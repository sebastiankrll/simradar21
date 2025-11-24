"use client";

import { useEffect } from "react";
import "./Map.css";
import { initData } from "@/storage/cache";
import { onClick, onMoveEnd, onPointerMove } from "./utils/events";
import { initMap } from "./utils/init";

initData();

export default function OMap() {
	useEffect(() => {
		const map = initMap();
		map.on("moveend", onMoveEnd);
		map.on("pointermove", onPointerMove);
		map.on("click", onClick);

		return () => {
			map.un("moveend", onMoveEnd);
			map.un("pointermove", onPointerMove);
			map.un("click", onClick);
			map.setTarget(undefined);
		};
	}, []);

	return <div id="map" />;
}
