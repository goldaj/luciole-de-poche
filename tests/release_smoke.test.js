'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const scripts = [
    'data.js',
    'state.js',
    'ui.js',
    'audio.js',
    'expedition.js',
    'bindings.js',
    'companions.js',
    'tutorial.js'
].map(name => path.join(root, 'app/src/main/assets/js', name));

function memoryStorage() {
    const values = new Map();
    return {
        getItem(key) {
            return values.has(key) ? values.get(key) : null;
        },
        setItem(key, value) {
            values.set(String(key), String(value));
        },
        removeItem(key) {
            values.delete(String(key));
        },
        clear() {
            values.clear();
        }
    };
}

const context = {
    console,
    localStorage: memoryStorage(),
    document: {
        getElementById() { return null; },
        querySelectorAll() { return []; },
        addEventListener() {}
    },
    navigator: { vibrate() {} },
    location: { hash: '' },
    performance: { now: () => 0 },
    requestAnimationFrame() {},
    cancelAnimationFrame() {},
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    Promise,
    Image: function Image() {},
    Audio: function Audio() {}
};
context.window = context;
context.globalThis = context;
vm.createContext(context);

for (const filename of scripts) {
    vm.runInContext(fs.readFileSync(filename, 'utf8'), context, { filename });
}

// UI notifications are outside the scope of this headless release test.
context.showToast = function () {};

function setState(value) {
    context.state = value;
    vm.runInContext('state = globalThis.state;', context);
}

