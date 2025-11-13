import { PilotFlightPlan, PilotLong, PilotTimes, VatsimData, VatsimPilot, VatsimPilotFlightPlan } from "./types/vatsim.js"

let prev: PilotLong[] = []

export function mapPilots(latestVatsimData: VatsimData): void {
    const pilotsLong: PilotLong[] = latestVatsimData.pilots.map(pilot => {
        const transceiverData = latestVatsimData.transceivers.find(transceiver => transceiver.callsign === pilot.callsign)
        const transceiver = transceiverData?.transceivers[0]

        // Search for pilot, that might have disconnected and reconnected. If so, assign old _id to prevent different db entries
        const prevPilot = prev.find(p =>
            p.cid === pilot.cid &&
            p.callsign === pilot.callsign &&
            p.groundspeed === 0 && // If prev groundspeed == 0, mark this flight as finished. TODO: Check if at gate for improved robustness.
            p.connected === false // Only if prev disconnected, otherwise assign new _id
        )
        const _id = prevPilot?._id || `${pilot.cid}_${pilot.callsign}_${pilot.logon_time}`

        return {
            // v TrackPoint v
            _id: _id,
            latitude: pilot.latitude,
            longitude: pilot.longitude,
            altitude_agl: transceiver?.heightAglM ? Math.round(transceiver.heightAglM * 3.28084) : pilot.altitude,
            altitude_ms: transceiver?.heightMslM ? Math.round(transceiver.heightMslM * 3.28084) : pilot.altitude,
            groundspeed: pilot.groundspeed,
            vertical_speed: 0, // TODO: v/s calculation
            heading: pilot.heading,
            connected: true, // TODO: check if connected or disconnected flight
            timestamp: new Date(pilot.last_updated),
            // v PilotShort v
            callsign: pilot.callsign,
            aircraft: pilot.flight_plan?.aircraft_short || "A320",
            transponder: pilot.flight_plan?.assigned_transponder ? Number(pilot.flight_plan?.assigned_transponder) : 2000,
            frequency: transceiver?.frequency || 122800000,
            // v PilotLong v
            cid: pilot.cid,
            name: pilot.name,
            server: pilot.server,
            pilot_rating: pilot.pilot_rating,
            military_rating: pilot.military_rating,
            qnh_i_hg: pilot.qnh_i_hg,
            qnh_mb: pilot.qnh_mb,
            flight_plan: mapPilotFlightPlan(pilot.flight_plan),
            logon_time: new Date(pilot.logon_time),
            times: mapPilotTimes(pilot.flight_plan)
        }
    })

    // console.log(pilotsLong[0])
}

function mapPilotFlightPlan(fp?: VatsimPilotFlightPlan): PilotFlightPlan | null {
    if (!fp) return null
    return {
        flight_rules: fp.flight_rules === "I" ? "IFR" : "VFR",
        ac_reg: "D-ABON", // TODO: Assign random, individual aircraft from database
        departure: fp.departure,
        arrival: fp.arrival,
        alternate: fp.alternate,
        filed_tas: Number(fp.cruise_tas),
        filed_altitude: Number(fp.altitude),
        enroute_time: parseStrToSeconds(fp.enroute_time),
        fuel_time: parseStrToSeconds(fp.fuel_time),
        enroute_dist: 0, // TODO: Calculate distance
        remarks: fp.remarks,
        route: fp.route,
        revision_id: fp.revision_id
    }
}

function mapPilotTimes(fp?: VatsimPilotFlightPlan): PilotTimes { // TODO: Calculate times
    return {
        off_block: fp ? parseStrToDate(fp.deptime) : new Date(),
        scheduled_dep: new Date(),
        actual_dep: new Date(),
        scheduled_arr: new Date(),
        actual_arr: new Date(),
        on_block: new Date()
    }
}

// "0325" -> 12,300 seconds
function parseStrToSeconds(time: string): number {
    const hours = Number(time.slice(0, 2))
    const minutes = Number(time.slice(2, 4))

    return hours * 3600 + minutes * 60
}

// "0020" -> 2025-11-14T00:20:00.000Z (next day)
function parseStrToDate(time: string): Date {
    const hours = Number(time.slice(0, 2))
    const minutes = Number(time.slice(2, 4))
    const now = new Date()

    const target = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        hours,
        minutes,
        0,
        0
    ))

    // If target time has already passed today, assume next day
    // TODO: Revise
    // if (target.getTime() < now.getTime()) {
    //     target.setUTCDate(target.getUTCDate() + 1)
    // }

    return target
}