'use strict';
// Music, ambience and sound-effect orchestration.
var AUDIO_SFX = [
    'ui_click', 'ui_back', 'ui_confirm', 'ui_denied', 'modal_open', 'tab', 'select', 'start_run',
    'pickup_soft', 'pickup_stone', 'pickup_magic', 'pickup_water', 'pickup_rare',
    'light_orb', 'chest', 'chest_jackpot', 'full_bag', 'character', 'upgrade', 'region_upgrade', 'trade', 'run_complete', 'badge',
    'gacha_start', 'gacha_pulse', 'gacha_rare', 'gacha_epic', 'gacha_legendary', 'fusion_gather', 'fusion_burst', 'fusion_done',
    'firework_1', 'firework_2', 'firework_3', 'firework_4'
];
var AUDIO_MUSIC = { refuge: 'audio/music/refuge.ogg', echoes: 'audio/music/echoes.ogg', fanal: 'audio/music/fanal.ogg', terrain_clairiere: 'audio/music/terrain_clairiere.ogg', terrain_rivage: 'audio/music/terrain_rivage.ogg', terrain_bois: 'audio/music/terrain_bois.ogg', terrain_marais: 'audio/music/terrain_marais.ogg', terrain_iles: 'audio/music/terrain_iles.ogg', terrain_grotte: 'audio/music/terrain_grotte.ogg', terrain_jardin: 'audio/music/terrain_jardin.ogg', terrain_archipel: 'audio/music/terrain_archipel.ogg' };
var AUDIO_AMBIENCE = { forest: 'audio/ambience/forest.ogg', shore: 'audio/ambience/shore.ogg', swamp: 'audio/ambience/swamp.ogg', sky: 'audio/ambience/sky.ogg', cave: 'audio/ambience/cave.ogg', night: 'audio/ambience/night.ogg' };
var AUDIO_REGION_AMBIENCE = ['forest', 'shore', 'forest', 'swamp', 'sky', 'cave', 'night', 'sky'];
var AUDIO_REGION_MUSIC = ['terrain_clairiere', 'terrain_rivage', 'terrain_bois', 'terrain_marais', 'terrain_iles', 'terrain_grotte', 'terrain_jardin', 'terrain_archipel'];
var AUDIO_MUSIC_VOLUME = { refuge: .25, echoes: .23, fanal: .31, terrain_clairiere: .19, terrain_rivage: .19, terrain_bois: .19, terrain_marais: .18, terrain_iles: .19, terrain_grotte: .18, terrain_jardin: .18, terrain_archipel: .19 };
var AUDIO_AMBIENCE_VOLUME = { forest: .15, shore: .17, swamp: .15, sky: .14, cave: .17, night: .14 };
function preloadAudioAssets() {
    AUDIO_SFX.forEach(function (k) { var a = new Audio('audio/sfx/' + k + '.ogg'); a.preload = 'auto'; a.volume = .72; audio.sfx[k] = a; });
    Object.keys(AUDIO_MUSIC).forEach(function (k) { var a = new Audio(AUDIO_MUSIC[k]); a.preload = 'auto'; a.loop = k !== 'fanal'; audio.preloads.push(a); });
    Object.keys(AUDIO_AMBIENCE).forEach(function (k) { var a = new Audio(AUDIO_AMBIENCE[k]); a.preload = 'auto'; a.loop = true; audio.preloads.push(a); });
}
function initAudio() { unlockAudio(); }
function unlockAudio() { if (audio.unlocked)
    return; audio.unlocked = true; syncAudioScene(true); }
