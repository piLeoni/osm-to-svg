"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchOSM = fetchOSM;
const axios_1 = __importDefault(require("axios"));
const https_1 = __importDefault(require("https"));
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
                    console.warn("This way of passing queries is deprecatd.");
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
        axios_1.default.post("https://overpass-api.de/api/interpreter", `data=${encodeURIComponent(query)}`, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            httpsAgent: new https_1.default.Agent({ rejectUnauthorized: false }),
        })
            .then(data => resolve(data))
            .catch(reject);
    });
}
//# sourceMappingURL=fetchOSM.js.map