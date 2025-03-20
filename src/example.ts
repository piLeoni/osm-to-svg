import fs from "fs";
import { OSM2SVG } from ".";
import { Feature, Point, GeoJsonProperties} from "geojson";


const osm2svg = new OSM2SVG()
const center:Feature<Point, GeoJsonProperties> = {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Point', coordinates: [-122.393723, 37.795471] }
}
const scale = "1:10000"
const width = 152
const height = 108
const bearing = 0


osm2svg.fetchArea({
    center, width, height, bearing, scale,
    propertiesAsTags: true,
    query: [
        { way: '"natural"="coastline"' },
        { relation: '"natural"="coastline"' },
        { way: '"building"' },
        {
            way: '"highway"',
            filters: ['pedestrian',
                'elevator',
                'service',
                'living_street',
                'tertiary',
                'primary',
                'residential',
                'secondary',
                'cycleway',
                'unclassified',
                'steps',
                'corridor',
                'path']
        }]
}).then(data => {
    fs.writeFileSync("little-map.svg", data.svg.generate())
    fs.writeFileSync("little-map.json", JSON.stringify(data.geoJSON, null, 2))
})