function safePlay(el, onFail) { if (!el)
    return; var p; try {
    p = el.play();
    if (p && p.catch)
        p.catch(function () { if (onFail)
            onFail(); });
}
catch (e) {
    if (onFail)
        onFail();
} }
// Les pas ont été supprimés : la musique + l'ambiance donnent déjà la sensation de déplacement
// et libèrent surtout les canaux audio pour les récoltes, coffres et événements importants.
var AUDIO_SFX_MASTER = .86;
// Les fichiers d'action (récoltes, Échos, fusion, coffres...) ont une amplitude source
// nettement supérieure aux petits clics UI : on plafonne donc leur volume FINAL,
// plutôt que de leur appliquer aveuglément le même multiplicateur.
var AUDIO_UI_SFX = { ui_click: 1, ui_back: 1, ui_confirm: 1, ui_denied: 1, modal_open: 1, tab: 1, select: 1 };
var AUDIO_ACTION_SFX_CAP = .10;
var AUDIO_SFX_GAIN = {
    ui_click: .70, ui_back: .70, ui_confirm: .68, ui_denied: .64, modal_open: .62, tab: .66, select: .66,
    start_run: .66, pickup_soft: .72, pickup_stone: .72, pickup_magic: .70, pickup_water: .72, pickup_rare: .76,
    light_orb: .72, chest: .74, chest_jackpot: .78, full_bag: .65, character: .68, upgrade: .70, region_upgrade: .72, trade: .67, run_complete: .72, badge: .72,
    gacha_start: .72, gacha_pulse: .70, gacha_rare: .74, gacha_epic: .76, gacha_legendary: .80, fusion_gather: .72, fusion_burst: .78, fusion_done: .72,
    firework_1: .70, firework_2: .70, firework_3: .70, firework_4: .70
};
function finalSfxVolume(name, requested) { var gain = AUDIO_SFX_GAIN[name] === undefined ? .70 : AUDIO_SFX_GAIN[name], v = Math.max(0, Math.min(1, requested * AUDIO_SFX_MASTER * gain)); return AUDIO_UI_SFX[name] ? v : Math.min(v, AUDIO_ACTION_SFX_CAP); }
function sfxPriority(name) { if (/^pickup_|^chest|^light_orb$|^character$/.test(name))
    return 3; if (/^gacha_|^fusion_|^firework_|^upgrade$|^region_upgrade$|^run_complete$|^badge$|^start_run$/.test(name))
    return 2; return 1; }
function cleanupSfxVoice(v) { var i = audio.activeSfx.indexOf(v); if (i >= 0)
    audio.activeSfx.splice(i, 1); }
function stopSfxVoice(v) { if (!v)
    return; try {
    v.el.pause();
    v.el.currentTime = 0;
}
catch (e) { } cleanupSfxVoice(v); }
function prepareSfxVoice(priority, now) {
    audio.activeSfx = audio.activeSfx.filter(function (v) { return v && v.el && !v.el.ended; });
    // Un son important coupe les petits clics qui viennent juste de partir sur le même geste.
    if (priority >= 2)
        audio.activeSfx.slice().forEach(function (v) { if (v.priority === 1 && now - v.started < 130)
            stopSfxVoice(v); });
    var maxVoices = 6;
    if (audio.activeSfx.length < maxVoices)
        return true;
    var candidate = null;
    audio.activeSfx.forEach(function (v) { if (!candidate || v.priority < candidate.priority || (v.priority === candidate.priority && v.started < candidate.started))
        candidate = v; });
    if (candidate && (priority > candidate.priority || priority >= 3)) {
        stopSfxVoice(candidate);
        return true;
    }
    return false;
}
function playSfx(name, volume, cooldown) {
    if (!audio.enabled || !audio.unlocked)
        return false;
    var base = audio.sfx[name];
    if (!base)
        return false;
    var now = Date.now(), cd = cooldown === undefined ? 0 : cooldown;
    if (cd && now - (audio.lastSfx[name] || 0) < cd)
        return false;
    var priority = sfxPriority(name);
    if (!prepareSfxVoice(priority, now))
        return false;
    audio.lastSfx[name] = now;
    var a = base.cloneNode(true), requested = volume === undefined ? .72 : volume;
    a.volume = finalSfxVolume(name, requested);
    var voice = { el: a, name: name, priority: priority, started: now };
    audio.activeSfx.push(voice);
    var done = function () { cleanupSfxVoice(voice); };
    a.addEventListener('ended', done, { once: true });
    a.addEventListener('error', done, { once: true });
    safePlay(a, done);
    return true;
}
// Canal de récolte exclusif : jamais plus d'un son de ressource en lecture.
// Cela évite l'accumulation de cloneNode()/play() lors d'une longue marche continue,
// qui pouvait finir par épuiser temporairement les décodeurs audio de certaines WebView Android.
function playPickupSfx(name, cooldown) {
    if (!audio.enabled || !audio.unlocked)
        return false;
    var a = audio.sfx[name];
    if (!a)
        return false;
    var now = Date.now(), cd = cooldown === undefined ? 0 : cooldown;
    if (cd && now - (audio.lastSfx[name] || 0) < cd)
        return false;
    audio.lastSfx[name] = now;
    if (audio.pickupCurrent && audio.pickupCurrent !== a) {
        try {
            audio.pickupCurrent.pause();
            audio.pickupCurrent.currentTime = 0;
        }
        catch (e) { }
    }
    audio.pickupCurrent = a;
    a.volume = finalSfxVolume(name, .62);
    try {
        if (!a.paused) {
            a.currentTime = 0;
            return true;
        }
        a.currentTime = 0;
    }
    catch (e) { }
    safePlay(a, function () { if (audio.pickupCurrent === a)
        audio.pickupCurrent = null; });
    return true;
}
function playTone() { }
function clearAudioFades() { while (audio.fadeTimers.length)
    clearInterval(audio.fadeTimers.pop()); }
