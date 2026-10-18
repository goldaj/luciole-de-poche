"use strict";
const fs=require('fs'), path=require('path');
const root=path.resolve(__dirname,'..');
const src=fs.readFileSync(path.join(root,'app/src/main/assets/js/isometric_v4_b126.js'),'utf8');
function section(name,next){const a=src.indexOf('function '+name+'('); if(a<0)throw Error('fonction absente '+name); const b=next?src.indexOf('\nfunction '+next+'(',a):src.length; return src.slice(a,b<0?src.length:b);}
const border=section('isoDrawBorder','v4GroundPool');
if(!/useNativeHorizontal = game\.region === 0/.test(border) || !/\? !useNativeHorizontal/.test(border)) throw Error('orientation haut/bas actuelle non verrouillée');
if(!/b\.side === 'bottom'\) \{ p\.x -= 4; p\.y \+= 7; \}/.test(border)) throw Error('ancrage bas absent');
if(!/b\.side === 'right'\) \{ p\.x \+= 4; p\.y \+= 7; \}/.test(border)) throw Error('ancrage droite absent');
const player=section('isoDrawPlayer','isoDrawCompanion');
if(!/A -> neutral -> B -> neutral/.test(player)) throw Error('cycle de marche explicite absent');
if(!/direction === 'DR'\) spriteDirection = 'DL'/.test(player) || !/direction === 'UR'\) spriteDirection = 'UL'/.test(player)) throw Error('foulée opposée absente');
if(!/cycleDistance = 144/.test(player)) throw Error('cadence par distance modifiée');
const html=fs.readFileSync(path.join(root,'app/src/main/assets/index.html'),'utf8');
const comp=html.indexOf('js/companions.js'), iso=html.indexOf('js/isometric_v4_b126.js'), hud=html.indexOf('js/commercial_hud_v4_b120.js');
if(!(comp>=0 && comp<iso && iso<hud)) throw Error('ordre startRun cassé');
console.log('v4_build121_targeted cumulative: OK');
