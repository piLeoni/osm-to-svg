"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const turf = __importStar(require("@turf/turf"));
const createRectangle_1 = require("./createRectangle");
const fetchOSM_1 = require("./fetchOSM");
const osmtogeojson_1 = __importDefault(require("osmtogeojson"));
const geojson2svg_1 = require("geojson2svg");
const utils_1 = require("./utils");
const proj4_1 = __importDefault(require("proj4"));
function fetchArea(props) {
    return new Promise((resolve, reject) => {
        (() => __awaiter(this, void 0, void 0, function* () {
            try {
                const { rectangle, northWest, southEast, } = (0, createRectangle_1.createRectangle)(props);
                const bbox = turf.bbox(rectangle);
                const boundingBox = [bbox[1], bbox[0], bbox[3], bbox[2]];
                const response = yield (0, fetchOSM_1.fetchOSM)({ boundingBox, query: props.query }).catch(console.error);
                if (response && "data" in response) {
                    const pixelSizes = { width: props.width * 3.7795275591, height: props.height * 3.7795275591 };
                    const geoJSON = (0, osmtogeojson_1.default)(response.data, { flatProperties: false });
                    const filtered = geoJSON.features
                        .map((f) => {
                        if (f.geometry.type === "Polygon")
                            return (0, utils_1.clipPolygonWithinPolygon)(f, rectangle);
                        if (f.geometry.type === "LineString")
                            return (0, utils_1.clipLinesWithinPolygon)(f, rectangle);
                    });
                    geoJSON.features = filtered.flat(Infinity);
                    const converter = new geojson2svg_1.GeoJSON2SVG({
                        viewportSize: pixelSizes,
                        mapExtent: { top: northWest[1], left: northWest[0], right: southEast[0], bottom: southEast[1] },
                        coordinateConverter: (coordinates) => {
                            return (0, proj4_1.default)(`+proj=gnom +lat_0=${props.center.geometry.coordinates[1]} +lon_0=${props.center.geometry.coordinates[0]} +x_0=0 +y_0=0 +ellps=WGS84 +datum=WGS84 +units=m +no_defs`, coordinates);
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
                            clippingArea: rectangle
                        },
                        svg: {
                            paths: svgPaths,
                            clippingArea: converter.convert(rectangle)[0],
                            generate: () => (0, utils_1.buildSVG)({ width: props.width, height: props.height, svgPaths })
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