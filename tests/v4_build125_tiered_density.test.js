"use strict";
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const iso = fs.readFileSync(path.join(root, 'app/src/main/assets/js/isometric_v4_b126.js'), 'utf8');
const expedition = fs.readFileSync(path.join(root, 'app/src/main/assets/js/expedition.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'app/src/main/assets/index.html'), 'utf8');
function ok(cond, msg) { if (!cond) throw new Error(msg); }
ok(html.includes('js/isometric_v4_b126.js'), 'renderer b126 non chargé');
ok(/\[0,\s*\.55,\s*\.75,\s*1\.00,\s*1\.35\]/.test(iso), 'courbe 55/75/100/135 absente');
ok(/densityPerMillion\s*=\s*\[0,\s*17,\s*23,\s*31,\s*50\]/.test(iso), 'densité spatiale des couronnes inattendue');
ok(/function\s+v4DecorRingLevel/.test(iso), 'classification concentrique absente');
ok(/WALK_TIER\[level\s*-\s*1\]/.test(iso) && /WALK_TIER\[ring\s*-\s*2\]\.world\s*\*\s*\.5/.test(iso), 'les couronnes ne réutilisent pas les tailles historiques des niveaux');
ok(/buildV4TieredVisualDecor\(rng\)/.test(iso), 'construction décorative par couronnes absente');
ok(/if\s*\(d\.t\s*===\s*2\)\s*return\s*true/.test(iso), 'les boules de lumière risquent d’être filtrées');
ok(!iso.includes("'v4JarN1'") && !iso.includes("'v4JarN2'"), 'faux coffres décoratifs encore dans le renderer');
ok(!expedition.includes('v4JarN1:') && !expedition.includes('v4JarN2:'), 'aliases de coffres décoratifs encore chargés');
ok(/v4Chest:\s*'v4b114\/chest\.png'/.test(expedition), 'le vrai coffre ouvrable a été retiré par erreur');
ok(/function\s+isoDrawChest/.test(iso), 'rendu des vrais coffres à Gemmes absent');
// Expected visual-only extras by nested ring. These counts are invariant once a ring exists.
const worlds = [1400,1650,1900,2150];
const density = [17,23,31,50];
let prevArea = 0;
const expected = worlds.map((w,i) => {
  const area = w*w;
  const ringArea = area - prevArea;
  prevArea = area;
  return Math.round(ringArea / 1e6 * density[i]);
});
ok(JSON.stringify(expected) === JSON.stringify([33,18,28,51]), 'comptage attendu des couronnes modifié: '+expected.join(','));
console.log('v4_build125_tiered_density: OK', expected.join('/'));
