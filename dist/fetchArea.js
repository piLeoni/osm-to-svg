"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchArea = fetchArea;
const bbox_1 = require("@turf/bbox");
const createBounds_1 = require("./createBounds");
const fetchOSM_1 = require("./fetchOSM");
const osmtogeojson_1 = __importDefault(require("osmtogeojson"));
const geojson2svg_1 = require("geojson2svg");
const utils_1 = require("./utils");
const proj4_1 = __importDefault(require("proj4"));
function fetchArea(props) {
    const unitsToMM = 3.7795275591;
    const spatialScale = { unitsToPixles: unitsToMM };
    const widthMM = typeof props.width === "number" ? props.width : (0, utils_1.parseLength)(props.width);
    const heightMM = typeof props.height === "number" ? props.height : (0, utils_1.parseLength)(props.height);
    return new Promise((resolve, reject) => {
        (() => __awaiter(this, void 0, void 0, function* () {
            try {
                const { bounds, northWest, southEast } = (0, createBounds_1.createBounds)(Object.assign(Object.assign({}, props), { width: widthMM / 1000, height: heightMM / 1000 }));
                const bb = (0, bbox_1.bbox)(bounds);
                const boundingBox = [bb[1], bb[0], bb[3], bb[2]];
                const response = yield (0, fetchOSM_1.fetchOSM)({ boundingBox, query: props.query || ['way["highway"]'] }).catch(console.error);
                if (response && "data" in response) {
                    const pixelSizes = { width: widthMM * spatialScale.unitsToPixles, height: heightMM * spatialScale.unitsToPixles };
                    const geoJSON = (0, osmtogeojson_1.default)(response.data, { flatProperties: false });
                    const filtered = geoJSON.features
                        .map((f) => {
                        if (f.geometry.type === "Polygon")
                            return (0, utils_1.clipPolygonWithinPolygon)(f, bounds);
                        if (f.geometry.type === "LineString")
                            return (0, utils_1.clipLinesWithinPolygon)(f, bounds);
                    });
                    geoJSON.features = filtered.flat(Infinity);
                    const converter = new geojson2svg_1.GeoJSON2SVG({
                        viewportSize: pixelSizes,
                        mapExtent: { top: northWest[1], left: northWest[0], right: southEast[0], bottom: southEast[1] },
                        coordinateConverter: (coordinates) => {
                            const [x, y] = (0, proj4_1.default)(`+proj=gnom +lat_0=${props.center.geometry.coordinates[1]} +lon_0=${props.center.geometry.coordinates[0]} +x_0=0 +y_0=0 +ellps=WGS84 +datum=WGS84 +units=m +no_defs`, coordinates);
                            return [x, y];
                        }
                    });
                    const svgPaths = [];
                    geoJSON.features
                        .map(f => (Object.assign(Object.assign({}, f), { properties: (0, utils_1.JSONPropertiesToXMLTags)(f.properties, "_") })))
                        .forEach((f) => {
                        const options = Object.assign({}, (props.propertiesAsTags && f.properties &&
                            {
                                attributes: Object.keys(f.properties).map(key => ({
                                    property: `properties.${key}`,
                                    type: 'dynamic',
                                    key: key
                                }))
                            }));
                        converter.convert(f, options).forEach(p => svgPaths.push(p));
                    });
                    resolve({
                        geoJSON: {
                            collection: geoJSON,
                            clippingArea: bounds
                        },
                        svg: {
                            paths: svgPaths,
                            clippingArea: converter.convert(bounds)[0],
                            generate: () => (0, utils_1.buildSVG)({ width: widthMM, height: heightMM, svgPaths })
                        }
                    });
                }
            }
            catch (e) {
                reject(e);
            }
        }))();
    });
}
//# sourceMappingURL=fetchArea.js.map