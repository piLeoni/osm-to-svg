"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OSM2SVG = void 0;
const fetchArea_1 = require("./fetchArea");
const fetchBoundingBox_1 = require("./fetchBoundingBox");
const fetchOSMFile_1 = require("./fetchOSMFile");
class OSM2SVG {
    constructor() {
        this.fetchArea = fetchArea_1.fetchArea;
        this.fetchBoundingBox = fetchBoundingBox_1.fetchBoundingBox;
        this.fetchOSMFile = fetchOSMFile_1.fetchOSMFile;
    }
}
exports.OSM2SVG = OSM2SVG;
//# sourceMappingURL=index.js.map