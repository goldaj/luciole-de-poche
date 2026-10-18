'use strict';
// Persistent progression, economy and migration rules.
var IMG = {};
var state;
var currentScreen = 'homeScreen';
var journalTab = 'collections';
var JOURNAL_TABS = ['collections', 'creatures', 'badges'];
var journalSwipeStart = null;
var tradeDraft = { ordinary: { target: '', inputs: {} }, regional: { target: '', inputs: {} } };
var screenHistory = [];
var pendingImportedArchive = null;
var game = null;
var audio = { enabled: false, unlocked: false, sfx: {}, preloads: [], music: null, musicKey: '', ambience: null, ambienceKey: '', fadeTimers: [], duckTimer: null, stepDistance: 0, lastSfx: {}, activeSfx: [], pickupCurrent: null };
var $ = function (id) { return document.getElementById(id); };
function defaultTutorialState() {
    return { version: 5, coreStage: 'waiting-run', seenMechanics: {}, activeMechanic: '', mechanicStep: 0 };
}
function completedTutorialState() {
    return { version: 5, coreStage: 'complete', seenMechanics: {}, activeMechanic: '', mechanicStep: 0 };
}
function defaultState() {
    return {
        version: SAVE_VERSION, createdAt: Date.now(), lastSeen: Date.now(), lastDay: '', streak: 0,
        resources: { seed: 8, berry: 3, pebble: 4, leaf: 2, shell: 0, glow: 2, mushroom: 0, pearl: 0, flower: 0, waterlily: 0, crystal: 0, echostone: 0, moonpollen: 0, cloudfeather: 0, moss: 0, glass: 0, acorn: 0, reed: 0, cloud: 0, prism: 0, dew: 0, amber: 0 },
        upgrades: { bag: 1, boots: 1, lantern: 1, compass: 1, herbarium: 1, lens: 1, harvest: 1, samplebox: 1, jar: 1, garden: 1, dock: 1 },
        discoveredResources: ['seed', 'berry', 'pebble', 'leaf', 'glow'], discoveredCreatures: [], characterKnowledge: {}, visitedRegions: [0], regionLevels: [1, 1, 1, 1, 1, 1, 1, 1], unlockFloor: 1, badges: [], fanalArchipelagoWalkDone: false, fanalRevealed: false, fanalDeposits: emptyFanalDeposits(), gameWon: false,
        stats: { expeditions: 0, collected: 0, distance: 0, rare: 0, dailyDone: 0, fullMaps: 0 }, daily: null, settings: { sound: true, haptics: true, audioV2: true },
        gems: 0, echoesUnlocked: false, echoesIntroSeen: false, companionFragments: {}, companionSurplus: {}, companionPermanent: [], companionDiscovered: [], gachaPulls: 0, releaseGifts: {},
        tutorial: defaultTutorialState(), balanceV32: null, refugeFeatures: { tracker: false }, menuSeenNotices: {}, itemSeenNotices: {}, menuNoticesInitialized: false
    };
}
function loadState() {
    initializeSaveSlots();
    recoverSaveSlot(activeSaveSlot);
    try {
        var raw = localStorage.getItem(currentSaveKey());
        state = raw ? JSON.parse(raw) : defaultState();
        var hadTutorialState = !!(state.tutorial && typeof state.tutorial === 'object');
        var hadItemNoticeState = !!(state.itemSeenNotices && typeof state.itemSeenNotices === 'object');
        var priorVersion = state.version || 0, d = defaultState(), legacyLevels = state.upgrades ? Object.keys(state.upgrades).reduce(function (a, k) { return a + (state.upgrades[k] || 0); }, 0) : 0;
        Object.keys(d).forEach(function (k) { if (state[k] === undefined)
            state[k] = d[k]; });
        Object.keys(d.resources).forEach(function (k) { if (state.resources[k] === undefined)
            state.resources[k] = 0; });
        Object.keys(d.upgrades).forEach(function (k) { if (state.upgrades[k] === undefined)
            state.upgrades[k] = 1; });
        if (!state.settings || typeof state.settings !== 'object')
            state.settings = {};
        Object.keys(d.settings).forEach(function (k) { if (state.settings[k] === undefined)
            state.settings[k] = d.settings[k]; });
        if (!state.refugeFeatures || typeof state.refugeFeatures !== 'object')
            state.refugeFeatures = { tracker: false };
        if (state.refugeFeatures.tracker === undefined)
            state.refugeFeatures.tracker = false;
        if (!state.menuSeenNotices || typeof state.menuSeenNotices !== 'object')
            state.menuSeenNotices = {};
        if (!state.itemSeenNotices || typeof state.itemSeenNotices !== 'object')
            state.itemSeenNotices = {};
        ['mapScreen', 'refugeScreen', 'journalScreen', 'echoesScreen'].forEach(function (screen) { if (!Array.isArray(state.menuSeenNotices[screen])) state.menuSeenNotices[screen] = []; if (!Array.isArray(state.itemSeenNotices[screen])) state.itemSeenNotices[screen] = []; });
        if (state.menuNoticesInitialized === undefined)
            state.menuNoticesInitialized = false;
        if (priorVersion < 25 && !state.settings.audioV2) {
            state.settings.sound = true;
            state.settings.audioV2 = true;
        }
        if (priorVersion < 26) {
            // Préserve les chemins déjà atteints avant le changement de numérotation des améliorations.
            var oldUnlocked = 1;
            for (var ui = 1; ui < REGION.length; ui++) {
                var prev = (state.regionLevels && state.regionLevels[ui - 1]) || 1;
                if (legacyLevels < REGION[ui].req || prev < 3)
                    break;
                oldUnlocked++;
            }
            state.unlockFloor = Math.max(state.unlockFloor || 1, oldUnlocked);
            EXPLORATION_UPGRADE_IDS.forEach(function (id) { var old = Math.max(0, Math.min(8, Number(state.upgrades[id]) || 0)); state.upgrades[id] = Math.min(8, old + 1); });
            SUPPORT_UPGRADE_IDS.forEach(function (id) { var old = Math.max(0, Math.min(8, Number(state.upgrades[id]) || 0)); state.upgrades[id] = Math.min(8, old + 1); });
        }
        if (!state.fanalDeposits || typeof state.fanalDeposits !== 'object')
            state.fanalDeposits = emptyFanalDeposits();
        if (priorVersion < 21 && !state.gameWon) {
            ['seed', 'berry', 'pebble', 'leaf', 'shell'].forEach(function (k) { var deposited = Math.max(0, Math.floor(Number(state.fanalDeposits[k]) || 0)), surplus = Math.max(0, deposited - (FINAL_TARGET[k] || 0)); if (surplus) {
                state.resources[k] = (state.resources[k] || 0) + surplus;
                state.fanalDeposits[k] -= surplus;
            } });
        }
        Object.keys(FINAL_TARGET).forEach(function (k) { var v = Math.floor(Number(state.fanalDeposits[k]) || 0); state.fanalDeposits[k] = Math.max(0, Math.min(FINAL_TARGET[k], v)); });
        if (priorVersion < 20 && state.gameWon)
            Object.keys(FINAL_TARGET).forEach(function (k) { state.fanalDeposits[k] = FINAL_TARGET[k]; });
        if (priorVersion < 21 && state.gameWon)
            Object.keys(FINAL_TARGET).forEach(function (k) { state.fanalDeposits[k] = FINAL_TARGET[k]; });
        if (!state.characterKnowledge || typeof state.characterKnowledge !== 'object')
            state.characterKnowledge = {};
        state.discoveredCreatures = (state.discoveredCreatures || []).filter(function (k) { return !!CREATURE[k]; });
        Object.keys(state.characterKnowledge).forEach(function (k) { state.characterKnowledge[k] = Math.max(0, Math.min(4, Math.floor(Number(state.characterKnowledge[k]) || 0))); });
        if (priorVersion < SAVE_VERSION && priorVersion < 8) {
            var legacyUnlocked = 1;
            LEGACY_REGION_REQ.forEach(function (req) { if (legacyLevels >= req)
                legacyUnlocked++; });
            legacyUnlocked = Math.min(REGION.length, legacyUnlocked - 1);
            state.unlockFloor = Math.max(state.unlockFloor || 1, legacyUnlocked);
        }
        state.unlockFloor = Math.max(1, Math.min(REGION.length, state.unlockFloor || 1));
        if (!Array.isArray(state.regionLevels))
            state.regionLevels = d.regionLevels.slice();
        for (var ri = 0; ri < REGION.length; ri++)
            state.regionLevels[ri] = Math.max(1, Math.min(REGION_MAX_LEVEL, state.regionLevels[ri] || 1));
        if (priorVersion < 17 && state.gameWon)
            state.fanalRevealed = true;
        if (priorVersion < 18) {
            if (state.gameWon) {
                state.fanalArchipelagoWalkDone = true;
                state.fanalRevealed = true;
            }
            else if (state.fanalRevealed) {
                state.fanalArchipelagoWalkDone = true;
                var migratedLoreReady = Object.keys(CREATURE).every(function (k) { return (state.characterKnowledge[k] || 0) >= 3; });
                if (!migratedLoreReady)
                    state.fanalRevealed = false;
            }
        }
        if (priorVersion < SAVE_VERSION && state.daily && state.daily.reward && !state.daily.claimed) {
            Object.keys(state.daily.reward).forEach(function (k) { if (PATH_MATERIALS.indexOf(k) >= 0 && state.discoveredResources.indexOf(k) < 0) {
                var amount = state.daily.reward[k] || 0;
                delete state.daily.reward[k];
                state.daily.reward.seed = (state.daily.reward.seed || 0) + amount * 2;
            } });
        }
        state.version = SAVE_VERSION;
        if (!state.stats)
            state.stats = d.stats;
        Object.keys(d.stats).forEach(function (k) { if (state.stats[k] === undefined)
            state.stats[k] = 0; });
        if (!hadTutorialState) {
            var hasExistingProgress = priorVersion > 0 && ((state.stats.expeditions || 0) > 0 || purchasedUpgradeLevels(state) > 0 || (state.gachaPulls || 0) > 0 || !!state.gameWon);
            state.tutorial = hasExistingProgress ? completedTutorialState() : defaultTutorialState();
        }
        else {
            if (!state.tutorial.seenMechanics || typeof state.tutorial.seenMechanics !== 'object') state.tutorial.seenMechanics = {};
            if (!state.tutorial.coreStage) state.tutorial.coreStage = 'complete';
            // v3.2.2 : le tutoriel principal ne commence plus dans l'accueil, la carte ou la préparation.
            // Tant que la première balade n'est pas réellement lancée, il reste entièrement dormant.
            if ((state.stats.expeditions || 0) === 0 && ['home-welcome', 'home-resources', 'home-menu', 'home-explore', 'waiting-explore', 'map-first', 'run-setup', 'run-bag', 'run-light', 'run-map-progress', 'run-needs', 'run-move', 'run-gather', 'run-return'].indexOf(state.tutorial.coreStage) >= 0)
                state.tutorial.coreStage = 'waiting-run';
            else if ((state.stats.expeditions || 0) > 0 && ['home-welcome', 'home-resources', 'home-menu', 'home-explore', 'waiting-explore', 'map-first', 'run-setup', 'waiting-run'].indexOf(state.tutorial.coreStage) >= 0)
                state.tutorial.coreStage = 'complete';
            state.tutorial.version = 5;
            state.tutorial.activeMechanic = state.tutorial.activeMechanic || '';
            state.tutorial.mechanicStep = Math.max(0, Math.floor(Number(state.tutorial.mechanicStep) || 0));
        }
        if (priorVersion < 28 && priorVersion > 0) {
            var bagRefund = bagMigrationRefund(state.upgrades.bag || 1);
            Object.keys(bagRefund).forEach(function (key) { state.resources[key] = (state.resources[key] || 0) + bagRefund[key]; });
        }
        // Terminus cosy a été relevé à 100 balades : un ancien déblocage à 50 n'est plus considéré acquis.
        if ((state.stats.expeditions || 0) < 100)
            state.badges = (state.badges || []).filter(function (id) { return id !== 'tram'; });
        normalizeCompanionState();
        if (priorVersion < 22) {
            var evolutions = completedEvolutionCount(state);
            if (evolutions > 0) {
                state.gems += evolutions * GEM_EVOLUTION_REWARD;
                state.echoesUnlocked = true;
                state.echoesIntroSeen = true;
            }
        }
        if (completedEvolutionCount(state) > 0)
            state.echoesUnlocked = true;
        if (priorVersion < 31) {
            // Migration réversible v3.2.0 : les anciennes balades niveau 3 étaient déjà au maximum.
            // On les place donc au nouveau niveau 4 sans leur refaire payer une évolution.
            var oldRegionLevels = state.regionLevels.slice(0, REGION.length);
            state.balanceV32 = {
                migratedFromVersion: priorVersion,
                regionLevelsV31: oldRegionLevels.slice(),
                paidFourthLevels: [],
                migratedAt: Date.now()
            };
            state.regionLevels = oldRegionLevels.map(function (level) { return level >= 3 ? 4 : level; });
        }
        else if (!state.balanceV32 || typeof state.balanceV32 !== 'object') {
            state.balanceV32 = { migratedFromVersion: 31, regionLevelsV31: [], paidFourthLevels: [], migratedAt: Date.now() };
        }
        if (!Array.isArray(state.balanceV32.paidFourthLevels))
            state.balanceV32.paidFourthLevels = [];
        // Un joueur ayant déjà terminé le Grand Fanal ne doit pas être rouvert par la hausse
        // de son objectif en Lucioles. Les parties non terminées conservent leurs dépôts réels.
        if (priorVersion < 33 && state.gameWon)
            state.fanalDeposits.glow = FINAL_TARGET.glow;
        state.version = SAVE_VERSION;
    }
    catch (e) {
        state = defaultState();
        normalizeCompanionState();
    }
    applyOffline();
    touchDay();
    ensureDaily();
    checkBadges(false);
    if (!state.menuNoticesInitialized && typeof initializeMenuNoticeBaseline === 'function')
        initializeMenuNoticeBaseline(priorVersion > 0 && priorVersion < 32);
    if ((!hadItemNoticeState || priorVersion === 0) && typeof initializeItemNoticeBaselineFromMenu === 'function')
        initializeItemNoticeBaselineFromMenu();
    save();
    audio.enabled = !!state.settings.sound;
}
function markBalanceV32FourthPaid(regionIndex) {
    if (!state.balanceV32 || typeof state.balanceV32 !== 'object')
        state.balanceV32 = { migratedFromVersion: SAVE_VERSION, regionLevelsV31: [], paidFourthLevels: [], migratedAt: Date.now() };
    if (!Array.isArray(state.balanceV32.paidFourthLevels))
        state.balanceV32.paidFourthLevels = [];
    if (state.balanceV32.paidFourthLevels.indexOf(regionIndex) < 0)
        state.balanceV32.paidFourthLevels.push(regionIndex);
}
function restoreBalanceV31State(targetState) {
    // Outil de rollback pour une release corrective : aucun downgrade APK n'est nécessaire.
    // Les niveaux 4 achetés sous v3.2 sont ramenés à l'ancien maximum 3 et leur coût est remboursé.
    var s = targetState || state, refunds = {}, paid = s.balanceV32 && Array.isArray(s.balanceV32.paidFourthLevels) ? s.balanceV32.paidFourthLevels.slice() : [];
    paid.forEach(function (regionIndex) {
        if (((s.regionLevels && s.regionLevels[regionIndex]) || 1) < 4)
            return;
        var cost = regionUpgradeCost(regionIndex, 3);
        Object.keys(cost).forEach(function (k) { refunds[k] = (refunds[k] || 0) + cost[k]; s.resources[k] = (s.resources[k] || 0) + cost[k]; });
    });
    s.regionLevels = (s.regionLevels || []).map(function (level) { return Math.max(1, Math.min(3, level || 1)); });
    if (s.balanceV32) {
        s.balanceV32.rolledBackAt = Date.now();
        s.balanceV32.rollbackRefund = refunds;
        s.balanceV32.paidFourthLevels = [];
    }
    return refunds;
}
function save() {
    if (!state)
        return false;
    state.lastSeen = Date.now();
    try {
        var json = JSON.stringify(state), key = currentSaveKey(), previous = localStorage.getItem(key), previousParsed = parseSavePayload(previous);
        if (previousParsed)
            localStorage.setItem(localSaveBackupKey(activeSaveSlot), previous);
        localStorage.setItem(key, json);
        if (activeSaveSlot === 1)
            localStorage.setItem(LEGACY_SAVE_KEY, json);
        var bridge = androidBridge(), nativeOk = true;
        if (bridge && typeof bridge.backupSave === 'function') {
            try {
                nativeOk = bridge.backupSave(activeSaveSlot, json) !== false;
            }
            catch (e) {
                nativeOk = false;
            }
        }
        setSaveHealth(true, nativeOk, nativeOk ? 'Sauvegarde protégée' : 'Sauvegarde locale uniquement');
        if (typeof updateBottomNavNotifications === 'function')
            updateBottomNavNotifications();
        return true;
    }
    catch (e) {
        setSaveHealth(false, false, 'Échec de sauvegarde');
        if (typeof showToast === 'function')
            showToast('Impossible d’enregistrer la progression. Libère de l’espace puis réessaie.');
        return false;
    }
}
function dateKey(d) { return [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + d.getDate()).slice(-2)].join('-'); }
function daysBetween(a, b) { var aa = new Date(a + 'T12:00:00'), bb = new Date(b + 'T12:00:00'); return Math.round((bb - aa) / 86400000); }
function touchDay() {
    var today = dateKey(new Date());
    if (state.lastDay !== today) {
        if (state.lastDay && daysBetween(state.lastDay, today) === 1)
            state.streak++;
        else
            state.streak = 1;
        state.lastDay = today;
    }
}
function gardenFirstTerrain(k) {
    for (var i = 0; i < REGION.length; i++)
        if (REGION[i].items.indexOf(k) >= 0)
            return i + 1;
    return 99;
}
function gardenEligibleResources(level, includeUndiscovered) {
    level = Math.max(0, Math.min(8, Number(level) || 0));
    if (!level)
        return [];
    return Object.keys(RESOURCE).filter(function (k) { return EXCLUSIVE.indexOf(k) < 0 && gardenFirstTerrain(k) <= level && (includeUndiscovered === true || state.discoveredResources.indexOf(k) >= 0); });
}
function pathMaterialTerrainCount(k) { return REGION.reduce(function (sum, r) { return sum + (r.items.indexOf(k) >= 0 ? 1 : 0); }, 0); }
function pathMaterialEconomyTerrainCount(k) { return pathMaterialTerrainCount(k); }
function pathMaterialCirculationFactor(k) { var count = pathMaterialEconomyTerrainCount(k); return PATH_MATERIALS.indexOf(k) >= 0 ? 1 + Math.max(0, count - 1) * .24 : 1; }
function pathMaterialCostFactor(k) { if (PATH_MATERIALS.indexOf(k) < 0)
    return 1; var count = pathMaterialEconomyTerrainCount(k), first = gardenFirstTerrain(k), age = Math.max(0, Math.min(1, (5 - first) / 4)); return 1 + Math.max(0, count - 1) * .16 * age; }
