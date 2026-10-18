'use strict';
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'app/src/main/assets/js/isometric_v4_b126.js'), 'utf8');
function constant(name) {
  const m = source.match(new RegExp('var\\s+' + name + '\\s*=\\s*([0-9.]+)'));
  if (!m) throw new Error('Constante absente: ' + name);
  return Number(m[1]);
}
const sx = constant('ISO_X');
const sy = constant('ISO_Y');
const cy = constant('ISO_CENTER_Y');
if (!(sx > sy && sy > 0 && cy > .4 && cy < .7)) throw new Error('Projection isométrique incohérente');

function project(world, player, view) {
  const dx = world.x - player.x, dy = world.y - player.y;
  return { x: view.w * .5 + (dx - dy) * sx, y: view.h * cy + (dx + dy) * sy };
}
function unproject(screen, player, view) {
  const a = (screen.x - view.w * .5) / sx;
  const b = (screen.y - view.h * cy) / sy;
  return { x: player.x + (a + b) * .5, y: player.y + (b - a) * .5 };
}
function near(a, b, eps = 1e-7) { return Math.abs(a - b) <= eps; }
const view = { w: 393, h: 852 };
const players = [{x:700,y:700},{x:25,y:25},{x:1375,y:1375}];
const offsets = [[0,0],[100,0],[0,100],[-120,80],[170,-140],[-210,-160]];
for (const player of players) {
  for (const [dx,dy] of offsets) {
    const world = {x:player.x+dx,y:player.y+dy};
    const back = unproject(project(world, player, view), player, view);
    if (!near(back.x, world.x) || !near(back.y, world.y)) {
      throw new Error(`Round-trip invalide ${JSON.stringify({player,world,back})}`);
    }
  }
}
// Canonical isometric directions: +X goes down-right, +Y goes down-left.
const p = {x:700,y:700};
const c = project(p,p,view), px = project({x:800,y:700},p,view), py = project({x:700,y:800},p,view);
if (!(px.x > c.x && px.y > c.y)) throw new Error('+X ne va pas bas-droite');
if (!(py.x < c.x && py.y > c.y)) throw new Error('+Y ne va pas bas-gauche');
if (!/items\.sort/.test(source) || !/isoDepth/.test(source)) throw new Error('Tri de profondeur absent');
console.log('v4_isometric_contract: OK');
