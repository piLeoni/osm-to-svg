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
}
export type FetchOSMResult = Promise<object>;
export type CreateRectangle = (props: FetchOSMOptions) => FetchOSMResult;
export declare function fetchOSM(props: FetchOSMOptions): FetchOSMResult;
