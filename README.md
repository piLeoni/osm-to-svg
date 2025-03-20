# OSM-to-SVG

Convert OpenStreetMap (OSM) data to SVG with precise geographic control.

![Previw](https://github.com/piLeoni/osm-to-svg/blob/main/InkscapeScreenshot.png)

## Installation

```sh
npm install osm-to-svg
```

## Features

- Geographic precision with customizable scale and dimensions
- Support for OSM ways and relations filtering
- GeoJSON property to SVG tag conversion
- Boundary clipping for lines and polygons
- Metric measurements and coordinate projection
- Rotatable map views with bearing control

## Interface

### OSM2SVGOptions

```ts
interface OSM2SVGOptions {
  center: Feature<Point, GeoJsonProperties>; // Center point of the map
  width: number;        // Width in millimeters
  height: number;       // Height in millimeters
  scale: string;        // Map scale (e.g., "1:10000")
  bearing?: number;     // Rotation in degrees (default: 0)
  propertiesAsTags?: boolean; // Convert GeoJSON properties to SVG tags
  query: Array<{
    way?: string;       // Query for ways
    relation?: string;  // Query for relations
    filters?: string[]; // Additional filters
  }>;
}
```

### FetchAreaOptions

```ts
interface FetchAreaOptions {
  center: Feature<Point, GeoJsonProperties>;
  width: number;
  height: number;
  bearing?: number;
  scale: string;
  query: OSMQueryAtom[] | string; // A custom query can be passed as a string
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

## Usage Example

```ts
import { OSM2SVG } from 'osm-to-svg';

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
    width: 152,
    height: 108,
    scale: "1:10000",
    bearing: 0,
    propertiesAsTags: true,
    query: [
        { way: '"natural"="coastline"' },
        { way: '"building"' },
        { way: '"highway"' }
    ]
}).then(data => {
    // Generate SVG output
    console.log(data.svg.generate());
    // Access raw GeoJSON
    console.log(data.geoJSON.collection);
});
```

## Output

The library produces two types of output:

### SVG Format

- Vector graphics representation of the map
- Maintains geographic accuracy
- Includes converted OSM tags as SVG attributes
- Suitable for web display or print

### GeoJSON Format

- Raw geographic data
- Contains all OSM properties
- Includes clipping area for boundary control
- Useful for further processing or analysis

## Dependencies

- `@turf/turf`: Geospatial calculations
- `axios`: HTTP requests
- `geojson2svg`: GeoJSON to SVG conversion
- `proj4`: Coordinate projections
- `xmlbuilder2`: SVG generation

## License

MIT

