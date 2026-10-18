'use strict';
// Expedition simulation, rendering and reward flow.
function loadImages(done) {
    var files = { hero: 'hero.svg', gem: 'gemme.svg', gemChest: 'coffre_gemmes.svg', echoLantern: 'lanterne_echos.svg',
        v4Companion: 'v4b114/companion_blue.png', v4Chest: 'v4b114/chest.png', v4ChestAlt: 'v4b114/chest_alt.png',
        v4Tree: 'v4b114/tree.png', v4TreeN1: 'v4b114/tree_green_alt.png', v4TreeN2: 'v4b114/tree_blue.png', v4TreeN3: 'v4b114/tree_orange.png',
        v4TreeN4: 'v4b114/tree_willow.png', v4TreeN5: 'v4b114/tree_pink.png', v4TreeN6: 'v4b114/tree_pine.png', v4TreeN7: 'v4b114/tree_gold.png',
        v4Crystal: 'v4b114/crystal.png', v4CrystalAlt: 'v4b114/crystal_alt.png', v4CrystalN1: 'v4b114/crystal.png', v4CrystalN2: 'v4b114/crystal_alt.png',
        v4GroundA: 'v4b114/ground_tile_a.png', v4GroundB: 'v4b114/ground_tile_b.png', v4GroundC: 'v4b114/ground_tile_c.png',
        v4GroundN1: 'v4b114/ground_tile_d.png', v4GroundN2: 'v4b114/ground_tile_e.png', v4GroundN3: 'v4b114/ground_tile_f.png', v4GroundN4: 'v4b114/ground_tile_g.png',
        v4GroundN5: 'v4b114/ground_tile_h.png', v4GroundN6: 'v4b114/ground_tile_i.png', v4GroundN7: 'v4b114/ground_tile_j.png', v4GroundN8: 'v4b114/ground_tile_k.png',
        v4PathStraight: 'v4b114/path_straight.png', v4PathCurveA: 'v4b114/path_curve_a.png', v4PathCurveB: 'v4b114/path_curve_b.png',
        v4FlowerA: 'v4b114/flower_patch_a.png', v4FlowerB: 'v4b114/flower_patch_b.png', v4FlowerN1: 'v4b114/plant_a.png', v4FlowerN2: 'v4b114/plant_b.png',
        v4GrassN1: 'v4b114/plant_c.png', v4FernN1: 'v4b114/bush_f.png',
        v4RockA: 'v4b114/rock_patch_a.png', v4RockB: 'v4b114/rock_patch_b.png', v4RockN1: 'v4b114/rock_c.png', v4RockN2: 'v4b114/rock_d.png',
        v4RockN3: 'v4b114/rocks_flowers.png', v4RockN4: 'v4b114/rock_patch_b.png', v4RocksFlowers: 'v4b114/rocks_flowers.png',
        v4BushA: 'v4b114/bush_a.png', v4BushB: 'v4b114/bush_b.png', v4BushC: 'v4b114/bush_c.png', v4BushN1: 'v4b114/bush_d.png', v4BushN2: 'v4b114/bush_e.png',
        v4FallenLog: 'v4b114/fallen_log.png', v4Stump: 'v4b114/stump.png', v4LogN1: 'v4b114/fallen_log.png', v4RootN1: 'v4b114/fallen_log.png', v4RootN2: 'v4b114/stump.png',
        v4Mushrooms: 'v4b114/mushrooms.png', v4MushroomsSmall: 'v4b114/mushrooms_small.png', v4MushroomsLarge: 'v4b114/mushrooms_large.png', v4MushN1: 'v4b114/mushrooms.png', v4MushN2: 'v4b114/mushrooms_large.png',
        v4LanternAlt: 'v4b114/lantern_post_alt.png', v4LanternGround: 'v4b114/lantern_ground.png', v4LanternN1: 'v4b114/lantern_post.png', v4LanternN2: 'v4b114/lantern_post_alt.png',
        v4LanternN3: 'v4b114/lantern_amber.png', v4LanternN4: 'v4b114/lantern_blue.png',
        v4PondN1: 'v4b114/pond_lily.png', v4WaterfallN1: 'v4b114/waterfall_rock.png',
        v4Fence: 'v4b114/fence.png', v4BorderFlower1: 'v4b114/fence_flower.png', v4BorderFlower2: 'v4b114/fence_flower.png', v4BorderHedge1: 'v4b114/fence_flower.png',
        v4BorderReed1: 'v4b114/fence_rope.png', v4BorderRock1: 'v4b114/fence.png', v4BorderRope1: 'v4b114/fence_rope.png',
        v4BorderStone1: 'v4b114/fence_lantern.png', v4BorderStone2: 'v4b114/fence_crystal.png',
        v4OrbA: 'v4b114/orb_a.png', v4OrbB: 'v4b114/orb_b.png', v4LightOrb: 'v4b114/light_orb.png',
        v4PickupBerry: 'v4b114/pickup_berry.png', v4PickupSeed: 'v4b114/pickup_seed.png', v4PickupLeaf: 'v4b114/pickup_leaf.png',
        v4PickupMushroom: 'v4b114/pickup_mushroom.png', v4PickupOre: 'v4b114/pickup_ore.png', v4FireflyA: 'v4b114/firefly_a.png' };
    if (typeof V4_BIOME_FILES !== 'undefined') Object.keys(V4_BIOME_FILES).forEach(function (key) { files[key] = V4_BIOME_FILES[key]; });
    ['DR','DL','UR','UL'].forEach(function (dir) {
        for (var i = 0; i < 5; i++) files['v4Hero' + dir + i] = 'v4b114/hero_' + dir.toLowerCase() + '_' + i + '.png';
    });
    Object.keys(CREATURE).forEach(function (key) { files[key] = CREATURE[key].icon; });
    Object.keys(RESOURCE).forEach(function (key) { files[key] = RESOURCE[key].icon; });
    COMPANION_IDS.forEach(function (id) { files['comp_' + id] = COMPANION[id].icon; });
    var keys = Object.keys(files), left = keys.length;
    if (!left) {
        if (done) done();
        return;
    }
    keys.forEach(function (key) { var image = new Image(); image.onload = image.onerror = function () { if (--left === 0 && done) done(); }; image.src = 'img/' + files[key]; IMG[key] = image; });
}
function createMapCoverage(world) {
    var cell = MAP_COVERAGE_CELL, cols = Math.max(1, Math.ceil(world / cell)), rows = Math.max(1, Math.ceil(world / cell));
    return { cell: cell, cols: cols, rows: rows, total: cols * rows, litCount: 0, cells: new Uint8Array(cols * rows), litIndices: [], percent: 0 };
}
function mapCoveragePercent() { return game && game.coverage ? game.coverage.percent || 0 : 0; }
function markMapCoverage(x, y, radius) {
    if (!game || !game.coverage)
        return 0;
    var cov = game.coverage, cell = cov.cell, r = Math.max(1, radius || 0), minX = Math.max(0, Math.floor((x - r) / cell)), maxX = Math.min(cov.cols - 1, Math.floor((x + r) / cell)), minY = Math.max(0, Math.floor((y - r) / cell)), maxY = Math.min(cov.rows - 1, Math.floor((y + r) / cell)), r2 = r * r;
    for (var gy = minY; gy <= maxY; gy++)
        for (var gx = minX; gx <= maxX; gx++) {
            var idx = gy * cov.cols + gx;
            if (cov.cells[idx])
                continue;
            var cx = Math.min(game.world - 1, gx * cell + cell * .5), cy = Math.min(game.world - 1, gy * cell + cell * .5), dx = cx - x, dy = cy - y;
            if (dx * dx + dy * dy <= r2) {
                cov.cells[idx] = 1;
                cov.litIndices.push(idx);
                cov.litCount++;
            }
        }
    cov.percent = cov.litCount >= cov.total ? 100 : Math.floor(cov.litCount / cov.total * 100);
    if (cov.percent >= 100)
        game.mapComplete = true;
    return cov.percent;
}
function chooseFullMapBonus(r, level, rng) {
    rng = rng || Math.random;
    var rareAvailable = level >= 2;
    if (rareAvailable && rng() < FULL_MAP_RARE_CHANCE)
        return { type: r.rare, rare: true };
    return { type: chooseTerrainItem(r, rng), rare: false };
}
function fullMapBonusMarkup(reward) {
    if (!reward || !RESOURCE[reward.type])
        return '';
    var r = RESOURCE[reward.type];
    return '<div class="full-map-bonus"><div class="full-map-bonus-head"><span class="full-map-bonus-icon">☀️</span><div><strong>Carte éclairée à 100 %</strong><small>Exploration complète · récompense garantie</small></div></div><div class="full-map-bonus-reward">' + img(r.icon) + '<span><b>+1</b> ' + r.name + (reward.rare ? ' <em>ressource régionale</em>' : '') + '</span></div></div>';
}
function fullMapBadgeMarkup(unlocked) { return unlocked ? '<div class="full-map-badge-unlocked"><span>☀️</span><div><strong>Nouveau badge : Plus un coin d’ombre</strong><small>Tu as éclairé une carte entière.</small></div></div>' : ''; }
function prepareRun(regionIndex) {
    showScreen('expeditionScreen');
    var r = REGION[regionIndex], level = regionLevel(regionIndex), profile = walkProfile(regionIndex, level);
    $('runIntroImage').src = 'img/' + r.img;
    $('runIntroEyebrow').textContent = 'Balade niveau ' + level + ' / ' + REGION_MAX_LEVEL + ' · ' + profile.name;
    $('runIntroTitle').textContent = r.name;
    $('runIntroText').textContent = r.sub + ' ' + profile.desc + '. ' + (state.discoveredResources.indexOf(r.signature) >= 0 ? RESOURCE[r.signature].name : 'Une ressource-signature encore inconnue') + ' est la ressource-signature de ce chemin et sera nécessaire pour le faire évoluer. ' + RESOURCE[r.unique].name + ' est sa ressource régionale : elle n’apparaît qu’une fois la balade évoluée.';
    $('runIntro').classList.remove('hidden');
    $('startRunBtn').onclick = function () { $('runIntro').classList.add('hidden'); initAudio(); startRun(regionIndex); };
}
function startRun(regionIndex) {
    var canvas = $('gameCanvas'), r = REGION[regionIndex], level = regionLevel(regionIndex), profile = walkProfile(regionIndex, level), seed = (Date.now() ^ hashString(r.name) ^ state.stats.expeditions ^ (level * 2654435761)) >>> 0, rng = mulberry32(seed), center = profile.world / 2;
    game = { region: regionIndex, level: level, profile: profile, r: r, canvas: canvas, ctx: canvas.getContext('2d'), rng: rng, world: profile.world, player: { x: center, y: center, targetX: center, targetY: center }, nodes: [], decor: [], lightOrbs: [], creatures: [], fog: [], coverage: createMapCoverage(profile.world), mapComplete: false, inventory: {}, bag: 0, fullBagStopUsed: false, light: maxLight(), maxLight: maxLight(), last: performance.now(), lastUi: 0, running: true, started: Date.now(), distance: 0, visualDistance: 0, walkCycle: 0, moveStep: 0, rare: 0, dialogOpen: false };
    resizeCanvas();
    var decorCount = Math.round(54 + level * 24 + regionIndex * 2);
    for (var i = 0; i < decorCount; i++) {
        var deco = { x: rng() * game.world, y: rng() * game.world, s: 26 + rng() * 45, t: Math.floor(rng() * 4), rot: rng() * 6.28 };
        game.decor.push(deco);
        if (deco.t === 2) {
            deco.explored = false;
            game.lightOrbs.push(deco);
        }
    }
    for (i = 0; i < profile.nodes; i++) {
        var pos = nodePosition(rng, game.world), rare = rng() < rareChance(level, pos.edge), type = rare ? r.rare : chooseTerrainItem(r, rng);
        game.nodes.push({ x: pos.x, y: pos.y, edge: pos.edge, type: type, rare: rare, taken: false, revealed: false, near: false, bob: rng() * 6.28 });
    }
    ensureGuaranteedRegionalRares(game.nodes, r, level);
    ensureGuaranteedSignatureResources(game.nodes, r, level);
    if (typeof tutorialPrepareFirstRun === 'function')
        tutorialPrepareFirstRun(game);
    var angle = rng() * Math.PI * 2, characterRadius = Math.min(game.world * .34, 245 + level * 105 + regionIndex * 18), cp = { x: center + Math.cos(angle) * characterRadius, y: center + Math.sin(angle) * characterRadius };
    game.creatures.push({ x: cp.x, y: cp.y, type: r.character, seen: false, phase: rng() * 6.28 });
    game.fog.push({ x: center, y: center, r: lightRadius() });
    markMapCoverage(center, center, lightRadius());
    state.visitedRegions = state.visitedRegions || [];
    if (state.visitedRegions.indexOf(regionIndex) < 0)
        state.visitedRegions.push(regionIndex);
    updateRunUI();
    if (typeof tutorialEvent === 'function')
        tutorialEvent('run-started', { region: regionIndex });
    requestAnimationFrame(gameLoop);
}
function expeditionPixelRatio() { return Math.min(1.5, window.devicePixelRatio || 1); }
function resizeCanvas() {
    if (!game)
        return;
    var dpr = expeditionPixelRatio(), rect = game.canvas.getBoundingClientRect();
    game.canvasRect = rect;
    game.canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    game.canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    game.dpr = dpr;
    game.viewW = rect.width;
    game.viewH = rect.height;
    game.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!game.fogLayer) {
        game.fogLayer = document.createElement('canvas');
        game.fogCtx = game.fogLayer.getContext('2d');
    }
    game.fogLayer.width = game.canvas.width;
    game.fogLayer.height = game.canvas.height;
    game.fogCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    game.fogStampCache = Object.create(null);
}
function screenToWorld(clientX, clientY) {
    var rect = game.canvasRect || game.canvas.getBoundingClientRect(), cam = getCamera();
    return { x: clientX - rect.left + cam.x, y: clientY - rect.top + cam.y };
}
function getCamera() { return { x: Math.max(0, Math.min(game.world - game.viewW, game.player.x - game.viewW / 2)), y: Math.max(0, Math.min(game.world - game.viewH, game.player.y - game.viewH / 2)) }; }
var walkPointer = { active: false, clientX: 0, clientY: 0, paused: false, activeId: null, contacts: {}, sequence: 0 };
function applyWalkTarget(clientX, clientY) { if (!game || !game.running)
    return; var w = screenToWorld(clientX, clientY), inset = typeof walkBoundaryInset === 'function' ? walkBoundaryInset() : 25, tx = Math.max(inset, Math.min(game.world - inset, w.x)), ty = Math.max(inset, Math.min(game.world - inset, w.y)); if (typeof walkResolveTargetPosition === 'function') {
    var resolved = walkResolveTargetPosition(tx, ty); tx = resolved.x; ty = resolved.y;
} game.player.targetX = tx; game.player.targetY = ty; }
function latestWalkContact() { var best = null, bestId = null; Object.keys(walkPointer.contacts).forEach(function (id) { var c = walkPointer.contacts[id]; if (!best || c.order > best.order) {
    best = c;
    bestId = id;
} }); return best ? { id: bestId, contact: best } : null; }
function stopContinuousWalk() { walkPointer.active = false; walkPointer.paused = false; walkPointer.activeId = null; walkPointer.contacts = {}; if (game && game.player) {
    game.player.targetX = game.player.x;
    game.player.targetY = game.player.y;
} }
function pauseContinuousWalk() { walkPointer.paused = true; if (game && game.player) {
    game.player.targetX = game.player.x;
    game.player.targetY = game.player.y;
} }
function beginWalkContact(id, clientX, clientY, e) { if (!game || !game.running || game.dialogOpen)
    return; var w = screenToWorld(clientX, clientY), c = characterAtPoint(w.x, w.y, 48); if (c && interactCharacter(c)) {
    stopContinuousWalk();
    if (e && e.preventDefault)
        e.preventDefault();
    return;
} var key = String(id); walkPointer.contacts[key] = { clientX: clientX, clientY: clientY, order: ++walkPointer.sequence }; walkPointer.activeId = key; walkPointer.active = true; walkPointer.paused = false; walkPointer.clientX = clientX; walkPointer.clientY = clientY; applyWalkTarget(clientX, clientY); if (typeof tutorialEvent === 'function') tutorialEvent('walk-started'); }
function moveWalkContact(id, clientX, clientY) { var key = String(id), contact = walkPointer.contacts[key]; if (!contact)
    return; contact.clientX = clientX; contact.clientY = clientY; if (key !== walkPointer.activeId)
    return; walkPointer.clientX = clientX; walkPointer.clientY = clientY; if (walkPointer.active && !walkPointer.paused)
    applyWalkTarget(clientX, clientY); }
