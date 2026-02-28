import { Feature, FeatureCollection, GeoJsonProperties, Polygon } from "geojson";
import { OSMQueryAtom } from "./fetchOSM";
export interface FetchBoundingBoxOptions {
    boundingBox: number[];
    width: number | string;
    height: number | string;
    query?: string[] | string | OSMQueryAtom[];
    propertiesAsTags?: boolean;
}
export interface FetchBoundingBoxResult {
    geoJSON: {
        collection: FeatureCollection;
        clippingArea: Feature<Polygon, GeoJsonProperties>;
    };
    svg: {
        generate: () => string;
        paths: string[];
        clippingArea: string;
    };
}
export type FetchBoundingBox = (props: FetchBoundingBoxOptions) => Promise<FetchBoundingBoxResult>;
export declare function fetchBoundingBox(props: FetchBoundingBoxOptions): Promise<FetchBoundingBoxResult>;
