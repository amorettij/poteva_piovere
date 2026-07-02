#!/usr/bin/env node
// Scans img/people/ and writes data/images.json
// Run: node generate-images.js

const fs   = require('fs');
const path = require('path');

const IMG_DIR  = path.join(__dirname, 'img', 'people');
const OUT_FILE = path.join(__dirname, 'data', 'images.json');

const IGNORED = new Set(['.DS_Store', '.gitkeep', 'Thumbs.db']);
const IMG_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);

const manifest = {};

const folders = fs.readdirSync(IMG_DIR, { withFileTypes: true })
  .filter(e => e.isDirectory())
  .map(e => e.name)
  .sort();

for (const folder of folders) {
  const folderPath = path.join(IMG_DIR, folder);
  const files = fs.readdirSync(folderPath)
    .filter(f => !IGNORED.has(f) && IMG_EXT.has(path.extname(f).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  if (files.length > 0) {
    manifest[folder] = files;
  }
}

fs.writeFileSync(OUT_FILE, JSON.stringify(manifest, null, 2) + '\n');
console.log(`Generated ${OUT_FILE} — ${Object.keys(manifest).length} cartelle indicizzate.`);