function endWalkContact(id) { var key = String(id), wasActive = key === walkPointer.activeId; if (walkPointer.contacts[key])
    delete walkPointer.contacts[key]; if (!wasActive)
    return; var next = latestWalkContact(); if (next) {
    walkPointer.activeId = next.id;
    walkPointer.active = true;
    walkPointer.clientX = next.contact.clientX;
    walkPointer.clientY = next.contact.clientY;
    if (!walkPointer.paused)
        applyWalkTarget(walkPointer.clientX, walkPointer.clientY);
    return;
} walkPointer.active = false; walkPointer.activeId = null; walkPointer.paused = false; if (game && game.player) {
    game.player.targetX = game.player.x;
    game.player.targetY = game.player.y;
} }
function refreshContinuousWalkTarget() { if (!walkPointer.active || walkPointer.paused || !game || !game.running || game.dialogOpen)
    return; applyWalkTarget(walkPointer.clientX, walkPointer.clientY); }
function gameLoop(now) { if (!game || !game.running)
    return; var dt = Math.min(.034, (now - game.last) / 1000); game.last = now; updateGame(dt); if (now - game.lastUi > 180) {
    game.lastUi = now;
    updateRunUI();
} drawGame(now / 1000); requestAnimationFrame(gameLoop); }
function updateGame(dt) {
    if (game.dialogOpen)
        return;
    refreshContinuousWalkTarget();
    var p = game.player, dx = p.targetX - p.x, dy = p.targetY - p.y, distanceSquared = dx * dx + dy * dy, moved = false, speed = moveSpeed();
    if (distanceSquared > 9) {
        var distance = Math.sqrt(distanceSquared);
        var speedMultiplier = typeof isometricMovementSpeedMultiplier === 'function' ? isometricMovementSpeedMultiplier(dx, dy) : 1;
        var step = Math.min(distance, speed * speedMultiplier * dt);
        var visualStep = typeof isometricVisualDistanceStep === 'function' ? isometricVisualDistanceStep(dx, dy, step) : step;
        var nextX = p.x + dx / distance * step, nextY = p.y + dy / distance * step;
        if (typeof walkResolvePlayerPosition === 'function') {
            var resolvedStep = walkResolvePlayerPosition(nextX, nextY, p.x, p.y); nextX = resolvedStep.x; nextY = resolvedStep.y;
        }
        p.x = nextX;
        p.y = nextY;
        game.distance += step;
        game.visualDistance = (game.visualDistance || 0) + visualStep;
        game.walkCycle += visualStep / 30;
        game.moveStep = visualStep / Math.max(dt, .0001);
        moved = true;
        if (!lockFullMapLight())
            game.light = Math.max(0, game.light - visualStep * lightDrainPerDistance());
    }
    if (!moved) game.moveStep = 0;
    var visibility = currentVisibilityMetrics();
    if (moved) {
        var radiusNow = visibility.lightRadius, fogStep = Math.max(23, radiusNow * .34), fogStepSquared = fogStep * fogStep, lastFog = game.fog[game.fog.length - 1], wasMapComplete = game.mapComplete;
        if (!lastFog || distSquared(p.x, p.y, lastFog.x, lastFog.y) > fogStepSquared)
            game.fog.push({ x: p.x, y: p.y, r: radiusNow });
        markMapCoverage(p.x, p.y, radiusNow);
        if (!wasMapComplete && game.mapComplete) {
            lockFullMapLight();
            updateRunUI();
            showToast('Carte éclairée à 100 % · lumière maximale');
            playSfx('badge', .72);
            vibrate(28);
            visibility = currentVisibilityMetrics();
        }
    }
    game.lightOrbs.forEach(function (o) { collectLightOrb(o); });
    game.nodes.forEach(function (n) {
        if (n.taken)
            return;
        var pd2 = distSquared(p.x, p.y, n.x, n.y);
        if (pd2 <= visibility.lightRadiusSquared)
            n.revealed = true;
        if (pd2 < 1849)
            collectNode(n);
    });
    applySolsticeMilestones();
    if (game.dialogOpen)
        return;
    if (game.companion) {
        var companionDx = p.x - 38 - game.companion.x, companionDy = p.y + 22 - game.companion.y, follow = Math.min(1, dt * 3.3);
        game.companion.x += companionDx * follow;
        game.companion.y += companionDy * follow;
    }
    if (game.gemChests)
        game.gemChests.forEach(function (chest) {
            if (chest.opened)
                return;
            var chestDistanceSquared = distSquared(p.x, p.y, chest.x, chest.y);
            if (chestDistanceSquared <= visibility.lightRadiusSquared)
                chest.revealed = true;
            if (chestDistanceSquared < 2304)
                openGemChest(chest);
        });
}
function handleFullBagCollision(n) {
    if (!game)
        return false;
    if (n && !n.fullBagWarned) {
        n.fullBagWarned = true;
        showToast('Sacoche pleine. Le refuge t’attend.');
        playSfx('full_bag', .72, 500);
    }
    if (!game.fullBagStopUsed) {
        game.fullBagStopUsed = true;
        pauseContinuousWalk();
        game.player.targetX = game.player.x;
        game.player.targetY = game.player.y;
        return true;
    }
    return false;
}
function companionRefugeBonus(type, amount, label) {
    if (!game || !RESOURCE[type] || amount <= 0)
        return 0;
    game.refugeBonus = game.refugeBonus || {};
    game.refugeBonus[type] = (game.refugeBonus[type] || 0) + amount;
    discoverResource(type);
    if (label)
        showToast(label + ' · +' + amount + ' ' + RESOURCE[type].name + ' au Refuge');
    return amount;
}
function companionCommonPack(type) { return false; }
function companionRarePermanentBonus(type) {
    var id = activeCompanionId(), c = id && COMPANION[id];
    if (!c || c.rarity !== 'rare' || !companionIsPermanent(id) || (c.boosts || [])[0] !== type || game.companionRareBonusUsed)
        return 0;
    game.companionRareBonusUsed = true;
    return 1;
}
function companionStratusPack() {
    if (!activeEpicEffect('current'))
        return false;
    var chance = activeCompanionPermanent() ? .34 : .24;
    if (Math.random() >= chance)
        return false;
    game.companionSpeedUntil = performance.now() + (activeCompanionPermanent() ? 5500 : 4500);
    return true;
}
function companionDuoExtra() {
    if (!activeLegendaryEffect('duo'))
        return 0;
    game.companionDuoProgress = (game.companionDuoProgress || 0) + 1;
    var every = activeCompanionPermanent() ? 2 : 3;
    return game.companionDuoProgress % every === 0 ? 1 : 0;
}
function companionNoctisExtra(n) {
    if (!activeEpicEffect('night') || !n)
        return 0;
    var perm = activeCompanionPermanent(), threshold = perm ? .70 : .55;
    if (lightRatio() >= threshold)
        return 0;
    var chance = n.rare ? (perm ? .14 : .08) : (perm ? .32 : .22);
    return Math.random() < chance ? 1 : 0;
}
function nearbyUntakenNode(filter, maxDistance) {
    if (!game)
        return null;
    var p = game.player, best = null, bestD = Infinity;
    game.nodes.forEach(function (n) { if (n.taken || (filter && !filter(n)))
        return; var d = dist(p.x, p.y, n.x, n.y); if (d < bestD && (maxDistance == null || d <= maxDistance)) {
        best = n;
        bestD = d;
    } });
    return best;
}
function revealNearbyResources(radius, count) {
    if (!game)
        return 0;
    var p = game.player, list = game.nodes.filter(function (n) { return !n.taken && dist(p.x, p.y, n.x, n.y) <= radius; }).sort(function (a, b) { return dist(p.x, p.y, a.x, a.y) - dist(p.x, p.y, b.x, b.y); }), n = Math.min(list.length, count == null ? list.length : count);
    for (var i = 0; i < n; i++)
        list[i].revealed = true;
    return n;
}
function spawnCompanionNode(type) {
    if (!game || !RESOURCE[type])
        return null;
    var rng = game.rng || Math.random, a = rng() * Math.PI * 2, rr = 85 + rng() * 90, x = Math.max(55, Math.min(game.world - 55, game.player.x + Math.cos(a) * rr)), y = Math.max(55, Math.min(game.world - 55, game.player.y + Math.sin(a) * rr)), node = { x: x, y: y, edge: Math.min(1, Math.max(0, Math.sqrt(Math.pow(x - game.world / 2, 2) + Math.pow(y - game.world / 2, 2)) / (game.world * .72))), type: type, rare: EXCLUSIVE.indexOf(type) >= 0, taken: false, revealed: true, near: false, bob: rng() * 6.28, companionSpawned: true };
    game.nodes.push(node);
    return node;
}
function transformNearbyNode(type, maxDistance) { var n = nearbyUntakenNode(function (x) { return !x.rare; }, maxDistance); if (!n)
    return false; n.type = type; n.rare = EXCLUSIVE.indexOf(type) >= 0; n.revealed = true; return true; }
