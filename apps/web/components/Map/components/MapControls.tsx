"use client";

import { useRouter } from "next/navigation";
import "./MapControls.css";
import { useState } from "react";
import Icon from "@/components/Icon/Icon";
import { moveViewToCoordinates } from "../utils/events";

export default function MapControls() {
	const router = useRouter();
	const [isFullscreen, setIsFullscreen] = useState(false);

	const onFullscreen = async () => {
		try {
			if (!isFullscreen) {
				await document.documentElement.requestFullscreen();
				setIsFullscreen(true);
			} else {
				await document.exitFullscreen();
				setIsFullscreen(false);
			}
		} catch (err) {
			console.error("Fullscreen error:", err);
		}
	};

	const onCenterOnLocation = () => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(pos) => {
					const { latitude, longitude } = pos.coords;
					moveViewToCoordinates(longitude, latitude);
				},
				(err) => {
					console.error("Geolocation error:", err);
				},
			);
		} else {
			alert("Geolocation is not supported by your browser.");
		}
	};

	return (
		<div id="map-controls">
			<button type="button" className="map-control-item" onClick={onFullscreen}>
				<Icon name={isFullscreen ? "resize-decrease" : "resize-increase"} size={22} />
			</button>
			<button type="button" className="map-control-item">
				<Icon name="add" />
			</button>
			<button type="button" className="map-control-item">
				<Icon name="remove" />
			</button>
			<button type="button" className="map-control-item" onClick={onCenterOnLocation}>
				<Icon name="poi-contact" size={22} />
			</button>
			<button type="button" className="map-control-item">
				<Icon name="filter" size={22} />
			</button>
			<button type="button" className="map-control-item" onClick={() => router.push("/settings")}>
				<Icon name="settings" size={24} offset={1} />
			</button>
		</div>
	);
}
