# OSM-to-SVG

Convert OpenStreetMap (OSM) data to SVG.

![Previw](https://github.com/piLeoni/osm-to-svg/blob/main/InkscapeScreenshot.png)

## Installation

```sh
npm install osm-to-svg
```

## Features

- Fetch OSM data with customizable scale and dimensions
- Support for OSM ways and relations filtering
- GeoJSON property to SVG tag conversion
- Boundary clipping for lines and polygons
- Metric measurements and coordinate projection
- Rotatable map views with bearing control


## Command line use

```sh
npx osm-to-svgsvg --lon -122.393723 --lat 37.795471 --width 200mm --height 100mm --scale 1:10000 --query 'way["highway"~"primary|secondary|pedestrian|tertiary|residential"]' --query 'way["building"]' --svg output.svg --geojson output.geojson
```

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

## License

MIT

