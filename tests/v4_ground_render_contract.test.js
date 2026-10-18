'use strict';
const fs=require('fs'),vm=require('vm'),crypto=require('crypto'),path=require('path');
const root=path.resolve(__dirname,'..');
const renderer=path.join(root,'app/src/main/assets/js/isometric_v4_b126.js');
const code=fs.readFileSync(renderer,'utf8');
const calls=[];let state={tx:0,ty:0,rot:0,sx:1,sy:1,alpha:1},stack=[];
const gradient=()=>({addColorStop(){}});
const ctx={
 createLinearGradient:gradient,createRadialGradient:gradient,fillRect(){},beginPath(){},arc(){},fill(){},ellipse(){},stroke(){},clearRect(){},moveTo(){},lineTo(){},closePath(){},fillText(){},
 save(){stack.push({...state})},restore(){state=stack.pop()},translate(x,y){state.tx+=x;state.ty+=y},rotate(r){state.rot+=r},scale(x,y){state.sx*=x;state.sy*=y},
 drawImage(img,x,y,w,h){calls.push([img._key,state.tx,state.ty,state.rot,state.sx,state.sy,state.alpha,x,y,w,h])},
 set globalAlpha(v){state.alpha=v},get globalAlpha(){return state.alpha},set fillStyle(v){}
};
const groundKeys=['v4GroundA','v4GroundB','v4GroundC','v4GroundN1','v4GroundN2','v4GroundN3','v4GroundN4','v4GroundN5','v4GroundN6','v4GroundN7','v4GroundN8'];
const IMG={}; groundKeys.forEach(k=>IMG[k]={complete:true,naturalWidth:320,_key:k});
const game={viewW:393,viewH:852,player:{x:700,y:700,targetX:700,targetY:700},world:1400,region:0,level:1,v4GroundSeed:12345,ctx};
const sandbox={console,Math,IMG,game,startRun(){},distSquared(){return 0},RESOURCE:{},CREATURE:{},performance:{now(){return 0}}};
vm.createContext(sandbox);vm.runInContext(code,sandbox);
game.v4GroundCache=sandbox.buildV4GroundCache();
sandbox.isoGround(ctx,0);
const painted=calls.filter(c=>c[0]);
if(painted.length!==61) throw new Error(`Expected build114 draw budget of 61, got ${painted.length}`);
const unique=new Set(painted.map(c=>c[0]));
if(unique.size!==11) throw new Error(`Expected all 11 painted ground variants, got ${unique.size}`);
const digest=crypto.createHash('sha256').update(JSON.stringify(painted)).digest('hex');
const expected='e6b3b5585e6d6399b505f66ab6910bdd4b98c00725513048ded14237497f593b';
if(digest!==expected) throw new Error(`Ground render diverged from proven build114 contract: ${digest}`);
if(/v4GroundSurface|drawV4GroundSurface/.test(code)) throw new Error('Oversized precomposed ground surface must not return');
console.log('v4_ground_render_contract: OK (pixel-logic equivalent to build114, 61 draws, 11 variants)');
