const test = require("node:test");
const assert = require("node:assert/strict");

const { getOverpassHeaders, getOverpassUrl, DEFAULT_OVERPASS_URL, OVERPASS_USER_AGENT } = require("../dist/fetchOSM.js");

test("Overpass requests identify this package instead of Axios", () => {
    const headers = getOverpassHeaders();
    assert.equal(headers["User-Agent"], OVERPASS_USER_AGENT);
    assert.match(headers["User-Agent"], /osm-to-svg/);
    assert.doesNotMatch(headers["User-Agent"], /axios/i);
    assert.equal(headers.Accept, "application/json");
});

test("Overpass URL can be overridden by argument or OVERPASS_URL", () => {
    const previous = process.env.OVERPASS_URL;
    try {
        delete process.env.OVERPASS_URL;
        assert.equal(getOverpassUrl(), DEFAULT_OVERPASS_URL);

        process.env.OVERPASS_URL = "https://overpass.example/api/interpreter";
        assert.equal(getOverpassUrl(), "https://overpass.example/api/interpreter");
        assert.equal(
            getOverpassUrl("https://custom.example/interpreter"),
            "https://custom.example/interpreter"
        );
    } finally {
        if (previous === undefined) {
            delete process.env.OVERPASS_URL;
        } else {
            process.env.OVERPASS_URL = previous;
        }
    }
});
