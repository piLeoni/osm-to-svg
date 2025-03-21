import { Polygon, Feature, LineString } from 'geojson';
export declare function clipLinesWithinPolygon(line: Feature<LineString>, splitter: Feature<Polygon>): (Feature<LineString, import("geojson").GeoJsonProperties> | Feature<LineString, import("geojson").GeoJsonProperties>[])[];
export declare function clipPolygonWithinPolygon(polygon: Feature<Polygon>, splitter: Feature<Polygon>): Feature<Polygon | import("geojson").MultiPolygon, import("geojson").GeoJsonProperties>[];
export declare function JSONPropertiesToXMLTags(obj: Record<string, object | number | object | boolean>, separator?: string, prefix?: string): Record<string, object | number | object | boolean>;
export declare function buildSVG(props: {
    width: number;
    height: number;
    svgPaths: string[];
    offsetX?: number;
    offsetY?: number;
    bearing?: number;
}): string;
export declare function parseLength(value: string | number): number;
export declare function getScaleFactor(scale: string): number;
export declare function rotateCoordinates(x: number, y: number, angleInDegrees: number, pivotX: number, pivotY: number): [number, number];
