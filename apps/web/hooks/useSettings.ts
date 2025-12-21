"use client";

import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { useSettingsStore } from "@/storage/zustand";

export default function useSettings() {
	const { setTheme } = useTheme();
	const settings = useSettingsStore();
	const { data: session } = useSession();

	useEffect(() => {
		setTheme(settings.theme);
	}, [settings.theme, setTheme]);

	useEffect(() => {
		if (!session) return;

		const fetchUserSettings = async () => {
			try {
				const res = await fetch("/user/settings", { cache: "no-store" });
				if (!res.ok) {
					return;
				}

				const data = await res.json();
				settings.setSettings(data.settings);
			} catch (err) {
				console.error("Failed to load settings:", err);
			}
		};

		fetchUserSettings();
	}, [settings.setSettings, session]);
}
