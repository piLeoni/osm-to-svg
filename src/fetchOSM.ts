import axios from "axios"
import https from "https"

export const DEFAULT_OVERPASS_URL = "https://overpass-api.de/api/interpreter"
export const OVERPASS_USER_AGENT = "osm-to-svg/0.2.0 (+https://github.com/piLeoni/osm-to-svg)"

/** 
 * @deprecated Use string-based queries instead.
 */
export interface OSMQueryAtom {
    way?: string,
    relation?: string,
    filters?: string[]
}


export interface FetchOSMOptions {
    boundingBox: number[]
    query: string[] | string | OSMQueryAtom[]
    overpassUrl?: string
}

export type FetchOSMResult = Promise<object>
export type CreateRectangle = (props: FetchOSMOptions) => FetchOSMResult;

export function getOverpassUrl(override?: string): string {
    return override || process.env.OVERPASS_URL || DEFAULT_OVERPASS_URL
}

export function getOverpassHeaders(): Record<string, string> {
    return {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        "User-Agent": OVERPASS_USER_AGENT,
    }
}

export function fetchOSM(props: FetchOSMOptions): FetchOSMResult {
    return new Promise((resolve, reject) => {

        const query = typeof props.query === "string" ? props.query :
            `
            [out:json];
            (${props.query.map((q: string | OSMQueryAtom) => {
                if (typeof q === "string") return `${q.replace(/;$/, "")}(${props.boundingBox.join(",")});`

                if (typeof q === "object" && ("way" in q || "relation" in q)) {
                    console.warn("This way of passing queries is deprecated. Use string[] instead")
                    if (q.way) return `way[${q.way}${q.filters?.length ? `~"${q.filters.join("|")}"` : ``}](${props.boundingBox.join(",")});`
                    if (q.relation) return `relation[${q.relation}${q.filters?.length ? `~"${q.filters.join("|")}"` : ``}](${props.boundingBox.join(",")});`
                }
            }
            ).join("\n")});
            out body;
            >;
            out skel qt;
            `
        axios.post(
            getOverpassUrl(props.overpassUrl),
            `data=${encodeURIComponent(query)}`,
            {
                headers: getOverpassHeaders(),
                httpsAgent: new https.Agent({ rejectUnauthorized: false }),
            }
        )
            .then(data => resolve(data))
            .catch((error: unknown) => {
                if (axios.isAxiosError(error) && error.response?.status === 406) {
                    reject(new Error(
                        "Overpass API returned HTTP 406 Not Acceptable. " +
                        "The public instance rejects generic User-Agent strings. " +
                        "If this persists, set OVERPASS_URL to another interpreter " +
                        "(for example https://overpass.kumi.systems/api/interpreter)."
                    ))
                    return
                }
                reject(error)
            })

    })
}