"use client";

import { resetMap } from "@/components/Map/utils/events";
import "./SettingsPanel.css";
import { useId, useState } from "react";

export default function SettingsPanel() {
	return (
		<>
			<div className="panel-header">
				<div className="panel-id">Settings</div>
				<button className="panel-close" type="button" onClick={() => resetMap()}>
					<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
						<title>Close panel</title>
						<path
							fillRule="evenodd"
							d="M23.763 22.658 13.106 12 23.68 1.42a.781.781 0 0 0-1.1-1.1L12 10.894 1.42.237a.78.78 0 0 0-1.1 1.105L10.894 12 .237 22.658a.763.763 0 0 0 0 1.105.76.76 0 0 0 1.105 0L12 13.106l10.658 10.657a.76.76 0 0 0 1.105 0 .76.76 0 0 0 0-1.105"
							clipRule="evenodd"
						></path>
					</svg>
				</button>
			</div>
			<div className="panel-container main scrollable" id="settings-panel">
				<div className="setting-item">
					<p className="setting-item-title">Dark mode</p>
					<ToggleSwitch />
				</div>
				<div className="setting-item">
					<p className="setting-item-title">Day / night layer</p>
					<ToggleSwitch />
				</div>
				<div className="setting-item">
					<p className="setting-item-title">Airport markers</p>
					<ToggleSwitch />
				</div>
				<div className="setting-item">
					<p className="setting-item-title">Airport marker size</p>
					<SliderSwitch />
				</div>
				<div className="setting-item column">
					<p className="setting-item-title">Plane overlay</p>
					<ChooseSwitch />
				</div>
				<div className="setting-item">
					<p className="setting-item-title">Plane marker size</p>
					<SliderSwitch />
				</div>
			</div>
		</>
	);
}

function ToggleSwitch() {
	const id = useId();

	return (
		<label className="tgl-switch" htmlFor={id}>
			<input type="checkbox" id={id} />
			<span className="tgl-switch-slider"></span>
		</label>
	);
}

function SliderSwitch() {
	const [value, setValue] = useState(50);
	const id = useId();

	return (
		<label
			className="sld-switch"
			htmlFor={id}
			style={
				{
					"--value": value,
					"--max": 100,
				} as React.CSSProperties
			}
		>
			<input type="range" id={id} min="1" max="100" value={value} onChange={(e) => setValue(Number(e.target.value))} />
		</label>
	);
}

function ChooseSwitch() {
	const options = ["Callsign only", "Telemetry off", "Full"];
	const [selectedIndex, setSelectedIndex] = useState(0);

	return (
		<fieldset
			className="choose-switch"
			style={{ "--count": options.length, "--index": selectedIndex } as React.CSSProperties}
			aria-label="Plane overlay"
		>
			<span className="choose-switch-thumb" aria-hidden="true" />
			{options.map((option, idx) => (
				<button
					key={option}
					type="button"
					className="choose-switch-option"
					aria-pressed={selectedIndex === idx}
					onClick={() => setSelectedIndex(idx)}
				>
					{option}
				</button>
			))}
		</fieldset>
	);
}
