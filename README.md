# OSM-to-SVG

Convert OpenStreetMap (OSM) data to SVG.

![Previw](https://github.com/piLeoni/osm-to-svg/blob/main/InkscapeScreenshot.png)

## Installation

```sh
npm install osm-to-svg
```

## Local development

Run locally from this repository (without published `npx` package):

```sh
npm install
npm run build
node dist/bin/cli.js --help
```

## Features

- Fetch OSM data with customizable scale and dimensions
- Support for OSM ways and relations filtering
- GeoJSON property to SVG tag conversion
- Boundary clipping for lines and polygons
- Metric measurements and coordinate projection
- Rotatable map views with bearing control
- Direct CLI support for bounding-box input
- Local `.osm` / Overpass JSON file input


## Command line use

Center-point mode:

```sh
npx osm-to-svg --lon -122.393723 --lat 37.795471 --width 200mm --height 100mm --scale 1:10000 --query 'way["highway"~"primary|secondary|pedestrian|tertiary|residential"]' --query 'way["building"]' --svg output.svg --geojson output.geojson
```

Using a bounding box directly:

```sh
npx osm-to-svg --bbox "37.788,-122.401,37.802,-122.386" --width 200mm --height 100mm --query 'way["building"]' --svg output.svg --geojson output.geojson
```

Using a local `.osm` file:

```sh
npx osm-to-svg --osm ./extract.osm --width 200mm --height 100mm --svg output.svg --geojson output.geojson
```

For local development in this repository, replace `npx osm-to-svg` with:

```sh
node dist/bin/cli.js
```

### CLI input modes

- `--lat` + `--lon`: use center-point mode (`--scale` and `--bearing` apply here)
- `--bbox "south,west,north,east"`: fetch directly from Overpass for the given bounds
- `--osm ./file.osm`: convert local OSM XML or Overpass JSON
- Optional when using `--osm`: also pass `--bbox` to force output extent

If none of `--osm`/`--bbox` is used, `--lat` and `--lon` are required.

## Usage Example

```ts
// const { OSM2SVG } = require( 'osm-to-svg');
// const fs = require("fs")

import { OSM2SVG } from 'osm-to-svg';
import * as fs from "fs"

const osm2svg = new OSM2SVG();

// Define map center point
const center = {
    type: 'Feature',
    properties: {},
    geometry: {
        type: 'Point',
        coordinates: [-122.393723, 37.795471]
    }
};

// Fetch and convert OSM data
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
    // Generate SVG output
    fs.writeFileSync("map.svg", data.svg.generate());
    // Access raw GeoJSON
    fs.writeFileSync("map.geojson", JSON.stringify(data.geoJSON.collection, null,2));
});
```

## Interface


### FetchAreaOptions

```ts
interface FetchAreaOptions {
  center: Feature<Point, GeoJsonProperties>;
  width: number;
  height: number;
  bearing?: number;
  scale: string;
  query: string[] | string; // A custom query can be passed as a string
  propertiesAsTags?: boolean;
}
```

### Additional API methods

```ts
fetchBoundingBox(options: {
  boundingBox: [number, number, number, number]; // [south, west, north, east]
  width: number | string;
  height: number | string;
  query?: string[] | string;
  propertiesAsTags?: boolean;
})

fetchOSMFile(options: {
  filePath: string; // .osm XML or Overpass JSON file
  width: number | string;
  height: number | string;
  boundingBox?: [number, number, number, number];
  propertiesAsTags?: boolean;
})
```

Example:

```ts
const osm2svg = new OSM2SVG();

const { svg, geoJSON } = await osm2svg.fetchBoundingBox({
  boundingBox: [37.788, -122.401, 37.802, -122.386],
  width: "200mm",
  height: "100mm",
  query: ['way["building"]']
});
```

### FetchAreaResult

```ts
interface FetchAreaResult {
  geoJSON: {
    collection: FeatureCollection;
    clippingArea: Feature;
  };
  svg: {
    generate: () => string;
    paths: string[];
    clippingArea: string;
  };
}
```

## Output

The library produces two types of output:

### SVG Format

- Vector graphics representation of the map
- Maintains geographic accuracy
- Includes converted OSM tags as SVG attributes
- Suitable for web display or print
- Tags values are xml-escaped

### GeoJSON Format

- Raw geographic data
- Contains all OSM properties
- Includes clipping area for boundary control
- Useful for further processing or analysis

## Tests

Run all tests locally:

```sh
npm test
```

Current tests include CLI integration checks for:

- `--bbox` / `--osm` flag visibility in help
- local file conversion (`--osm`) using an offline fixture
- input validation for malformed `--bbox`

## License

MIT

