"use client";

import { useEffect } from "react";
import "./Map.css";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import Initializer from "@/components/Initializer/Initializer";
import { setSunLayerSettings } from "@/components/Map/sunLayer";
import BasePanel from "@/components/Panel/BasePanel";
import { initMapData } from "@/storage/map";
import { useMapRotationStore, useSettingsStore } from "@/storage/zustand";
import { setDataLayersSettings } from "../lib/dataLayers";
import { onClick, onMoveEnd, onPointerMove, setNavigator } from "../lib/events";
import { getMap, initMap, setMapTheme } from "../lib/init";
import { animatePilotFeatures } from "../lib/pilotFeatures";
import Controls from "./Controls";

export default function OMap({ children }: { children?: React.ReactNode }) {
	const router = useRouter();
	const pathname = usePathname();

	const { theme } = useTheme();
	const {
		dayNightLayer,
		dayNightLayerBrightness,
		airportMarkers,
		airportMarkerSize,
		planeMarkerSize,
		animatedPlaneMarkers,
		sectorAreas,
		traconColor,
		firColor,
	} = useSettingsStore();
	const { setRotation } = useMapRotationStore();

	useEffect(() => {
		setNavigator((href) => router.push(href));

		const map = initMap();
		map.on(["moveend"], (e) => {
			onMoveEnd(e);
			setRotation(e.target.getView().getRotation());
		});
		map.on("pointermove", onPointerMove);
		map.on("click", onClick);

		return () => {
			map.un(["moveend"], onMoveEnd);
			map.un("pointermove", onPointerMove);
			map.un("click", onClick);
			map.setTarget(undefined);
		};
	}, [router, setRotation]);

	useEffect(() => {
		initMapData(pathname);
	}, [pathname]);

	useEffect(() => {
		setMapTheme(theme === "dark");
	}, [theme]);

	useEffect(() => {
		if (!animatedPlaneMarkers) return;

		const map = getMap();
		if (!map) return;

		let animationFrameId = 0;
		const animate = () => {
			animatePilotFeatures(map);
			animationFrameId = window.requestAnimationFrame(animate);
		};
		animationFrameId = window.requestAnimationFrame(animate);

		return () => {
			window.cancelAnimationFrame(animationFrameId);
		};
	}, [animatedPlaneMarkers]);

	useEffect(() => {
		setSunLayerSettings(dayNightLayer, dayNightLayerBrightness);
		setDataLayersSettings(airportMarkers, airportMarkerSize, planeMarkerSize, sectorAreas, traconColor, firColor);
	}, [dayNightLayer, dayNightLayerBrightness, airportMarkers, airportMarkerSize, planeMarkerSize, sectorAreas, traconColor, firColor]);

	return (
		<>
			<Initializer />
			<BasePanel>{children}</BasePanel>
			<Controls />
			<div id="map" />
		</>
	);
}
