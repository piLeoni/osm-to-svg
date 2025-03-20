export interface OSMQueryAtom {
    way?: string;
    relation?: string;
    filters?: string[];
}
export interface FetchOSMOptions {
    boundingBox: number[];
    query: OSMQueryAtom[] | string;
}
export type FetchOSMResult = Promise<object>;
export type CreateRectangle = (props: FetchOSMOptions) => FetchOSMResult;
export declare function fetchOSM(props: FetchOSMOptions): FetchOSMResult;
