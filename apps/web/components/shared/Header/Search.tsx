"use client";

import type { StaticAirline, StaticAirport } from "@sr24/types/db";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "use-debounce";
import FlagSprite from "@/assets/images/sprites/flagSprite42.png";
import { getIcon } from "@/components/Panels/Pilot/PilotTitle";
import { getCachedAirline } from "@/storage/cache";
import { dxFindAirlines, dxFindAirports } from "@/storage/dexie";
import { fetchApi } from "@/utils/api";
import Icon from "../Icon/Icon";
import Spinner from "../Spinner/Spinner";

interface Pilot {
	pilot_id: string;
	callsign: string;
	dep_icao: string | undefined;
	arr_icao: string | undefined;
	aircraft: string;
	live: boolean;
}

type PilotResult = {
	live: Pilot[];
	offline: Pilot[];
};

type QueryResult = {
	airlines: StaticAirline[];
	airports: StaticAirport[];
	pilots: PilotResult;
};

async function fetchPilots(query: string): Promise<PilotResult> {
	const pilots = await fetchApi<PilotResult>(`/data/flights?q=${encodeURIComponent(query)}`);
	return pilots;
}

export default function Search() {
	const [searchValue, setSearchValue] = useState("");
	const debounced = useDebounce(searchValue, 300);

	const ref = useRef<HTMLDivElement>(null);

	const { data, isLoading } = useQuery<QueryResult>({
		queryKey: ["search", debounced],
		queryFn: async () => {
			if (debounced[0].startsWith("flights:")) {
				const query = debounced[0].split(":")[1] || "";
				const pilots = await fetchPilots(query);
				return { airlines: [], airports: [], pilots: pilots };
			}
			const [airlines, airports, pilots] = await Promise.all([
				dxFindAirlines(debounced[0], 10),
				dxFindAirports(debounced[0], 10),
				fetchPilots(debounced[0]),
			]);
			return { airlines, airports, pilots };
		},
		enabled: debounced[0].length > 2,
		staleTime: 10_000,
		gcTime: 60_000,
	});

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (ref.current && !ref.current.contains(event.target as Node)) {
				setSearchValue("");
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	return (
		<div id="header-search-wrapper" ref={ref}>
			<input
				id="header-search"
				type="text"
				placeholder="Find flights, airports, airlines and more"
				value={searchValue}
				onChange={(e) => setSearchValue(e.target.value)}
			/>
			{searchValue.length > 0 && (
				<div id="header-search-results" className="scrollable">
					{isLoading && <Spinner relative />}
					{searchValue.length < 3 && <p>Type at least 3 characters to search.</p>}
					{data?.airlines.length === 0 && data?.airports.length === 0 && data?.pilots.live.length === 0 && data?.pilots.offline.length === 0 && (
						<p>No results found.</p>
					)}

					{data?.airlines && data?.airlines.length > 0 && <div className="panel-data-separator">Airlines</div>}
					{data?.airlines.map((airline) => (
						<AirlineResult key={airline.id} airline={airline} setValue={setSearchValue} />
					))}

					{data?.airports && data?.airports.length > 0 && <div className="panel-data-separator">Airports</div>}
					{data?.airports.map((airport) => (
						<AirportResult key={airport.id} airport={airport} setValue={setSearchValue} />
					))}

					{data?.pilots.live && data?.pilots.live.length > 0 && <div className="panel-data-separator">Live Flights</div>}
					{data?.pilots.live.map((pilot) => (
						<PilotResult key={pilot.pilot_id} pilot={pilot} setValue={setSearchValue} />
					))}

					{data?.pilots.offline && data?.pilots.offline.length > 0 && <div className="panel-data-separator">Recent Or Scheduled Flights</div>}
					{data?.pilots.offline.map((pilot) => (
						<PilotResult key={pilot.pilot_id} pilot={pilot} setValue={setSearchValue} />
					))}
				</div>
			)}
		</div>
	);
}

function AirlineResult({ airline, setValue }: { airline: StaticAirline; setValue: (value: string) => void }) {
	return (
		<button className="search-item" type="button" onClick={() => setValue(`flights:${airline.id}`)}>
			<div className="search-icon" style={{ backgroundColor: airline.color?.[0] ?? "" }}>
				{getIcon(airline)}
			</div>
			<div className="search-info">
				<div className="search-title">{airline.name}</div>
				<div className="search-tags">
					<span
						style={{ background: "var(--color-red)", padding: "0px 2px", color: "white" }}
					>{`${airline.id}${airline.iata ? ` / ${airline.iata}` : ""}`}</span>
					<Icon name="hotline" size={12} />
					<span>{airline.callsign}</span>
				</div>
			</div>
		</button>
	);
}

function AirportResult({ airport, setValue }: { airport: StaticAirport; setValue: (value: string) => void }) {
	const router = useRouter();

	return (
		<button
			className="search-item"
			type="button"
			onClick={() => {
				router.push(`/airport/${airport.id}`);
				setValue("");
			}}
		>
			<div className="search-icon">
				<div className={`fflag ff-lg fflag-${airport.country}`} style={{ backgroundImage: `url(${FlagSprite.src})` }}></div>
			</div>
			<div className="search-info">
				<div className="search-title">{airport.name}</div>
				<div className="search-tags">
					<span
						style={{ background: "var(--color-red)", padding: "0px 2px", color: "white" }}
					>{`${airport.id}${airport.iata ? ` / ${airport.iata}` : ""}`}</span>
				</div>
			</div>
		</button>
	);
}

function PilotResult({ pilot, setValue }: { pilot: Pilot; setValue: (value: string) => void }) {
	const [airline, setAirline] = useState<StaticAirline | null>(null);
	const router = useRouter();

	const callsignNumber = pilot.callsign.slice(3);
	const flightNumber = airline?.iata ? `${airline.iata}${callsignNumber}` : pilot?.callsign;

	useEffect(() => {
		const airlineCode = pilot.callsign.slice(0, 3).toUpperCase();

		(async () => {
			const cached = await getCachedAirline(airlineCode);
			setAirline(cached);
		})();
	}, [pilot]);

	return (
		<button
			className="search-item"
			type="button"
			onClick={() => {
				router.push(`/pilot/${pilot.pilot_id}`);
				setValue("");
			}}
		>
			<div className="search-icon" style={{ backgroundColor: airline?.color?.[0] ?? "" }}>
				{getIcon(airline)}
			</div>
			<div className="search-info pilot">
				<div className="search-title">{flightNumber}</div>
				<div style={{ textAlign: "right", fontSize: "var(--font-size-small)" }}>
					{pilot.dep_icao || "N/A"} &ndash; {pilot.arr_icao || "N/A"}
				</div>
				<div className="search-tags">
					<span style={{ background: "var(--color-red)" }} className="bg">
						{pilot.callsign}
					</span>
					<span style={{ background: pilot.live ? "var(--color-green)" : "var(--color-dark-grey)" }} className="bg">
						Live
					</span>
				</div>
				<div style={{ textAlign: "right", fontSize: "var(--font-size-small)" }}>{pilot.aircraft}</div>
			</div>
		</button>
	);
}
