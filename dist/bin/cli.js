#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../index.js"); // Adjust the path as needed
const fs = __importStar(require("fs"));
const yargs_1 = __importDefault(require("yargs"));
const helpers_1 = require("yargs/helpers");
const argv = (0, yargs_1.default)((0, helpers_1.hideBin)(process.argv))
    .option('lat', {
    alias: 'latitude',
    describe: 'Latitude of the center point',
    type: 'number',
})
    .option('lon', {
    alias: 'longitude',
    describe: 'Longitude of the center point',
    type: 'number',
})
    .option('width', {
    describe: 'Width of the map in',
    type: 'string',
    default: "100mm",
})
    .option('height', {
    describe: 'Height of the map in meters',
    type: 'string',
    default: "100mm",
})
    .option('scale', {
    describe: 'Scale of the map (e.g., "1:10000")',
    type: 'string',
    default: '1:10000',
})
    .option('bearing', {
    describe: 'Bearing of the map in degrees',
    type: 'number',
    default: 0,
})
    .option('svg', {
    describe: "svg output file",
    type: 'string',
    default: "map.svg"
})
    .option('geojson', {
    describe: "geojson output file",
    type: 'string',
    default: "map.geojson"
})
    .option('query', {
    describe: 'Overpass query (repeatable)',
    type: 'string',
    array: true,
    default: ['way["highway"]']
})
    .option('properties_at_tags', {
    describe: "convert geojson properties to svg tags",
    type: 'boolean',
    default: false
})
    .option('bbox', {
    describe: 'Bounding box as "south,west,north,east"',
    type: 'string'
})
    .option('osm', {
    describe: 'Input local .osm (XML) or Overpass JSON file',
    type: 'string'
})
    .help()
    .alias('help', 'h')
    .argv;
const osm2svg = new index_js_1.OSM2SVG();
function parseBoundingBox(value) {
    const parsed = value
        .split(",")
        .map((part) => Number(part.trim()));
    if (parsed.length !== 4 || parsed.some((v) => Number.isNaN(v))) {
        throw new Error(`Invalid --bbox value "${value}". Expected "south,west,north,east".`);
    }
    const [south, west, north, east] = parsed;
    if (south >= north || west >= east) {
        throw new Error(`Invalid --bbox order "${value}". Expected south<north and west<east.`);
    }
    return [south, west, north, east];
}
const bbox = argv.bbox ? parseBoundingBox(argv.bbox) : undefined;
if (!argv.osm && !bbox && (typeof argv.lat !== "number" || typeof argv.lon !== "number")) {
    throw new Error("Provide either --osm, --bbox, or both --lat and --lon.");
}
const promise = argv.osm
    ? osm2svg.fetchOSMFile({
        filePath: argv.osm,
        width: argv.width,
        height: argv.height,
        boundingBox: bbox,
        propertiesAsTags: argv.properties_at_tags
    })
    : bbox
        ? osm2svg.fetchBoundingBox({
            boundingBox: bbox,
            width: argv.width,
            height: argv.height,
            propertiesAsTags: argv.properties_at_tags,
            query: argv.query
        })
        : (() => {
            const center = {
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'Point',
                    coordinates: [argv.lon, argv.lat],
                },
            };
            return osm2svg.fetchArea({
                center,
                width: argv.width,
                height: argv.height,
                scale: argv.scale,
                bearing: argv.bearing,
                propertiesAsTags: argv.properties_at_tags,
                query: argv.query,
            });
        })();
promise
    .then((data) => {
    fs.writeFileSync(`${argv.svg}`, data.svg.generate());
    fs.writeFileSync(`${argv.geojson}`, JSON.stringify(data.geoJSON.collection, null, 2));
    console.log(`SVG written to ${argv.svg}`);
    console.log(`GeoJSON written to ${argv.geojson}`);
})
    .catch((error) => {
    console.error('Error:', error);
});
//# sourceMappingURL=cli.js.map