import { rdsSetSingle } from "@sk/db/redis";
import axios from "axios";

const RELEASE_URL = "https://api.github.com/repos/sebastiankrll/simradar24-data/releases/latest";
const BASE_DATA_URL = "https://github.com/sebastiankrll/simradar24-data/releases/download/";

let version: string | null = null;

export async function updateAirlines(): Promise<void> {
	if (!(await isNewRelease())) return;

	try {
		const airlinesJsonUrl = `${BASE_DATA_URL}${version}/airlines.json`;

		const response = await axios.get(airlinesJsonUrl, {
			responseType: "json",
		});

		await rdsSetSingle("static_airlines:all", response.data);
		await rdsSetSingle("static_airlines:version", version?.replace(/^v/, "") || "1.0.0");
	} catch (error) {
		console.error(`Error checking for new airlines data: ${error}`);
	}
}

async function isNewRelease(): Promise<boolean> {
	try {
		const response = await axios.get(RELEASE_URL);
		const release = response.data.tag_name;

		if (release !== version) {
			version = release;
			return true;
		}
	} catch (error) {
		console.error(`Error checking for updates: ${error}`);
	}

	return false;
}
