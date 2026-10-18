"use strict";
const fs=require('fs'), path=require('path');
const root=path.resolve(__dirname,'..');
const src=fs.readFileSync(path.join(root,'app/src/main/assets/js/isometric_v4_b126.js'),'utf8');
function section(name,next){const a=src.indexOf('function '+name+'('); if(a<0)throw Error('missing '+name); const b=next?src.indexOf('\nfunction '+next+'(',a):src.length; return src.slice(a,b<0?src.length:b);}
const border=section('buildV4Border','v4LargeTreeKey');
if(!border.includes('segment % 4 === 2')) throw Error('barrier sight windows missing');
const drawBorder=section('isoDrawBorder','v4GroundPool');
if(!drawBorder.includes('useNativeHorizontal = game.region === 0') || !drawBorder.includes('? !useNativeHorizontal')) throw Error('top/bottom current orientation not locked');
if(!drawBorder.includes("b.side === 'top') { p.x += 4; p.y -= 7;")) throw Error('top outward anchor missing');
if(!src.includes('applyV4BarrierSightWindows();')) throw Error('sight window application missing');
if(!src.includes('if (d.v4HideForBarrierSight) return;')) throw Error('decor sight filtering missing');
console.log('v4_build122_targeted cumulative: OK');
