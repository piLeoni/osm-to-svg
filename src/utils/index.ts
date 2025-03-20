import * as turf from "@turf/turf"
import { Polygon, Feature, LineString } from 'geojson';
import xmlEscape from "xml-escape"
import { create } from 'xmlbuilder2';

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
  return Object.keys(obj).reduce((acc: Record<string, string | number | object | boolean>, key: string):Record<string, object | number | object | boolean> => {
    const newKey: string = `${prefix ? `${prefix}${separator}${key}` : key}`.replace(/:/g, '_');
    const value = obj[key];

    if (typeof value === 'object' && value !== null) {
      Object.assign(acc, JSONPropertiesToXMLTags(value as Record<string, object | number | object | boolean> , separator, newKey));
    } else {
      acc[newKey] = typeof value === "string" ? xmlEscape(value) : value;
    }
    return acc as Record<string, object | number | object | boolean>;
  }, {});
}


export function buildSVG(props: { width: number; height: number, svgPaths: string[] }): string {
  const doc = create({ version: '1.0' })
    .ele('svg', {
      width: `${props.width}mm`,
      height: `${props.height}mm`,
      xmlns: 'http://www.w3.org/2000/svg',
    })
    .ele('style')
    .txt('path { stroke: black; stroke-width: 0.1; fill: none; }')
    .up();

  props.svgPaths.forEach((path) => {
    doc.import(create(path).root());
  });

  return doc.end({ prettyPrint: true });
}
