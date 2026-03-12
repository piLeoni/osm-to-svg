"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clipLinesWithinPolygon = clipLinesWithinPolygon;
exports.clipPolygonWithinPolygon = clipPolygonWithinPolygon;
exports.JSONPropertiesToXMLTags = JSONPropertiesToXMLTags;
exports.buildSVG = buildSVG;
exports.parseLength = parseLength;
exports.getScaleFactor = getScaleFactor;
exports.rotateCoordinates = rotateCoordinates;
const xml_escape_1 = __importDefault(require("xml-escape"));
const xmlbuilder2_1 = require("xmlbuilder2");
const convert_units_1 = __importDefault(require("convert-units"));
const boolean_within_1 = require("@turf/boolean-within");
const boolean_intersects_1 = require("@turf/boolean-intersects");
const line_split_1 = require("@turf/line-split");
const intersect_1 = require("@turf/intersect");
const helpers_1 = require("@turf/helpers");
function clipLinesWithinPolygon(line, splitter) {
    const output = [];
    //Accept what is entirelly within the polygon
    if ((0, boolean_within_1.booleanWithin)(line, splitter))
        output.push(line);
    //Check if it does intersect the polygon
    if ((0, boolean_intersects_1.booleanIntersects)(line, splitter)) {
        const sliced = (0, line_split_1.lineSplit)(line, splitter);
        if (sliced.features.length) {
            sliced.features.map((f, i) => f.properties = Object.assign(Object.assign({}, line.properties), { sliced: true, id: `${line.properties.id}/slice/${i}` }));
            // return only the segments within it
            output.push(sliced.features.filter(_f => (0, boolean_within_1.booleanWithin)(_f, splitter)));
        }
    }
    return output;
}
function clipPolygonWithinPolygon(polygon, splitter) {
    const output = [];
    //Accept what is entirelly within the polygon
    if ((0, boolean_within_1.booleanWithin)(polygon, splitter))
        output.push(polygon);
    //Check if it does intersect the polygon
    if ((0, boolean_intersects_1.booleanIntersects)(polygon, splitter)) {
        const sliced = (0, intersect_1.intersect)((0, helpers_1.featureCollection)([polygon, splitter]));
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
// export function buildSVG(props: { width: number | string; height: number | string, svgPaths: string[] }): string {
//   const doc = create({ version: '1.0' })
//     .ele('svg', {
//       width: typeof props.width === "string" ? props.width : `${props.width}mm`,
//       height: typeof props.height === "string" ? props.height : `${props.height}mm`,
//       xmlns: 'http://www.w3.org/2000/svg',
//     })
//     .ele('style')
//     .txt('path { stroke: black; stroke-width: 0.1; fill: none; }')
//     .up();
//   props.svgPaths.forEach((path) => {
//     doc.import(create(path).root());
//   });
//   return doc.end({ prettyPrint: true });
// }
function buildSVG(props) {
    // const offsetX = props.offsetX || 0;
    // const offsetY = props.offsetY || 0;
    const doc = (0, xmlbuilder2_1.create)({ version: '1.0' })
        .ele('svg', {
        width: `${props.width}mm`,
        height: `${props.height}mm`,
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: `0 0 ${props.width}mm ${props.height}mm`
    })
        .ele('style')
        .txt('path { stroke: black; stroke-width: 0.1; fill: none; }')
        .up();
    // Wrap all paths inside a <g> element with translation
    const group = doc.ele('g', {
    // transform: `translate(${props.offsetX} ${(props.offsetY)})`
    // transform: `rotate(${-(props.bearing||0)}, ${((props.width*(1/3.7795275591))/2)} ${((props.height/(1/3.7795275591))/2)})`
    });
    props.svgPaths.forEach((path) => {
        group.import((0, xmlbuilder2_1.create)(path).root());
    });
    return doc.end({ prettyPrint: true });
}
function parseLength(value) {
    if (typeof value === "number")
        return value;
    // Default unit is 'mm' if no unit is specified
    const match = value.toString().match(/^([\d.]+)(mm|cm|m|km|in|ft|yd)?$/);
    if (!match)
        throw new Error(`Invalid length format: ${value}`);
    const [, num, unit = 'mm'] = match;
    const output = (0, convert_units_1.default)(parseFloat(num)).from(unit).to("mm"); // Convert to mm
    return output;
}
function getScaleFactor(scale) {
    const [a, b] = scale.split(":").map(parseFloat);
    return b / a; // Converts real-world meters to scaled meters
}
function rotateCoordinates(x, y, angleInDegrees, pivotX, pivotY) {
    // Convert angle to radians
    const angleInRadians = (angleInDegrees * Math.PI) / 180;
    // Step 1: Translate the point to the origin by subtracting the pivot point
    const translatedX = x - pivotX;
    const translatedY = y - pivotY;
    // Step 2: Apply the rotation formula
    const rotatedX = translatedX * Math.cos(angleInRadians) + translatedY * Math.sin(angleInRadians);
    const rotatedY = -translatedX * Math.sin(angleInRadians) + translatedY * Math.cos(angleInRadians);
    // Step 3: Translate the rotated point back by adding the pivot point
    const finalX = rotatedX + pivotX;
    const finalY = rotatedY + pivotY;
    // Return the final rotated coordinates
    return [finalX, finalY];
}
//# sourceMappingURL=index.js.map