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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBounds = createBounds;
const turf = __importStar(require("@turf/turf"));
const utils_1 = require("./utils");
function createBounds(props) {
    const scaleFactor = (0, utils_1.getScaleFactor)(props.scale);
    const widthMeters = props.width * scaleFactor;
    const heightMeters = props.height * scaleFactor;
    const north = turf.destination(props.center, heightMeters / 1000 / 2, 0).geometry.coordinates;
    const south = turf.destination(props.center, heightMeters / 1000 / 2, 180).geometry.coordinates;
    const west = turf.destination(props.center, widthMeters / 1000 / 2, -90).geometry.coordinates;
    const east = turf.destination(props.center, widthMeters / 1000 / 2, 90).geometry.coordinates;
    const northEast = turf.point([east[0], north[1]]).geometry.coordinates;
    const northWest = turf.point([west[0], north[1]]).geometry.coordinates;
    const southEast = turf.point([east[0], south[1]]).geometry.coordinates;
    const southWest = turf.point([west[0], south[1]]).geometry.coordinates;
    let bounds = turf.polygon([[northEast, northWest, southWest, southEast, northEast]]);
    if (props.bearing) {
        bounds = turf.transformRotate(bounds, props.bearing, { pivot: props.center });
    }
    return {
        bounds,
        northEast,
        northWest,
        southWest,
        southEast,
    };
}
//# sourceMappingURL=createBounds.js.map