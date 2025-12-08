import type { PilotShort } from "@sr24/types/vatsim";

export interface PilotProperties extends Required<PilotShort> {
	type: "pilot";
	clicked: boolean;
	hovered: boolean;
}

export interface AirportProperties {
	type: "airport";
	size: "s" | "m" | "l";
	clicked: boolean;
	hovered: boolean;
}

export interface ControllerLabelProperties {
	type: "fir" | "tracon";
	label: string;
	clicked: boolean;
	hovered: boolean;
}

export interface AirportLabelProperties {
	type: "airport";
	size: "s" | "m" | "l";
	offset: number;
}
