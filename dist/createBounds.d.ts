import { Polygon, Feature, Point, GeoJsonProperties } from 'geojson';
export interface CreateBoundsOptions {
    center: Feature<Point, GeoJsonProperties>;
    width: number;
    height: number;
    bearing?: number;
    scale: string;
}
export interface FetchBoundsResult {
    bounds: Feature<Polygon, GeoJsonProperties>;
    northEast: number[];
    northWest: number[];
    southEast: number[];
    southWest: number[];
}
export type CreateBounds = (props: CreateBoundsOptions) => FetchBoundsResult;
export declare function createBounds(props: CreateBoundsOptions): FetchBoundsResult;
