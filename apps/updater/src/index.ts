import "dotenv/config";
import { rdsConnect } from "@sr24/db/redis";
import { CronJob } from "cron";
import { updateAirlines } from "./airlines";
import { updateAirports } from "./airports";
import { updateFirs } from "./fir";
import { updateFleets } from "./fleet";
import { updateTracons } from "./tracon";

let dbsInitialized = false;

CronJob.from({
	cronTime: "0 6 * * *",
	onTick: async () => {
		if (!dbsInitialized) {
			await rdsConnect();
			dbsInitialized = true;
		}

		await updateAirlines();
		await updateAirports();
		await updateFirs();
		await updateTracons();
		await updateFleets();

		console.log("✅ Static data update completed!");
	},
	start: true,
	runOnInit: true,
	timeZone: "UTC",
});