function resourceReserveTarget(k) { return Math.max(10, Math.min(40, Math.round((FINAL_TARGET[k] || 50) * .20))); }
function resourceStockRatio(k) { var stock = state && state.resources ? Math.max(0, Number(state.resources[k]) || 0) : 0, stored = state && state.fanalDeposits ? fanalStored(k) : 0; return (stock + stored) / Math.max(1, resourceReserveTarget(k)); }
function resourceNeedMultiplier(k) { var ratio = resourceStockRatio(k); return 1 + Math.max(0, Math.min(.55, (1 - ratio) * .55)); }
function leastStockedResources(keys, entropy, count) { var list = (keys || []).filter(function (k, i, a) { return !!RESOURCE[k] && a.indexOf(k) === i; }); list.sort(function (a, b) { var d = resourceStockRatio(a) - resourceStockRatio(b); return Math.abs(d) > .0001 ? d : (gardenEntropy(a, entropy) - gardenEntropy(b, entropy)); }); return list.slice(0, Math.max(1, Math.floor(count || 1))); }
function gardenResourceWeight(k, level) {
    var first = gardenFirstTerrain(k);
    if (first > level || EXCLUSIVE.indexOf(k) >= 0)
        return 0;
    // Les matériaux présents sur plusieurs cartes poussent moins vite, mais on utilise désormais la vraie palette actuelle.
    var rarity = PATH_MATERIALS.indexOf(k) >= 0 ? (.25 + Math.min(8, level) * .012) / pathMaterialCirculationFactor(k) : 1;
    // Les Lucioles ont déjà les boules de lumière comme source supplémentaire.
    if (k === 'glow')
        rarity = .78;
    // Plus une ressource apparaît tard, plus sa culture passive reste prudente.
    var terrainFactor = Math.pow(.86, Math.max(0, first - 1));
    // Petit rattrapage anti-frustration : jamais plus de +55 %, donc le jardin aide sans remplacer les balades.
    return rarity * terrainFactor * resourceNeedMultiplier(k);
}
function gardenEntropy(k, entropy) { return hashString(String(entropy || 0) + '|' + k) % 100000; }
function offlineGardenRewards(elapsedMs, level, entropy) {
    var elapsed = Math.max(0, Math.min(elapsedMs || 0, 12 * 3600000));
    level = Math.max(0, Math.min(8, Number(level) || 0));
    if (!level)
        return {};
    // Même cadence volontairement lente qu'en 1.1.10 : le jardin complète les balades, il ne les remplace pas.
    var cycles = Math.floor(elapsed / 1800000), total = Math.floor(cycles * level), keys = gardenEligibleResources(level), out = {};
    if (!total || !keys.length)
        return out;
    var weightTotal = keys.reduce(function (sum, k) { return sum + gardenResourceWeight(k, level); }, 0), used = 0, remainders = [];
    keys.forEach(function (k) {
        var exact = total * gardenResourceWeight(k, level) / weightTotal, base = Math.floor(exact);
        out[k] = base;
        used += base;
        remainders.push({ k: k, f: exact - base, t: gardenEntropy(k, entropy) });
    });
    remainders.sort(function (a, b) { return b.f - a.f || (a.t - b.t); });
    for (var r = 0; r < total - used; r++)
        out[remainders[r % remainders.length].k]++;
    return out;
}
function applyOffline() {
    var now = Date.now(), last = state.lastSeen || now, elapsed = Math.max(0, Math.min(now - last, 12 * 3600000));
    var level = upgradeEffectLevel('garden', state.upgrades && state.upgrades.garden), gain = offlineGardenRewards(elapsed, level, last), any = false;
    state.offlineGain = { hours: elapsed / 3600000 };
    Object.keys(gain).forEach(function (k) { var amount = gain[k] || 0; if (!amount)
        return; any = true; state.offlineGain[k] = amount; state.resources[k] = (state.resources[k] || 0) + amount; if (state.discoveredResources.indexOf(k) < 0)
        state.discoveredResources.push(k); });
    return any;
}
function showOfflineGainPopup() {
    var g = state.offlineGain || { hours: 0 }, keys = Object.keys(g).filter(function (k) { return k !== 'hours' && (g[k] || 0) > 0; });
    if (!keys.length)
        return false;
    if (!$('modal').classList.contains('hidden'))
        return false;
    keys.sort(function (a, b) { return gardenFirstTerrain(a) - gardenFirstTerrain(b) || Object.keys(RESOURCE).indexOf(a) - Object.keys(RESOURCE).indexOf(b); });
    var rewards = keys.map(function (k) { return resourcePill(k, g[k]); }).join('');
    var duration = g.hours >= 1 ? Math.floor(g.hours) + ' h ' + Math.round((g.hours % 1) * 60) + ' min' : Math.max(1, Math.round(g.hours * 60)) + ' min';
    state.offlineGain = { hours: 0 };
    save();
    $('offlineMessage').textContent = 'Les lucioles ont bien travaillé. Ton refuge est un peu plus rempli.';
    showModal('luciole.svg', 'Les lucioles ont travaillé', '<p>Pendant ton absence, elles ont pris soin du jardin et rapporté :</p><div class="offline-rewards">' + rewards + '</div><small class="offline-duration">Après ' + duration + ' loin du refuge</small>');
    return true;
}
function hashString(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
} return h >>> 0; }
function leastStockedPathMaterial(keys, entropy) { var list = (keys || []).filter(function (k) { return PATH_MATERIALS.indexOf(k) >= 0 && RESOURCE[k]; }); return list.length ? leastStockedResources(list, entropy, 1)[0] : 'seed'; }
function dailyUnlocked() { return !!(state && state.stats && (state.stats.expeditions || 0) > 0); }
function ensureDaily() {
    if (!dailyUnlocked()) {
        state.daily = null;
        return;
    }
    var key = dateKey(new Date());
    if (state.daily && state.daily.date === key)
        return;
    var h = hashString(key), kind = h % 3, quest, known = (state.discoveredResources || []).filter(function (k) { return !!RESOURCE[k] && EXCLUSIVE.indexOf(k) < 0; }), knownPath = known.filter(function (k) { return PATH_MATERIALS.indexOf(k) >= 0; }), needs = leastStockedResources(known, h, 2), needA = needs[0] || 'seed', needB = needs[1] || 'berry', special = leastStockedPathMaterial(knownPath, h);
    function dailyAmount(k, big) { if (PATH_MATERIALS.indexOf(k) >= 0)
        return big ? 4 : 3; if (k === 'glow')
        return big ? 6 : 4; return big ? 7 : 5; }
    if (kind === 0) {
        var collectReward = { glow: 2 };
        addCost(collectReward, needA, dailyAmount(needA, true));
        quest = { type: 'collect', target: 25 + (h % 4) * 5, progress: 0, title: 'Remplir la sacoche', text: 'Ramasse des ressources pendant tes balades.', reward: collectReward, claimed: false };
    }
    if (kind === 1) {
        var walkReward = {};
        addCost(walkReward, needA, dailyAmount(needA, false));
        addCost(walkReward, needB, dailyAmount(needB, false));
        quest = { type: 'walk', target: 2 + (h % 2), progress: 0, title: 'Prendre l’air', text: 'Termine quelques petites expéditions.', reward: walkReward, claimed: false };
    }
    if (kind === 2) {
        var reward = { glow: 3 };
        addCost(reward, special, 3 + (h % 2));
        quest = { type: 'rare', target: 2 + (h % 3), progress: 0, title: 'Un éclat différent', text: 'Trouve des ressources régionales.', reward: reward, claimed: false };
    }
    quest.date = key;
    state.daily = quest;
}
function dailyProgress(type, n) { if (!state.daily || state.daily.claimed)
    return; if (state.daily.type === type) {
    state.daily.progress = Math.min(state.daily.target, state.daily.progress + n);
    save();
} }
function dailyRewardMarkup(q, collected) {
    q = q || state.daily;
    if (!q || !q.reward)
        return '';
    return '<div class="daily-reward-list' + (collected ? ' daily-reward-list-collected' : '') + '">' + Object.keys(q.reward).map(function (k) { return '<div class="daily-reward-item">' + img(RESOURCE[k].icon) + '<span>' + RESOURCE[k].name + '</span><b>+' + format(q.reward[k]) + '</b></div>'; }).join('') + '</div>';
}
function showDailyRewards() {
    var q = state.daily;
    if (!q || q.claimed || q.progress >= q.target)
        return false;
    showModal('luciole.svg', 'Récompenses de la mission', '<p>Termine la quête pour recevoir :</p>' + dailyRewardMarkup(q));
    return true;
}
function claimDaily() {
    var q = state.daily;
    if (!q || q.claimed || q.progress < q.target)
        return;
    Object.keys(q.reward).forEach(function (k) { state.resources[k] += q.reward[k]; discoverResource(k); });
    q.claimed = true;
    state.stats.dailyDone++;
    save();
    renderHome();
    playSfx('badge', .52);
    showModal('luciole.svg', 'Petite mission accomplie', '<p class="daily-collected-copy">Tu récupères :</p>' + dailyRewardMarkup(q, true));
}
function totalLevels(s) { return purchasedUpgradeLevels(s); }
function savedRegionLevel(s, i) { return Math.max(1, Math.min(REGION_MAX_LEVEL, (s.regionLevels && s.regionLevels[i]) || 1)); }
function progressUnlockedCount(s) {
    var l = totalLevels(s), n = 1;
    for (var i = 1; i < REGION.length; i++) {
        if (l < REGION[i].req || savedRegionLevel(s, i - 1) < REGION_MAX_LEVEL)
            break;
        n++;
    }
    return n;
}
function unlockedCount(s) { return Math.max(Math.min(REGION.length, s.unlockFloor || 1), progressUnlockedCount(s)); }
function isUnlocked(i) { return i < unlockedCount(state); }
function img(path, cls) { return '<img ' + (cls ? 'class="' + cls + '" ' : '') + 'src="img/' + path + '" alt="">'; }
function resourcePill(k, n) { return '<span class="resource-pill">' + img(RESOURCE[k].icon) + '<b>' + format(n) + '</b></span>'; }
function format(n) { if (n >= 1000000)
    return (n / 1000000).toFixed(1) + 'm'; if (n >= 1000)
    return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'k'; return String(n); }
