import axios from "axios"
import https from "https"

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
}

export type FetchOSMResult = Promise<object>
export type CreateRectangle = (props: FetchOSMOptions) => FetchOSMResult;

export function fetchOSM(props: FetchOSMOptions): FetchOSMResult {
    return new Promise((resolve, reject) => {

        const query = typeof props.query === "string" ? props.query :
            `
            [out:json];
            (${props.query.map((q: string | OSMQueryAtom) => {
                if (typeof q === "string") return `${q.replace(/;$/, "")}(${props.boundingBox.join(",")});`

                if (typeof q === "object" && ("way" in q || "relation" in q)) {
                    console.warn("This way of passing queries is deprecatd.")
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
            "https://overpass-api.de/api/interpreter",
            `data=${encodeURIComponent(query)}`,
            {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                httpsAgent: new https.Agent({ rejectUnauthorized: false }),
            }
        )
            .then(data => resolve(data))
            .catch(reject)

    })
}