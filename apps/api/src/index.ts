import "dotenv/config";
import { constants } from "node:zlib";
import { pgFindAirportFlights, pgHealthCheck, pgShutdown, prisma } from "@sr24/db/pg";
import { rdsConnect, rdsGetSingle, rdsGetTimeSeries, rdsHealthCheck, rdsShutdown, rdsSub } from "@sr24/db/redis";
import type { AirportLong, ControllerLong, DashboardData, InitialData, PilotLong, RedisAll } from "@sr24/types/interface";
import compression from "compression";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import type { Prisma } from "../../../packages/db/src/generated/prisma/index.js";
import { authHandler, type CustomRequest, errorHandler } from "./middleware.js";
import { validateCallsign, validateICAO, validateNumber } from "./validation.js";
import { getMetar, getTaf } from "./weather.js";

let initialData: InitialData | null = null;
let dashboardData: DashboardData | null = null;
const pilotsLong: Map<string, PilotLong> = new Map();
const controllersLong: Map<string, ControllerLong> = new Map();
const airportsLong: Map<string, AirportLong> = new Map();

async function connectDBs(): Promise<void> {
	await rdsConnect();
	rdsSub("data:all", async (data: string) => {
		try {
			const parsed: RedisAll = JSON.parse(data);
			initialData = parsed.init;
			dashboardData = parsed.dashboard;
			pilotsLong.clear();
			parsed.pilots.forEach((p) => {
				pilotsLong.set(p.id, p);
			});
			controllersLong.clear();
			parsed.controllers.forEach((c) => {
				controllersLong.set(c.callsign, c);
			});
			airportsLong.clear();
			parsed.airports.forEach((a) => {
				airportsLong.set(a.icao, a);
			});
		} catch (err) {
			console.error("Error parsing RedisAll data from subscription:", err);
		}
	});
}
connectDBs().catch((err) => {
	console.error("Error connecting to databases:", err);
	process.exit(1);
});

const limiter = rateLimit({
	windowMs: 60_000,
	max: 60,
	message: "Too many requests from this endpoint, please try again later.",
	standardHeaders: true,
	legacyHeaders: false,
});
const brotliCompression = compression({
	brotli: { [constants.BROTLI_PARAM_QUALITY]: 4 },
});
const app = express();

if (process.env.TRUST_PROXY === "true") {
	app.set("trust proxy", 1);
}

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(limiter);

// Health check endpoints
app.get(
	"/health",
	errorHandler(async (_req, res) => {
		const startTime = Date.now();
		const health = {
			status: "ok",
			timestamp: new Date().toISOString(),
			uptime: process.uptime(),
			services: {
				redis: "unknown",
				postgres: "unknown",
			},
		};

		try {
			const redisHealthy = await rdsHealthCheck();
			health.services.redis = redisHealthy ? "ok" : "error";
			if (!redisHealthy) health.status = "degraded";
		} catch (_err) {
			health.services.redis = "error";
			health.status = "degraded";
		}

		try {
			const pgHealthy = await pgHealthCheck();
			health.services.postgres = pgHealthy ? "ok" : "error";
			if (!pgHealthy) health.status = "degraded";
		} catch (_err) {
			health.services.postgres = "error";
			health.status = "degraded";
		}

		const responseTime = Date.now() - startTime;
		const statusCode = health.status === "ok" ? 200 : 503;

		res.status(statusCode).json({
			...health,
			responseTime: `${responseTime}ms`,
		});
	}),
);

app.get(
	"/health/live",
	errorHandler(async (_req, res) => {
		res.json({
			status: "alive",
			timestamp: new Date().toISOString(),
		});
	}),
);

app.get(
	"/health/ready",
	errorHandler(async (_req, res) => {
		try {
			const redisHealthy = await rdsHealthCheck();
			const pgHealthy = await pgHealthCheck();

			if (!redisHealthy || !pgHealthy) {
				const reasons: string[] = [];
				if (!redisHealthy) reasons.push("Redis connection failed");
				if (!pgHealthy) reasons.push("PostgreSQL connection failed");

				res.status(503).json({
					status: "not-ready",
					reasons,
					timestamp: new Date().toISOString(),
				});
				return;
			}

			res.json({
				status: "ready",
				timestamp: new Date().toISOString(),
			});
		} catch (_err) {
			res.status(503).json({
				status: "not-ready",
				reasons: ["Health check failed"],
				timestamp: new Date().toISOString(),
			});
		}
	}),
);

