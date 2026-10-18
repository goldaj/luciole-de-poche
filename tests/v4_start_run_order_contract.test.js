'use strict';
const fs=require('fs'), path=require('path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'app/src/main/assets/index.html'),'utf8');
const companions=html.indexOf('js/companions.js');
const iso=html.indexOf('js/isometric_v4_b126.js');
const hud=html.indexOf('js/commercial_hud_v4_b120.js');
if (!(companions>=0 && iso>companions && hud>iso)) throw new Error('ordre scripts invalide: companions -> isometric -> commercial HUD attendu');
const isoSrc=fs.readFileSync(path.join(root,'app/src/main/assets/js/isometric_v4_b126.js'),'utf8');
if (!/startRun\s*=\s*function\s*\(regionIndex\)/.test(isoSrc)) throw new Error('wrapper startRun isometrique absent');
if (!/game\.v4GroundCache\s*=\s*buildV4GroundCache\(\)/.test(isoSrc)) throw new Error('cache sol non prepare dans startRun');
for (const later of ['tutorial.js','bootstrap.js']) {
  const s=fs.readFileSync(path.join(root,'app/src/main/assets/js',later),'utf8');
  if (/startRun\s*=|function\s+startRun/.test(s)) throw new Error(later+' redefinit startRun apres renderer');
}
console.log('v4_start_run_order_contract: OK');
