import type { Feature } from "ol";
import type { Point } from "ol/geom";
import type { SelectOptionType } from "@/components/shared/Select/Select";
import type { FilterValues } from "@/types/zustand";
import { getMapView } from "./init";
import { setPilotFeatures } from "./pilotFeatures";

let mapFilters: Partial<Record<keyof FilterValues, SelectOptionType[]>> = {};

export function applyMapFilters(filters: Partial<Record<keyof FilterValues, SelectOptionType[]>>): void {
	mapFilters = filters;
	const view = getMapView();
	if (!view) return;

	const extent = view.calculateExtent();
	const zoom = view.getZoom() || 0;
	setPilotFeatures(extent, zoom);
}

export function filterPilotFeatures(features: Feature<Point>[]): Feature<Point>[] {
	if (Object.keys(mapFilters).length === 0) return features;

	if (mapFilters.Airline && mapFilters.Airline.length > 0) {
		features = features.filter((feature) => {
			const callsign = feature.get("callsign") as string;
			return mapFilters.Airline?.some((filter) => filter.value === callsign.slice(0, 3));
		});
	}
	if (mapFilters["Aircraft Type"] && mapFilters["Aircraft Type"].length > 0) {
		features = features.filter((feature) => {
			const aircraftType = feature.get("aircraft") as string;
			return mapFilters["Aircraft Type"]?.some((filter) => filter.value === aircraftType);
		});
	}
	if (mapFilters.Departure && mapFilters.Departure.length > 0) {
		features = features.filter((feature) => {
			const route = feature.get("route") as string;
			return mapFilters.Departure?.some((filter) => filter.value === route.split(" -- ")[0]);
		});
	}
	if (mapFilters.Arrival && mapFilters.Arrival.length > 0) {
		features = features.filter((feature) => {
			const route = feature.get("route") as string;
			return mapFilters.Arrival?.some((filter) => filter.value === route.split(" -- ")[1]);
		});
	}
	if (mapFilters.Any && mapFilters.Any.length > 0) {
		features = features.filter((feature) => {
			const route = feature.get("route") as string;
			return mapFilters.Any?.some((filter) => filter.value === route.split(" -- ")[0] || filter.value === route.split(" -- ")[1]);
		});
	}
	if (mapFilters["Flight Callsign"] && mapFilters["Flight Callsign"].length > 0) {
		features = features.filter((feature) => {
			const callsign = feature.get("callsign") as string;
			return mapFilters["Flight Callsign"]?.some((filter) => filter.value === callsign);
		});
	}
	if (mapFilters.Squawk && mapFilters.Squawk.length > 0) {
		features = features.filter((feature) => {
			const squawk = feature.get("transponder") as string;
			return mapFilters.Squawk?.some((filter) => filter.value === squawk);
		});
	}

	return features;
}
