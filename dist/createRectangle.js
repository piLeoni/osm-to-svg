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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRectangle = void 0;
const turf = __importStar(require("@turf/turf"));
function createRectangle(props) {
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
    let rectangleOutput = turf.polygon([[northEast, northWest, southWest, southEast, northEast]]);
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
exports.createRectangle = createRectangle;
//# sourceMappingURL=createRectangle.js.map