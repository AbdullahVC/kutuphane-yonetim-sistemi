#!/usr/bin/env node

/**
 * Remove Prisma WASM files after generation to prevent Edge Runtime bundling issues
 * We only need the binary engine for Node.js runtime
 */

const fs = require("fs");
const path = require("path");

const prismaGeneratedDir = path.join(__dirname, "..", "app", "generated", "prisma");

const wasmFilesToRemove = [
  "wasm.js",
  "wasm.d.ts",
  "edge.js",
  "edge.d.ts",
  "runtime/wasm-engine-edge.js",
  "runtime/wasm-compiler-edge.js",
  "runtime/edge-esm.js",
  "runtime/edge.js",
  "wasm-edge-light-loader.mjs",
  "wasm-worker-loader.mjs",
];

let removedCount = 0;

wasmFilesToRemove.forEach((file) => {
  const filePath = path.join(prismaGeneratedDir, file);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`Removed: ${file}`);
      removedCount++;
    } catch (error) {
      console.warn(`Failed to remove ${file}:`, error.message);
    }
  }
});

console.log(`\nCleaned ${removedCount} WASM/Edge files from Prisma generated directory.`);