async function run() {
    // Save schema and fresh-start behavior.
    const base = context.defaultState();
    assert.equal(base.version, 35);
    assert.equal(base.tutorial.coreStage, 'waiting-run');
    assert.equal(base.gems, 0);
    assert.deepEqual(Array.from(base.companionPermanent), []);
    assert.equal(base.resources.seed, 8);
    setState(base);
    context.normalizeCompanionState();

    const fresh = context.freshStartState({ sound: false, haptics: true, audioV2: true });
    assert(Object.values(fresh.resources).every(value => value === 0));
    assert.equal(fresh.gems, 0);
    assert.equal(fresh.settings.sound, false);
    assert.equal(fresh.tutorial.coreStage, 'waiting-run');

    // The daily quest stays completely absent until the player has finished at least one expedition.
    setState(context.defaultState());
    context.ensureDaily();
    assert.equal(context.state.daily, null);
    context.state.stats.expeditions = 1;
    context.ensureDaily();
    assert(context.state.daily && context.state.daily.date);


    // Claiming a completed daily quest reuses the visual reward cards instead of collapsing to plain text.
    context.state.daily.progress = context.state.daily.target;
    let claimedDailyModal = null;
    context.renderHome = function () {};
    context.showModal = function (icon, title, text) { claimedDailyModal = { icon, title, text }; };
    context.playSfx = function () {};
    context.claimDaily();
    assert.equal(context.state.daily.claimed, true);
    assert(claimedDailyModal && claimedDailyModal.text.includes('daily-reward-list-collected'));
    assert(claimedDailyModal.text.includes('daily-reward-item'));
    assert(!claimedDailyModal.text.includes('Le refuge reçoit'));

    // v3.2.0 Bag curve: intentionally tiny start, large tutorial relief, same historical cap.
    assert.equal(context.REGION_MAX_LEVEL, 4);
    assert.deepEqual(Array.from(context.BAG_CAPACITY_BY_LEVEL.slice(1)), [10, 18, 25, 32, 39, 46, 53, 60]);
    assert.equal(context.bagCapacityForLevel(1), 10);
    assert.equal(context.bagCapacityForLevel(2), 18);
    assert.equal(context.bagCapacityForLevel(8), 60);
    assert.equal(JSON.stringify(context.bagUpgradeCost(1)), JSON.stringify({ seed: 2, pebble: 2 }));
    const bagLifetime = Array.from({ length: 7 }, (_, i) => context.bagUpgradeCost(i + 1))
        .reduce((sum, cost) => sum + Object.values(cost).reduce((a, b) => a + b, 0), 0);
    assert.equal(bagLifetime, 196);
    for (let level = 1; level <= 7; level++) {
        const cost = context.bagUpgradeCost(level);
        assert(Object.keys(cost).every(key => !context.PATH_MATERIALS.includes(key) && !context.EXCLUSIVE.includes(key)));
    }
    assert.equal(JSON.stringify(context.bagMigrationRefund(2)), JSON.stringify({ seed: 3, pebble: 3, glow: 1, pearl: 3 }));

    // Four terrain levels have distinct economic jobs.
    assert.equal(context.WALK_TIER.length, 4);
    assert.deepEqual(Array.from([1, 2, 3, 4].map(context.guaranteedRareMinimum)), [0, 2, 4, 7]);
    assert.deepEqual(Array.from([1, 2, 3, 4].map(context.guaranteedSignatureMinimum)), [4, 5, 7, 9]);
    let terrainSink = 0;
    for (let i = 0; i < context.REGION.length; i++) {
        const region = context.REGION[i];
        for (let level = 1; level < context.REGION_MAX_LEVEL; level++) {
            const cost = context.regionUpgradeCost(i, level);
            terrainSink += Object.values(cost).reduce((sum, value) => sum + value, 0);
            if (level <= 2) {
                const otherMax = Math.max(...Object.entries(cost).filter(([key]) => key !== region.signature).map(([, value]) => value));
                assert(cost[region.signature] > otherMax, `${region.name} L${level}->${level + 1}: signature must dominate`);
            }
            if (level === 2 && i > 0) {
                const previousUnique = context.REGION[i - 1].unique;
                assert(cost[region.unique] > cost[previousUnique], `${region.name}: current regional must exceed previous regional`);
            }
            if (level === 3)
                assert(cost[region.unique] > cost[region.signature], `${region.name} L3->4: regional mastery must dominate`);
        }
    }
    assert.equal(terrainSink, 968);
    // v3.2.2 raises only the Luciole share of existing recipes.
    assert.equal(context.LUCIOLE_COST_MULTIPLIER, 4 / 3);
    assert.equal(context.bagUpgradeCost(2).glow, 2);
    assert.equal(context.regionUpgradeCost(0, 1).glow, 3);
    assert.equal(context.REFUGE_TRACKER.cost.glow, 16);
    assert.equal(context.FINAL_TARGET.glow, 320);

    // Signature resources are always most concentrated on their own terrain, even at Herbarium extremes.
    setState(context.defaultState());
    for (const herbarium of [1, 8]) {
        context.state.upgrades.herbarium = herbarium;
        for (let home = 0; home < context.REGION.length; home++) {
            const region = context.REGION[home];
            const homeTotal = region.items.reduce((sum, key) => sum + context.terrainItemWeight(key, region), 0);
            const homeShare = context.terrainItemWeight(region.signature, region) / homeTotal;
            let otherMax = 0;
            for (let other = 0; other < context.REGION.length; other++) {
                if (other === home || !context.REGION[other].items.includes(region.signature)) continue;
                const otherRegion = context.REGION[other];
                const otherTotal = otherRegion.items.reduce((sum, key) => sum + context.terrainItemWeight(key, otherRegion), 0);
                otherMax = Math.max(otherMax, context.terrainItemWeight(region.signature, otherRegion) / otherTotal);
            }
            assert(homeShare > otherMax, `${region.signature} must be most common on ${region.name}`);
        }
    }

    // Refuge progression no longer consumes signatures or regional resources; Glow remains shared by design.
    let refugeSink = 0;
    for (const upgrade of context.UPGRADE) {
        for (let level = 1; level < upgrade.max; level++) {
            const cost = context.upgradeCost(upgrade, level);
            refugeSink += Object.values(cost).reduce((sum, value) => sum + value, 0);
            assert(Object.keys(cost).every(key => !context.PATH_MATERIALS.includes(key) && !context.EXCLUSIVE.includes(key)));
        }
    }
    assert.equal(refugeSink, 2035);

    // v3.2.1 reveals Refuge improvements one at a time on deterministic expedition milestones.
    setState(context.defaultState());
    context.state.stats.expeditions = 0;
    assert.deepEqual(Array.from(context.UPGRADE.filter(context.upgradeVisible).map(u => u.id)), ['bag']);
    context.state.stats.expeditions = 1;
    assert.deepEqual(Array.from(context.UPGRADE.filter(context.upgradeVisible).map(u => u.id)), ['bag']);
    context.state.stats.expeditions = 2;
    assert.deepEqual(Array.from(context.UPGRADE.filter(context.upgradeVisible).map(u => u.id)), ['bag', 'lantern']);
    context.state.stats.expeditions = 3;
    assert.deepEqual(Array.from(context.UPGRADE.filter(context.upgradeVisible).map(u => u.id)), ['bag', 'boots', 'lantern']);
    assert.equal(new Set(Object.values(context.REFUGE_REVEAL_EXPEDITIONS)).size, Object.keys(context.REFUGE_REVEAL_EXPEDITIONS).length);

    // The one-time tracking feature appears at exactly three badges and does not modify the resource economy.
    setState(context.defaultState());
    context.state.badges = ['first', 'collector'];
    assert.equal(context.refugeTrackerVisible(context.state), false);
    context.state.badges.push('friend');
    assert.equal(context.refugeTrackerVisible(context.state), true);
    assert.equal(context.refugeTrackerUnlocked(context.state), false);
    assert.deepEqual(Array.from(context.sortedResourceKeysByAmount(context.REFUGE_TRACKER.cost)), ['seed', 'pebble', 'leaf', 'berry', 'glow']);
    context.state.refugeFeatures.tracker = true;
    const trackerMarkup = context.trackingSetupMarkup(0, '');
    assert(trackerMarkup.includes('data-tracking-resource=""'));
    assert(trackerMarkup.includes('none selected'));
    assert(!trackerMarkup.includes('Optionnel'));
    assert(!trackerMarkup.includes('sélectionné par défaut'));
    const maxTrackerButtons = Math.max(...context.REGION.map(region => new Set([...(region.items || []), region.unique]).size + 1));
    assert.equal(maxTrackerButtons <= 8, true, 'La grille 4 × 2 de l’Aiguille doit contenir toutes les options, Aucune comprise');
    context.game = { trackingResource: 'seed', trackingTarget: null, trackingExhausted: false, nodes: [
        { type: 'seed', taken: false }, { type: 'pebble', taken: false }, { type: 'seed', taken: false }
    ], rng: () => 0 };
    vm.runInContext('game = globalThis.game;', context);
    const trackedFirst = context.refreshTrackingTarget(true);
    assert.equal(trackedFirst.type, 'seed');
    trackedFirst.taken = true;
    const trackedSecond = context.refreshTrackingTarget(true);
    assert.equal(trackedSecond.type, 'seed');
    trackedSecond.taken = true;
    assert.equal(context.refreshTrackingTarget(true), null);

    // NPC lore is interaction-driven: the third main dialogue is unlocked only at balade level 4.
    setState(context.defaultState());
    context.state.characterKnowledge.escargot = 0;
    assert.equal(context.nextCharacterDialogueNumber('escargot', 1), 1);
    context.state.characterKnowledge.escargot = 1;
    assert.equal(context.nextCharacterDialogueNumber('escargot', 2), 2);
    context.state.characterKnowledge.escargot = 2;
    assert.equal(context.nextCharacterDialogueNumber('escargot', 3), 0);
    assert.equal(context.nextCharacterDialogueNumber('escargot', 4), 3);

    // A PNJ is interactable only inside the player's direct light halo. Remembered/proximity light never counts.
    context.game = {
        player: { x: 100, y: 100 }, light: 100, maxLight: 100, mapComplete: false,
        creatures: [{ x: 130, y: 100, type: 'escargot' }]
    };
    vm.runInContext('game = globalThis.game;', context);
    assert.equal(context.creatureDirectlyLit(context.game.creatures[0], { lightRadiusSquared: 1600 }), true);
    assert.equal(context.characterAtPoint(130, 100, 48).type, 'escargot');
    context.game.creatures[0].x = 190;
    assert.equal(context.creatureDirectlyLit(context.game.creatures[0], { lightRadiusSquared: 1600 }), false);
    assert.equal(context.characterAtPoint(190, 100, 48), null);

    // Bottom-menu notices remember individual discoveries instead of blinking again for the same event.
    setState(context.defaultState());
    context.initializeMenuNoticeBaseline();
    assert.equal(context.menuNoticeKeys('refugeScreen').every(key => context.state.menuSeenNotices.refugeScreen.includes(key)), true);
    context.state.stats.expeditions = 2;
    assert(context.menuNoticeKeys('refugeScreen').includes('refuge-visible:lantern'));
    assert.equal(context.state.menuSeenNotices.refugeScreen.includes('refuge-visible:lantern'), false);

    // Opening the bottom tab can clear its global alert without erasing the detailed marker in the page.
    context.initializeItemNoticeBaselineFromMenu();
    assert.equal(context.itemNoticePending('refugeScreen', 'refuge-visible:lantern'), true);
    context.markMenuNoticesSeen('refugeScreen');
    assert.equal(context.state.menuSeenNotices.refugeScreen.includes('refuge-visible:lantern'), true);
    assert.equal(context.itemNoticePending('refugeScreen', 'refuge-visible:lantern'), true);
    const lanternNotice = context.pageNoticePills('refugeScreen', [{ key: 'refuge-visible:lantern', label: 'Nouveau' }]);
    assert(lanternNotice.includes('Nouveau'));
    context.markItemNoticesSeen('refugeScreen', ['refuge-visible:lantern']);
    assert.equal(context.itemNoticePending('refugeScreen', 'refuge-visible:lantern'), false);

    // The core tutorial prepares exactly the resources needed for the first forced Bag upgrade.
    setState(context.defaultState());
    context.state.resources = Object.fromEntries(Object.keys(context.state.resources).map(key => [key, 0]));
    context.state.tutorial.coreStage = 'waiting-run';
    const guidedRun = { player: { x: 500, y: 500 }, world: 1000, nodes: [] };
    assert.equal(context.tutorialPrepareFirstRun(guidedRun), true);
    assert.equal(guidedRun.nodes.filter(node => node.tutorial && node.type === 'seed').length, 2);
    assert.equal(guidedRun.nodes.filter(node => node.tutorial && node.type === 'pebble').length, 2);
    assert.equal(context.registerMechanicTutorial('test-mechanic', [{ target: '#fake', title: 'Test' }]), true);
    setState(context.defaultState());
    assert.equal(context.tutorialCoreActive(), false);
    context.tutorialEvent('explore-opened');
    assert.equal(context.state.tutorial.coreStage, 'waiting-run');
    assert.equal(context.tutorialCoreActive(), false);
    context.tutorialRunSetupOpened(0);
    assert.equal(context.state.tutorial.coreStage, 'waiting-run');
    context.tutorialEvent('run-started');
    assert.equal(context.state.tutorial.coreStage, 'run-bag');
    assert.equal(context.CORE_TUTORIAL_STEPS['map-first'], undefined);
    assert.equal(context.CORE_TUTORIAL_STEPS['run-setup'], undefined);
    assert.equal(context.CORE_TUTORIAL_STEPS['run-light'].next, 'run-light-orbs');
    assert.equal(context.CORE_TUTORIAL_STEPS['run-light-orbs'].next, 'run-map-progress');
    assert(context.CORE_TUTORIAL_STEPS['run-light-orbs'].text.includes('petit halo'));
    assert.equal(context.CORE_TUTORIAL_STEPS['run-light-orbs'].text.toLowerCase().includes('luciole'), false);
    assert.equal(context.CORE_TUTORIAL_STEPS['run-map-progress'].next, 'run-needs');
    assert.equal(context.CORE_TUTORIAL_STEPS['run-needs'].next, 'run-move');
    context.state.tutorial.coreStage = 'run-move';
    context.tutorialEvent('walk-started');
    assert.equal(context.state.tutorial.coreStage, 'run-gather');
    context.game = { inventory: { seed: 2, pebble: 2 } };
    vm.runInContext('game = globalThis.game;', context);
    context.tutorialEvent('resource-collected');
    assert.equal(context.state.tutorial.coreStage, 'run-return');
    context.state.tutorial.coreStage = 'refuge-bag';
    context.tutorialOnBagUpgrade(1, 2);
    assert.equal(context.state.tutorial.coreStage, 'refuge-done');
    context.state.tutorial.coreStage = 'complete';
    assert.equal(context.startMechanicTutorial('test-mechanic'), true);
    assert.equal(context.state.tutorial.activeMechanic, 'test-mechanic');
    context.tutorialFinishMechanic();
    assert.equal(context.state.tutorial.seenMechanics['test-mechanic'], true);

    // Every tutorial step can be skipped without forcing a screen change or leaving an active guard behind.
    setState(context.defaultState());
    context.state.tutorial.coreStage = 'run-gather';
    context.tutorialSkipCurrent();
    assert.equal(context.state.tutorial.coreStage, 'complete');
    context.state.tutorial.coreStage = 'complete';
    context.state.tutorial.seenMechanics = {};
    assert.equal(context.startMechanicTutorial('test-mechanic'), true);
    context.tutorialSkipCurrent();
    assert.equal(context.state.tutorial.activeMechanic, '');
    assert.equal(context.state.tutorial.seenMechanics['test-mechanic'], true);

    // Sample Box may save any resource without consuming bag space, even when the bag is already full.
    setState(context.defaultState());
    context.state.upgrades.samplebox = 8;
    context.game = {
        bag: context.bagCapacity(), inventory: {}, rare: 0, fullBagStopUsed: false,
        player: { x: 0, y: 0 }, companion: null, r: context.REGION[0], light: 100, maxLight: 100
    };
    vm.runInContext('game = globalThis.game;', context);
    const nativeRandom = vm.runInContext('Math.random', context);
    vm.runInContext('Math.random = function () { return 0; };', context);
    context.updateRunUI = function () {};
    context.playResourceSfx = function () {};
    context.playSfx = function () {};
    context.companionAfterHarvest = function () {};
    const fullBagBefore = context.game.bag;
    const rareNode = { type: 'moss', rare: true, taken: false };
    context.collectNode(rareNode);
    assert.equal(rareNode.taken, true);
    assert.equal(context.game.inventory.moss, 1);
    assert.equal(context.game.bag, fullBagBefore);
    context.__restoreRandom = nativeRandom;
    vm.runInContext('Math.random = globalThis.__restoreRandom;', context);

    // Existing v3.0.3 players keep their progress, skip the forced onboarding, and receive only
    // the positive difference created by the Bag cost redistribution.
    context.localStorage.clear();
    const legacyPlayer = context.defaultState();
    legacyPlayer.version = 27;
    delete legacyPlayer.tutorial;
    legacyPlayer.stats.expeditions = 3;
    legacyPlayer.upgrades.bag = 2;
    Object.keys(legacyPlayer.resources).forEach(key => { legacyPlayer.resources[key] = 0; });
    legacyPlayer.lastSeen = Date.now();
    context.localStorage.setItem(context.saveSlotKey(1), JSON.stringify(legacyPlayer));
    context.localStorage.setItem(context.ACTIVE_SAVE_SLOT_KEY, '1');
    context.loadState();
    assert.equal(context.state.tutorial.coreStage, 'complete');
    assert.equal(context.state.resources.seed, 3);
    assert.equal(context.state.resources.pebble, 3);
    assert.equal(context.state.resources.glow, 1);
    assert.equal(context.state.resources.pearl, 3);

    // An untouched legacy slot still receives the onboarding after the update.
    context.localStorage.clear();
    const untouchedLegacy = context.defaultState();
    untouchedLegacy.version = 27;
    delete untouchedLegacy.tutorial;
    untouchedLegacy.stats.expeditions = 0;
    Object.keys(untouchedLegacy.upgrades).forEach(key => { untouchedLegacy.upgrades[key] = 1; });
    Object.keys(untouchedLegacy.resources).forEach(key => { untouchedLegacy.resources[key] = 0; });
    untouchedLegacy.lastSeen = Date.now();
    context.localStorage.setItem(context.saveSlotKey(1), JSON.stringify(untouchedLegacy));
    context.localStorage.setItem(context.ACTIVE_SAVE_SLOT_KEY, '1');
    context.loadState();
    assert.equal(context.state.tutorial.coreStage, 'waiting-run');

    // A save paused on an old home tutorial step now waits silently for the first explicit departure.
    context.localStorage.clear();
    const pausedOnResources = context.defaultState();
    pausedOnResources.version = 28;
    pausedOnResources.tutorial.version = 1;
    pausedOnResources.tutorial.coreStage = 'home-resources';
    pausedOnResources.lastSeen = Date.now();
    context.localStorage.setItem(context.saveSlotKey(1), JSON.stringify(pausedOnResources));
    context.localStorage.setItem(context.ACTIVE_SAVE_SLOT_KEY, '1');
    context.loadState();
    assert.equal(context.state.tutorial.coreStage, 'waiting-run');
    assert.equal(context.state.tutorial.version, 5);
    context.localStorage.clear();
    setState(context.defaultState());

    // Raising the Fanal Luciole target never reopens a game that was already completed.
    context.localStorage.clear();
    const finishedV321 = context.defaultState();
    finishedV321.version = 32;
    finishedV321.gameWon = true;
    finishedV321.fanalDeposits.glow = 240;
    finishedV321.lastSeen = Date.now();
    context.localStorage.setItem(context.saveSlotKey(1), JSON.stringify(finishedV321));
    context.localStorage.setItem(context.ACTIVE_SAVE_SLOT_KEY, '1');
    context.loadState();
    assert.equal(context.state.fanalDeposits.glow, 320);

    // v3.1.x maxed terrains migrate to the new level 4 without being repurchased; partial level 2 stays level 2.
    context.localStorage.clear();
    const v312Player = context.defaultState();
    v312Player.version = 30;
    v312Player.regionLevels = [3, 2, 3, 1, 1, 1, 1, 1];
    v312Player.stats.expeditions = 12;
    v312Player.lastSeen = Date.now();
    v312Player.balanceV32 = null;
    context.localStorage.setItem(context.saveSlotKey(1), JSON.stringify(v312Player));
    context.localStorage.setItem(context.ACTIVE_SAVE_SLOT_KEY, '1');
    context.loadState();
    assert.deepEqual(Array.from(context.state.regionLevels.slice(0, 4)), [4, 2, 4, 1]);
    assert.deepEqual(Array.from(context.state.balanceV32.regionLevelsV31.slice(0, 4)), [3, 2, 3, 1]);
    assert.deepEqual(Array.from(context.state.balanceV32.paidFourthLevels), []);

    // The balance rollback helper preserves progress and refunds only fourth levels actually bought in v3.2.
    setState(context.defaultState());
    context.state.regionLevels[0] = 3;
    Object.keys(context.state.resources).forEach(key => { context.state.resources[key] = 100; });
    const fourthCost = context.regionUpgradeCost(0, 3);
    context.payCost(fourthCost);
    const afterSpend = Object.fromEntries(Object.keys(fourthCost).map(key => [key, context.state.resources[key]]));
    context.state.regionLevels[0] = 4;
    context.markBalanceV32FourthPaid(0);
    const rollbackRefund = context.restoreBalanceV31State(context.state);
    assert.equal(context.state.regionLevels[0], 3);
    assert.deepEqual(JSON.parse(JSON.stringify(rollbackRefund)), JSON.parse(JSON.stringify(fourthCost)));
    Object.keys(fourthCost).forEach(key => assert.equal(context.state.resources[key], afterSpend[key] + fourthCost[key]));
    assert.deepEqual(Array.from(context.state.balanceV32.paidFourthLevels), []);

    context.localStorage.clear();
    setState(context.defaultState());

    // Saves keep a previous valid local copy and can recover from a damaged primary value.
    context.activeSaveSlot = 1;
    assert.equal(context.save(), true);
    const firstSave = context.localStorage.getItem(context.currentSaveKey());
    context.state.stats.expeditions = 9;
    assert.equal(context.save(), true);
    assert.equal(context.localStorage.getItem(context.localSaveBackupKey(1)), firstSave);
    context.localStorage.setItem(context.currentSaveKey(), '{broken');
    assert.equal(context.recoverSaveSlot(1), true);
    assert.equal(context.localStorage.getItem(context.currentSaveKey()), firstSave);

    // Premium Gems remain architecturally outside save slots. Earned Gems are spent first and the paid
    // remainder is confirmed asynchronously by the authoritative wallet bridge.
    let paidBalance = 50;
    let spendSequence = 0;
    context.LucioleAndroid = {
        getPremiumGemBalance() {
            return paidBalance;
        },
        requestPremiumGemSpend(amount) {
            const requestId = `spend-${++spendSequence}`;
            setTimeout(() => {
                paidBalance -= amount;
                context.LucioleBilling.onPremiumSpend(
                    requestId,
                    true,
                    paidBalance,
                    `transaction-${spendSequence}`,
                    ''
                );
            }, 0);
            return requestId;
        },
        isBillingEnabled() {
            return false;
        }
    };
    setState(context.defaultState());
    context.state.gems = 5;
    assert.equal(context.totalGemBalance(), 55);
    assert.equal(await context.spendGemCurrency(10), true);
    assert.equal(context.state.gems, 0);
    assert.equal(paidBalance, 45);

    // A rejected premium debit restores the earned portion.
    context.state.gems = 4;
    context.LucioleAndroid.requestPremiumGemSpend = function (amount) {
        const requestId = `spend-${++spendSequence}`;
        setTimeout(() => {
            context.LucioleBilling.onPremiumSpend(
                requestId,
                false,
                paidBalance,
                '',
                'refus test'
            );
        }, 0);
        return requestId;
    };
    assert.equal(await context.spendGemCurrency(10), false);
    assert.equal(context.state.gems, 4);
    assert.equal(paidBalance, 45);

    // The onboarding Echo is transparent: first call is 100% Common and every possible
    // companion has an active effect in the first region. After it, normal odds resume.
    context.state.echoesUnlocked = true;
    context.state.gachaPulls = 0;
    context.normalizeCompanionState();
    const firstPool = Array.from(context.firstEchoCompanionPool());
    assert.equal(firstPool.length, 6);
    assert(firstPool.every(id => context.COMPANION[id].rarity === 'common'));
    assert(firstPool.every(id => context.companionEffectActive(id, 0, 1)));
    const firstRates = context.currentGachaRates();
    assert.equal(firstRates.common.chance, 1);
    assert.equal(firstRates.rare, undefined);
    assert.equal(firstRates.epic, undefined);
    assert.equal(firstRates.legendary, undefined);
    const firstOdds = context.gachaItemProbabilities();
    assert.equal(firstOdds.length, firstPool.length);
    assert(Math.abs(firstOdds.reduce((sum, entry) => sum + entry.chance, 0) - 1) < 1e-9);
    assert(firstOdds.every(entry => Math.abs(entry.chance - (1 / firstPool.length)) < 1e-9));
    const guaranteed = context.chooseGachaResult(() => 0.999999, 0);
    assert(firstPool.includes(guaranteed));

    context.state.gachaPulls = 1;
    const rates = context.currentGachaRates();
    assert.equal(Math.round(rates.common.chance * 100), 58);
    assert.equal(Math.round(rates.rare.chance * 100), 26);
    assert.equal(Math.round(rates.epic.chance * 100), 12);
    assert.equal(Math.round(rates.legendary.chance * 100), 4);
    const itemOdds = context.gachaItemProbabilities();
    const oddsTotal = itemOdds.reduce((sum, entry) => sum + entry.chance, 0);
    assert(Math.abs(oddsTotal - 1) < 1e-9);
    assert.equal(itemOdds.length, Object.keys(context.COMPANION).length);
    assert.equal(context.COMPANION[context.chooseGachaResult(() => 0.999999, 1)].rarity, 'legendary');

    // A gacha spend is serialized: a rapid second tap cannot start another transaction.
    context.state.gems = 20;
    context.state.gachaPulls = 0;
    const firstPull = context.pullGacha();
    assert.equal(await context.pullGacha(), false);
    assert.equal(await firstPull, true);
    assert.equal(context.state.gachaPulls, 1);
    assert.equal(context.state.gems, 10);
    assert.equal(context.state.companionDiscovered.length, 1);
    const onboardingCompanion = context.state.companionDiscovered[0];
    assert.equal(context.COMPANION[onboardingCompanion].rarity, 'common');
    assert(context.companionEffectActive(onboardingCompanion, 0, 1));

    // The export format contains progression only, never the paid wallet.
    context.localStorage.clear();
    setState(context.defaultState());
    context.activeSaveSlot = 1;
    context.save();
    const archive = context.buildSaveArchive();
    assert.equal(archive.schema, 'luciole-de-poche.save-export');
    assert.equal(archive.formatVersion, 1);
    assert(archive.slots['1']);
    assert(!('premiumGems' in archive));
    assert(context.importedSlotValid(archive.slots['1']));

    console.log('release_smoke: OK');
}

run().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
