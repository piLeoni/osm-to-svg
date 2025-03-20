import { Polygon, Feature, LineString } from 'geojson';
export declare function clipLinesWithinPolygon(line: Feature<LineString>, splitter: Feature<Polygon>): any[];
export declare function clipPolygonWithinPolygon(polygon: Feature<Polygon>, splitter: Feature<Polygon>): any[];
export declare function JSONPropertiesToXMLTags(obj: Record<string, any>, separator?: string, prefix?: string): Record<string, any>;
export declare function buildSVG(props: {
    width: number;
    height: number;
    svgPaths: string[];
}): string;
