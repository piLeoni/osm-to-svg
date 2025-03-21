import { Polygon, Feature, Point, GeoJsonProperties } from 'geojson';
import {destination, point, polygon, transformRotate} from "@turf/turf"
import { getScaleFactor } from './utils';
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

export function createBounds(props: CreateBoundsOptions): FetchBoundsResult {

    const scaleFactor = getScaleFactor(props.scale)

    const widthMeters = props.width * scaleFactor;
    const heightMeters = props.height * scaleFactor;

    const north = destination(props.center, heightMeters / 1000 / 2, 0).geometry.coordinates;
    const south = destination(props.center, heightMeters / 1000 / 2, 180).geometry.coordinates;
    const west = destination(props.center, widthMeters / 1000 / 2, -90).geometry.coordinates;
    const east = destination(props.center, widthMeters / 1000 / 2, 90).geometry.coordinates;
    const northEast = point([east[0], north[1]]).geometry.coordinates;
    const northWest = point([west[0], north[1]]).geometry.coordinates;
    const southEast = point([east[0], south[1]]).geometry.coordinates;
    const southWest = point([west[0], south[1]]).geometry.coordinates;

    let bounds: Feature<Polygon, GeoJsonProperties> = polygon([[northEast, northWest, southWest, southEast, northEast]]);
    if (props.bearing) {
        bounds = transformRotate(bounds, props.bearing, { pivot: props.center });
    }

    return {
        bounds,
        northEast,
        northWest,
        southWest,
        southEast,
    };
}