function companionNeededTerrainResource() {
    if (!game)
        return '';
    var keys = game.r.items.slice();
    if (game.level >= 2)
        keys.push(game.r.rare);
    var need = leastStockedResources(keys, Math.floor((game.rng || Math.random)() * 1000000000), 1);
    return need[0] || keys[0] || '';
}
function companionAfterHarvest(n) {
    if (!game || !n)
        return;
    game.companionHarvestProgress = (game.companionHarvestProgress || 0) + 1;
    var count = game.companionHarvestProgress, perm = activeCompanionPermanent(), c = activeCompanion();
    if (!c)
        return;
    if (c.rarity === 'epic') {
        if (c.epic === 'growth') {
            var every = perm ? 4 : 6;
            game.companionGrowthCount = game.companionGrowthCount || 0;
            game.companionGrowthRareCount = game.companionGrowthRareCount || 0;
            if (count % every === 0 && (perm || game.companionGrowthCount < 5)) {
                var t = n.type;
                if (n.rare && !perm) {
                    if (game.companionGrowthRareCount >= 1)
                        t = chooseTerrainItem(game.r, game.rng || Math.random);
                    else
                        game.companionGrowthRareCount++;
                }
                game.companionGrowthCount++;
                spawnCompanionNode(t);
                showToast('Aster · ' + RESOURCE[t].name + ' repousse près de toi');
            }
        }
        else if (c.epic === 'tide') {
            var te = perm ? 4 : 6;
            game.companionTideCount = game.companionTideCount || 0;
            if (count % te === 0 && (perm || game.companionTideCount < 4)) {
                var choices = ['shell', 'glass'], t = leastStockedResources(choices, Math.floor((game.rng || Math.random)() * 1e8), 1)[0] || 'shell';
                if (transformNearbyNode(t, 650)) {
                    game.companionTideCount++;
                    showToast('Écume · la marée apporte ' + RESOURCE[t].name);
                }
            }
        }
        else if (c.epic === 'sowing') {
            var se = perm ? 4 : 6;
            game.companionSowingCount = game.companionSowingCount || 0;
            if (count % se === 0 && (perm || game.companionSowingCount < 4)) {
                var choices = ['seed', 'acorn'], k = leastStockedResources(choices, Math.floor((game.rng || Math.random)() * 1e8), 1)[0] || 'seed';
                game.companionSowingCount++;
                companionRefugeBonus(k, 1, 'Dorémi · semis');
            }
        }
        else if (c.epic === 'refrain') {
            var re = perm ? 4 : 6;
            if (count % re === 0) {
                var before = game.light;
                game.light = Math.min(game.maxLight, game.light + (perm ? 18 : 13));
                revealNearbyResources(perm ? 460 : 350, perm ? 8 : 5);
                var gain = Math.round((game.light - before) * 10) / 10;
                showToast('Sifflot · refrain' + (gain > 0 ? ' · +' + gain + '% lumière' : '') + ' · ressources révélées');
            }
        }
        else if (c.epic === 'refraction') {
            var ie = perm ? 3 : 5;
            if (count % ie === 0) {
                revealNearbyResources(perm ? 520 : 400);
                game.companionIrisPulse = (game.companionIrisPulse || 0) + 1;
                game.companionIrisCopies = game.companionIrisCopies || 0;
                var mayCopy = game.companionIrisPulse % 2 === 0 && (perm || game.companionIrisCopies < 2);
                if (mayCopy) {
                    var target = nearbyUntakenNode(function (x) { return !x.rare; }, perm ? 700 : 580);
                    if (target) {
                        spawnCompanionNode(target.type);
                        game.companionIrisCopies++;
                        showToast('Iris · réfraction · une trouvaille se dédouble');
                    }
                    else
                        showToast('Iris · les ressources proches se révèlent');
                }
                else
                    showToast('Iris · les ressources proches se révèlent');
            }
        }
        else if (c.epic === 'resonance') {
            var so = perm ? 4 : 5;
            game.companionResonanceCount = game.companionResonanceCount || 0;
            if (count % so === 0 && (perm || game.companionResonanceCount < 5)) {
                var need = companionNeededTerrainResource();
                if (need && transformNearbyNode(need, 700)) {
                    game.companionResonanceCount++;
                    showToast('Solambre · une trouvaille devient ' + RESOURCE[need].name);
                }
            }
        }
    }
    if (c.rarity === 'legendary' && c.legendary === 'barda') {
        var be = perm ? 4 : 5;
        game.companionBardaCount = game.companionBardaCount || 0;
        if (count % be === 0 && (perm || game.companionBardaCount < 5)) {
            game.companionBardaCount++;
            companionRefugeBonus(n.type, 1, 'Barda · poche secrète');
        }
    }
}
function companionMobiusFullBag(n) {
    if (!game || !n || !activeLegendaryEffect('mobius'))
        return false;
    var perm = activeCompanionPermanent();
    game.companionMobiusCount = game.companionMobiusCount || 0;
    if ((!perm && game.companionMobiusCount >= 4) || Math.random() >= (perm ? .75 : .55))
        return false;
    n.taken = true;
    game.companionMobiusCount++;
    if (n.rare)
        game.rare++;
    companionRefugeBonus(n.type, 1, 'Möbius · boucle impossible');
    playResourceSfx(n.type, n.rare);
    vibrate(n.rare ? 32 : 14);
    updateRunUI();
    return true;
}
function collectLightOrb(o) {
    if (!game || !o || o.collected || distSquared(game.player.x, game.player.y, o.x, o.y) > orbTriggerRadius() * orbTriggerRadius())
        return;
    var jar = upgradeEffectLevel('jar', state.upgrades.jar);
    if (jar <= 0) {
        o.explored = true;
        return;
    }
    var cap = bagCapacity(), room = Math.max(0, cap - game.bag), amount = Math.min(room, 1);
    o.collected = true;
    o.explored = true;
    var fresh = false;
    if (amount > 0) {
        game.inventory.glow = (game.inventory.glow || 0) + amount;
        game.bag += amount;
        fresh = discoverResource('glow');
    }
    var before = game.light;
    game.light = Math.min(game.maxLight, game.light + orbLightRestore());
    var gained = Math.round((game.light - before) * 10) / 10;
    showToast((amount > 0 ? (fresh ? 'Nouvelle découverte : ' : '+1 Luciole') : 'Boule absorbée · sacoche pleine') + (gained > 0 ? ' · +' + gained + '% lumière' : ''));
    playSfx('light_orb', .67, 80);
    vibrate(12);
    updateRunUI();
}
function trackingCandidates() {
    if (!game || !game.trackingResource)
        return [];
    return game.nodes.filter(function (n) { return !n.taken && n.type === game.trackingResource; });
}
function refreshTrackingTarget(silent) {
    if (!game || !game.trackingResource)
        return null;
    var candidates = trackingCandidates();
    if (!candidates.length) {
        game.trackingTarget = null;
        if (!silent && !game.trackingExhausted) {
            game.trackingExhausted = true;
            showToast('Plus aucune trace de ' + RESOURCE[game.trackingResource].name + ' sur cette balade.');
        }
        return null;
    }
    game.trackingExhausted = false;
    var rng = game.rng || Math.random;
    game.trackingTarget = candidates[Math.floor(rng() * candidates.length)];
    return game.trackingTarget;
}
function ensureTrackingTarget() {
    if (!game || !game.trackingResource)
        return null;
    if (!game.trackingTarget || game.trackingTarget.taken || game.trackingTarget.type !== game.trackingResource)
        return refreshTrackingTarget(true);
    return game.trackingTarget;
}
function drawTrackingArrow(ctx, cam, px, py) {
    var target = ensureTrackingTarget();
    if (!target)
        return;
    var dx = target.x - game.player.x, dy = target.y - game.player.y, len = Math.sqrt(dx * dx + dy * dy);
    if (len < 1)
        return;
    var angle = Math.atan2(dy, dx), radius = 48, x = px + Math.cos(angle) * radius, y = py + Math.sin(angle) * radius;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = 'rgba(255,250,224,.92)';
    ctx.strokeStyle = 'rgba(55,79,66,.38)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#547661';
    ctx.beginPath();
    ctx.moveTo(9, 0);
    ctx.lineTo(-4, -5.5);
    ctx.lineTo(-1.5, 0);
    ctx.lineTo(-4, 5.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}
function collectNode(n) {
    var cap = bagCapacity(), free = Math.max(0, cap - game.bag), samplePacked = Math.random() < sampleBoxSaveChance();
    if (free <= 0 && !samplePacked) {
        if (companionMobiusFullBag(n))
            return;
        handleFullBagCollision(n);
        return;
    }
    var baseAmount = 1;
    if (!n.rare && free > 1 && Math.random() < harvestBonusChance())
        baseAmount = 2;
    var extra = companionDuoExtra() + companionNoctisExtra(n), commonPacked = companionCommonPack(n.type), stratusPacked = companionStratusPack(), freeUnits = (commonPacked ? 1 : 0) + (samplePacked ? 1 : 0) + (stratusPacked ? 1 : 0), wanted = baseAmount + extra, maxAmount = free + freeUnits, amount = Math.max(1, Math.min(wanted, maxAmount)), spaceCost = Math.max(0, amount - freeUnits);
    n.taken = true;
    game.inventory[n.type] = (game.inventory[n.type] || 0) + amount;
    game.bag += spaceCost;
    if (n.rare)
        game.rare++;
    var rareBonus = companionRarePermanentBonus(n.type);
    if (rareBonus) {
        game.inventory[n.type] += rareBonus;
        amount += rareBonus;
    }
    var fresh = discoverResource(n.type), lightGain = 0;
    if (n.type === 'glow') {
        var before = game.light;
        game.light = Math.min(game.maxLight, game.light + glowLightRestore() * amount);
        lightGain = Math.round((game.light - before) * 10) / 10;
    }
    var tags = [];
    if (amount > 1)
        tags.push('+' + (amount - 1) + ' bonus');
    if (commonPacked)
        tags.push('rangé par le compagnon');
    if (samplePacked)
        tags.push('échantillon rangé');
    if (stratusPacked)
        tags.push('courant porteur');
    if (rareBonus)
        tags.push('première trouvaille doublée');
    showToast((fresh ? 'Nouvelle découverte : ' : '+' + amount + ' ') + RESOURCE[n.type].name + (tags.length ? ' · ' + tags.join(' · ') : '') + (lightGain > 0 ? ' · +' + lightGain + '% lumière' : ''));
    companionAfterHarvest(n);
    if (game.trackingResource && game.trackingTarget === n)
        refreshTrackingTarget(false);
    playResourceSfx(n.type, n.rare);
    vibrate(n.rare ? 32 : 14);
    updateRunUI();
    if (typeof tutorialEvent === 'function')
        tutorialEvent('resource-collected', { type: n.type, amount: amount });
}
function runProjectedResourceCount(k) { return (state.resources[k] || 0) + (game && game.inventory ? (game.inventory[k] || 0) : 0); }
function runNeedsCostReady(cost) { return Object.keys(cost).every(function (k) { return runProjectedResourceCount(k) >= cost[k]; }); }
function runNeedsResourceMarkup(k, required) {
    var owned = runProjectedResourceCount(k), during = game && game.inventory ? (game.inventory[k] || 0) : 0, missing = owned < required, label = hiddenPathMaterial(k) ? 'Matériau inconnu' : RESOURCE[k].name;
    return '<div class="run-needs-resource ' + (missing ? 'missing' : 'ready') + '">' + costResourceVisual(k) + '<div class="run-needs-resource-copy"><strong>' + label + '</strong>' + (during ? '<small>dont +' + during + ' cette balade</small>' : '') + '</div><span class="run-needs-count">' + owned + ' / ' + required + '</span></div>';
}
function runNeedsCostMarkup(cost) { return '<div class="run-needs-resources">' + sortedResourceKeysByAmount(cost).map(function (k) { return runNeedsResourceMarkup(k, cost[k]); }).join('') + '</div>'; }
function runNeedsRefugeUpgrades() { return UPGRADE.filter(function (u) { return upgradeVisible(u) && (state.upgrades[u.id] || 0) < u.max; }); }
function runNeedsTrackerAvailable() { return !!(refugeTrackerVisible(state) && !refugeTrackerUnlocked(state)); }
function runNeedsAvailable() { return !!(game && (game.level < REGION_MAX_LEVEL || runNeedsRefugeUpgrades().length || runNeedsTrackerAvailable())); }
function runNeedsMarkup() {
    if (!game)
        return '';
    var html = '<p class="run-needs-note">Les compteurs incluent ce qui est déjà dans ta sacoche. Ces trouvailles rejoindront réellement le Refuge quand tu rentreras.</p>';
    if (game.level < REGION_MAX_LEVEL) {
        var terrainCost = regionUpgradeCost(game.region, game.level), terrainReady = runNeedsCostReady(terrainCost);
        html += '<section class="run-needs-section"><div class="run-needs-section-head"><div><strong>Prochain niveau de la balade</strong><small>' + game.r.name + ' · niveau ' + game.level + ' → ' + (game.level + 1) + '</small></div><span class="run-needs-section-tag">Balade</span></div><div class="run-needs-card"><div class="run-needs-card-head">' + img(game.r.img) + '<div><strong>Faire évoluer ' + game.r.name + '</strong><small>Ce qu’il faut avoir au Refuge au retour.</small></div><span class="run-needs-status ' + (terrainReady ? 'ready' : '') + '">' + (terrainReady ? 'Prêt' : 'À compléter') + '</span></div>' + runNeedsCostMarkup(terrainCost) + '</div></section>';
    }
    var upgrades = runNeedsRefugeUpgrades();
    if (upgrades.length) {
        html += '<section class="run-needs-section"><div class="run-needs-section-head"><div><strong>Améliorations du Refuge</strong><small>Toutes les améliorations actuellement accessibles et encore évolutives.</small></div><span class="run-needs-section-tag">Refuge</span></div>';
        var group = '';
        upgrades.forEach(function (u) { var level = state.upgrades[u.id] || 0, cost = upgradeCost(u, level), ready = runNeedsCostReady(cost); if (u.group !== group) {
            group = u.group;
            html += '<div class="run-needs-group">' + group + '</div>';
        } html += '<div class="run-needs-card"><div class="run-needs-card-head">' + img(u.icon) + '<div><strong>' + u.name + '</strong><small>Niveau ' + level + ' → ' + (level + 1) + '</small></div><span class="run-needs-status ' + (ready ? 'ready' : '') + '">' + (ready ? 'Prêt' : 'À compléter') + '</span></div>' + runNeedsCostMarkup(cost) + '</div>'; });
        html += '</section>';
    }
    if (runNeedsTrackerAvailable()) {
        var trackerReady = runNeedsCostReady(REFUGE_TRACKER.cost);
        html += '<section class="run-needs-section"><div class="run-needs-section-head"><div><strong>Équipement du Refuge</strong><small>Amélioration unique débloquée grâce à tes badges.</small></div><span class="run-needs-section-tag">Refuge</span></div><div class="run-needs-card"><div class="run-needs-card-head">' + img(REFUGE_TRACKER.icon) + '<div><strong>' + REFUGE_TRACKER.name + '</strong><small>Installation unique · sans niveau</small></div><span class="run-needs-status ' + (trackerReady ? 'ready' : '') + '">' + (trackerReady ? 'Prêt' : 'À compléter') + '</span></div>' + runNeedsCostMarkup(REFUGE_TRACKER.cost) + '</div></section>';
    }
    return html;
}
function updateRunNeedsButton() { var b = $('runNeedsBtn'); if (!b)
    return; b.classList.toggle('hidden', !runNeedsAvailable()); }
function showRunNeeds() { if (!runNeedsAvailable())
    return false; stopContinuousWalk(); game.dialogOpen = true; showModal('carnet.svg', 'À chercher pendant la balade', runNeedsMarkup(), '<button class="primary" id="modalClose">Reprendre la balade</button>', 'run-needs-modal'); return true; }
function updateRunUI() { if (!game)
    return; var cap = bagCapacity(); $('bagLabel').textContent = game.bag + ' / ' + cap; $('lightLabel').textContent = Math.ceil(game.light) + '% · ' + lightStateLabel(); $('mapLabel').textContent = mapCoveragePercent() + '%'; $('mapLabel').parentNode && $('mapLabel').parentNode.classList.toggle('complete', !!game.mapComplete); $('runInventory').innerHTML = Object.keys(game.inventory).map(function (k) { return '<span class="mini-resource">' + img(RESOURCE[k].icon) + (game.inventory[k]) + '</span>'; }).join(''); updateRunNeedsButton(); }
function roundedRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function fogStamp(kind, innerRatio) {
    if (!game)
        return null;
    game.fogStampCache = game.fogStampCache || Object.create(null);
    var ratio = Math.max(0, Math.min(.95, Number(innerRatio) || 0)), bucket = Math.round(ratio * 20) / 20, key = kind + ':' + bucket;
    if (game.fogStampCache[key])
        return game.fogStampCache[key];
    var canvas = document.createElement('canvas'), size = 256, center = size / 2, outer = center - 2;
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext('2d'), gradient = ctx.createRadialGradient(center, center, outer * bucket, center, center, outer);
    if (kind === 'history') {
        gradient.addColorStop(0, 'rgba(0,0,0,1)');
        gradient.addColorStop(.7, 'rgba(0,0,0,1)');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
    }
    else if (kind === 'orb') {
        gradient.addColorStop(0, 'rgba(0,0,0,.54)');
        gradient.addColorStop(.58, 'rgba(0,0,0,.38)');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
    }
    else if (kind === 'near') {
        gradient.addColorStop(0, 'rgba(0,0,0,.58)');
        gradient.addColorStop(.58, 'rgba(0,0,0,.42)');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
    }
    else {
        gradient.addColorStop(0, 'rgba(0,0,0,1)');
        gradient.addColorStop(.72, 'rgba(0,0,0,1)');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    game.fogStampCache[key] = canvas;
    return canvas;
}
function drawFogStamp(ctx, kind, x, y, radius, innerRatio, alpha) {
    if (radius <= 0 || alpha <= 0)
        return;
    var stamp = fogStamp(kind, innerRatio), previousAlpha = ctx.globalAlpha;
    ctx.globalAlpha = previousAlpha * Math.max(0, Math.min(1, alpha));
    ctx.drawImage(stamp, x - radius, y - radius, radius * 2, radius * 2);
    ctx.globalAlpha = previousAlpha;
}
function drawGame(t) {
    var c = game.ctx, cam = getCamera(), w = game.viewW, h = game.viewH, r = game.r, visibility = currentVisibilityMetrics();
    c.clearRect(0, 0, w, h);
    c.fillStyle = r.palette[0];
    c.fillRect(0, 0, w, h);
    c.save();
    c.translate(-cam.x, -cam.y);
    for (var j = 0; j < game.decor.length; j++) {
        var d = game.decor[j];
        if (d.x < cam.x - 80 || d.x > cam.x + w + 80 || d.y < cam.y - 80 || d.y > cam.y + h + 80)
            continue;
        drawDecor(c, d, r, j, t);
    }
    game.nodes.forEach(function (n) {
        if (n.taken || n.x < cam.x - 60 || n.x > cam.x + w + 60 || n.y < cam.y - 60 || n.y > cam.y + h + 60)
            return;
        var pd2 = distSquared(game.player.x, game.player.y, n.x, n.y), stage = resourceStage(n, game.player, game.lightOrbs, visibility, pd2), alpha = stage === 'lit' ? 1 : stage === 'near' ? .34 : stage === 'remembered' ? visibility.rememberedAlpha : stage === 'rememberedRare' ? visibility.rememberedRareAlpha : 0;
        if (alpha <= 0)
            return;
        var sz = n.rare ? 43 : 34, bob = Math.sin(t * 2 + n.bob) * 2;
        c.save();
        c.globalAlpha = alpha;
        c.translate(n.x, n.y + bob);
        if (n.rare && stage === 'lit') {
            c.fillStyle = 'rgba(255,244,170,.3)';
            c.beginPath();
            c.arc(0, 0, 31 + Math.sin(t * 3) * 3, 0, Math.PI * 2);
            c.fill();
        }
        if (IMG[n.type] && IMG[n.type].complete)
            c.drawImage(IMG[n.type], -sz / 2, -sz / 2, sz, sz);
        c.restore();
    });
    game.creatures.forEach(function (o) {
        var bob = Math.sin(t * 1.3 + o.phase) * 3, sz = 54;
        if (o.x < cam.x - 70 || o.x > cam.x + w + 70 || o.y < cam.y - 70 || o.y > cam.y + h + 70)
            return;
        if (IMG[o.type] && IMG[o.type].complete)
            c.drawImage(IMG[o.type], o.x - sz / 2, o.y - sz / 2 + bob, sz, sz);
        if (creatureHasNewDialogue(o) && creatureDirectlyLit(o, visibility)) {
            c.save();
            c.translate(o.x + 20, o.y - 29 + bob);
            c.fillStyle = '#f3c66b';
            c.strokeStyle = 'rgba(69,72,57,.38)';
            c.lineWidth = 1.5;
            c.beginPath();
            c.arc(0, 0, 10, 0, Math.PI * 2);
            c.fill();
            c.stroke();
            c.fillStyle = '#42584b';
            c.font = '800 13px system-ui';
            c.textAlign = 'center';
            c.textBaseline = 'middle';
            c.fillText('!', 0, .5);
            c.restore();
        }
    });
    if (distSquared(game.player.x, game.player.y, game.player.targetX, game.player.targetY) > 64) {
        c.strokeStyle = 'rgba(255,255,255,.75)';
        c.lineWidth = 3;
        c.beginPath();
        c.arc(game.player.targetX, game.player.targetY, 9 + Math.sin(t * 4) * 2, 0, Math.PI * 2);
        c.stroke();
    }
    var playerMoving = distSquared(game.player.x, game.player.y, game.player.targetX, game.player.targetY) > 9;
    var playerPhase = playerMoving ? game.distance * .105 : t * 1.55;
    var playerBob = playerMoving ? Math.sin(playerPhase) * 2.2 : Math.sin(playerPhase) * .65;
    var playerTilt = playerMoving ? Math.sin(playerPhase) * .026 : 0;
    var playerScaleY = playerMoving ? 1 - Math.abs(Math.sin(playerPhase)) * .018 : 1 + Math.sin(playerPhase) * .006;
    c.fillStyle = 'rgba(45,65,55,.18)';
    c.beginPath();
    c.ellipse(game.player.x, game.player.y + 19, 20 - (playerMoving ? Math.abs(Math.sin(playerPhase)) * 1.5 : 0), 8, 0, 0, Math.PI * 2);
    c.fill();
    if (IMG.hero && IMG.hero.complete) {
        c.save();
        c.translate(game.player.x, game.player.y - 8 + playerBob);
        c.rotate(playerTilt);
        c.scale(1, playerScaleY);
        c.drawImage(IMG.hero, -25, -29, 50, 58);
        c.restore();
    }
    c.restore();

    var radius = visibility.lightRadius, px = game.player.x - cam.x, py = game.player.y - cam.y;
    if (!fullMapVisualReveal()) {
        var fog = game.fogCtx;
        fog.setTransform(game.dpr, 0, 0, game.dpr, 0, 0);
        fog.globalCompositeOperation = 'source-over';
        fog.globalAlpha = 1;
        fog.clearRect(0, 0, w, h);
        fog.fillStyle = game.region >= 5 ? 'rgba(22,27,44,.96)' : 'rgba(32,54,46,.94)';
        fog.fillRect(0, 0, w, h);
        fog.globalCompositeOperation = 'destination-out';
        var nearRadius = visibility.proximityRadius, historyReveal = visibility.historyReveal;
        if (historyReveal > 0)
            game.fog.forEach(function (f) {
                var fr = f.r || radius, x = f.x - cam.x, y = f.y - cam.y;
                if (x < -fr || x > w + fr || y < -fr || y > h + fr)
                    return;
                drawFogStamp(fog, 'history', x, y, fr, .18, historyReveal);
            });
        var orbRadius = visibility.passiveRadius;
        game.lightOrbs.forEach(function (o) {
            if (o.explored || o.collected)
                return;
            var ox = o.x - cam.x, oy = o.y - cam.y;
            if (ox < -orbRadius || ox > w + orbRadius || oy < -orbRadius || oy > h + orbRadius)
                return;
            drawFogStamp(fog, 'orb', ox, oy, orbRadius, .08, 1);
        });
        if (nearRadius > radius + 1 && visibility.proximityReveal > 0)
            drawFogStamp(fog, 'near', px, py, nearRadius, radius * .78 / nearRadius, visibility.proximityReveal);
        drawFogStamp(fog, 'core', px, py, radius, .18, 1);
        fog.globalCompositeOperation = 'source-over';
        fog.globalAlpha = 1;
        c.drawImage(game.fogLayer, 0, 0, w, h);
    }
    var warm = c.createRadialGradient(px, py, 0, px, py, radius);
    warm.addColorStop(0, 'rgba(255,226,130,.13)');
    warm.addColorStop(.65, 'rgba(255,220,110,.06)');
    warm.addColorStop(1, 'rgba(255,220,110,0)');
    c.fillStyle = warm;
    c.beginPath();
    c.arc(px, py, radius, 0, Math.PI * 2);
    c.fill();
    c.save();
    c.translate(-cam.x, -cam.y);
    (game.gemChests || []).forEach(function (chest) {
        if (chest.opened || (!chest.revealed && !game.mapComplete) || chest.x < cam.x - 70 || chest.x > cam.x + w + 70 || chest.y < cam.y - 70 || chest.y > cam.y + h + 70)
            return;
        var chestBob = Math.sin(t * 2 + chest.bob) * 2;
        c.save();
        c.translate(chest.x, chest.y + chestBob);
        c.fillStyle = 'rgba(151,102,218,.18)';
        c.beginPath();
        c.arc(0, 0, 31 + Math.sin(t * 3) * 2, 0, Math.PI * 2);
        c.fill();
        if (IMG.gemChest)
            c.drawImage(IMG.gemChest, -27, -27, 54, 54);
        c.restore();
    });
    if (game.companion) {
        var companionId = game.companion.id, companionImage = IMG['comp_' + companionId], companion = game.companion;
        if (companionImage && companionImage.complete) {
            c.fillStyle = 'rgba(45,65,55,.14)';
            c.beginPath();
            c.ellipse(companion.x, companion.y + 13, 14, 5, 0, 0, Math.PI * 2);
            c.fill();
            c.drawImage(companionImage, companion.x - 21, companion.y - 28 + Math.sin(t * 2.4) * 1.6, 42, 42);
        }
    }
    c.restore();
    drawTrackingArrow(c, cam, px, py);
}
function drawDecor(c, d, r, index, t) {
    if (d.t === 2 && d.collected)
        return;
    c.save();
    c.translate(d.x, d.y);
    c.rotate(d.rot * .05);
    if (d.t === 0) {
        c.fillStyle = r.palette[1];
        c.beginPath();
        c.arc(0, 0, d.s * .42, 0, Math.PI * 2);
        c.arc(d.s * .25, -d.s * .12, d.s * .32, 0, Math.PI * 2);
        c.arc(-d.s * .24, -d.s * .08, d.s * .3, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#6d644e';
        c.fillRect(-3, d.s * .1, 6, d.s * .48);
    }
    if (d.t === 1) {
        c.fillStyle = 'rgba(255,255,255,.14)';
        c.beginPath();
        c.ellipse(0, 0, d.s * .75, d.s * .35, 0, 0, Math.PI * 2);
        c.fill();
    }
    if (d.t === 2) {
        var pulse = 1 + Math.sin(t * 1.53846 + index) * .1;
        c.fillStyle = 'rgba(255,239,151,.14)';
        c.beginPath();
        c.arc(0, 0, 18 * pulse, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = 'rgba(255,238,142,.3)';
        c.beginPath();
        c.arc(0, 0, 11 * pulse, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#fff1a8';
        c.beginPath();
        c.arc(0, 0, 5.5, 0, Math.PI * 2);
        c.fill();
    }
    if (d.t === 3) {
        c.strokeStyle = r.palette[2];
        c.lineWidth = 3;
        c.lineCap = 'round';
        for (var q = -2; q <= 2; q++) {
            c.beginPath();
            c.moveTo(q * 5, 5);
            c.quadraticCurveTo(q * 6, -12, q * 8, -20 - (index % 10));
            c.stroke();
        }
    }
    c.restore();
}
function dockGiftAmount(level) { return 1 + Math.floor(Math.max(0, Number(level) || 0) / 3); }
function chooseDockGiftResource(r, rng) { rng = rng || Math.random; if (!r || !r.items || !r.items.length)
    return 'seed'; if (rng() < .68) {
    var need = leastStockedResources(r.items, Math.floor(rng() * 1000000000), 1);
    if (need.length)
        return need[0];
} return chooseTerrainItem(r, rng); }
function dockReturnBonusMarkup(gift, amount) {
    if (!gift || !amount || !RESOURCE[gift])
        return '';
    return '<div class="dock-return-bonus"><div class="dock-return-head">' + img('coquillage.svg', 'dock-return-icon') + '<div><strong>Jetée de brume</strong><small>Un présent t’attendait au retour</small></div></div><div class="dock-return-reward">' + img(RESOURCE[gift].icon) + '<span><b>+' + amount + '</b> ' + RESOURCE[gift].name + '</span></div></div>';
}
function runRewardSummaryMarkup(inv, chestCount, chestGems) {
    var keys = Object.keys(inv || {}).filter(function (k) { return (inv[k] || 0) > 0 && RESOURCE[k]; });
    var chestMarkup = (chestCount || 0) > 0 ? '<span class="run-reward-item gem-chest-summary" title="Coffre à Gemmes · +' + (chestGems || 0) + ' Gemmes">' + img('coffre_gemmes.svg') + '<span class="gem-chest-summary-value"><b>+' + (chestGems || 0) + '</b><small>Gemmes</small></span></span>' : '';
    if (!keys.length && !chestMarkup)
        return '<p class="run-empty-summary">La promenade était déjà une trouvaille, même en revenant le sac vide.</p>';
    return '<div class="run-reward-grid">' + keys.map(function (k) { return '<span class="run-reward-item">' + img(RESOURCE[k].icon) + '<b>' + inv[k] + '</b></span>'; }).join('') + chestMarkup + '</div>';
}
function companionReturnBonusMarkup(id, bonus) {
    var keys = Object.keys(bonus || {}).filter(function (k) { return (bonus[k] || 0) > 0 && RESOURCE[k]; });
    if (!id || !COMPANION[id] || !keys.length)
        return '';
    return '<div class="dock-return-bonus companion-return-bonus"><div class="dock-return-head">' + img(COMPANION[id].icon, 'dock-return-icon') + '<div><strong>' + COMPANION[id].name + '</strong><small>Rangé directement au Refuge pendant la balade</small></div></div><div class="run-reward-grid">' + keys.map(function (k) { return '<span class="run-reward-item">' + img(RESOURCE[k].icon) + '<b>+' + bonus[k] + '</b></span>'; }).join('') + '</div></div>';
}
function endRun() {
    if (!game || !game.running)
        return;
    game.running = false;
    var guidedFirstRun = typeof tutorialCoreIsFirstRun === 'function' && tutorialCoreIsFirstRun();
    var completedRegion = game.region, completedLevel = game.level, inv = game.inventory, refugeBonus = game.refugeBonus || {}, companionId = activeCompanionId(), chestCount = game.gemChestsOpened || 0, chestGems = game.gemChestGems || 0, fullMapReward = null, fullMapBadgeWasUnlocked = state.badges.indexOf('illuminator') >= 0;
    if (game.mapComplete) {
        fullMapReward = chooseFullMapBonus(game.r, game.level);
        inv[fullMapReward.type] = (inv[fullMapReward.type] || 0) + 1;
        if (fullMapReward.rare)
            game.rare++;
        discoverResource(fullMapReward.type);
        state.stats.fullMaps = (state.stats.fullMaps || 0) + 1;
    }
    var got = Object.keys(inv).reduce(function (a, k) { return a + inv[k]; }, 0);
    Object.keys(inv).forEach(function (k) { state.resources[k] = (state.resources[k] || 0) + inv[k]; });
    Object.keys(refugeBonus).forEach(function (k) { state.resources[k] = (state.resources[k] || 0) + refugeBonus[k]; });
    var dailyWasAvailable = !!state.daily;
    state.stats.expeditions++;
    state.stats.collected += got;
    state.stats.distance += Math.round(game.distance);
    state.stats.rare += game.rare;
    ensureDaily();
    if (dailyWasAvailable) {
        dailyProgress('collect', got);
        dailyProgress('walk', 1);
        dailyProgress('rare', game.rare);
    }
    var dock = upgradeEffectLevel('dock', state.upgrades.dock), gift = null, giftAmount = 0;
    if (dock > 0 && Math.random() < Math.min(.8, .18 + dock * .07)) {
        gift = chooseDockGiftResource(game.r, Math.random);
        giftAmount = dockGiftAmount(dock);
        state.resources[gift] += giftAmount;
        inv[gift] = (inv[gift] || 0) + giftAmount;
        discoverResource(gift);
    }
    var fanalRevealedNow = revealFinalGoalAfterRun(completedRegion, completedLevel);
    save();
    var region = game.r;
    game = null;
    showScreen('homeScreen');
    checkBadges(false);
    save();
    var fullMapBadgeUnlocked = !fullMapBadgeWasUnlocked && state.badges.indexOf('illuminator') >= 0;
    var summary = runRewardSummaryMarkup(inv, chestCount, chestGems);
    playSfx('run_complete', .75);
    showModal(region.img, 'Balade terminée', summary + companionReturnBonusMarkup(companionId, refugeBonus) + fullMapBonusMarkup(fullMapReward) + fullMapBadgeMarkup(fullMapBadgeUnlocked) + dockReturnBonusMarkup(gift, giftAmount), '<button class="secondary" id="againBtn">Une autre balade</button><button class="primary" id="modalClose">Rentrer</button>', 'run-end-modal');
    if (guidedFirstRun && typeof tutorialEvent === 'function')
        tutorialEvent('first-run-ended');
    $('modalClose').onclick = function () {
        hideModal(true);
        if (typeof tutorialAfterFirstRunSummaryClosed === 'function' && tutorialAfterFirstRunSummaryClosed())
            return;
        if (fanalRevealedNow)
            showFanalRevealPopup();
    };
    $('againBtn').onclick = function () { hideModal(true); if (fanalRevealedNow)
        showFanalRevealPopup(function () { showScreen('mapScreen'); });
    else
        showScreen('mapScreen'); };
}
function confirmLeaveExpedition() {
    if (!game) {
        $('runIntro').classList.add('hidden');
        showScreen('mapScreen', true);
        return true;
    }
    if (game.dialogOpen)
        return true;
    stopContinuousWalk();
    game.dialogOpen = true;
    showModal('map.svg', 'Rentrer au refuge ?', '<p>Tu conserveras tout ce que tu as déjà ramassé pendant cette balade.</p>', '<button class="secondary" id="stayRunBtn">Continuer la balade</button><button class="primary" id="leaveRunBtn">Rentrer</button>');
    $('stayRunBtn').onclick = function () { hideModal(true); if (game)
        game.dialogOpen = false; };
    $('leaveRunBtn').onclick = function () { hideModal(true); if (game)
        game.dialogOpen = false; endRun(); };
    return true;
}
function handleSystemBack() {
    if (typeof tutorialHandleSystemBack === 'function' && tutorialHandleSystemBack())
        return true;
    var modal = $('modal');
    if (modal && !modal.classList.contains('hidden')) {
        hideModal(true);
        return true;
    }
    var picker = $('companionPicker');
    if (picker && !picker.classList.contains('hidden')) {
        picker.classList.add('hidden');
        picker.innerHTML = '';
        return true;
    }
    var gacha = $('gachaOverlay');
    if (gacha && !gacha.classList.contains('hidden')) {
        closeGachaAnimation();
        return true;
    }
    var fusion = $('fusionOverlay');
    if (fusion && !fusion.classList.contains('hidden')) {
        if (fusion.classList.contains('phase-reveal'))
            closeFusionAnimation();
        return true;
    }
    if (currentScreen === 'endingScreen') {
        exitEndingCelebration();
        return true;
    }
    if (currentScreen === 'expeditionScreen')
        return confirmLeaveExpedition();
    if (currentScreen !== 'homeScreen') {
        var previous = screenHistory.length ? screenHistory.pop() : 'homeScreen';
        if (previous === 'expeditionScreen' || previous === 'endingScreen')
            previous = 'homeScreen';
        showScreen(previous, true);
        return true;
    }
    return false;
}
