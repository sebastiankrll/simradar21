"use client";

import { useEffect } from "react";
import "./Map.css";
import { useRouter } from "next/navigation";
import { onClick, onMoveEnd, onPointerMove } from "./utils/events";
import { initMap } from "./utils/init";

export default function OMap() {
	const router = useRouter();

	useEffect(() => {
		const onNavigate = (e: Event) => {
			const href = (e as CustomEvent<string>).detail;
			if (href) router.push(href);
		};
		window.addEventListener("sr24:navigate", onNavigate);

		const map = initMap();
		map.on(["moveend"], onMoveEnd);
		map.on("pointermove", onPointerMove);
		map.on("click", onClick);

		return () => {
			window.removeEventListener("sr24:navigate", onNavigate);
			map.un(["moveend"], onMoveEnd);
			map.un("pointermove", onPointerMove);
			map.un("click", onClick);
			map.setTarget(undefined);
		};
	}, [router]);

	return <div id="map" />;
}
