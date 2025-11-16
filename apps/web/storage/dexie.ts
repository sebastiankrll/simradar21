import Dexie from "dexie";

type StaticVersions = {
    airportsVersion: string;
    traconsVersion: string;
    firsVersion: string;
}

export async function initLocalDatabase(): Promise<void> {
    dxCheckForNewVersions()
}

async function dxCheckForNewVersions(): Promise<void> {
    const response = await fetch(`http://localhost:5000/api/static/versions`)
    const serverVersions: StaticVersions = await response.json()

    const localVersions: StaticVersions = JSON.parse(localStorage.getItem("databaseVersions") || "{}")

    if (serverVersions.airportsVersion !== localVersions.airportsVersion) {
        await fetchStaticData("airports")
    }
    if (serverVersions.traconsVersion !== localVersions.traconsVersion) {
        await fetchStaticData("tracons")
    }
    if (serverVersions.firsVersion !== localVersions.firsVersion) {
        await fetchStaticData("firs")
    }

    localStorage.setItem("databaseVersions", JSON.stringify(serverVersions))
}

async function fetchStaticData(type: string): Promise<void> {
    const response = await fetch(`http://localhost:5000/api/static/${type}`)
    const data = await response.json()

    console.log(data)
}

// const db = new Dexie('MyDatabase')

// db.version(1).stores({
//     friends: '++id, name, age'
// })