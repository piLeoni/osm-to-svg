export declare const DEFAULT_OVERPASS_URL = "https://overpass-api.de/api/interpreter";
export declare const OVERPASS_USER_AGENT = "osm-to-svg/0.2.0 (+https://github.com/piLeoni/osm-to-svg)";
/**
 * @deprecated Use string-based queries instead.
 */
export interface OSMQueryAtom {
    way?: string;
    relation?: string;
    filters?: string[];
}
export interface FetchOSMOptions {
    boundingBox: number[];
    query: string[] | string | OSMQueryAtom[];
    overpassUrl?: string;
}
export type FetchOSMResult = Promise<object>;
export type CreateRectangle = (props: FetchOSMOptions) => FetchOSMResult;
export declare function getOverpassUrl(override?: string): string;
export declare function getOverpassHeaders(): Record<string, string>;
export declare function fetchOSM(props: FetchOSMOptions): FetchOSMResult;
