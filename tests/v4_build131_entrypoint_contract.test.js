const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const builder = fs.readFileSync(path.join(root,'tools/build_phone_test_apk.py'),'utf8');
if (!builder.includes('file:///android_asset/b133x.html')) throw new Error('DEX entrypoint is not b133x.html');
if (!builder.includes('assets/b133x.html')) throw new Error('versioned HTML asset is not b133x.html');
if (!builder.includes('new_code=133')) throw new Error('versionCode packaging is not 132');
console.log('v4_build133_entrypoint_contract: OK');
