import { Feature, Point, GeoJsonProperties, FeatureCollection } from 'geojson';
import { OSMQueryAtom } from "./fetchOSM";
export interface FetchAreaOptions {
    center: Feature<Point, GeoJsonProperties>;
    width: number | string;
    height: number | string;
    bearing?: number;
    scale: string;
    query?: string[] | string | OSMQueryAtom[];
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