app.get(
	"/data/init",
	brotliCompression,
	errorHandler(async (_req, res) => {
		if (!initialData) {
			res.status(503).json({ error: "Initial data not available" });
			return;
		}
		res.json(initialData);
	}),
);

app.get(
	"/data/pilot/:id",
	errorHandler(async (req, res) => {
		const pilot = pilotsLong.get(req.params.id);
		if (!pilot) {
			res.status(404).json({ error: "Pilot not found" });
			return;
		}

		res.json(pilot);
	}),
);

app.get(
	"/data/airport/:icao",
	errorHandler(async (req, res) => {
		const airport = airportsLong.get(req.params.icao.toUpperCase());
		if (!airport) {
			res.status(404).json({ error: "Airport not found" });
			return;
		}

		res.json(airport);
	}),
);

app.get(
	"/data/weather/:icao",
	errorHandler(async (req, res) => {
		const icao = req.params.icao.toUpperCase();
		const metar = getMetar(icao);
		const taf = getTaf(icao);

		res.json({ metar, taf });
	}),
);

app.get(
	"/data/controllers/:callsigns",
	errorHandler(async (req, res) => {
		const callsignArray = req.params.callsigns.split(",").map((cs) => validateCallsign(cs.trim()));

		if (callsignArray.length === 0) {
			res.status(400).json({ error: "At least one callsign is required" });
			return;
		}

		const controllers = callsignArray.map((callsign) => controllersLong.get(callsign) || null);
		const validControllers = controllers.filter((controller) => controller !== null);
		if (validControllers.length === 0) {
			res.status(404).json({ error: "Controller not found" });
			return;
		}

		res.json(validControllers);
	}),
);

app.get(
	"/data/track/:id",
	brotliCompression,
	errorHandler(async (req, res) => {
		const trackPoints = await rdsGetTimeSeries(`pilot:tp:${req.params.id}`);
		if (!trackPoints || trackPoints.length === 0) {
			res.status(404).json({ error: "Track not found" });
			return;
		}

		res.json(trackPoints);
	}),
);

app.get(
	"/data/aircraft/:reg",
	errorHandler(async (req, res) => {
		const aircraft = await rdsGetSingle(`static_fleet:${req.params.reg.toUpperCase()}`);
		if (!aircraft) {
			res.status(404).json({ error: "Aircraft not found" });
			return;
		}

		res.json(aircraft);
	}),
);

app.get(
	"/data/dashboard/",
	brotliCompression,
	errorHandler(async (_req, res) => {
		if (!dashboardData) {
			res.status(404).json({ error: "Dashboard data not available" });
			return;
		}

		res.json(dashboardData);
	}),
);

app.get(
	"/data/airport/:icao/flights",
	errorHandler(async (req, res) => {
		const icao = validateICAO(req.params.icao).toUpperCase();
		const direction = (String(req.query.direction || "dep").toLowerCase() === "arr" ? "arr" : "dep") as "dep" | "arr";
		const limit = validateNumber(req.query.limit || 20, "Limit", 1, 30);
		const cursor = req.query.cursor as string | undefined;
		const backwards = req.query.backwards === "true";

		const data = await pgFindAirportFlights(icao, direction, limit, cursor, backwards);
		res.json(data);
	}),
);

