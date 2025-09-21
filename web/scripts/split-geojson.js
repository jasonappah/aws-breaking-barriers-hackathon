#!/usr/bin/env node

import fs from "node:fs";
const originalFilePath = "web/apps/web/public/us_data/us_310.geojson"

const template = {
    "type": "FeatureCollection",
    "features": []
}

const originalFile = JSON.parse(fs.readFileSync(originalFilePath, "utf8"));

const features = originalFile.features;

const splitIndex = Math.floor(features.length * 0.5);
const part1 = features.slice(0, splitIndex);
const part2 = features.slice(splitIndex);

const part1File = {
    ...template,
    features: part1
}

const part2File = {
    ...template,
    features: part2
}

const part1FilePath = "web/apps/web/public/us_data/us_310_split_part1.geojson";
const part2FilePath = "web/apps/web/public/us_data/us_311_split_part2.geojson";
 
fs.writeFileSync(part1FilePath, JSON.stringify(part1File));
fs.writeFileSync(part2FilePath, JSON.stringify(part2File));