function fadeElement(el, target, ms, stopAfter) { if (!el)
    return; var start = el.volume || 0, t0 = Date.now(), timer = setInterval(function () { var p = Math.min(1, (Date.now() - t0) / Math.max(1, ms)); el.volume = start + (target - start) * p; if (p >= 1) {
    clearInterval(timer);
    var ix = audio.fadeTimers.indexOf(timer);
    if (ix >= 0)
        audio.fadeTimers.splice(ix, 1);
    if (stopAfter && target <= .001) {
        try {
            el.pause();
            el.currentTime = 0;
        }
        catch (e) { }
    }
} }, 30); audio.fadeTimers.push(timer); }
function setAudioLoop(kind, key, path, volume, loop, force) {
    var prop = kind === 'music' ? 'music' : 'ambience', keyProp = prop + 'Key', current = audio[prop];
    if (audio[keyProp] === key && current) {
        if (force) {
            try {
                if (current.ended)
                    current.currentTime = 0;
            }
            catch (e) { }
            current.volume = volume;
            safePlay(current);
        }
        return;
    }
    if (current) {
        fadeElement(current, 0, 420, true);
    }
    audio[keyProp] = key || '';
    if (!key || !path) {
        audio[prop] = null;
        return;
    }
    var el = new Audio(path);
    el.preload = 'auto';
    el.loop = loop !== false;
    el.volume = 0;
    audio[prop] = el;
    safePlay(el);
    fadeElement(el, volume, 620, false);
}
function musicForScene() { if (currentScreen === 'endingScreen')
    return 'fanal'; if (currentScreen === 'echoesScreen')
    return 'echoes'; if (currentScreen === 'expeditionScreen' && game)
    return AUDIO_REGION_MUSIC[Math.max(0, Math.min(AUDIO_REGION_MUSIC.length - 1, game.region | 0))] || 'terrain_clairiere'; return 'refuge'; }
function ambienceForScene() { if (currentScreen !== 'expeditionScreen' || !game)
    return ''; return AUDIO_REGION_AMBIENCE[Math.max(0, Math.min(AUDIO_REGION_AMBIENCE.length - 1, game.region | 0))] || ''; }
function syncAudioScene(force) {
    if (!audio.enabled || !audio.unlocked || document.hidden) {
        stopAmbient();
        return;
    }
    var mk = musicForScene(), ak = ambienceForScene();
    if (force || audio.musicKey !== mk)
        setAudioLoop('music', mk, AUDIO_MUSIC[mk], AUDIO_MUSIC_VOLUME[mk] || .3, mk !== 'fanal', !!force);
    if (force || audio.ambienceKey !== ak)
        setAudioLoop('ambience', ak, ak ? AUDIO_AMBIENCE[ak] : '', ak ? (AUDIO_AMBIENCE_VOLUME[ak] || .22) : 0, true, !!force);
}
function duckAudio(ms, factor) { if (!audio.enabled)
    return; factor = factor || .42; clearTimeout(audio.duckTimer); if (audio.music)
    fadeElement(audio.music, (AUDIO_MUSIC_VOLUME[audio.musicKey] || .3) * factor, 160, false); audio.duckTimer = setTimeout(function () { if (audio.music)
    fadeElement(audio.music, AUDIO_MUSIC_VOLUME[audio.musicKey] || .3, 360, false); }, ms || 1000); }
