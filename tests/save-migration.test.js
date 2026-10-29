const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('app/src/main/assets/js/state.js', 'utf8');
const start = source.indexOf('function normalizePersistentSaveRoots(');
const end = source.indexOf('function loadState() {', start);
assert(start >= 0 && end > start, 'Expected save normalization');
const sandbox = {};
vm.runInNewContext(source.slice(start, end), sandbox);
const normalize = sandbox.normalizePersistentSaveRoots;
const defaults = {
  resources:{seed:8, berry:3}, upgrades:{bag:1}, settings:{sound:true},
  stats:{expeditions:0}, characterKnowledge:{}, fanalDeposits:{},
  refugeFeatures:{tracker:false}, menuSeenNotices:{}, itemSeenNotices:{},
  discoveredResources:['seed'], discoveredCreatures:[], visitedRegions:[0],
  regionLevels:[1,1], badges:[], companionPermanent:[], companionDiscovered:[]
};
const restored = normalize({
  version:42, gems:12, resources:null, upgrades:{bag:5},
  settings:'oops', discoveredResources:'invalid', regionLevels:[4,4],
  stats:{expeditions:77}
},defaults);
assert.equal(restored.gems,12);
assert.equal(restored.stats.expeditions,77);
assert.equal(restored.upgrades.bag,5);
assert.equal(restored.resources.seed,8);
assert.equal(restored.settings.sound,true);
assert.equal(restored.regionLevels[0],4);
assert.deepEqual(Array.from(restored.discoveredResources),['seed']);
assert.equal(normalize(null,defaults),defaults);
console.log('OK: damaged nested save fields do not erase progression');
