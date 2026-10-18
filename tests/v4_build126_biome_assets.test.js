'use strict';
const fs=require('fs'), path=require('path'), vm=require('vm');
const root=path.resolve(__dirname,'..');
const artPath=path.join(root,'app/src/main/assets/js/biome_art_v126.js');
const dataPath=path.join(root,'app/src/main/assets/js/data.js');
const artSrc=fs.readFileSync(artPath,'utf8');
const ctx={}; vm.createContext(ctx); vm.runInContext(artSrc,ctx);
if(!Array.isArray(ctx.V4_BIOME_ART)||ctx.V4_BIOME_ART.length<8) throw Error('8 bibliothèques de balade attendues');
const seen=new Map();
for(let r=0;r<8;r++){
  const a=ctx.V4_BIOME_ART[r];
  if(!a) throw Error('bibliothèque manquante région '+r);
  if(a.ground.length!==11) throw Error(`r${r}: 11 tiles attendues, ${a.ground.length}`);
  if(a.large.length<4) throw Error(`r${r}: gros décors insuffisants`);
  if(a.small.length<8) throw Error(`r${r}: petits décors insuffisants`);
  if(a.border.length<4) throw Error(`r${r}: bordures insuffisantes`);
  for(const category of ['ground','large','small','border','orb']){
    for(const key of a[category]){
      const owner=seen.get(key);
      if(owner!==undefined && owner!==r) throw Error(`asset partagé entre balades: ${key} r${owner}/r${r}`);
      seen.set(key,r);
      if(/chest|coffre/i.test(key)) throw Error('coffre décoratif dans pool biome: '+key);
    }
  }
}
for(const [key,rel] of Object.entries(ctx.V4_BIOME_FILES)){
  const file=path.join(root,'app/src/main/assets/img',rel);
  if(!fs.existsSync(file)) throw Error('asset biome absent: '+rel);
}
const data=fs.readFileSync(dataPath,'utf8');
const resources=['seed','berry','pebble','leaf','shell','glow','mushroom','pearl','flower','waterlily','crystal','echostone','moonpollen','cloudfeather','moss','glass','acorn','reed','cloud','prism','dew','amber'];
for(const key of resources){
  if(!new RegExp(key+": \\{[^\\n]*icon: 'v4resources/"+key+"\\.png'").test(data)) throw Error('nouvel icon resource non branché: '+key);
  const file=path.join(root,'app/src/main/assets/img/v4resources',key+'.png');
  if(!fs.existsSync(file)) throw Error('png resource absent: '+key);
}
console.log('v4_build126_biome_assets: OK');
