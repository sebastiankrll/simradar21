import { create } from "zustand";
import { persist } from "zustand/middleware/persist";

export type Units = "metric" | "imperial";
export type TimeFormat = "24h" | "12h";
export type TimeZone = "local" | "utc";

interface SettingsState {
	units: Units;
	timeFormat: TimeFormat;
	timeZone: TimeZone;
	mapTheme: "light" | "dark";
	showSunlight: boolean;

	setUnits: (u: Units) => void;
	setTimeFormat: (t: TimeFormat) => void;
	setTimeZone: (tz: TimeZone) => void;
	toggleLayer: (key: keyof Pick<SettingsState, "showSunlight">) => void;
}

export const useSettingsStore = create<SettingsState>()(
	persist(
		(set) => ({
			units: "imperial",
			timeFormat: "24h",
			timeZone: "utc",
			mapTheme: "dark",
			showSunlight: true,

			setUnits: (units) => set({ units }),
			setTimeFormat: (timeFormat) => set({ timeFormat }),
			setTimeZone: (timeZone) => set({ timeZone }),
			toggleLayer: (key) => set((state) => ({ [key]: !state[key] })),
		}),
		{
			name: "simradar21-settings",
		},
	),
);
