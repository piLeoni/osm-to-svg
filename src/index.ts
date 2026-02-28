import { fetchArea, FetchArea } from "./fetchArea";
import { fetchBoundingBox, FetchBoundingBox } from "./fetchBoundingBox";
import { fetchOSMFile, FetchOSMFile } from "./fetchOSMFile";

export class OSM2SVG {
    constructor() {}
    public fetchArea: FetchArea= fetchArea
    public fetchBoundingBox: FetchBoundingBox = fetchBoundingBox
    public fetchOSMFile: FetchOSMFile = fetchOSMFile
}

