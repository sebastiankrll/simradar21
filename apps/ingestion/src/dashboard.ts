import { rdsSetRingStorage, rdsSetSingle } from "@sk/db/redis";
import type { ControllerLong, DashboardStats, VatsimData, VatsimEventData } from "@sk/types/vatsim";
import axios from "axios";

const VATSIM_EVENT_URL = "https://my.vatsim.net/api/v2/events/latest";
const VATSIM_EVENT_INTERVAL = 60 * 60 * 1000;
const VATSIM_HISTORY_WINDOW = 24 * 60 * 60 * 1000;

export async function updateDashboardData(vatsimData: VatsimData, controllers: ControllerLong[]): Promise<void> {
    updateVatsimEvents();

    const stats = getDashboardStats(vatsimData, controllers);
    rdsSetSingle("dashboard:stats", stats);

    const historyItem = { pilots: vatsimData.pilots.length, controllers: controllers.length };
    rdsSetRingStorage("dashboard:history", historyItem, VATSIM_HISTORY_WINDOW);
}

let lastEventUpdateTimestamp: Date | null = null;

async function updateVatsimEvents(): Promise<void> {
    if (lastEventUpdateTimestamp && (Date.now() - lastEventUpdateTimestamp.getTime()) < VATSIM_EVENT_INTERVAL) {
        return;
    }
    lastEventUpdateTimestamp = new Date();

    const response = await axios.get<VatsimEventData>(VATSIM_EVENT_URL);
    const vatsimEvents = response.data.data;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 2);

    const activeEvents = vatsimEvents.filter((event) => {
        const eventDate = new Date(event.start_time);
        return eventDate >= today && eventDate < tomorrow;
    });

    await rdsSetSingle("dashboard:events", activeEvents);
}

function getDashboardStats(vatsimData: VatsimData, controllersLong: ControllerLong[]): DashboardStats {
    const pilots = new Set(vatsimData.pilots.map((p) => p.cid)).size;
    const controllers = new Set(controllersLong.map((c) => c.cid)).size;
    const supervisors = new Set(controllersLong.filter((c) => c.facility === 0 || c.facility === 1).map((c) => c.cid)).size;

    const busiestAirports = Array.from(vatsimData.pilots.reduce((acc, pilot) => {
        if (pilot.flight_plan?.departure) {
            acc.set(pilot.flight_plan.departure, (acc.get(pilot.flight_plan.departure) || 0) + 1);
        }
        if (pilot.flight_plan?.arrival) {
            acc.set(pilot.flight_plan.arrival, (acc.get(pilot.flight_plan.arrival) || 0) + 1);
        }
        return acc;
    }, new Map<string, number>())).map(([icao, count]) => ({ icao, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    const busiestRoutes = Array.from(vatsimData.pilots.reduce((acc, pilot) => {
        if (pilot.flight_plan) {
            const routeKey = `${pilot.flight_plan.departure}-${pilot.flight_plan.arrival}`;
            acc.set(routeKey, (acc.get(routeKey) || 0) + 1);
        }
        return acc;
    }, new Map<string, number>())).map(([route, count]) => ({ route, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    const busiestAircraft = Array.from(vatsimData.pilots.reduce((acc, pilot) => {
        if (pilot.flight_plan?.aircraft_short) {
            acc.set(pilot.flight_plan.aircraft_short, (acc.get(pilot.flight_plan.aircraft_short) || 0) + 1);
        }
        return acc;
    }, new Map<string, number>())).map(([aircraft, count]) => ({ aircraft, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    const rarestAircraft = Array.from(vatsimData.pilots.reduce((acc, pilot) => {
        if (pilot.flight_plan?.aircraft_short) {
            acc.set(pilot.flight_plan.aircraft_short, (acc.get(pilot.flight_plan.aircraft_short) || 0) + 1);
        }
        return acc;
    }, new Map<string, number>())).map(([aircraft, count]) => ({ aircraft, count }))
        .sort((a, b) => a.count - b.count)
        .slice(0, 5);

    const busiestControllers = controllersLong.sort((a, b) => b.connections - a.connections)
        .slice(0, 5)
        .map((c) => ({ callsign: c.callsign, count: c.connections }));

    return {
        pilots,
        controllers,
        supervisors,
        busiestAirports,
        busiestRoutes,
        busiestAircraft,
        rarestAircraft,
        busiestControllers,
    }
}