'use strict';
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const godotPath = path.join(root, 'app/src/main/godot/commercial_25d_world_director.gd');
const hooksPath = path.join(root, 'app/src/main/assets/js/three_d_gameplay_hooks.js');
if (!fs.existsSync(godotPath) || !fs.existsSync(hooksPath)) {
  console.log('v4_25d_camera_contract: SKIP (native 2.5D branch files absent from WebView review source)');
  process.exit(0);
}
const godot = fs.readFileSync(godotPath, 'utf8');
const hooks = fs.readFileSync(hooksPath, 'utf8');
function number(src, re, label) {
  const m = src.match(re);
  if (!m) throw new Error('Constante absente: ' + label);
  return Number(m[1]);
}
const gSize = number(godot, /CAMERA_SIZE\s*:=\s*([0-9.]+)/, 'Godot CAMERA_SIZE');
const jSize = number(hooks, /CAMERA_SIZE\s*=\s*([0-9.]+)/, 'JS CAMERA_SIZE');
if (Math.abs(gSize - jSize) > 1e-9) throw new Error(`CAMERA_SIZE diverge: Godot=${gSize}, JS=${jSize}`);
const gm = godot.match(/CAMERA_OFFSET\s*:=\s*Vector3\(([0-9.]+),\s*([0-9.]+),\s*([0-9.]+)\)/);
if (!gm) throw new Error('Godot CAMERA_OFFSET absent');
const jm = [
  number(hooks, /CAMERA_OFFSET_X\s*=\s*([0-9.]+)/, 'JS OFFSET_X'),
  number(hooks, /CAMERA_OFFSET_Y\s*=\s*([0-9.]+)/, 'JS OFFSET_Y'),
  number(hooks, /CAMERA_OFFSET_Z\s*=\s*([0-9.]+)/, 'JS OFFSET_Z')
];
const gv = gm.slice(1).map(Number);
for (let i = 0; i < 3; i++) if (Math.abs(gv[i] - jm[i]) > 1e-9) throw new Error(`CAMERA_OFFSET[${i}] diverge: Godot=${gv[i]}, JS=${jm[i]}`);
const look = number(hooks, /CAMERA_LOOK_Y\s*=\s*([0-9.]+)/, 'JS LOOK_Y');
if (Math.abs(look - 0.24) > 1e-9 || !/Vector3\(0\.0,\s*0\.24,\s*0\.0\)/.test(godot)) throw new Error('Point de visée 2.5D divergent');
if (!/PROJECTION_ORTHOGONAL/.test(godot)) throw new Error('Caméra Godot non orthographique');
console.log('v4_25d_camera_contract: OK');
