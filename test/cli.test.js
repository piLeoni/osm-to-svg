const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { execFile } = require("node:child_process");
const { promisify } = require("node:util");

const execFileAsync = promisify(execFile);

const repoRoot = path.resolve(__dirname, "..");
const cliPath = path.join(repoRoot, "dist", "bin", "cli.js");
const fixturePath = path.join(repoRoot, "test", "fixtures", "minimal-overpass.json");
const outputDir = path.join(repoRoot, ".tmp-test-output");

function cleanupOutput() {
    fs.rmSync(outputDir, { recursive: true, force: true });
    fs.mkdirSync(outputDir, { recursive: true });
}

test.beforeEach(() => {
    cleanupOutput();
});

test("CLI help exposes new input flags", async () => {
    const { stdout } = await execFileAsync("node", [cliPath, "--help"], { cwd: repoRoot });
    assert.match(stdout, /--bbox/);
    assert.match(stdout, /--osm/);
});

test("CLI converts local Overpass JSON file to SVG and GeoJSON", async () => {
    const svgOut = path.join(outputDir, "fixture.svg");
    const geojsonOut = path.join(outputDir, "fixture.geojson");

    await execFileAsync(
        "node",
        [
            cliPath,
            "--osm",
            fixturePath,
            "--width",
            "20mm",
            "--height",
            "20mm",
            "--svg",
            svgOut,
            "--geojson",
            geojsonOut
        ],
        { cwd: repoRoot }
    );

    const svg = fs.readFileSync(svgOut, "utf8");
    const geojson = JSON.parse(fs.readFileSync(geojsonOut, "utf8"));
    assert.match(svg, /<svg/);
    assert.equal(geojson.type, "FeatureCollection");
});

test("CLI rejects invalid bbox values", async () => {
    let thrown = null;
    try {
        await execFileAsync(
            "node",
            [cliPath, "--bbox", "37.7,-122.3,37.8", "--width", "20mm", "--height", "20mm"],
            { cwd: repoRoot }
        );
    } catch (error) {
        thrown = error;
    }

    assert.ok(thrown, "Expected command to fail with invalid bbox");
    const output = `${thrown.stdout || ""}\n${thrown.stderr || ""}`;
    assert.match(output, /Invalid --bbox value/);
});
