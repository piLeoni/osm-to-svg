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
exports.fetchBoundingBox = fetchBoundingBox;
const turf_1 = require("@turf/turf");
const osmtogeojson_1 = __importDefault(require("osmtogeojson"));
const geojson2svg_1 = require("geojson2svg");
const fetchOSM_1 = require("./fetchOSM");
const utils_1 = require("./utils");
function fetchBoundingBox(props) {
    return new Promise((resolve, reject) => {
        (() => __awaiter(this, void 0, void 0, function* () {
            try {
                const widthMM = typeof props.width === "number" ? props.width : (0, utils_1.parseLength)(props.width);
                const heightMM = typeof props.height === "number" ? props.height : (0, utils_1.parseLength)(props.height);
                const unitsToMM = 3.7795275591;
                const pixelSizes = { width: widthMM * unitsToMM, height: heightMM * unitsToMM };
                const [south, west, north, east] = props.boundingBox;
                const clippingArea = (0, turf_1.bboxPolygon)([west, south, east, north]);
                const response = yield (0, fetchOSM_1.fetchOSM)({
                    boundingBox: props.boundingBox,
                    query: props.query || ['way["highway"]']
                });
                if (!response || !("data" in response)) {
                    throw new Error("OSM request failed: no response data");
                }
                const geoJSON = (0, osmtogeojson_1.default)(response.data, { flatProperties: false });
                const converter = new geojson2svg_1.GeoJSON2SVG({
                    viewportSize: pixelSizes,
                    mapExtent: { top: north, left: west, right: east, bottom: south }
                });
                const svgPaths = [];
                geoJSON.features
                    .map((f) => (Object.assign(Object.assign({}, f), { properties: (0, utils_1.JSONPropertiesToXMLTags)((f.properties || {}), "_") })))
                    .forEach((f) => {
                    const options = Object.assign({}, (props.propertiesAsTags && f.properties && {
                        attributes: Object.keys(f.properties).map((key) => ({
                            property: `properties.${key}`,
                            type: "dynamic",
                            key
                        }))
                    }));
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
                        generate: () => (0, utils_1.buildSVG)({ width: widthMM, height: heightMM, svgPaths })
                    }
                });
            }
            catch (e) {
                reject(e);
            }
        }))();
    });
}
//# sourceMappingURL=fetchBoundingBox.js.map