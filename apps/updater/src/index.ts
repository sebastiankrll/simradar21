import 'dotenv/config'
import { CronJob } from "cron"
import { updateAirports } from "./airports.js"
import { updateFIRs } from './fir.js'

CronJob.from({
    cronTime: '0 6 * * *',
    onTick: async () => {
        await updateAirports()
        await updateFIRs()
    },
    start: true,
    runOnInit: true,
    timeZone: 'UTC',
})