import { Polygon, Feature, Point, GeoJsonProperties } from 'geojson';
export interface CreateRectangleOptions {
    center: Feature<Point, GeoJsonProperties>;
    width: number;
    height: number;
    bearing?: number;
    scale: string;
}
export interface FetchRectangleResult {
    rectangle: Feature<Polygon, GeoJsonProperties>;
    northEast: number[];
    northWest: number[];
    southEast: number[];
    southWest: number[];
}
export type CreateRectangle = (props: CreateRectangleOptions) => FetchRectangleResult;
export declare function createRectangle(props: CreateRectangleOptions): FetchRectangleResult;
