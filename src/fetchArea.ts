import { Polygon, Feature, Point, GeoJsonProperties, LineString, FeatureCollection, Geometry } from 'geojson';
import * as turf from '@turf/turf';
import { createBounds } from "./createBounds";
import { fetchOSM, OSMQueryAtom } from "./fetchOSM";
import osmtogeojson from "osmtogeojson";
import { GeoJSON2SVG } from 'geojson2svg';
import {
    clipLinesWithinPolygon,
    clipPolygonWithinPolygon,
    JSONPropertiesToXMLTags,
    buildSVG,
    parseLength
} from "./utils"
import proj4 from 'proj4';


export interface FetchAreaOptions {
    center: Feature<Point, GeoJsonProperties>,
    width: number | string,
    height: number | string,
    bearing?: number,
    scale: string,
    query?: string[] | string | OSMQueryAtom[]
    propertiesAsTags?: boolean
}

export interface FetchAreaResult {
    geoJSON: {
        collection: FeatureCollection,
        clippingArea: Feature
    }
    svg: {
        generate: () => string
        paths: string[]
        clippingArea: string
    }
}

export type FetchArea = (props: FetchAreaOptions) => Promise<FetchAreaResult>;

export function fetchArea(props: FetchAreaOptions): Promise<FetchAreaResult> {

    const unitsToMM = 3.7795275591
    const spatialScale = { unitsToPixles: unitsToMM }

    const widthMM = typeof props.width === "number" ? props.width : parseLength(props.width)
    const heightMM = typeof props.height === "number" ? props.height : parseLength(props.height)

    return new Promise((resolve, reject) => {
        (async () => {
            try {
                const { bounds, northWest, southEast } = createBounds({ ...props, width: widthMM / 1000, height: heightMM / 1000 });
                const bbox = turf.bbox(bounds)
                const boundingBox = [bbox[1], bbox[0], bbox[3], bbox[2]]

                const response = await fetchOSM({ boundingBox, query: props.query || ['way["highway"]'] }).catch(console.error)
                if (response && "data" in response) {
                    const pixelSizes = { width: widthMM * spatialScale.unitsToPixles, height: heightMM * spatialScale.unitsToPixles }

                    const geoJSON = osmtogeojson(response.data, { flatProperties: false });
                    const filtered = geoJSON.features
                        .map((f: Feature) => {
                            if (f.geometry.type === "Polygon") return clipPolygonWithinPolygon(f as Feature<Polygon>, bounds)
                            if (f.geometry.type === "LineString") return clipLinesWithinPolygon(f as Feature<LineString>, bounds)
                        })
                    geoJSON.features = filtered.flat(Infinity) as Feature<Geometry, GeoJsonProperties>[]



                    const converter = new GeoJSON2SVG({
                        viewportSize: pixelSizes,
                        mapExtent: { top: northWest[1], left: northWest[0], right: southEast[0], bottom: southEast[1] },
                        coordinateConverter: (coordinates) => {
                            const [x, y] = proj4(`+proj=gnom +lat_0=${props.center.geometry.coordinates[1]} +lon_0=${props.center.geometry.coordinates[0]} +x_0=0 +y_0=0 +ellps=WGS84 +datum=WGS84 +units=m +no_defs`, coordinates)
                         
                            return [x, y]
                        }
                    });
                    const svgPaths: string[] = []
                    geoJSON.features
                        .map(f => ({ ...f, properties: JSONPropertiesToXMLTags(f.properties as Record<string, number | boolean | object>, "_") }))
                        .forEach((f: Feature) => {
                            const options = {
                                ...(props.propertiesAsTags && f.properties &&
                                {
                                    attributes: Object.keys(f.properties).map(key => ({
                                        property: `properties.${key}`,
                                        type: 'dynamic',
                                        key: key
                                    }))

                                })
                            }
                            converter.convert(f, options).forEach(p => svgPaths.push(p))
                        })
                    resolve({
                        geoJSON: {
                            collection: geoJSON,
                            clippingArea: bounds
                        },
                        svg: {
                            paths: svgPaths,
                            clippingArea: converter.convert(bounds)[0],
                            generate: () => buildSVG({ width: widthMM, height: heightMM, svgPaths})
                        }
                    })
                }

            }
            catch (e) { reject(e) }

        })()
    });
}
