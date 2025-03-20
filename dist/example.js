"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const _1 = require(".");
const osm2svg = new _1.OSM2SVG();
const center = {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Point', coordinates: [-122.393723, 37.795471] }
};
const scale = "1:10000";
const width = 152;
const height = 108;
const bearing = 0;
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
        }
    ]
}).then(data => {
    fs_1.default.writeFileSync("little-map.svg", data.svg.generate());
    fs_1.default.writeFileSync("little-map.json", JSON.stringify(data.geoJSON, null, 2));
});
//# sourceMappingURL=example.js.map