function sortedResourceKeysByAmount(o) { return Object.keys(o || {}).sort(function (a, b) { var diff = (o[b] || 0) - (o[a] || 0); return diff || ((RESOURCE[a] && RESOURCE[a].name) || a).localeCompare((RESOURCE[b] && RESOURCE[b].name) || b); }); }
function costText(o) { return sortedResourceKeysByAmount(o).map(function (k) { return o[k] + ' ' + RESOURCE[k].name.toLowerCase(); }).join(', '); }
function hasCost(cost) { return Object.keys(cost).every(function (k) { return (state.resources[k] || 0) >= cost[k]; }); }
function missingCost(cost) { var out = {}; Object.keys(cost).forEach(function (k) { var missing = Math.max(0, cost[k] - (state.resources[k] || 0)); if (missing)
    out[k] = missing; }); return out; }
function hiddenPathMaterial(k) { return PATH_MATERIALS.indexOf(k) >= 0 && state.discoveredResources.indexOf(k) < 0; }
function costResourceVisual(k) { return hiddenPathMaterial(k) ? '<span class="cost-unknown-icon">?</span>' : img(RESOURCE[k].icon); }
function upgradeCostMarkup(cost) { return sortedResourceKeysByAmount(cost).map(function (k) { var missing = (state.resources[k] || 0) < cost[k]; return '<span class="cost-item ' + (missing ? 'cost-item-missing' : '') + '">' + costResourceVisual(k) + '<b>' + cost[k] + '</b></span>'; }).join(''); }
function missingCostPopupMarkup(cost) { var missing = missingCost(cost), keys = Object.keys(missing); return '<div class="missing-modal-list">' + keys.map(function (k) { return '<span class="missing-modal-item">' + costResourceVisual(k) + '<span><b>' + missing[k] + '</b> ' + (hiddenPathMaterial(k) ? 'Matériau encore inconnu' : RESOURCE[k].name) + '</span></span>'; }).join('') + '</div>'; }
function fullCostStatusPopupMarkup(cost) { return '<div class="cost-status-list">' + Object.keys(cost).map(function (k) { var owned = Math.max(0, Math.floor(state.resources[k] || 0)), required = cost[k], missing = owned < required, label = hiddenPathMaterial(k) ? 'Matériau encore inconnu' : RESOURCE[k].name; return '<div class="cost-status-item ' + (missing ? 'missing' : 'ready') + '">' + costResourceVisual(k) + '<div class="cost-status-copy"><strong>' + label + '</strong><small>' + (missing ? 'Il en manque ' + (required - owned) : 'Quantité suffisante') + '</small></div><b>' + owned + ' / ' + required + '</b></div>'; }).join('') + '</div>'; }
function showMissingCostModal(icon, title, cost) { var missing = missingCost(cost); if (!Object.keys(missing).length)
    return false; showModal(icon, 'Ressources manquantes', '<p>' + title + '</p>' + missingCostPopupMarkup(cost)); return true; }
