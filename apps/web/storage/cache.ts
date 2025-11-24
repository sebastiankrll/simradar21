import type { AirportShort, ControllerShort, WsAll, WsDelta } from "@sk/types/vatsim";
import { initAirportFeatures, initPilotFeatures, setFeatures, updatePilotFeatures } from "@/components/Map/utils/dataLayers";
import { updateOverlays } from "@/components/Map/utils/events";
import type { ControllerWithFeature } from "@/types/ol";
import { dxGetTracons, dxInitDatabases } from "./dexie";
import { wsClient } from "@/utils/ws";
import { get } from "http";
import { getMapView } from "@/components/Map/utils/init";

let airportsShort: AirportShort[] = [];
let controllersShort: ControllerShort[] = [];
let tracons: ControllerWithFeature[] = [];

export async function initData(): Promise<void> {
	await dxInitDatabases();
	const data = (await fetch("http://localhost:5000/api/data/init").then((res) => res.json())) as WsAll;
	await initAirportFeatures();
	initPilotFeatures(data.pilots);

	const view = getMapView();
	if (view) {
		setFeatures(view.calculateExtent(), view.getZoom() || 5);
	}

	wsClient.addListener((msg) => {
		updateCache(msg);
	});
}

export async function updateCache(delta: WsDelta): Promise<void> {
	updatePilotFeatures(delta.pilots);
	// airportsShort = wsShort.airports;
	// controllersShort = wsShort.controllers;
	// tracons = await extractTracons(controllersShort);
	// updateOverlays();
}

export function getCachedAirport(id: string): AirportShort | null {
	return airportsShort.find((a) => a.icao === id) || null;
}

export function getCachedController(id: string): ControllerShort | null {
	return controllersShort.find((c) => c.callsign === id) || null;
}

async function extractTracons(controllers: ControllerShort[]): Promise<ControllerWithFeature[]> {
	const result: ControllerWithFeature[] = [];
	const newTracons: ControllerShort[] = [];
	const ids: string[] = [];

	for (const c of controllers) {
		if (c.facility === 5) {
			const existing = tracons.find((t) => t.callsign === c.callsign);
			if (existing) {
				result.push(existing);
				continue;
			}

			const idx = c.callsign.indexOf("_");
			const id = idx === -1 ? c.callsign : c.callsign.slice(0, idx);
			ids.push(id);
			newTracons.push(c);
		}
	}

	const features = await dxGetTracons(ids);

	for (let i = 0; i < newTracons.length; i++) {
		let feature = features[i];

		if (!feature) {
			const callsign = newTracons[i].callsign;

			const parts = callsign.split("_");
			const id = parts.length > 2 ? `${parts[0]}_${parts[1]}` : callsign;

			feature = await dxGetTracons([id]).then((res) => res[0]);
		}

		result.push({
			...newTracons[i],
			feature: feature?.feature,
		});
	}

	return result;
}
