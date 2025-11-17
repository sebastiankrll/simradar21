import { FIRFeature, FIRFeatureCollection, SimAwareTraconFeature, SimAwareTraconFeatureCollection, StaticAirport } from "@sk/types/db";
import Dexie, { EntityTable } from "dexie";
import { FeatureCollection } from "geojson";

interface StaticVersions {
    airportsVersion: string;
    traconsVersion: string;
    firsVersion: string;
}

interface DexieFeature {
    id: string;
    feature: FIRFeature | SimAwareTraconFeature;
}

interface DexieAirport {
    id: string;
    latitude: number;
    longitude: number;
    size: string;
    feature: StaticAirport;
}

const db = new Dexie('StaticDatabase') as Dexie & {
    airports: EntityTable<
        DexieAirport,
        "id"
    >,
    firs: EntityTable<
        DexieFeature,
        "id"
    >,
    tracons: EntityTable<
        DexieFeature,
        "id"
    >
}

db.version(1).stores({
    airports: 'id, latitude, longitude, size',
    firs: 'id',
    tracons: 'id'
})

export async function dxInitLocalDatabase(): Promise<void> {
    checkForNewVersions()
}

async function checkForNewVersions(): Promise<void> {
    const response = await fetch(`http://localhost:5000/api/static/versions`)
    const serverVersions: StaticVersions = await response.json()

    const localVersions: StaticVersions = JSON.parse(localStorage.getItem("databaseVersions") || "{}")

    if (serverVersions.airportsVersion !== localVersions.airportsVersion) {
        const data = await fetchStaticData("airports") as StaticAirport[]
        const airports: DexieAirport[] = data
            .map(a => ({
                id: a.id,
                latitude: a.latitude,
                longitude: a.longitude,
                size: a.size || "small_airport",
                feature: a
            }))

        storeAirports(airports)
    }

    if (serverVersions.firsVersion !== localVersions.firsVersion) {
        const collection = await fetchStaticData("firs") as FIRFeatureCollection
        const features: DexieFeature[] = collection.features
            .filter(f => f.properties?.id && f.properties.id.trim() !== "")
            .map(f => ({
                id: f.properties.id,
                feature: f
            }))

        storeFeatures(features, db.firs)
    }

    if (serverVersions.traconsVersion !== localVersions.traconsVersion) {
        const collection = await fetchStaticData("tracons") as SimAwareTraconFeatureCollection
        const features = collection.features
            .filter(f => f.properties?.id && f.properties.id.trim() !== "")
            .map(f => ({
                id: f.properties.id,
                feature: f as SimAwareTraconFeature
            }))

        storeFeatures(features, db.tracons)
    }

    // localStorage.setItem("databaseVersions", JSON.stringify(serverVersions))
}

async function fetchStaticData(type: string): Promise<StaticAirport[] | FeatureCollection> {
    const response = await fetch(`http://localhost:5000/api/static/${type}`)
    const data = await response.json()

    return data
}

async function storeAirports(airports: DexieAirport[]): Promise<void> {
    db.airports.bulkPut(airports).then(() => {
        console.log("Done adding airports")
    }).catch(e => {
        if (e.name === "BulkError") {
            console.error(`Some airports did not succeed. Completed: ${e.failures.length}`)
        } else {
            throw e
        }
    })
}

async function storeFeatures(features: DexieFeature[], db: EntityTable<DexieFeature, "id">): Promise<void> {
    db.bulkPut(features).then(() => {
        console.log("Done adding features")
    }).catch(e => {
        if (e.name === "BulkError") {
            console.error(`Some airports did not succeed. Completed: ${e.failures.length}`)
        } else {
            throw e
        }
    })
}

export async function dxGetAllAirports(): Promise<DexieAirport[]> {
    return await db.airports.toArray()
}