function showRegionUpgradeNeedsModal(i, cost) { if (hasCost(cost))
    return false; showModal(REGION[i].img, 'Ressources nécessaires', '<p>Pour faire évoluer <strong>' + REGION[i].name + '</strong>, voici le coût complet.</p>' + fullCostStatusPopupMarkup(cost)); return true; }
function payCost(cost) { Object.keys(cost).forEach(function (k) { state.resources[k] -= cost[k]; }); }
function upgradeGlowCost(level) { return 1 + Math.floor(Math.max(0, Math.min(6, level - 1)) / 3); }
var REFUGE_SUPPORT_MATERIALS = ['seed', 'berry', 'pebble', 'leaf', 'shell'];
function refugeSupportMaterial(u, level) { return REFUGE_SUPPORT_MATERIALS[((u.matOffset || 0) + level) % REFUGE_SUPPORT_MATERIALS.length]; }
function refugeSupportAmount(level) { return 3 + Math.floor(Math.max(1, Math.min(7, level)) / 2); }
function upgradeCost(u, level) {
    if (u && u.id === 'bag')
        return bagUpgradeCost(level);
    // v3.2.0 : le Refuge consomme surtout des matériaux communs + Lucioles. Les signatures
    // et ressources régionales restent ainsi principalement dédiées à la progression des balades.
    var m = Math.pow(1.22, level), out = {}, support = refugeSupportMaterial(u, level);
    Object.keys(u.base).forEach(function (k) { out[k] = Math.ceil(u.base[k] * m); });
    addCost(out, 'glow', upgradeGlowCost(level));
    addCost(out, support, refugeSupportAmount(level));
    return raiseExistingLucioleCost(out);
}
function upgradeVisible(u) {
    var level = (state.upgrades && state.upgrades[u.id]) || 1;
    if (u.id === 'bag' || level > 1)
        return true;
    var threshold = REFUGE_REVEAL_EXPEDITIONS[u.id];
    return threshold !== undefined && ((state.stats && state.stats.expeditions) || 0) >= threshold;
}
function refugeTrackerVisible(s) { s = s || state || {}; return !!(s.refugeFeatures && s.refugeFeatures.tracker) || ((s.badges || []).length >= REFUGE_TRACKER.badgesRequired); }
function refugeTrackerUnlocked(s) { s = s || state || {}; return !!(s.refugeFeatures && s.refugeFeatures.tracker); }
function buyRefugeTracker() {
    if (!refugeTrackerVisible(state) || refugeTrackerUnlocked(state))
        return false;
    if (!hasCost(REFUGE_TRACKER.cost)) {
        showMissingCostModal(REFUGE_TRACKER.icon, 'Il te manque encore quelques ressources pour installer ' + REFUGE_TRACKER.name + '.', REFUGE_TRACKER.cost);
        return false;
    }
    payCost(REFUGE_TRACKER.cost);
    state.refugeFeatures.tracker = true;
    save();
    playSfx('upgrade', .72);
    renderRefuge();
    showModal(REFUGE_TRACKER.icon, REFUGE_TRACKER.name + ' installée', '<p>Avant chaque balade, tu peux maintenant choisir une ressource à pister.</p><p>L’aiguille indique une trouvaille dans la balade, puis en choisit une autre après chaque collecte.</p>');
    return true;
}
function regionLevel(i) { return savedRegionLevel(state, i); }
function addCost(out, k, n) { out[k] = (out[k] || 0) + n; }
function regionAdvancedMaterial(r) { return r.signature || r.craft || 'mushroom'; }
function regionUpgradeCost(i, level) {
    var r = REGION[i], out = {}, a = r.evolve[0], b = r.evolve[1], previousUnique = i > 0 ? REGION[i - 1].unique : null;
    level = Math.max(1, Math.min(REGION_MAX_LEVEL - 1, Number(level) || 1));
    if (level === 1) {
        addCost(out, a, 4 + Math.floor(i * .7));
        addCost(out, b, 3 + Math.floor(i * .5));
        addCost(out, r.signature, 8 + i);
        addCost(out, 'glow', 2 + Math.floor(i / 3));
    }
    else if (level === 2) {
        addCost(out, a, 6 + Math.floor(i * .8));
        addCost(out, b, 5 + Math.floor(i * .6));
        addCost(out, r.signature, 12 + i);
        addCost(out, r.unique, 5 + Math.floor(i / 2));
        if (previousUnique)
            addCost(out, previousUnique, 2 + Math.floor(i / 4));
        addCost(out, 'glow', 3 + Math.floor(i / 2));
    }
    else {
        // Le quatrième palier n'est pas un simple coût gonflé : il consacre la maîtrise
        // de la ressource régionale de la balade, qui devient le principal matériau demandé.
        addCost(out, a, 6 + Math.floor(i * .6));
        addCost(out, b, 5 + Math.floor(i * .5));
        addCost(out, r.signature, 10 + Math.floor(i * .8));
        addCost(out, r.unique, 12 + i);
        addCost(out, 'glow', 4 + Math.floor(i / 3));
    }
    return raiseRegionLucioleCost(out, r, level);
}
function pathMaterialAvailabilityScore(k) { if (PATH_MATERIALS.indexOf(k) < 0)
    return 0; var factor = pathMaterialCirculationFactor(k), score = 0; REGION.forEach(function (r, i) { if (r.items.indexOf(k) < 0)
    return; var maxTier = WALK_TIER[REGION_MAX_LEVEL - 1], nodes = maxTier.baseNodes + i * maxTier.regionNodes; score += nodes * (k === r.signature ? 1 : 1 / factor); }); return score; }
