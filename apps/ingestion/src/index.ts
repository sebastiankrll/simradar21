import axios from "axios"
import { VatsimData } from "./types/vatsim.js";

const VATSIM_DATA_URL = "https://data.vatsim.net/v3/vatsim-data.json"
const FETCH_INTERVAL = 5_000

let updating = false
let lastUpdateTimestamp = "2000-01-01T00:00:00.00000Z"

async function fetchVatsimData(): Promise<void> {
    if (updating) return

    updating = true
    try {
        const response = await axios.get<VatsimData>(VATSIM_DATA_URL)
        const data = response.data

        if (new Date(data.general.update_timestamp) > new Date(lastUpdateTimestamp)) {
            lastUpdateTimestamp = data.general.update_timestamp

            // TODO: Do something with the data (save to DB, process, etc.)
            console.log(`✅ Retrieved ${data.pilots.length} pilots and ${data.controllers.length} controllers.`)
        } else {
            console.log("Nothing changed.")
        }

    } catch (error) {
        console.error("❌ Error fetching VATSIM data:", error instanceof Error ? error.message : error)
    }
    updating = false
}

fetchVatsimData()
setInterval(fetchVatsimData, FETCH_INTERVAL)