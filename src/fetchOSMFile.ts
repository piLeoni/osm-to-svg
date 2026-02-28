import fs from "fs";
import { JSDOM } from "jsdom";
import { Feature, FeatureCollection, GeoJsonProperties, Geometry, Polygon } from "geojson";
import { bbox, bboxPolygon } from "@turf/turf";
import osmtogeojson from "osmtogeojson";
import { GeoJSON2SVG } from "geojson2svg";
import { JSONPropertiesToXMLTags, buildSVG, parseLength } from "./utils";

export interface FetchOSMFileOptions {
    filePath: string;
    width: number | string;
    height: number | string;
    boundingBox?: number[]; // [south, west, north, east]
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

export function fetchOSMFile(props: FetchOSMFileOptions): Promise<FetchOSMFileResult> {
    return new Promise((resolve, reject) => {
        (async () => {
            try {
                const widthMM = typeof props.width === "number" ? props.width : parseLength(props.width);
                const heightMM = typeof props.height === "number" ? props.height : parseLength(props.height);
                const unitsToMM = 3.7795275591;
                const pixelSizes = { width: widthMM * unitsToMM, height: heightMM * unitsToMM };

                const fileContent = fs.readFileSync(props.filePath, "utf8");
                const trimmed = fileContent.trim();
                const osmInput = trimmed.startsWith("{")
                    ? JSON.parse(trimmed)
                    : new JSDOM(fileContent, { contentType: "text/xml" }).window.document;

                const geoJSON = osmtogeojson(osmInput, { flatProperties: false }) as FeatureCollection;
                const computedBbox = bbox(geoJSON);
                const [west, south, east, north] = computedBbox;
                const [bbSouth, bbWest, bbNorth, bbEast] = props.boundingBox || [south, west, north, east];
                const clippingArea = bboxPolygon([bbWest, bbSouth, bbEast, bbNorth]);

                const converter = new GeoJSON2SVG({
                    viewportSize: pixelSizes,
                    mapExtent: { top: bbNorth, left: bbWest, right: bbEast, bottom: bbSouth }
                });

                const svgPaths: string[] = [];
                (geoJSON.features as Feature<Geometry, GeoJsonProperties>[])
                    .map((f) => ({ ...f, properties: JSONPropertiesToXMLTags((f.properties || {}) as Record<string, number | boolean | object>, "_") }))
                    .forEach((f) => {
                        const options = {
                            ...(props.propertiesAsTags && f.properties && {
                                attributes: Object.keys(f.properties).map((key) => ({
                                    property: `properties.${key}`,
                                    type: "dynamic",
                                    key
                                }))
                            })
                        };
                        converter.convert(f, options).forEach((p) => svgPaths.push(p));
                    });

                resolve({
                    geoJSON: {
                        collection: geoJSON,
                        clippingArea
                    },
                    svg: {
                        paths: svgPaths,
                        clippingArea: converter.convert(clippingArea)[0],
                        generate: () => buildSVG({ width: widthMM, height: heightMM, svgPaths })
                    }
                });
            } catch (e) {
                reject(e);
            }
        })();
    });
}
