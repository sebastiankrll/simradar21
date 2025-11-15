import { WsShort } from "@sk/types/vatsim";
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
            console.log(`✅ Subscribed to ws:short. Currently subscribed to ${count} channel(s).`)
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