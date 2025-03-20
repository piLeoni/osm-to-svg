export interface OSMQueryAtom {
    way?: string;
    relation?: string;
    filters?: string[];
}
export interface FetchOSMOptions {
    boundingBox: number[];
    query: OSMQueryAtom[] | string;
}
export declare type FetchOSMResult = Promise<any>;
export declare type CreateRectangle = (props: FetchOSMOptions) => FetchOSMResult;
export declare function fetchOSM(props: FetchOSMOptions): FetchOSMResult;
