"use client";

import type { SimAwareTraconFeature, StaticAirport } from "@sk/types/db";
import type { AirportLong, ControllerLong } from "@sk/types/vatsim";
import { parseMetar } from "metar-taf-parser";
import { useEffect, useRef, useState } from "react";
import { cacheIsInitialized, getCachedAirport, getCachedTracon, getControllersLong } from "@/storage/cache";
import { setHeight } from "../helpers";
import { ControllerInfo } from "../shared/ControllerInfo";
import { AirportConnections } from "./AirportConnections";
import { AirportStatus } from "./AirportStatus";
import { AirportTitle } from "./AirportTitle";
import { AirportWeather } from "./AirportWeather";

export interface AirportPanelStatic {
	airport: StaticAirport | null;
	tracon: SimAwareTraconFeature | null;
	controllers: ControllerLong[];
}
type AccordionSection = "weather" | "stats" | "controllers" | null;

export function AirportGeneral({ initialAirport }: { initialAirport: AirportLong }) {
	const [airport, _setAirport] = useState<AirportLong>(initialAirport);
	const parsedMetar = airport.metar ? parseMetar(airport.metar) : null;

	const [data, setData] = useState<AirportPanelStatic>({
		airport: null,
		controllers: [],
		tracon: null,
	});
	useEffect(() => {
		const loadData = async () => {
			while (!cacheIsInitialized()) {
				await new Promise((resolve) => setTimeout(resolve, 50));
			}

			const [airport, controllers, tracon] = await Promise.all([
				getCachedAirport(initialAirport.icao),
				getControllersLong(initialAirport.icao),
				getCachedTracon(initialAirport.icao),
			]);

			setData({ airport, controllers, tracon });
		};

		loadData();
	}, [initialAirport]);

	const weatherRef = useRef<HTMLDivElement>(null);
	const statsRef = useRef<HTMLDivElement>(null);
	const controllersRef = useRef<HTMLDivElement>(null);

	const [openSection, setOpenSection] = useState<AccordionSection>(null);
	const toggleSection = (section: AccordionSection) => {
		setOpenSection(openSection === section ? null : section);
	};

	useEffect(() => {
		setHeight(weatherRef, openSection === "weather");
		setHeight(statsRef, openSection === "stats");
		setHeight(controllersRef, openSection === "controllers");
	}, [openSection]);

	return (
		<>
			<AirportTitle staticAirport={data.airport} />
			<AirportStatus airport={airport} parsedMetar={parsedMetar} />
			<div className="panel-container main scrollable">
				<button
					className={`panel-container-header${openSection === "weather" ? " open" : ""}`}
					type="button"
					onClick={() => toggleSection("weather")}
				>
					<p>More Weather & METAR</p>
					<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
						<title>Weather & METAR</title>
						<path
							fillRule="evenodd"
							d="M11.842 18 .237 7.26a.686.686 0 0 1 0-1.038.8.8 0 0 1 1.105 0L11.842 16l10.816-9.704a.8.8 0 0 1 1.105 0 .686.686 0 0 1 0 1.037z"
							clipRule="evenodd"
						></path>
					</svg>
				</button>
				<AirportWeather airport={airport} parsedMetar={parsedMetar} openSection={openSection} ref={weatherRef} />
				<AirportConnections airport={airport} />
				<button
					className={`panel-container-header${openSection === "weather" ? " open" : ""}`}
					type="button"
					onClick={() => toggleSection("controllers")}
				>
					<p>Controller Information</p>
					<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
						<title>Controllers</title>
						<path
							fillRule="evenodd"
							d="M11.842 18 .237 7.26a.686.686 0 0 1 0-1.038.8.8 0 0 1 1.105 0L11.842 16l10.816-9.704a.8.8 0 0 1 1.105 0 .686.686 0 0 1 0 1.037z"
							clipRule="evenodd"
						></path>
					</svg>
				</button>
				<ControllerInfo controllers={data.controllers} airport={data.airport} tracon={data.tracon} openSection={openSection} ref={controllersRef} />
			</div>
		</>
	);
}
