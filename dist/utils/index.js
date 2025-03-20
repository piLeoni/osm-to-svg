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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clipLinesWithinPolygon = clipLinesWithinPolygon;
exports.clipPolygonWithinPolygon = clipPolygonWithinPolygon;
exports.JSONPropertiesToXMLTags = JSONPropertiesToXMLTags;
exports.buildSVG = buildSVG;
const turf = __importStar(require("@turf/turf"));
const xml_escape_1 = __importDefault(require("xml-escape"));
const xmlbuilder2_1 = require("xmlbuilder2");
function clipLinesWithinPolygon(line, splitter) {
    const output = [];
    //Accept what is entirelly within the polygon
    if (turf.booleanWithin(line, splitter))
        output.push(line);
    //Check if it does intersect the polygon
    if (turf.booleanIntersects(line, splitter)) {
        const sliced = turf.lineSplit(line, splitter);
        if (sliced.features.length) {
            sliced.features.map((f, i) => f.properties = Object.assign(Object.assign({}, line.properties), { sliced: true, id: `${line.properties.id}/slice/${i}` }));
            // return only the segments within it
            output.push(sliced.features.filter(_f => turf.booleanWithin(_f, splitter)));
        }
    }
    return output;
}
function clipPolygonWithinPolygon(polygon, splitter) {
    const output = [];
    //Accept what is entirelly within the polygon
    if (turf.booleanWithin(polygon, splitter))
        output.push(polygon);
    //Check if it does intersect the polygon
    if (turf.booleanIntersects(polygon, splitter)) {
        const sliced = turf.intersect(turf.featureCollection([polygon, splitter]));
        if (sliced) {
            sliced.properties = Object.assign(Object.assign({}, polygon.properties), { sliced: true });
            output.push(sliced);
        }
    }
    return output;
}
function JSONPropertiesToXMLTags(obj, separator = '_', prefix = '') {
    return Object.keys(obj).reduce((acc, key) => {
        const newKey = `${prefix ? `${prefix}${separator}${key}` : key}`.replace(/:/g, '_');
        const value = obj[key];
        if (typeof value === 'object' && value !== null) {
            Object.assign(acc, JSONPropertiesToXMLTags(value, separator, newKey));
        }
        else {
            acc[newKey] = typeof value === "string" ? (0, xml_escape_1.default)(value) : value;
        }
        return acc;
    }, {});
}
function buildSVG(props) {
    const doc = (0, xmlbuilder2_1.create)({ version: '1.0' })
        .ele('svg', {
        width: `${props.width}mm`,
        height: `${props.height}mm`,
        xmlns: 'http://www.w3.org/2000/svg',
    })
        .ele('style')
        .txt('path { stroke: black; stroke-width: 0.1; fill: none; }')
        .up();
    props.svgPaths.forEach((path) => {
        doc.import((0, xmlbuilder2_1.create)(path).root());
    });
    return doc.end({ prettyPrint: true });
}
//# sourceMappingURL=index.js.map