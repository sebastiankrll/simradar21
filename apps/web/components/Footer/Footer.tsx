"use client";

import "./Footer.css";
import useSWR from "swr";
import { fetchApi } from "@/utils/api";

interface Metrics {
	connectedClients: number;
	rateLimitedClients: number;
	totalMessages: number;
	avgMessagesPerClient: number;
	timestamp: string;
}

const WS_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:3002";

export default function Footer() {
	const { data: metrics, isLoading } = useSWR<Metrics>(`${WS_URL.replace("ws", "http")}/metrics`, fetchApi, { refreshInterval: 120_000 });

	return (
		<footer>
			<div className="footer-item" id="footer-clients">
				<span>{isLoading ? "..." : (metrics?.connectedClients ?? "0")}</span>visitors online
			</div>
			<div className="footer-item" id="footer-timestamp">
				<span></span>18:27:20z
			</div>
			<div className="footer-item" id="footer-github">
				Report a bug, request a feature, or send ❤️ on&nbsp;
				<a href="https://github.com/sebastiankrll/simradar21" rel="noopener noreferrer" target="_blank">
					GitHub
				</a>
			</div>
			<div className="footer-item" id="footer-version">
				v0.0.1
			</div>
		</footer>
	);
}
