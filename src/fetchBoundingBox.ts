import { Feature, FeatureCollection, GeoJsonProperties, Geometry, Polygon } from "geojson";
import { bboxPolygon } from "@turf/bbox-polygon";
import osmtogeojson from "osmtogeojson";
import { GeoJSON2SVG } from "geojson2svg";
import { fetchOSM, OSMQueryAtom } from "./fetchOSM";
import { JSONPropertiesToXMLTags, buildSVG, parseLength } from "./utils";

export interface FetchBoundingBoxOptions {
    boundingBox: number[]; // [south, west, north, east]
    width: number | string;
    height: number | string;
    query?: string[] | string | OSMQueryAtom[];
    propertiesAsTags?: boolean;
}

export interface FetchBoundingBoxResult {
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

export type FetchBoundingBox = (props: FetchBoundingBoxOptions) => Promise<FetchBoundingBoxResult>;

export function fetchBoundingBox(props: FetchBoundingBoxOptions): Promise<FetchBoundingBoxResult> {
    return new Promise((resolve, reject) => {
        (async () => {
            try {
                const widthMM = typeof props.width === "number" ? props.width : parseLength(props.width);
                const heightMM = typeof props.height === "number" ? props.height : parseLength(props.height);
                const unitsToMM = 3.7795275591;
                const pixelSizes = { width: widthMM * unitsToMM, height: heightMM * unitsToMM };

                const [south, west, north, east] = props.boundingBox;
                const clippingArea = bboxPolygon([west, south, east, north]);

                const response = await fetchOSM({
                    boundingBox: props.boundingBox,
                    query: props.query || ['way["highway"]']
                });

                if (!response || !("data" in response)) {
                    throw new Error("OSM request failed: no response data");
                }

                const geoJSON = osmtogeojson(response.data, { flatProperties: false }) as FeatureCollection;
                const converter = new GeoJSON2SVG({
                    viewportSize: pixelSizes,
                    mapExtent: { top: north, left: west, right: east, bottom: south }
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
