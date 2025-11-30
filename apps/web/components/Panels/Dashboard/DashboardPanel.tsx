"use client";

import { useEffect, useRef, useState } from "react";
import { DashboardHistory } from "./DashboardHistory";
import { setHeight } from "../helpers";
import { DashboardStats } from "./DashboardStats";
import { DashboardEvents } from "./DashboardEvents";

const sampleData = [
	{ name: "00:00", altitude: 1000, speed: 150 },
	{ name: "01:00", altitude: 1200, speed: 160 },
	{ name: "02:00", altitude: 1100, speed: 155 },
	{ name: "03:00", altitude: 1300, speed: 165 },
	{ name: "04:00", altitude: 1250, speed: 158 },
];

export default function DashboardPanel() {
	const historyRef = useRef<HTMLDivElement>(null);
	const statsRef = useRef<HTMLDivElement>(null);
	const eventsRef = useRef<HTMLDivElement>(null);

	const [openSection, setOpenSection] = useState<string | null>(null);
	const toggleSection = (section: string) => {
		setOpenSection(openSection === section ? null : section);
	};

	useEffect(() => {
		setHeight(historyRef, openSection === "history");
	}, [openSection]);

	return (
		<>
			<div className="panel-container dashboard">
				<button
					className={`panel-container-header${openSection === "history" ? " open" : ""}`}
					type="button"
					onClick={() => toggleSection("history")}
				>
					<p>Last 24 hours</p>
					<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
						<title>Last 24 hours</title>
						<path
							fillRule="evenodd"
							d="M11.842 18 .237 7.26a.686.686 0 0 1 0-1.038.8.8 0 0 1 1.105 0L11.842 16l10.816-9.704a.8.8 0 0 1 1.105 0 .686.686 0 0 1 0 1.037z"
							clipRule="evenodd"
						></path>
					</svg>
				</button>
				<div ref={historyRef} className={`panel-sub-container accordion${openSection === "history" ? " open" : ""}`}>
					<DashboardHistory data={sampleData} />
				</div>
			</div>
			<div className="panel-container dashboard">
				<button className={`panel-container-header${openSection === "stats" ? " open" : ""}`} type="button" onClick={() => toggleSection("stats")}>
					<p>General statistics</p>
					<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
						<title>General statistics</title>
						<path
							fillRule="evenodd"
							d="M11.842 18 .237 7.26a.686.686 0 0 1 0-1.038.8.8 0 0 1 1.105 0L11.842 16l10.816-9.704a.8.8 0 0 1 1.105 0 .686.686 0 0 1 0 1.037z"
							clipRule="evenodd"
						></path>
					</svg>
				</button>
				<div ref={statsRef} className={`panel-sub-container accordion${openSection === "stats" ? " open" : ""}`}>
					<DashboardStats />
				</div>
			</div>
			<div className="panel-container dashboard">
				<button className={`panel-container-header${openSection === "events" ? " open" : ""}`} type="button" onClick={() => toggleSection("events")}>
					<p>VATSIM events</p>
					<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
						<title>VATSIM events</title>
						<path
							fillRule="evenodd"
							d="M11.842 18 .237 7.26a.686.686 0 0 1 0-1.038.8.8 0 0 1 1.105 0L11.842 16l10.816-9.704a.8.8 0 0 1 1.105 0 .686.686 0 0 1 0 1.037z"
							clipRule="evenodd"
						></path>
					</svg>
				</button>
				<div ref={eventsRef} className={`panel-sub-container accordion${openSection === "events" ? " open" : ""}`}>
					<DashboardEvents />
				</div>
			</div>
		</>
	);
}
