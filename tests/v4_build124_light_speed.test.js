"use strict";
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..');
const iso=fs.readFileSync(path.join(root,'app/src/main/assets/js/isometric_v4_b126.js'),'utf8');
const expedition=fs.readFileSync(path.join(root,'app/src/main/assets/js/expedition.js'),'utf8');
const html=fs.readFileSync(path.join(root,'app/src/main/assets/index.html'),'utf8');
if(!html.includes('js/isometric_v4_b126.js')) throw Error('renderer b126 non charge');
if(!iso.includes('visibility.proximityRadius * .96, .25')) throw Error('zone semi-eclairee absente');
if(!iso.includes('cov.cell * 1.28, .10')) throw Error('zone decouverte sombre non distincte');
if(!iso.includes('isoRevealPlayer(fog, playerFog, visibility.lightRadius)')) throw Error('halo eclaire franc absent');
if(!expedition.includes('isometricMovementSpeedMultiplier(dx, dy)')) throw Error('compensation vitesse isometrique non branchee');
if(!expedition.includes('game.visualDistance = (game.visualDistance || 0) + visualStep')) throw Error('distance visuelle non suivie');
const companions=fs.readFileSync(path.join(root,'app/src/main/assets/js/companions.js'),'utf8');
if(!companions.includes('distance: 0, visualDistance: 0')) throw Error('distance visuelle absente du vrai startRun companions');
if(!iso.includes("typeof game.visualDistance === 'number' ? game.visualDistance : game.distance")) throw Error('animation non synchronisee sur distance visuelle');
const sandbox={Math,console,startRun(){},game:{},IMG:{},distSquared(){return 0},performance:{now(){return 0}}};
vm.createContext(sandbox); vm.runInContext(iso,sandbox);
const dirs=[[1,0],[0,1],[-1,0],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1],[2,1],[1,2],[-2,1]];
const speeds=[];
for(const [dx,dy] of dirs){
  const len=Math.hypot(dx,dy),ux=dx/len,uy=dy/len;
  const mult=sandbox.isometricMovementSpeedMultiplier(dx,dy);
  const projected=Math.hypot(.62*(ux-uy),.31*(ux+uy))*mult;
  speeds.push(projected);
}
const min=Math.min(...speeds),max=Math.max(...speeds);
if(max-min>1e-9) throw Error(`vitesse ecran non isotrope: ${min}..${max}`);
if(min<.69||max>.70) throw Error('vitesse ecran de reference inattendue');
// Effective remaining fog opacities: dark > remembered > penumbra > fully lit.
const base=.97, remembered=base*(1-.10), penumbra=remembered*(1-.25), lit=0;
if(!(base>remembered && remembered>penumbra && penumbra>lit)) throw Error('hierarchie de lumiere invalide');
console.log('v4_build124_light_speed: OK', {screenSpeed:min.toFixed(4),dark:base,remembered:remembered.toFixed(3),penumbra:penumbra.toFixed(3),lit});
