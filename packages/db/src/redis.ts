import { AirportLong, ControllerLong, PilotLong, WsShort } from "@sk/types/vatsim";
import Redis from "ioredis";

const redis = new Redis()

export function rdsPubWsShort(wsShort: WsShort) {
    redis.publish("ws:short", JSON.stringify(wsShort))
    // console.log("✅ ws:short published on redis!")
}

export function rdsSubWsShort(callback: (data: WsShort) => void) {
    redis.subscribe("ws:short", (err, count) => {
        if (err) {
            console.error("Failed to subscribe: %s", err.message)
        } else {
            // console.log(`✅ Subscribed to ws:short. Currently subscribed to ${count} channel(s).`)
        }
    })

    redis.on("message", (channel, data) => {
        if (channel === "ws:short") {
            try {
                const parsed: WsShort = JSON.parse(data)
                // console.log("✅ Received new data on ws:short.")
                callback(parsed)
            } catch (err) {
                console.error("Failed to parse ws:short data", err)
            }
        }
    })
}

export async function rdsSetAll(pilotsLong: PilotLong[], controllersLong: ControllerLong[], airportsLong: AirportLong[]) {
    rdsSetPilots(pilotsLong)
    rdsSetControllers(controllersLong)
    rdsSetAirports(airportsLong)
}

async function rdsSetPilots(pilotsLong: PilotLong[]) {
    const pipeline = redis.pipeline()

    for (const pilotLong of pilotsLong) {
        const key = `pilots:${pilotLong.callsign}`
        pipeline.set(key, JSON.stringify(pilotLong))
        pipeline.expire(key, 60)
        pipeline.sadd("pilots:active", pilotLong.callsign)
    }

    await pipeline.exec()
    // console.log(`✅ ${pilotsLong.length} pilots set in pilots:active.`)
}

export async function rdsGetPilot(callsign: string): Promise<string | null> {
    const data = await redis.get(`pilots:${callsign}`)
    if (!data) return null

    return JSON.parse(data)
}

async function rdsSetControllers(controllersLong: ControllerLong[]) {
    const pipeline = redis.pipeline()

    for (const controllerLong of controllersLong) {
        const key = `controllers:${controllerLong.callsign}`
        pipeline.set(key, JSON.stringify(controllerLong))
        pipeline.expire(key, 60)
        pipeline.sadd("controllers:active", controllerLong.callsign)
    }

    await pipeline.exec()
    // console.log(`✅ ${controllersLong.length} controllers set in controllers:active.`)
}

export async function rdsGetController(callsign: string): Promise<string | null> {
    const data = await redis.get(`controllers:${callsign}`)
    if (!data) return null

    return JSON.parse(data)
}

async function rdsSetAirports(airportsLong: AirportLong[]) {
    const pipeline = redis.pipeline()

    for (const airportLong of airportsLong) {
        const key = `airports:${airportLong.icao}`
        pipeline.set(key, JSON.stringify(airportLong))
        pipeline.expire(key, 60)
        pipeline.sadd("airports:active", airportLong.icao)
    }

    await pipeline.exec()
    // console.log(`✅ ${airportsLong.length} airports set in airports:active.`)
}

export async function rdsGetAirport(icao: string): Promise<string | null> {
    const data = await redis.get(`airports:${icao}`)
    if (!data) return null

    return JSON.parse(data)
}