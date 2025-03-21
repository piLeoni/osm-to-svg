"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBounds = createBounds;
const turf_1 = require("@turf/turf");
const utils_1 = require("./utils");
function createBounds(props) {
    const scaleFactor = (0, utils_1.getScaleFactor)(props.scale);
    const widthMeters = props.width * scaleFactor;
    const heightMeters = props.height * scaleFactor;
    const north = (0, turf_1.destination)(props.center, heightMeters / 1000 / 2, 0).geometry.coordinates;
    const south = (0, turf_1.destination)(props.center, heightMeters / 1000 / 2, 180).geometry.coordinates;
    const west = (0, turf_1.destination)(props.center, widthMeters / 1000 / 2, -90).geometry.coordinates;
    const east = (0, turf_1.destination)(props.center, widthMeters / 1000 / 2, 90).geometry.coordinates;
    const northEast = (0, turf_1.point)([east[0], north[1]]).geometry.coordinates;
    const northWest = (0, turf_1.point)([west[0], north[1]]).geometry.coordinates;
    const southEast = (0, turf_1.point)([east[0], south[1]]).geometry.coordinates;
    const southWest = (0, turf_1.point)([west[0], south[1]]).geometry.coordinates;
    let bounds = (0, turf_1.polygon)([[northEast, northWest, southWest, southEast, northEast]]);
    if (props.bearing) {
        bounds = (0, turf_1.transformRotate)(bounds, props.bearing, { pivot: props.center });
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