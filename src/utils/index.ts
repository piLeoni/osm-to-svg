import * as turf from "@turf/turf"
import { Polygon, Feature, LineString } from 'geojson';
import xmlEscape from "xml-escape"
import { create } from 'xmlbuilder2';
import convert from 'convert-units';

export function clipLinesWithinPolygon(line: Feature<LineString>, splitter: Feature<Polygon>) {
  const output = []
  //Accept what is entirelly within the polygon
  if (turf.booleanWithin(line, splitter)) output.push(line)
  //Check if it does intersect the polygon
  if (turf.booleanIntersects(line, splitter)) {
    const sliced = turf.lineSplit(line, splitter);
    if (sliced.features.length) {
      sliced.features.map((f, i) => f.properties = { ...line.properties, sliced: true, id: `${line.properties!.id!}/slice/${i}` })
      // return only the segments within it
      output.push(sliced.features.filter(_f => turf.booleanWithin(_f, splitter)))
    }
  }
  return output
}
export function clipPolygonWithinPolygon(polygon: Feature<Polygon>, splitter: Feature<Polygon>) {
  const output = []
  //Accept what is entirelly within the polygon
  if (turf.booleanWithin(polygon, splitter)) output.push(polygon)
  //Check if it does intersect the polygon
  if (turf.booleanIntersects(polygon, splitter)) {
    const sliced = turf.intersect(turf.featureCollection([polygon, splitter]))
    if (sliced) {
      sliced.properties = { ...polygon.properties, sliced: true };
      output.push(sliced);
    }
  }
  return output
}


export function JSONPropertiesToXMLTags(obj: Record<string, object | number | object | boolean>, separator: string = '_', prefix: string = ''): Record<string, object | number | object | boolean> {
  return Object.keys(obj).reduce((acc: Record<string, string | number | object | boolean>, key: string): Record<string, object | number | object | boolean> => {
    const newKey: string = `${prefix ? `${prefix}${separator}${key}` : key}`.replace(/:/g, '_');
    const value = obj[key];

    if (typeof value === 'object' && value !== null) {
      Object.assign(acc, JSONPropertiesToXMLTags(value as Record<string, object | number | object | boolean>, separator, newKey));
    } else {
      acc[newKey] = typeof value === "string" ? xmlEscape(value) : value;
    }
    return acc as Record<string, object | number | object | boolean>;
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
export function buildSVG(props: { width: number ; height: number ; svgPaths: string[]; offsetX?: number; offsetY?: number, bearing?:number }): string {
  // const offsetX = props.offsetX || 0;
  // const offsetY = props.offsetY || 0;

  const doc = create({ version: '1.0' })
    .ele('svg', {
      width:`${props.width}mm`,
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
    group.import(create(path).root());
  });

  return doc.end({ prettyPrint: true });
}


type LengthUnit = 'mm' | 'cm' | 'm' | 'km' | 'in' | 'ft' | 'yd';

export function parseLength(value: string | number): number {
  if (typeof value === "number") return value;
  // Default unit is 'mm' if no unit is specified
  const match = value.toString().match(/^([\d.]+)(mm|cm|m|km|in|ft|yd)?$/);
  if (!match) throw new Error(`Invalid length format: ${value}`);

  const [, num, unit = 'mm'] = match;
  const output = convert(parseFloat(num)).from(unit as LengthUnit).to("mm");  // Convert to mm
  return output
}


export function getScaleFactor(scale: string): number {
  const [a, b] = scale.split(":").map(parseFloat);
  return b / a; // Converts real-world meters to scaled meters
}

export function rotateCoordinates(x: number, y: number, angleInDegrees: number, pivotX: number, pivotY: number): [number, number] {
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

