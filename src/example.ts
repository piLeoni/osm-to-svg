import fs from "fs";
import { OSM2SVG } from ".";
import { Feature, Point, GeoJsonProperties } from "geojson";

const osm2svg = new OSM2SVG()

const center: Feature<Point, GeoJsonProperties> = {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Point', coordinates: [-122.393723, 37.795471] }
}


osm2svg.fetchArea({
    center,
    width: "150mm",
    height: "100mm",
    bearing: 0,
    scale: "1:50000",
    propertiesAsTags: true,
    query: [
        'way["natural"="coastline"]',
        'relation["natural"="coastline"]',
        'way["building"]',
        'way["highway"~"primary|secondary|pedestrian|tertiary|residential"]',
        'way["bridge"="yes"]',
        'relation["bridge"="yes"]'
    ]
}).then(data => {
    fs.writeFileSync("little-map.svg", data.svg.generate())
    fs.writeFileSync("little-map.json", JSON.stringify(data.geoJSON, null, 2))
})

