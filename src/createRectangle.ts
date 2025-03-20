// import { Cartograph } from ".";
import { Polygon, Feature, Point, GeoJsonProperties } from 'geojson';
import * as turf from '@turf/turf';

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

export function createRectangle(props: CreateRectangleOptions): FetchRectangleResult {
    const scaleFactor = (() => {
        const [a, b] = props.scale.split(":").map(parseFloat);
        return b / a;
    })();

    const widthMeters = (props.width / 1000) * scaleFactor;
    const heightMeters = (props.height / 1000) * scaleFactor;

    const north = turf.destination(props.center, heightMeters / 1000 / 2, 0).geometry.coordinates;
    const south = turf.destination(props.center, heightMeters / 1000 / 2, 180).geometry.coordinates;
    const west = turf.destination(props.center, widthMeters / 1000 / 2, -90).geometry.coordinates;
    const east = turf.destination(props.center, widthMeters / 1000 / 2, 90).geometry.coordinates;
    const northEast = turf.point([east[0], north[1]]).geometry.coordinates;
    const northWest = turf.point([west[0], north[1]]).geometry.coordinates;
    const southEast = turf.point([east[0], south[1]]).geometry.coordinates;
    const southWest = turf.point([west[0], south[1]]).geometry.coordinates;

    let rectangleOutput: Feature<Polygon, GeoJsonProperties> = turf.polygon([[northEast, northWest, southWest, southEast, northEast]]);
    if (props.bearing) {
        rectangleOutput = turf.transformRotate(rectangleOutput, props.bearing, { pivot: props.center });
    }

    return {
        rectangle: rectangleOutput,
        northEast,
        northWest,
        southWest,
        southEast,
    };
}