function economyAudit() {
    var sink = {}, uses = {}, pathPressure = {};
    Object.keys(RESOURCE).forEach(function (k) { sink[k] = 0; uses[k] = 0; });
    function addRecipe(cost) { Object.keys(cost).forEach(function (k) { sink[k] += cost[k]; uses[k]++; }); }
    UPGRADE.forEach(function (u) { for (var l = 1; l < u.max; l++)
        addRecipe(upgradeCost(u, l)); });
    REGION.forEach(function (r, i) { for (var l = 1; l < REGION_MAX_LEVEL; l++) addRecipe(regionUpgradeCost(i, l)); });
    PATH_MATERIALS.forEach(function (k) { pathPressure[k] = (sink[k] + (FINAL_TARGET[k] || 0)) / Math.max(1, pathMaterialAvailabilityScore(k)); });
    return { sink: sink, uses: uses, pathPressure: pathPressure };
}
function finalMapsReady() { return unlockedCount(state) >= REGION.length && REGION.every(function (r, i) { return regionLevel(i) >= REGION_MAX_LEVEL; }); }
function completedCharacterLoreCount() { return Object.keys(CREATURE).reduce(function (sum, k) { return sum + Math.max(0, Math.min(3, (state.characterKnowledge && state.characterKnowledge[k]) || 0)); }, 0); }
function allCharacterLoreReady() { return completedCharacterLoreCount() === Object.keys(CREATURE).length * 3; }
function finalArchipelagoWalkReady() { return !!state.fanalArchipelagoWalkDone || !!state.gameWon; }
function markFinalArchipelagoWalk(regionIndex, level) { if (finalMapsReady() && regionIndex === REGION.length - 1 && level >= REGION_MAX_LEVEL)
    state.fanalArchipelagoWalkDone = true; return finalArchipelagoWalkReady(); }
