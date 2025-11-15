import 'dotenv/config'
import { OurAirportsCsv } from "@sk/types";
import axios from "axios";
import csvParser from "csv-parser";
import { pgUpsertAirports } from '@sk/db/pg';

const CSV_URL = 'https://ourairports.com/data/airports.csv'

export async function updateAirports(): Promise<void> {
    const response = await axios.get(CSV_URL, { responseType: 'stream' })
    const airports: OurAirportsCsv[] = []

    await new Promise((resolve, reject) => {
        response.data
            .pipe(csvParser())
            .on('data', (row: OurAirportsCsv) => airports.push(row))
            .on('end', () => resolve(airports))
            .on('error', (err: Error) => reject(err))
    })

    await pgUpsertAirports(airports)

    // console.log(airports[0])
    // console.log(`Fetched ${airports.length} airports. Updating database...`)
}