function updateSoundButton() { var b = $('soundBtn'); if (!b)
    return; b.classList.toggle('is-muted', !audio.enabled); b.setAttribute('aria-label', audio.enabled ? 'Couper le son' : 'Activer le son'); b.setAttribute('title', audio.enabled ? 'Couper le son' : 'Activer le son'); }
function toggleSound() { audio.enabled = !audio.enabled; state.settings.sound = audio.enabled; state.settings.audioV2 = true; save(); updateSoundButton(); if (audio.enabled) {
    unlockAudio();
    playSfx('ui_confirm', .42);
    syncAudioScene(true);
}
else
    stopAmbient(); }
function startAmbient() { syncAudioScene(); }
function stopAmbient() { clearAudioFades(); clearTimeout(audio.duckTimer); if (audio.music) {
    try {
        audio.music.pause();
    }
    catch (e) { }
} if (audio.ambience) {
    try {
        audio.ambience.pause();
    }
    catch (e) { }
} audio.music = null; audio.ambience = null; audio.musicKey = ''; audio.ambienceKey = ''; }
function resourceSfxGroup(type) { if (['pebble', 'crystal', 'echostone', 'prism', 'amber'].indexOf(type) >= 0)
    return 'pickup_stone'; if (['glow', 'moonpollen', 'dew', 'cloudfeather', 'cloud'].indexOf(type) >= 0)
    return 'pickup_magic'; if (['shell', 'pearl', 'waterlily', 'glass'].indexOf(type) >= 0)
    return 'pickup_water'; return 'pickup_soft'; }
function playResourceSfx(type, rare) { return playPickupSfx(rare ? 'pickup_rare' : resourceSfxGroup(type), rare ? 55 : 40); }
function stepSfxForRegion() { return ''; /* supprimé en 2.0.1 : ambiance continue, aucun pas répétitif */ }
function buttonHasDedicatedSfx(b) { if (!b || !b.matches)
    return false; if (b.matches('[data-upgrade],[data-region-upgrade],[data-trade-execute],[data-fanal-deposit],[data-fanal-all]'))
    return true; return ['echoPullBtn', 'echoPullAllBtn', 'compAssemble', 'finalWinBtn', 'finalReplayBtn', 'companionSoloBtn', 'companionStartSelected'].indexOf(b.id) >= 0; }
function bindAudioInteractions() {
    if (document._ldpAudioBound)
        return;
    document._ldpAudioBound = true;
    document.addEventListener('pointerdown', function (e) { unlockAudio(); var t = e.target; if (!t || t.id === 'gameCanvas' || (t.closest && t.closest('#gameCanvas')))
        return; var b = t.closest && t.closest('button,[role="button"],select,input'); if (!b)
        return; if (b.id === 'soundBtn' || buttonHasDedicatedSfx(b))
        return; if (b.disabled || b.getAttribute('aria-disabled') === 'true') {
        playSfx('ui_denied', .48, 130);
        return;
    } if (b.id === 'backBtn' || b.id === 'modalClose' || b.classList.contains('companion-picker-back'))
        playSfx('ui_back', .46, 75);
    else if (b.hasAttribute('data-screen') || b.hasAttribute('data-tab'))
        playSfx('tab', .43, 70);
    else if (b.hasAttribute('data-grid-companion') || b.hasAttribute('data-companion-detail') || b.hasAttribute('data-region'))
        playSfx('select', .45, 70);
    else if (b.classList.contains('primary'))
        playSfx('ui_confirm', .44, 80);
    else
        playSfx('ui_click', .42, 70); }, true);
    document.addEventListener('change', function (e) { var t = e.target; if (t && (/^(SELECT|INPUT)$/.test(t.tagName)))
        playSfx('select', .40, 90); }, true);
    document.addEventListener('visibilitychange', function () { if (document.hidden) {
        if (audio.music)
            audio.music.pause();
        if (audio.ambience)
            audio.ambience.pause();
        audio.activeSfx.slice().forEach(stopSfxVoice);
        if (audio.pickupCurrent) {
            try {
                audio.pickupCurrent.pause();
                audio.pickupCurrent.currentTime = 0;
            }
            catch (e) { }
            audio.pickupCurrent = null;
        }
    }
    else
        syncAudioScene(true); });
}
function vibrate(ms) { if (state.settings.haptics && navigator.vibrate)
    navigator.vibrate(ms || 18); }
