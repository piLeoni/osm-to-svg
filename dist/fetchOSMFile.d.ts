import { Feature, FeatureCollection, GeoJsonProperties, Polygon } from "geojson";
export interface FetchOSMFileOptions {
    filePath: string;
    width: number | string;
    height: number | string;
    boundingBox?: number[];
    propertiesAsTags?: boolean;
}
export interface FetchOSMFileResult {
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
export type FetchOSMFile = (props: FetchOSMFileOptions) => Promise<FetchOSMFileResult>;
export declare function fetchOSMFile(props: FetchOSMFileOptions): Promise<FetchOSMFileResult>;
