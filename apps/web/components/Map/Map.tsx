'use client'

import { Map as oMap, View } from "ol"
import { fromLonLat, transformExtent } from "ol/proj"
import { useEffect } from "react"
import './Map.css'
import { MapLibreLayer } from "@geoblocks/ol-maplibre-layer"
import { StyleSpecification } from "maplibre-gl"
import mapLibreStyle from './positron.json'

export default function Map() {
    useEffect(() => {
        // Init map
        const map = new oMap({
            target: "map",
            view: new View({
                center: fromLonLat([0, 0]),
                zoom: 3,
                maxZoom: 18,
                minZoom: 3,
                extent: transformExtent([-190, -80, 190, 80], 'EPSG:4326', 'EPSG:3857')
            }),
            controls: []
        })

        const mbLayer = new MapLibreLayer({
            mapLibreOptions: {
                style: mapLibreStyle as StyleSpecification,
            },
            properties: { type: 'base' }
        })
        map.addLayer(mbLayer)

        return () => {
            map.setTarget(undefined)
        }
    }, [])

    return (
        <>
            <div id="map" />
        </>
    )
}