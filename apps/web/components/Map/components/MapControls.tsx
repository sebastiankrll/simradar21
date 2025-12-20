"use client";

import { useRouter } from "next/navigation";
import "./MapControls.css";
import Icon from "@/components/Icon/Icon";

export default function MapControls() {
	const router = useRouter();

	return (
		<div id="map-controls">
			<button type="button" className="map-control-item">
				<Icon name="add" />
			</button>
			<button type="button" className="map-control-item">
				<Icon name="remove" />
			</button>
			<button type="button" className="map-control-item" onClick={() => router.push("/settings")}>
				<Icon name="settings" size={24} offset={1} />
			</button>
		</div>
	);
}