function finalGoalRevealed() { return !!state.fanalRevealed || !!state.gameWon; }
function canRevealFinalGoalAfterRun(regionIndex, level) { return !finalGoalRevealed() && finalMapsReady() && allCharacterLoreReady() && (finalArchipelagoWalkReady() || (regionIndex === REGION.length - 1 && level >= REGION_MAX_LEVEL)); }
function revealFinalGoalAfterRun(regionIndex, level) { markFinalArchipelagoWalk(regionIndex, level); if (!canRevealFinalGoalAfterRun(regionIndex, level))
    return false; state.fanalRevealed = true; return true; }
function visibleBadges() { return BADGES.filter(function (b) { return b.id !== 'beacon' || finalGoalRevealed(); }); }
function finalUpgradesReady() { return UPGRADE.every(function (u) { return (state.upgrades[u.id] || 0) >= FINAL_UPGRADE_LEVEL; }); }
function fanalStored(k) { return Math.max(0, Math.min(FINAL_TARGET[k] || 0, Math.floor(Number(state.fanalDeposits && state.fanalDeposits[k]) || 0))); }
function fanalMissing(k) { return Math.max(0, (FINAL_TARGET[k] || 0) - fanalStored(k)); }
function fanalDepositAmount(k, amount) {
    if (!finalGoalRevealed() || state.gameWon || !FINAL_TARGET[k])
        return 0;
    state.fanalDeposits = state.fanalDeposits || emptyFanalDeposits();
    var wanted = Math.max(0, Math.floor(Number(amount) || 0)), available = Math.max(0, Math.floor(state.resources[k] || 0)), take = Math.min(wanted, available, fanalMissing(k));
    if (!take)
        return 0;
    state.resources[k] = available - take;
    state.fanalDeposits[k] = fanalStored(k) + take;
    save();
    renderHome();
    playSfx('pickup_magic', .58, 55);
    return take;
}
function fanalDepositAll(k) { return fanalDepositAmount(k, Math.min(state.resources[k] || 0, fanalMissing(k))); }
function finalGoalProgress() {
    var keys = Object.keys(FINAL_TARGET), sum = 0, done = 0;
    keys.forEach(function (k) { var ratio = Math.min(1, fanalStored(k) / FINAL_TARGET[k]); sum += ratio; if (ratio >= 1)
        done++; });
    var resourcePercent = sum / keys.length, mapsDone = REGION.filter(function (r, i) { return regionLevel(i) >= REGION_MAX_LEVEL; }).length / REGION.length, upgradeProgress = UPGRADE.reduce(function (a, u) { var level = Math.max(1, state.upgrades[u.id] || 1); return a + Math.min(1, Math.max(0, (level - 1) / (FINAL_UPGRADE_LEVEL - 1))); }, 0) / UPGRADE.length;
    return { percent: Math.round((resourcePercent * .72 + mapsDone * .16 + upgradeProgress * .12) * 100), done: done, total: keys.length, mapsReady: finalMapsReady(), upgradesReady: finalUpgradesReady() };
}
function finalReady() { return finalGoalRevealed() && finalMapsReady() && finalUpgradesReady() && Object.keys(FINAL_TARGET).every(function (k) { return fanalStored(k) >= FINAL_TARGET[k]; }); }
function walkProfile(regionIndex, level) { var l = Math.max(1, Math.min(REGION_MAX_LEVEL, level || regionLevel(regionIndex))), t = WALK_TIER[l - 1]; return { level: l, name: t.name, desc: t.desc, world: t.world, nodes: t.baseNodes + regionIndex * t.regionNodes, rareBase: t.rareBase, rareEdge: t.rareEdge }; }
function rareChance(level, edge) {
    if (level <= 1)
        return 0;
    var t = WALK_TIER[Math.max(1, Math.min(REGION_MAX_LEVEL, level)) - 1], e = Math.max(0, Math.min(1, edge || 0)), compass = state.upgrades.compass || 0;
    return Math.min(.24, t.rareBase + t.rareEdge * Math.pow(e, 2.05) + compass * (level === 2 ? .0022 : .0042) * (.30 + .70 * e));
}
function guaranteedRareMinimum(level) { return level <= 1 ? 0 : (level === 2 ? 2 : (level === 3 ? 4 : 7)); }
function expectedCountWithFloor(n, p, min) {
    n = Math.max(0, Math.round(n || 0));
    p = Math.max(0, Math.min(1, p || 0));
    min = Math.max(0, Math.min(n, Math.round(min || 0)));
    var expected = n * p;
    if (!min || !n)
        return expected;
    var q = 1 - p, prob = Math.pow(q, n);
    for (var x = 0; x < min; x++) {
        if (x > 0)
            prob = prob * ((n - x + 1) / x) * (p / Math.max(1e-12, q));
        expected += (min - x) * prob;
    }
    return Math.min(n, expected);
}
function averageTerrainRareChance(level) {
    if (level <= 1)
        return 0;
    var steps = 320, sum = 0;
    for (var i = 0; i < steps; i++) {
        var u = (i + .5) / steps, edge = Math.pow(u, .43);
        sum += rareChance(level, edge);
    }
    return sum / steps;
}
function terrainResourceEstimates(regionIndex) {
    var r = REGION[regionIndex], level = regionLevel(regionIndex), profile = walkProfile(regionIndex, level), nodes = profile.nodes, rareAvg = averageTerrainRareChance(level), rareExpected = level >= 2 ? expectedCountWithFloor(nodes, rareAvg, guaranteedRareMinimum(level)) : 0;
    rareExpected = Math.max(0, Math.min(nodes, rareExpected));
    var commonSlots = nodes - rareExpected, totalWeight = r.items.reduce(function (sum, k) { return sum + terrainItemWeight(k, r); }, 0), entries = r.items.map(function (k) { return { key: k, expected: commonSlots * terrainItemWeight(k, r) / Math.max(.0001, totalWeight), kind: k === r.signature ? 'signature' : 'common' }; });
    if (guaranteedSignatureMinimum(level) > 0) {
        var sig = entries.filter(function (e) { return e.key === r.signature; })[0], raw = sig ? sig.expected : 0, sigP = totalWeight ? terrainItemWeight(r.signature, r) / totalWeight : 0, target = expectedCountWithFloor(commonSlots, sigP, guaranteedSignatureMinimum(level));
        if (sig && target > raw) {
            var remainingRaw = Math.max(.0001, commonSlots - raw), scale = Math.max(0, (commonSlots - target) / remainingRaw);
            entries.forEach(function (e) { if (e !== sig)
                e.expected *= scale; });
            sig.expected = target;
        }
    }
    if (level >= 2)
        entries.push({ key: r.rare, expected: rareExpected, kind: 'rare' });
    entries.forEach(function (e) { e.share = nodes ? e.expected / nodes : 0; });
    entries.sort(function (a, b) { return a.expected - b.expected || RESOURCE[a.key].name.localeCompare(RESOURCE[b.key].name); });
    return entries;
}
function terrainResourceRate(n) { return (Math.round(n * 10) / 10).toFixed(1).replace('.', ','); }
function terrainResourceListMarkup(regionIndex) {
    var r = REGION[regionIndex], level = regionLevel(regionIndex), profile = walkProfile(regionIndex, level), entries = terrainResourceEstimates(regionIndex), herb = state.upgrades.herbarium || 0, compass = state.upgrades.compass || 0;
    var note = '<p class="terrain-resource-note"><strong>Du plus rare au plus fréquent</strong> · niveau ' + level + ' / ' + REGION_MAX_LEVEL + '.</p><div class="terrain-resource-modifiers"><span>Herbier ' + herb + ' / 8</span><span>Boussole ' + compass + ' / 8</span></div>';
    if (level <= 1)
        note += '<small class="terrain-resource-locked-rare">La ressource régionale n’est pas encore disponible sur cette balade.</small>';
    return note + '<div class="terrain-resource-list">' + entries.map(function (e, i) { var badge = e.kind === 'rare' ? '<em class="terrain-resource-badge rare">Ressource régionale</em>' : (e.kind === 'signature' ? '<em class="terrain-resource-badge signature">Ressource-signature</em>' : ''); return '<div class="terrain-resource-item"><b class="terrain-resource-rank">' + (i + 1) + '</b>' + img(RESOURCE[e.key].icon) + '<div><strong>' + RESOURCE[e.key].name + '</strong>' + badge + '<small>≈ ' + terrainResourceRate(e.share * 100) + ' % des emplacements</small></div></div>'; }).join('') + '</div>';
}
function showTerrainResources(regionIndex) {
    if (!isUnlocked(regionIndex)) {
        showToast('Cette balade doit d’abord être débloquée.');
        return false;
    }
    var r = REGION[regionIndex];
    showModal(r.img, 'Ressources · ' + r.name, terrainResourceListMarkup(regionIndex), null, 'terrain-resource-modal');
    return true;
}
function ensureGuaranteedRegionalRares(nodes, r, level) {
    var minimum = guaranteedRareMinimum(level), count = nodes.reduce(function (sum, n) { return sum + (n.rare && n.type === r.rare ? 1 : 0); }, 0);
    if (count >= minimum)
        return count;
    var candidates = nodes.filter(function (n) { return !n.rare; }).sort(function (a, b) { return (b.edge || 0) - (a.edge || 0); });
    for (var i = 0; i < minimum - count && i < candidates.length; i++) {
        candidates[i].rare = true;
        candidates[i].type = r.rare;
    }
    return Math.min(minimum, count + candidates.length);
}
function nodePosition(rng, world) {
    var half = world / 2 - 70, angle = rng() * Math.PI * 2, ca = Math.cos(angle), sa = Math.sin(angle), maxR = half / Math.max(Math.abs(ca), Math.abs(sa)), edge = Math.pow(rng(), .43), radius = maxR * edge;
    return { x: world / 2 + ca * radius, y: world / 2 + sa * radius, edge: edge };
}
function discoverResource(k) { if (state.discoveredResources.indexOf(k) < 0) {
    state.discoveredResources.push(k);
    return true;
} return false; }
function nextCharacterDialogueNumber(k, level) {
    var known = Math.max(0, Math.min(4, (state.characterKnowledge && state.characterKnowledge[k]) || 0)), normalizedLevel = Math.max(1, Math.min(REGION_MAX_LEVEL, level || 1)), cap = normalizedLevel >= 4 ? 3 : normalizedLevel >= 2 ? 2 : 1;
    if (known < cap)
        return known + 1;
    if (state.gameWon && known === 3)
        return 4;
    return 0;
}
function discoverCreature(k, level) {
    var fresh = state.discoveredCreatures.indexOf(k) < 0;
    if (fresh)
        state.discoveredCreatures.push(k);
    state.characterKnowledge = state.characterKnowledge || {};
    var learned = nextCharacterDialogueNumber(k, level);
    if (learned)
        state.characterKnowledge[k] = learned;
    save();
    if (fresh)
        playSfx('character', .66, 120);
    return { fresh: fresh, learned: learned };
}
function characterJournalText(k) {
    var ch = CREATURE[k], known = Math.max(0, Math.min(4, (state.characterKnowledge && state.characterKnowledge[k]) || 0));
    if (!known)
        return '<p>Tu sais seulement que vos chemins se sont déjà croisés.</p>';
    var html = '<p><strong>' + ch.home + '</strong> · connaissance ' + known + ' / 3</p>';
    for (var i = 0; i < known; i++)
        html += '<div class="lore-note"><strong>' + (i === 3 ? 'Épilogue' : 'Niveau ' + (i + 1)) + '</strong><p>' + ch.dialogue[i] + '</p></div>';
    return html;
}
function showCharacterDialogue(c, learned, fresh, replay) {
    if (!game || !c || !CREATURE[c.type] || !learned)
        return false;
    var ch = CREATURE[c.type], epilogue = learned === 4;
    game.dialogOpen = true;
    game.player.targetX = game.player.x;
    game.player.targetY = game.player.y;
    showModal(ch.icon, ch.name + (fresh ? ' · première rencontre' : ''), '<p><strong>' + game.r.name + ' · ' + (epilogue ? 'épilogue ' : 'récit ') + learned + ' / 3</strong></p><p>« ' + ch.dialogue[learned - 1] + ' »</p><p class="lore-hint">' + (replay ? 'Dialogue déjà noté dans ton carnet.' : epilogue ? 'Une dernière note s’ajoute à ton carnet.' : 'Cette rencontre est notée dans ton carnet.') + '</p>');
    return true;
}
function characterHasNewDialogue(k, level) { return !!nextCharacterDialogueNumber(k, level); }
function creatureHasNewDialogue(c) { return !!(c && !c.learnedThisRun && characterHasNewDialogue(c.type, game && game.level)); }
function meetCharacter(c) {
    if (!game || !c || !CREATURE[c.type])
        return false;
    c.seen = true;
    var result = discoverCreature(c.type, game.level);
    if (!result.learned)
        return false;
    c.learnedThisRun = true;
    return showCharacterDialogue(c, result.learned, result.fresh, false);
}
function replayCharacterDialogue(c) {
    if (!game || !c || !CREATURE[c.type])
        return false;
    var learned = Math.max(0, Math.min(4, (state.characterKnowledge && state.characterKnowledge[c.type]) || 0));
    if (!learned)
        return false;
    return showCharacterDialogue(c, learned, false, true);
}
function creatureDirectlyLit(c, metrics) {
    if (!game || !game.player || !c)
        return false;
    metrics = metrics || (typeof currentVisibilityMetrics === 'function' ? currentVisibilityMetrics() : null);
    if (!metrics || !metrics.lightRadiusSquared)
        return false;
    return distSquared(game.player.x, game.player.y, c.x, c.y) <= metrics.lightRadiusSquared;
}
function interactCharacter(c) {
    if (!game || !c || !CREATURE[c.type] || !creatureDirectlyLit(c))
        return false;
    if (creatureHasNewDialogue(c))
        return meetCharacter(c);
    return replayCharacterDialogue(c);
}
function characterAtPoint(x, y, radius) {
    if (!game || !game.creatures)
        return null;
    var best = null, bestD = Infinity, r = Math.max(28, radius || 46);
    game.creatures.forEach(function (c) {
        if (!creatureDirectlyLit(c))
            return;
        var d = dist(x, y, c.x, c.y);
        if (d <= r && d < bestD) {
            best = c;
            bestD = d;
        }
    });
    return best;
}
function checkBadges(show) {
    var got = [];
    BADGES.forEach(function (b) { if (state.badges.indexOf(b.id) < 0 && b.test(state)) {
        state.badges.push(b.id);
        got.push(b);
    } });
    if (got.length && show) {
        playSfx('badge', .80);
        showModal('carnet.svg', 'Nouveau badge : ' + got[0].name, got[0].desc);
    }
}