function mulberry32(seed) { return function () { var t = seed += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function chooseWeighted(arr, rng) { return arr[Math.floor(rng() * arr.length)]; }
function distSquared(a, b, c, d) { var x = a - c, y = b - d; return x * x + y * y; }
function dist(a, b, c, d) { return Math.sqrt(distSquared(a, b, c, d)); }
function maxLight() { return 100; }
function lightRatio() { return game ? (game.mapComplete ? 1 : Math.max(0, Math.min(1, game.light / game.maxLight))) : 1; }
function lockFullMapLight() { if (game && game.mapComplete) {
    game.light = game.maxLight;
    return true;
} return false; }
function lerp(a, b, t) { return a + (b - a) * t; }
function minimumLightRadius() { return 68; }
function baseLightRadius() { return 68 + state.upgrades.lantern * 10; }
function lightRadius() { return Math.round(lerp(minimumLightRadius(), baseLightRadius(), lightRatio())); }
function fullProximityRadius() { return baseLightRadius() + 96 + (state.upgrades.lens || 0) * 13; }
function proximityRadius() { var p = lightRatio(), lit = lightRadius(); return Math.round(lerp(lit, fullProximityRadius(), p)); }
function passiveLightRadius() { return 62 + (state.upgrades.lens || 0) * 9; }
function exploredFogReveal() { var p = lightRatio(); return p <= .5 ? 1.16 * p : .58 + .42 * ((p - .5) / .5); }
function proximityFogReveal() { var p = Math.min(1, lightRatio() * 2); return Math.sin(p * Math.PI / 2); }
function rememberedResourceAlpha() { var p = lightRatio(); return p <= .5 ? .68 * p : .34 + 1.32 * (p - .5); }
function rememberedRareAlpha() { return Math.max(0, Math.min(1, (lightRatio() - .5) * 2)); }
function fullMoveSpeed() { return 118 + (state.upgrades.boots || 0) * 13; }
function zeroLightSpeed() { var boots = state.upgrades.boots || 0; return boots >= 2 ? 131 : boots === 1 ? 118 : 105; }
function moveSpeed() { var base = lerp(zeroLightSpeed(), fullMoveSpeed(), lightRatio()); if (game && game.companionSpeedUntil && performance.now() < game.companionSpeedUntil)
    base *= 1.15; return base; }
function bagCapacity() { return bagCapacityForLevel(state.upgrades.bag || 1); }
function harvestBonusChance() { return Math.min(.55, upgradeEffectLevel('harvest', state.upgrades.harvest) * .065); }
function herbariumSignatureBonus() { return Math.min(.96, (state.upgrades.herbarium || 0) * .12); }
function sampleBoxSaveChance() { return Math.min(.32, upgradeEffectLevel('samplebox', state.upgrades.samplebox) * .04); }
function terrainItemWeight(k, r) { var w = k === r.signature ? 1.8 + herbariumSignatureBonus() : (PATH_MATERIALS.indexOf(k) >= 0 ? 1 / pathMaterialCirculationFactor(k) : 1), regionIndex = REGION.indexOf(r), terrainBonus = TERRAIN_RESOURCE_WEIGHT_BONUS[regionIndex]; if (regionIndex >= 3)
    w *= LATE_TERRAIN_RESOURCE_BALANCE[k] || 1; if (terrainBonus && terrainBonus[k])
    w *= terrainBonus[k]; return w; }
function chooseTerrainItem(r, rng) { var total = r.items.reduce(function (sum, k) { return sum + terrainItemWeight(k, r); }, 0), roll = rng() * total; for (var i = 0; i < r.items.length; i++) {
    roll -= terrainItemWeight(r.items[i], r);
    if (roll <= 0)
        return r.items[i];
} return r.items[r.items.length - 1]; }
function guaranteedSignatureMinimum(level) { return level <= 1 ? 4 : (level === 2 ? 5 : (level === 3 ? 7 : 9)); }
function ensureGuaranteedSignatureResources(nodes, r, level) { var minimum = guaranteedSignatureMinimum(level), count = nodes.reduce(function (sum, n) { return sum + (!n.rare && n.type === r.signature ? 1 : 0); }, 0); if (count >= minimum)
    return count; var candidates = nodes.filter(function (n) { return !n.rare && n.type !== r.signature; }).sort(function (a, b) { return (b.edge || 0) - (a.edge || 0); }); for (var i = 0; i < minimum - count && i < candidates.length; i++)
    candidates[i].type = r.signature; return Math.min(minimum, count + candidates.length); }
function lightDrainPerDistance() { var drain = .0073 / (1 + (state.upgrades.lantern || 0) * .075); if (activeLegendaryEffect('solstice') && activeCompanionPermanent())
    drain *= .85; return drain; }
function orbLightRestore() { var level = upgradeEffectLevel('jar', state.upgrades.jar); return level > 0 ? 8 + level * 2 : 0; }
function glowLightRestore() { var level = upgradeEffectLevel('jar', state.upgrades.jar); return 3 + level * .5; }
function orbTriggerRadius() { return 34; }
function lightStateLabel() { var p = lightRatio(); return p >= .70 ? 'vive' : p >= .35 ? 'douce' : p > 0 ? 'faible' : 'éteinte'; }
function fullMapVisualReveal() { return !!(game && game.mapComplete); }
function currentVisibilityMetrics() {
    var ratio = lightRatio(), lit = Math.round(lerp(minimumLightRadius(), baseLightRadius(), ratio)), proximity = Math.round(lerp(lit, fullProximityRadius(), ratio)), passive = passiveLightRadius();
    return {
        ratio: ratio,
        lightRadius: lit,
        lightRadiusSquared: lit * lit,
        proximityRadius: proximity,
        proximityRadiusSquared: proximity * proximity,
        passiveRadius: passive,
        passiveRadiusSquared: passive * passive,
        historyReveal: ratio <= .5 ? 1.16 * ratio : .58 + .42 * ((ratio - .5) / .5),
        proximityReveal: Math.sin(Math.min(1, ratio * 2) * Math.PI / 2),
        rememberedAlpha: ratio <= .5 ? .68 * ratio : .34 + 1.32 * (ratio - .5),
        rememberedRareAlpha: Math.max(0, Math.min(1, (ratio - .5) * 2))
    };
}
function resourceStage(n, p, orbs, metrics, playerDistanceSquared) {
    if (fullMapVisualReveal())
        return 'lit';
    metrics = metrics || currentVisibilityMetrics();
    var pd2 = typeof playerDistanceSquared === 'number' ? playerDistanceSquared : distSquared(p.x, p.y, n.x, n.y);
    if (pd2 <= metrics.lightRadiusSquared)
        return 'lit';
    if (n.revealed) {
        if (n.rare)
            return metrics.rememberedRareAlpha >= .999 ? 'lit' : metrics.rememberedRareAlpha > 0 ? 'rememberedRare' : 'hidden';
        return metrics.rememberedAlpha >= .999 ? 'lit' : metrics.rememberedAlpha > 0 ? 'remembered' : 'hidden';
    }
    if (n.rare)
        return 'hidden';
    if (pd2 <= metrics.proximityRadiusSquared && metrics.proximityRadius > metrics.lightRadius)
        return 'near';
    var lights = orbs || (game && game.lightOrbs) || [];
    for (var i = 0; i < lights.length; i++) {
        var o = lights[i];
        if (!o.explored && !o.collected && distSquared(o.x, o.y, n.x, n.y) <= metrics.passiveRadiusSquared)
            return 'near';
    }
    return 'hidden';
}
