#!/usr/bin/env node

import { OSM2SVG } from '../index.js'; // Adjust the path as needed
import * as fs from 'fs';
import { Feature, GeoJsonProperties, Point } from 'geojson';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

interface CLIArgs {
    lat: number;
    lon: number;
    width: string;
    height: string;
    scale: string;
    bearing: number;
    svg: string;
    geojson: string;
    query: string;
    properties_at_tags:boolean
}

const argv = yargs(hideBin(process.argv))
    .option('lat', {
        alias: 'latitude',
        describe: 'Latitude of the center point',
        type: 'number',
        demandOption: true,
    })
    .option('lon', {
        alias: 'longitude',
        describe: 'Longitude of the center point',
        type: 'number',
        demandOption: true,
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
        describe: "geojson output file",
        type: 'string',
        default: "map.geojson"
    })
    .option('properties_at_tags', {
        describe: "convert geojson properties to svg tags",
        type: 'boolean',
        default: false
    })
    .help()
    .alias('help', 'h')
    .argv as CLIArgs;

const osm2svg = new OSM2SVG();

const center: Feature<Point, GeoJsonProperties> = {
    type: 'Feature',
    properties: {},
    geometry: {
        type: 'Point',
        coordinates: [argv.lon, argv.lat],
    },
};

osm2svg
    .fetchArea({
        center,
        width: argv.width,
        height: argv.height,
        scale: argv.scale,
        bearing: argv.bearing,
        propertiesAsTags: argv.properties_at_tags,
        query: argv.query,
    })
    .then((data) => {
        fs.writeFileSync(`${argv.svg}`, data.svg.generate());
        fs.writeFileSync(`${argv.geojson}`, JSON.stringify(data.geoJSON.collection, null, 2));
        console.log(`SVG written to ${argv.svg}`);
        console.log(`GeoJSON written to ${argv.geojson}`);
    })
    .catch((error) => {
        console.error('Error:', error);
    });