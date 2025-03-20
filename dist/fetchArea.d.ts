import { Feature, Point, GeoJsonProperties, FeatureCollection } from 'geojson';
import { OSMQueryAtom } from "./fetchOSM";
export interface FetchAreaOptions {
    center: Feature<Point, GeoJsonProperties>;
    width: number;
    height: number;
    bearing?: number;
    scale: string;
    query: OSMQueryAtom[] | string;
    propertiesAsTags?: boolean;
}
export interface FetchAreaResult {
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
export type FetchArea = (props: FetchAreaOptions) => Promise<FetchAreaResult>;
export declare function fetchArea(props: FetchAreaOptions): Promise<FetchAreaResult>;