app.get(
	"/search/flights",
	errorHandler(async (req, res) => {
		const query = req.query.q as string;

		if (!query || query.length < 1) {
			res.status(400).json({ error: "Query parameter 'q' is required" });
			return;
		}

		const whereClause: Prisma.PilotWhereInput = {
			OR: [
				{ callsign: { contains: query.toUpperCase() } },
				{ dep_icao: { contains: query.toUpperCase() } },
				{ arr_icao: { contains: query.toUpperCase() } },
				{ cid: { contains: query } },
				{ name: { contains: query, mode: "insensitive" } },
			],
		};

		const [livePilots, offlinePilots] = await Promise.all([
			prisma.pilot.findMany({
				where: {
					...whereClause,
					live: true,
				},
				select: {
					pilot_id: true,
					callsign: true,
					dep_icao: true,
					arr_icao: true,
					aircraft: true,
					live: true,
				},
				take: 10,
			}),

			prisma.pilot.findMany({
				where: {
					...whereClause,
					live: false,
				},
				orderBy: {
					last_update: "desc",
				},
				distinct: ["callsign"],
				select: {
					pilot_id: true,
					callsign: true,
					dep_icao: true,
					arr_icao: true,
					aircraft: true,
					live: true,
				},
				take: 10,
			}),
		]);

		res.json({
			live: livePilots,
			offline: offlinePilots,
		});
	}),
);

app.get(
	"/data/flights/:callsign",
	errorHandler(async (req, res) => {
		const callsign = req.params.callsign.toUpperCase();
		const limit = Number(req.query.limit ?? 20);
		const cursor = req.query.cursor as string | undefined;

		const results = await prisma.pilot.findMany({
			where: {
				callsign,
			},
			orderBy: {
				last_update: "desc",
			},
			take: limit,
			...(cursor && {
				skip: 1,
				cursor: {
					pilot_id: cursor,
				},
			}),
		});

		const pilots: PilotLong[] = results.map((r) => ({
			id: r.pilot_id,
			cid: r.cid,
			callsign: r.callsign,
			latitude: r.latitude,
			longitude: r.longitude,
			altitude_agl: r.altitude_agl,
			altitude_ms: r.altitude_ms,
			groundspeed: r.groundspeed,
			vertical_speed: r.vertical_speed,
			heading: r.heading,
			aircraft: r.aircraft,
			transponder: r.transponder,
			frequency: r.frequency,
			name: r.name,
			server: r.server,
			pilot_rating: r.pilot_rating,
			military_rating: r.military_rating,
			qnh_i_hg: r.qnh_i_hg,
			qnh_mb: r.qnh_mb,
			flight_plan: r.flight_plan as any,
			times: r.times as any,
			logon_time: r.logon_time,
			timestamp: r.last_update,
			live: r.live,
		}));

		res.json(pilots);
	}),
);

app.get(
	"/user/settings",
	authHandler,
	errorHandler(async (req: CustomRequest, res) => {
		const cid = BigInt(req.user?.cid || 0);

		const user = await prisma.user.findUnique({
			where: { cid },
			select: { settings: true },
		});

		if (!user) {
			res.status(404).json({ error: "User not found" });
			return;
		}

		res.json({ settings: user.settings || {} });
	}),
);

app.post(
	"/user/settings",
	authHandler,
	errorHandler(async (req: CustomRequest, res) => {
		const cid = BigInt(req.user?.cid || 0);
		const settings = req.body;

		if (!settings || typeof settings !== "object") {
			res.status(400).json({ error: "Invalid settings data" });
			return;
		}

		const user = await prisma.user.upsert({
			where: { cid },
			update: { settings },
			create: { cid, settings },
		});

		res.json({ settings: user.settings });
	}),
);

app.use((_req, res) => {
	res.status(404).json({ error: "Endpoint not found" });
});

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
	console.error("Error:", err);

	const status = err.status || err.statusCode || 500;
	const message = err.message || "Internal server error";

	res.status(status).json({
		error: message,
		...(process.env.NODE_ENV === "development" && { stack: err.stack }),
	});
});

const PORT = process.env.API_PORT || 3001;
const server = app.listen(PORT, () => {
	console.log(`Express API listening on port ${PORT}`);
});

const gracefulShutdown = async (signal: string) => {
	console.log(`\n${signal} signal received: closing HTTP server`);
	server.close(async () => {
		console.log("HTTP server closed");
		try {
			await rdsShutdown();
		} catch (err) {
			console.error("Error shutting down Redis:", err);
		}
		try {
			await pgShutdown();
		} catch (err) {
			console.error("Error shutting down PostgreSQL:", err);
		}
		process.exit(0);
	});

	// Force shutdown after 10 seconds
	setTimeout(() => {
		console.error("Forced shutdown after timeout");
		process.exit(1);
	}, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
