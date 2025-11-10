#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const sdkRoot = path.resolve(__dirname, '..', '..');
const sdkLib = path.join(sdkRoot, 'lib', 'index.js');
const sdkPkg = path.join(sdkRoot, 'package.json');

function log(...args) {
  console.log('[ensure-sdk-built]', ...args);
}

try {
  if (!fs.existsSync(sdkPkg)) {
    log('SDK package.json not found at', sdkPkg);
    process.exit(0);
  }

  if (!fs.existsSync(sdkLib)) {
    log('SDK build output missing. Running `npm run build` in SDK root...');
    execSync('npm run build', { stdio: 'inherit', cwd: sdkRoot });
    if (!fs.existsSync(sdkLib)) {
      console.error('[ensure-sdk-built] Failed to produce', sdkLib);
      process.exit(1);
    }
    log('SDK build complete.');
  } else {
    log('SDK build output found.');
  }
} catch (err) {
  console.error('[ensure-sdk-built] Error:', err && err.message ? err.message : err);
  process.exit(1);
}
