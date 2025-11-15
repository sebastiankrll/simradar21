import { WsShort } from "@sk/types/vatsim";
import Redis from "ioredis";

const redis = new Redis()

export function rdsPushWsShort(wsShort: WsShort) {
    redis.publish("ws:short", JSON.stringify(wsShort))
    console.log("✅ ws:short published on redis!")
}