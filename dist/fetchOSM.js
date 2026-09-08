"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OVERPASS_USER_AGENT = exports.DEFAULT_OVERPASS_URL = void 0;
exports.getOverpassUrl = getOverpassUrl;
exports.getOverpassHeaders = getOverpassHeaders;
exports.fetchOSM = fetchOSM;
const axios_1 = __importDefault(require("axios"));
const https_1 = __importDefault(require("https"));
exports.DEFAULT_OVERPASS_URL = "https://overpass-api.de/api/interpreter";
exports.OVERPASS_USER_AGENT = "osm-to-svg/0.2.0 (+https://github.com/piLeoni/osm-to-svg)";
function getOverpassUrl(override) {
    return override || process.env.OVERPASS_URL || exports.DEFAULT_OVERPASS_URL;
}
function getOverpassHeaders() {
    return {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        "User-Agent": exports.OVERPASS_USER_AGENT,
    };
}
function fetchOSM(props) {
    return new Promise((resolve, reject) => {
        const query = typeof props.query === "string" ? props.query :
            `
            [out:json];
            (${props.query.map((q) => {
                var _a, _b;
                if (typeof q === "string")
                    return `${q.replace(/;$/, "")}(${props.boundingBox.join(",")});`;
                if (typeof q === "object" && ("way" in q || "relation" in q)) {
                    console.warn("This way of passing queries is deprecated. Use string[] instead");
                    if (q.way)
                        return `way[${q.way}${((_a = q.filters) === null || _a === void 0 ? void 0 : _a.length) ? `~"${q.filters.join("|")}"` : ``}](${props.boundingBox.join(",")});`;
                    if (q.relation)
                        return `relation[${q.relation}${((_b = q.filters) === null || _b === void 0 ? void 0 : _b.length) ? `~"${q.filters.join("|")}"` : ``}](${props.boundingBox.join(",")});`;
                }
            }).join("\n")});
            out body;
            >;
            out skel qt;
            `;
        axios_1.default.post(getOverpassUrl(props.overpassUrl), `data=${encodeURIComponent(query)}`, {
            headers: getOverpassHeaders(),
            httpsAgent: new https_1.default.Agent({ rejectUnauthorized: false }),
        })
            .then(data => resolve(data))
            .catch((error) => {
            var _a;
            if (axios_1.default.isAxiosError(error) && ((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 406) {
                reject(new Error("Overpass API returned HTTP 406 Not Acceptable. " +
                    "The public instance rejects generic User-Agent strings. " +
                    "If this persists, set OVERPASS_URL to another interpreter " +
                    "(for example https://overpass.kumi.systems/api/interpreter)."));
                return;
            }
            reject(error);
        });
    });
}
//# sourceMappingURL=fetchOSM.js.map