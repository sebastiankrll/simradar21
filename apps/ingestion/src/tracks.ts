import type { PilotLong } from "@sr24/types/interface";
import { fromLonLat } from "./utils/helpers.js";

export function mapTrackPoints(pilots: PilotLong[]): Map<string, Buffer> {
	const trackPoints: Map<string, Buffer> = new Map();
	for (const pilot of pilots) {
		const encoded = encodeTrackPoint(pilot);
		trackPoints.set(pilot.id, encoded);
	}
	return trackPoints;
}

const TRACKPOINT_SIZE = 25;

export function encodeTrackPoint(p: PilotLong): Buffer {
	const buf = Buffer.allocUnsafe(TRACKPOINT_SIZE);

	const [x, y] = fromLonLat([p.longitude, p.latitude]);
	buf.writeInt32BE(x, 0);
	buf.writeInt32BE(y, 4);

	buf.writeInt16BE(roundAltitude(p.altitude_ms) / 100, 8);
	buf.writeInt16BE(roundAltitude(p.altitude_agl) / 100, 10);

	buf.writeInt16BE(p.groundspeed, 12);
	buf.writeInt16BE(roundAltitude(p.vertical_speed), 14);
	buf.writeUInt16BE(p.heading, 16);

	const color = getTrackPointColor(p.altitude_agl, p.altitude_ms);
	const rgb = parseInt(color.slice(1), 16);
	buf.writeUInt8((rgb >> 16) & 0xff, 18);
	buf.writeUInt8((rgb >> 8) & 0xff, 19);
	buf.writeUInt8(rgb & 0xff, 20);

	buf.writeUInt32BE(Math.floor(p.timestamp.getTime() / 1000), 21);

	return buf;
}

function roundAltitude(altitude: number): number {
	return Math.round(altitude / 100) * 100;
}

function getTrackPointColor(altitude_agl: number, altitude_ms: number): string {
	if (altitude_agl < 50) {
		return "#4d5f83";
	}

	const degrees = (300 / 50000) * altitude_ms + 60;
	const colorSectors = [
		{ color: "red", angle: 0, rgb: [255, 0, 0] },
		{ color: "yellow", angle: 60, rgb: [255, 255, 0] },
		{ color: "green", angle: 120, rgb: [0, 255, 0] },
		{ color: "cyan", angle: 180, rgb: [0, 255, 255] },
		{ color: "blue", angle: 240, rgb: [0, 0, 255] },
		{ color: "magenta", angle: 300, rgb: [255, 0, 255] },
		{ color: "red", angle: 360, rgb: [255, 0, 0] },
	];

	let lowerBoundIndex = 0;
	for (let i = 0; i < colorSectors.length; i++) {
		if (degrees < colorSectors[i].angle) {
			lowerBoundIndex = i - 1;
			break;
		}
	}

	const lowerBound = colorSectors[lowerBoundIndex];
	const upperBound = colorSectors[lowerBoundIndex + 1];
	const interpolationFactor = (degrees - lowerBound.angle) / (upperBound.angle - lowerBound.angle);

	const resultRGB = [];
	for (let i = 0; i < 3; i++) {
		resultRGB[i] = Math.round(lowerBound.rgb[i] + interpolationFactor * (upperBound.rgb[i] - lowerBound.rgb[i]));
	}
	const hexString = `#${resultRGB.map((c) => c.toString(16).padStart(2, "0")).join("")}`;

	return hexString;
}
