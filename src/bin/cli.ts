#!/usr/bin/env node

import { OSM2SVG } from '../index.js'; // Adjust the path as needed
import * as fs from 'fs';
import { Feature, GeoJsonProperties, Point } from 'geojson';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

interface CLIArgs {
    lat?: number;
    lon?: number;
    width: string;
    height: string;
    scale: string;
    bearing: number;
    svg: string;
    geojson: string;
    query: string[];
    properties_at_tags:boolean;
    bbox?: string;
    osm?: string;
}

const argv = yargs(hideBin(process.argv))
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
    .argv as CLIArgs;

const osm2svg = new OSM2SVG();

function parseBoundingBox(value: string): [number, number, number, number] {
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
            const center: Feature<Point, GeoJsonProperties> = {
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'Point',
                    coordinates: [argv.lon as number, argv.lat as number],
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