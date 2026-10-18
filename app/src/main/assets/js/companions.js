'use strict';
// Echoes, companions, Gem economy and shop presentation.
var COMPANION_RARITY = {
    common: { name: 'Commun', weight: 58, color: '#72a776', assembly: 50 },
    rare: { name: 'Rare', weight: 26, color: '#5d9fd3', assembly: 40 },
    epic: { name: 'Épique', weight: 12, color: '#9b67c7', assembly: 30 },
    legendary: { name: 'Légendaire', weight: 4, color: '#d59a32', assembly: 20 }
};
var COMPANION = {
    pepine: { name: 'Pépine', rarity: 'common', icon: 'comp_pepine.svg', boosts: ['seed'], echoDesc: 'Favorise les Graines.', permanentDesc: 'Favorise fortement les Graines et évite les longues séries sans en trouver.' },
    murette: { name: 'Mûrette', rarity: 'common', icon: 'comp_murette.svg', boosts: ['berry'], echoDesc: 'Favorise les Baies.', permanentDesc: 'Favorise fortement les Baies et évite les longues séries sans en trouver.' },
    cairn: { name: 'Cairn', rarity: 'common', icon: 'comp_cairn.svg', boosts: ['pebble'], echoDesc: 'Favorise les Galets.', permanentDesc: 'Favorise fortement les Galets et évite les longues séries sans en trouver.' },
    folia: { name: 'Folia', rarity: 'common', icon: 'comp_folia.svg', boosts: ['leaf'], echoDesc: 'Favorise les Feuilles.', permanentDesc: 'Favorise fortement les Feuilles et évite les longues séries sans en trouver.' },
    nacre: { name: 'Nacre', rarity: 'common', icon: 'comp_nacre.svg', boosts: ['shell'], echoDesc: 'Favorise les Coquillages.', permanentDesc: 'Favorise fortement les Coquillages et évite les longues séries sans en trouver.' },
    luz: { name: 'Luz', rarity: 'common', icon: 'comp_luz.svg', boosts: ['glow'], echoDesc: 'Favorise les Lucioles.', permanentDesc: 'Favorise fortement les Lucioles et évite les longues séries sans en trouver.' },
    bolet: { name: 'Bolet', rarity: 'common', icon: 'comp_bolet.svg', boosts: ['mushroom'], echoDesc: 'Favorise les Champignons.', permanentDesc: 'Favorise fortement les Champignons et évite les longues séries sans en trouver.' },
    brumette: { name: 'Brumette', rarity: 'common', icon: 'comp_brumette.svg', boosts: ['pearl'], echoDesc: 'Favorise les Perles de brume.', permanentDesc: 'Favorise fortement les Perles de brume et évite les longues séries sans en trouver.' },
    lunelle: { name: 'Lunelle', rarity: 'common', icon: 'comp_lunelle.svg', boosts: ['flower'], echoDesc: 'Favorise les Fleurs-lunes.', permanentDesc: 'Favorise fortement les Fleurs-lunes et évite les longues séries sans en trouver.' },
    nym: { name: 'Nym', rarity: 'common', icon: 'comp_nym.svg', boosts: ['waterlily'], echoDesc: 'Favorise les Nénuphars.', permanentDesc: 'Favorise fortement les Nénuphars et évite les longues séries sans en trouver.' },
    quartz: { name: 'Quartz', rarity: 'common', icon: 'comp_quartz.svg', boosts: ['crystal'], echoDesc: 'Favorise les Cristaux.', permanentDesc: 'Favorise fortement les Cristaux et évite les longues séries sans en trouver.' },
    reson: { name: 'Réson', rarity: 'common', icon: 'comp_reson.svg', boosts: ['echostone'], echoDesc: 'Favorise les Pierres d’écho.', permanentDesc: 'Favorise fortement les Pierres d’écho et évite les longues séries sans en trouver.' },
    velours: { name: 'Velours', rarity: 'common', icon: 'comp_velours.svg', boosts: ['moonpollen'], echoDesc: 'Favorise le Pollen lunaire.', permanentDesc: 'Favorise fortement le Pollen lunaire et évite les longues séries sans en trouver.' },
    cirrus: { name: 'Cirrus', rarity: 'common', icon: 'comp_cirrus.svg', boosts: ['cloudfeather'], echoDesc: 'Favorise les Plumes de nuage.', permanentDesc: 'Favorise fortement les Plumes de nuage et évite les longues séries sans en trouver.' },
    biscotte: { name: 'Biscotte', rarity: 'rare', icon: 'comp_biscotte.svg', boosts: ['acorn'], echoDesc: 'Fait apparaître les Glands dorés dès le niveau 1 et les favorise.', permanentDesc: 'Fait apparaître les Glands dorés dès le niveau 1, sécurise plusieurs apparitions et double la première trouvaille.' },
    herbine: { name: 'Herbine', rarity: 'rare', icon: 'comp_herbine.svg', boosts: ['moss'], echoDesc: 'Fait apparaître les Mousses-étoiles dès le niveau 1 et les favorise.', permanentDesc: 'Fait apparaître les Mousses-étoiles dès le niveau 1, sécurise plusieurs apparitions et double la première trouvaille.' },
    maree: { name: 'Marée', rarity: 'rare', icon: 'comp_maree.svg', boosts: ['glass'], echoDesc: 'Fait apparaître les Verres de mer dès le niveau 1 et les favorise.', permanentDesc: 'Fait apparaître les Verres de mer dès le niveau 1, sécurise plusieurs apparitions et double la première trouvaille.' },
    lumen: { name: 'Lumen', rarity: 'rare', icon: 'comp_lumen.svg', boosts: ['amber'], echoDesc: 'Fait apparaître l’Ambre céleste dès le niveau 1 et le favorise.', permanentDesc: 'Fait apparaître l’Ambre céleste dès le niveau 1, sécurise plusieurs apparitions et double la première trouvaille.' },
    truffe: { name: 'Truffe', rarity: 'rare', icon: 'comp_truffe.svg', boosts: ['reed'], echoDesc: 'Fait apparaître les Roseaux chantants dès le niveau 1 et les favorise.', permanentDesc: 'Fait apparaître les Roseaux chantants dès le niveau 1, sécurise plusieurs apparitions et double la première trouvaille.' },
    opale: { name: 'Opale', rarity: 'rare', icon: 'comp_opale.svg', boosts: ['prism'], echoDesc: 'Fait apparaître les Prismes doux dès le niveau 1 et les favorise.', permanentDesc: 'Fait apparaître les Prismes doux dès le niveau 1, sécurise plusieurs apparitions et double la première trouvaille.' },
    satin: { name: 'Satin', rarity: 'rare', icon: 'comp_satin.svg', boosts: ['cloud'], echoDesc: 'Fait apparaître les Graines de nuage dès le niveau 1 et les favorise.', permanentDesc: 'Fait apparaître les Graines de nuage dès le niveau 1, sécurise plusieurs apparitions et double la première trouvaille.' },
    aube: { name: 'Aube', rarity: 'rare', icon: 'comp_aube.svg', boosts: ['dew'], echoDesc: 'Fait apparaître la Rosée lunaire dès le niveau 1 et la favorise.', permanentDesc: 'Fait apparaître la Rosée lunaire dès le niveau 1, sécurise plusieurs apparitions et double la première trouvaille.' },
    aster: { name: 'Aster', rarity: 'epic', icon: 'comp_aster.svg', boosts: ['leaf', 'moss'], epic: 'growth', echoDesc: 'Croissance : fait parfois repousser une ressource récoltée, avec une limite par balade.', permanentDesc: 'Croissance profonde : une ressource récoltée peut repousser près de toi, sans limite par balade.' },
    ecume: { name: 'Écume', rarity: 'epic', icon: 'comp_ecume.svg', boosts: ['shell', 'glass'], epic: 'tide', echoDesc: 'Marée : transforme régulièrement une trouvaille proche en Coquillage ou Verre de mer, avec une limite par balade.', permanentDesc: 'Grande marée : transforme régulièrement une trouvaille proche en Coquillage ou Verre de mer, sans limite par balade.' },
    doremi: { name: 'Dorémi', rarity: 'epic', icon: 'comp_doremi.svg', boosts: ['seed', 'acorn'], epic: 'sowing', echoDesc: 'Semis : envoie régulièrement une Graine ou un Gland doré utile directement au Refuge, avec une limite par balade.', permanentDesc: 'Semis généreux : envoie régulièrement une Graine ou un Gland doré directement au Refuge, sans limite par balade.' },
    sifflot: { name: 'Sifflot', rarity: 'epic', icon: 'comp_sifflot.svg', boosts: ['waterlily', 'reed'], epic: 'refrain', echoDesc: 'Refrain : récupère régulièrement de la lumière et révèle les ressources proches.', permanentDesc: 'Grand refrain : récupère régulièrement de la lumière et révèle largement les ressources proches.' },
    stratus: { name: 'Stratus', rarity: 'epic', icon: 'comp_stratus.svg', boosts: ['cloudfeather', 'cloud'], epic: 'current', echoDesc: 'Courant porteur : certaines trouvailles ne prennent pas de place et donnent brièvement de l’élan.', permanentDesc: 'Courant puissant : certaines trouvailles ne prennent pas de place et donnent un élan prolongé.' },
    iris: { name: 'Iris', rarity: 'epic', icon: 'comp_iris.svg', boosts: ['crystal', 'prism'], epic: 'refraction', echoDesc: 'Réfraction : révèle régulièrement les ressources proches et peut dédoubler quelques trouvailles.', permanentDesc: 'Réfraction vive : révèle régulièrement les ressources proches et peut en dédoubler, sans limite par balade.' },
    noctis: { name: 'Noctis', rarity: 'epic', icon: 'comp_noctis.svg', boosts: ['moonpollen', 'dew'], epic: 'night', echoDesc: 'Nuit fertile : quand la lumière baisse, certaines récoltes donnent une unité supplémentaire.', permanentDesc: 'Nuit généreuse : quand la lumière baisse, les récoltes donnent plus souvent une unité supplémentaire.' },
    solambre: { name: 'Solambre', rarity: 'epic', icon: 'comp_solambre.svg', boosts: ['echostone', 'amber'], epic: 'resonance', echoDesc: 'Résonance : transforme régulièrement une trouvaille proche en ressource utile au Refuge, avec une limite par balade.', permanentDesc: 'Résonance profonde : transforme régulièrement une trouvaille proche en ressource utile au Refuge, sans limite par balade.' },
    mobius: { name: 'Möbius', rarity: 'legendary', icon: 'comp_mobius.svg', legendary: 'mobius', echoDesc: 'Boucle impossible : sacoche pleine, Möbius peut encore sauver quelques trouvailles en les envoyant au Refuge.', permanentDesc: 'Boucle maîtrisée : sacoche pleine, Möbius peut continuer à envoyer des trouvailles au Refuge sans limite par balade.' },
    solstice: { name: 'Solstice', rarity: 'legendary', icon: 'comp_solstice.svg', legendary: 'solstice', echoDesc: 'Second soleil : l’exploration rend de la lumière à plusieurs étapes de la carte.', permanentDesc: 'Second soleil permanent : l’exploration rend de la lumière à plusieurs étapes de la carte et la lumière se vide plus lentement.' },
    barda: { name: 'Barda', rarity: 'legendary', icon: 'comp_barda.svg', legendary: 'barda', echoDesc: 'Poches secrètes : envoie régulièrement une copie de ta récolte directement au Refuge, avec une limite par balade.', permanentDesc: 'Poches sans fond : envoie régulièrement une copie de ta récolte directement au Refuge, sans limite par balade.' },
    duo: { name: 'Duo', rarity: 'legendary', icon: 'comp_duo.svg', legendary: 'duo', echoDesc: 'Reflet : certaines récoltes créent une copie si la sacoche a de la place.', permanentDesc: 'Reflet fidèle : une récolte sur deux crée une copie si la sacoche a de la place.' },
    trefle: { name: 'Trèfle', rarity: 'legendary', icon: 'comp_trefle.svg', legendary: 'trefle', echoDesc: 'Coup de chance : garantit un coffre à Gemmes et améliore les chances de belles trouvailles.', permanentDesc: 'Grande chance : garantit un coffre à Gemmes et augmente fortement les chances de coffres et de jackpots.' }
};
var COMPANION_IDS = Object.keys(COMPANION);
var COMMON_COMPANION_ECHO_BONUS = .06, COMMON_COMPANION_PERMANENT_BONUS = .08, RARE_COMPANION_ECHO_BONUS = .04, RARE_COMPANION_PERMANENT_BONUS = .06;
var GEM_PULL_COST = 10, GEM_EVOLUTION_REWARD = 10, GACHA_UNKNOWN_WEIGHT = 1.5;
var GEM_CHEST_REGION_CHANCE = [.15, .175, .20, .225, .25, .275, .30, .325];
var GEM_JACKPOT_CHANCE = .10;
var companionDraft = { region: -1, selected: '', mode: '', tracking: '' };
// Test-only A/B renderer capture. This runs before the v4 isometric layer is loaded, so these
// references are the historical 2D expedition functions inherited from the v3.2.7 renderer.
var WALK_RENDER_LEGACY_2D = {
    drawGame: typeof drawGame === 'function' ? drawGame : null,
    screenToWorld: typeof screenToWorld === 'function' ? screenToWorld : null,
    getCamera: typeof getCamera === 'function' ? getCamera : null
};
var gachaTimers = [], gachaStartedAt = 0, gachaCanAccelerate = false;
var fusionTimers = [];
function completedEvolutionCount(s) { return (s.regionLevels || []).reduce(function (sum, l) { return sum + Math.max(0, Math.min(REGION_MAX_LEVEL - 1, (l || 1) - 1)); }, 0); }
function normalizeCompanionState() {
    if (typeof state.gems !== 'number' || !isFinite(state.gems))
        state.gems = 0;
    state.gems = Math.max(0, Math.floor(state.gems));
    if (!state.companionFragments || typeof state.companionFragments !== 'object')
        state.companionFragments = {};
    if (!state.companionSurplus || typeof state.companionSurplus !== 'object')
        state.companionSurplus = {};
    if (!Array.isArray(state.companionPermanent))
        state.companionPermanent = [];
    if (!Array.isArray(state.companionDiscovered))
        state.companionDiscovered = [];
    COMPANION_IDS.forEach(function (id) { state.companionFragments[id] = Math.max(0, Math.floor(Number(state.companionFragments[id]) || 0)); state.companionSurplus[id] = Math.max(0, Math.floor(Number(state.companionSurplus[id]) || 0)); });
    state.companionPermanent = state.companionPermanent.filter(function (id, i, a) { return !!COMPANION[id] && a.indexOf(id) === i; });
    state.companionDiscovered = state.companionDiscovered.filter(function (id, i, a) { return !!COMPANION[id] && a.indexOf(id) === i; });
    state.gachaPulls = Math.max(0, Math.floor(Number(state.gachaPulls) || 0));
    if (!state.releaseGifts || typeof state.releaseGifts !== 'object')
        state.releaseGifts = {};
    state.echoesUnlocked = !!state.echoesUnlocked;
    state.echoesIntroSeen = !!state.echoesIntroSeen;
}
function companionIsPermanent(id) { return state.companionPermanent.indexOf(id) >= 0; }
function companionFragments(id) { return Math.max(0, state.companionFragments[id] || 0); }
function companionAssemblyCost(id) { var c = COMPANION[id], r = c && COMPANION_RARITY[c.rarity]; return r && r.assembly ? r.assembly : 50; }
function companionSurplus(id) { return Math.max(0, state.companionSurplus[id] || 0); }
function companionKnown(id) { return state.companionDiscovered.indexOf(id) >= 0 || companionIsPermanent(id) || companionFragments(id) > 0 || companionSurplus(id) > 0; }
function companionUsable(id) { return !!COMPANION[id] && companionKnown(id); }
function ownedUsableCompanions() { return COMPANION_IDS.filter(companionUsable); }
function companionRequiredResources(c) { var keys = []; (c.boosts || []).forEach(function (k) { if (keys.indexOf(k) < 0)
    keys.push(k); }); return keys; }
function companionPoolUnlocked(id) { return !!COMPANION[id] && !!state.echoesUnlocked; }
function availableCompanionPool() { return COMPANION_IDS.filter(companionPoolUnlocked); }
function companionRarityMarkup(r) { var d = COMPANION_RARITY[r]; return '<span class="companion-rarity ' + r + '">' + d.name + '</span>'; }
function companionFormLabel(id) { return companionIsPermanent(id) ? 'Permanent' : 'Écho'; }
function companionStatusText(id) { return companionIsPermanent(id) ? 'Permanent · effet renforcé' : 'Écho · utilisable librement'; }
function companionDisplayDescription(id) { var c = COMPANION[id]; if (!c)
    return ''; return companionIsPermanent(id) ? (c.permanentDesc || c.echoDesc || '') : (c.echoDesc || c.permanentDesc || ''); }
function activeCompanionId() { return game && game.companion && game.companion.id || ''; }
function activeCompanion() { var id = activeCompanionId(); return id && COMPANION[id] ? COMPANION[id] : null; }
function activeCompanionPermanent() { var id = activeCompanionId(); return !!(id && companionIsPermanent(id)); }
function activeLegendaryEffect(effect) { var c = activeCompanion(); return !!(c && c.rarity === 'legendary' && c.legendary === effect); }
function activeEpicEffect(effect) { var c = activeCompanion(); return !!(c && c.rarity === 'epic' && c.epic === effect); }
function companionNodeFactor(id, regionIndex, level) { return 1; }
function companionNodeCount(regionIndex, level, id) { return walkProfile(regionIndex, level).nodes; }
function companionEffectActive(id, regionIndex, level) {
    var c = COMPANION[id], r = REGION[regionIndex];
    if (!c || !r)
        return false;
    level = level || regionLevel(regionIndex);
    if (c.rarity === 'legendary' || c.rarity === 'epic')
        return true;
    var target = (c.boosts || [])[0];
    if (c.rarity === 'rare')
        return r.rare === target;
    return r.items.indexOf(target) >= 0;
}
function baseCompanionProbabilityMap(regionIndex, level, edge) {
    var r = REGION[regionIndex], weights = {}, total = 0, pRare = level >= 2 ? rareChance(level, edge) : 0, out = {};
    r.items.forEach(function (k) { weights[k] = terrainItemWeight(k, r); total += weights[k]; });
    r.items.forEach(function (k) { out[k] = (1 - pRare) * (weights[k] || 0) / Math.max(.000001, total); });
    if (level >= 2)
        out[r.rare] = pRare;
    return out;
}
function applyFixedAppearanceBoosts(out, targets, bonus) {
    targets = (targets || []).filter(function (k, i, a) { return !!RESOURCE[k] && a.indexOf(k) === i; });
    if (!targets.length || bonus <= 0)
        return out;
    var targetBase = targets.reduce(function (sum, k) { return sum + (out[k] || 0); }, 0), maxEach = Math.max(0, (.97 - targetBase) / targets.length), add = Math.min(bonus, maxEach), desiredTarget = targetBase + add * targets.length, otherBase = Math.max(0, 1 - targetBase), otherDesired = Math.max(0, 1 - desiredTarget), scale = otherBase > 0 ? otherDesired / otherBase : 0, targetSet = {};
    targets.forEach(function (k) { targetSet[k] = true; });
    Object.keys(out).forEach(function (k) { if (!targetSet[k])
        out[k] *= scale; });
    targets.forEach(function (k) { out[k] = (out[k] || 0) + add; });
    return out;
}
function probabilityMapAtEdge(regionIndex, level, edge, id) {
    var out = baseCompanionProbabilityMap(regionIndex, level, edge), c = id && COMPANION[id];
    if (!c || !companionEffectActive(id, regionIndex, level))
        return out;
    if (c.rarity === 'common')
        return applyFixedAppearanceBoosts(out, c.boosts, companionIsPermanent(id) ? COMMON_COMPANION_PERMANENT_BONUS : COMMON_COMPANION_ECHO_BONUS);
    if (c.rarity === 'rare')
        return applyFixedAppearanceBoosts(out, c.boosts, companionIsPermanent(id) ? RARE_COMPANION_PERMANENT_BONUS : RARE_COMPANION_ECHO_BONUS);
    return out;
}
function pickNodeResourceWithCompanion(regionIndex, level, edge, rng, id) { var probs = probabilityMapAtEdge(regionIndex, level, edge, id), roll = rng(), keys = Object.keys(probs), last = keys[0] || REGION[regionIndex].items[0]; for (var i = 0; i < keys.length; i++) {
    last = keys[i];
    roll -= probs[keys[i]];
    if (roll <= 0)
        return keys[i];
} return last; }
function ensureMinimumNodeType(nodes, type, minimum, rare, protectedType) {
    minimum = Math.max(0, Math.min(nodes.length, Math.floor(minimum || 0)));
    var count = nodes.reduce(function (sum, n) { return sum + (n.type === type ? 1 : 0); }, 0);
    if (count >= minimum)
        return count;
    var candidates = nodes.filter(function (n) { return n.type !== type && !n.rare && (!protectedType || protectedType === type || n.type !== protectedType); }).sort(function (a, b) { return (b.edge || 0) - (a.edge || 0); });
    for (var i = 0; i < minimum - count && i < candidates.length; i++) {
        candidates[i].type = type;
        candidates[i].rare = !!rare;
    }
    return Math.min(minimum, count + candidates.length);
}
function companionRareMinimum(level, id) { var base = guaranteedRareMinimum(level); if (!id || !COMPANION[id] || COMPANION[id].rarity !== 'rare')
    return base; if (level <= 1)
    return companionIsPermanent(id) ? 2 : 1; return base + (companionIsPermanent(id) ? 2 : 1); }
function ensureCompanionGenerationEffects(nodes, r, level, id) {
    var c = id && COMPANION[id];
    if (!c || !companionEffectActive(id, REGION.indexOf(r), level))
        return;
    if (c.rarity === 'rare') {
        ensureMinimumNodeType(nodes, c.boosts[0], companionRareMinimum(level, id), true, r.signature);
        return;
    }
    if (c.rarity === 'common' && companionIsPermanent(id)) {
        var target = c.boosts[0], regionIndex = REGION.indexOf(r), steps = 96, avg = 0;
        for (var i = 0; i < steps; i++) {
            var u = (i + .5) / steps, edge = Math.pow(u, .43);
            avg += (probabilityMapAtEdge(regionIndex, level, edge, id)[target] || 0) / steps;
        }
        var expected = nodes.length * avg, minimum = Math.max(4, Math.ceil(expected * .82));
        ensureMinimumNodeType(nodes, target, minimum, false, r.signature);
    }
}
function companionTerrainResourceEstimates(regionIndex, id) {
    var level = regionLevel(regionIndex), r = REGION[regionIndex], nodeCount = companionNodeCount(regionIndex, level, id), steps = 420, sum = {};
    for (var i = 0; i < steps; i++) {
        var u = (i + .5) / steps, edge = Math.pow(u, .43), p = probabilityMapAtEdge(regionIndex, level, edge, id);
        Object.keys(p).forEach(function (k) { sum[k] = (sum[k] || 0) + p[k] / steps; });
    }
    var exp = {};
    Object.keys(sum).forEach(function (k) { exp[k] = sum[k] * nodeCount; });
    var rareCompanionActive = !!(id && COMPANION[id] && COMPANION[id].rarity === 'rare' && companionEffectActive(id, regionIndex, level));
    if (level >= 2 || rareCompanionActive) {
        var rk = r.rare, pr = (sum[rk] || 0), floor = rareCompanionActive ? companionRareMinimum(level, id) : guaranteedRareMinimum(level), target = expectedCountWithFloor(nodeCount, pr, floor);
        if (target > (exp[rk] || 0)) {
            var old = exp[rk] || 0, other = Math.max(.0001, nodeCount - old), scale = Math.max(0, (nodeCount - target) / other);
            Object.keys(exp).forEach(function (k) { if (k !== rk)
                exp[k] *= scale; });
            exp[rk] = target;
        }
    }
    if (guaranteedSignatureMinimum(level) > 0) {
        var sk = r.signature, ps = (sum[sk] || 0), st = expectedCountWithFloor(nodeCount, ps, guaranteedSignatureMinimum(level));
        if (st > (exp[sk] || 0)) {
            var so = exp[sk] || 0, oth = Math.max(.0001, nodeCount - so), sc = Math.max(0, (nodeCount - st) / oth);
            Object.keys(exp).forEach(function (k) { if (k !== sk)
                exp[k] *= sc; });
            exp[sk] = st;
        }
    }
    return Object.keys(exp).map(function (k) { return { key: k, expected: exp[k], share: exp[k] / nodeCount, kind: EXCLUSIVE.indexOf(k) >= 0 ? 'rare' : (k === r.signature ? 'signature' : 'common'), totalNodes: nodeCount }; }).sort(function (a, b) { return a.expected - b.expected || RESOURCE[a.key].name.localeCompare(RESOURCE[b.key].name); });
}
function companionPreviewMarkup(regionIndex, id) {
    var c = id && COMPANION[id];
    if (c)
        return '<div class="companion-preview-head"><strong>Effet ' + companionFormLabel(id).toLowerCase() + '</strong><small>' + companionDisplayDescription(id) + '</small></div>';
    return '<div class="companion-preview-head"><strong>Départ sans compagnon</strong><small>' + (companionConceptKnown() ? 'Aucun bonus de compagnon pour cette balade.' : 'Prêt pour cette balade.') + '</small></div>';
}
function renderEchoVisibility() { var nav = $('echoNavBtn'); if (nav)
    nav.classList.toggle('hidden', !state.echoesUnlocked); }
var billingCatalog = [];
var pendingPremiumSpends = Object.create(null);
var gachaSpendPending = false;

function premiumGemBalance() {
    var bridge = androidBridge();
    if (!bridge || typeof bridge.getPremiumGemBalance !== 'function') {
        return 0;
    }
    try {
        return Math.max(0, Math.floor(Number(bridge.getPremiumGemBalance()) || 0));
    }
    catch (error) {
        return 0;
    }
}

function earnedGemBalance() {
    return Math.max(0, Math.floor(Number(state && state.gems) || 0));
}

function totalGemBalance() {
    return earnedGemBalance() + premiumGemBalance();
}

function requestPremiumGemSpend(amount) {
    return new Promise(function (resolve) {
        var bridge = androidBridge();
        if (!bridge || typeof bridge.requestPremiumGemSpend !== 'function') {
            resolve(false);
            return;
        }

        var requestId = '';
        try {
            requestId = String(bridge.requestPremiumGemSpend(amount) || '');
        }
        catch (error) {
            resolve(false);
            return;
        }

        if (!requestId) {
            resolve(false);
            return;
        }

        var timeout = setTimeout(function () {
            if (!pendingPremiumSpends[requestId]) {
                return;
            }
            delete pendingPremiumSpends[requestId];
            resolve(false);
            showToast('La dépense de Gemmes achetées n’a pas pu être confirmée.');
        }, 15000);

        pendingPremiumSpends[requestId] = {
            resolve: resolve,
            timeout: timeout
        };
    });
}

/**
 * Spends earned currency first. Any paid remainder is debited by the remote wallet.
 * The local earned part is rolled back if that authoritative debit is rejected.
 */
function spendGemCurrency(amount) {
    amount = Math.max(0, Math.floor(Number(amount) || 0));
    if (!amount) {
        return Promise.resolve(true);
    }
    if (totalGemBalance() < amount) {
        return Promise.resolve(false);
    }

    var earned = Math.min(earnedGemBalance(), amount);
    var premium = amount - earned;
    state.gems -= earned;

    if (!premium) {
        return Promise.resolve(true);
    }

    return requestPremiumGemSpend(premium).then(function (confirmed) {
        if (!confirmed) {
            state.gems += earned;
        }
        return confirmed;
    });
}

function billingAvailable() {
    var bridge = androidBridge();
    try {
        return !!(bridge && bridge.isBillingEnabled && bridge.isBillingEnabled());
    }
    catch (error) {
        return false;
    }
}

function requestGemCatalog() {
    var bridge = androidBridge();
    if (!billingAvailable() || !bridge || !bridge.requestGemCatalog) {
        return;
    }
    try {
        bridge.requestGemCatalog();
    }
    catch (error) {
        // The shop stays hidden or disabled until the native bridge answers again.
    }
}

function gachaItemProbabilities() {
    var rates = currentGachaRates();
    var out = [];
    Object.keys(rates).forEach(function (rarity) {
        var group = rates[rarity];
        var total = 0;
        var weights = group.ids.map(function (id) {
            var weight = group.equalWeights ? 1 : (companionKnown(id) ? 1 : GACHA_UNKNOWN_WEIGHT);
            total += weight;
            return { id: id, weight: weight };
        });
        weights.forEach(function (entry) {
            out.push({
                id: entry.id,
                chance: group.chance * entry.weight / Math.max(0.0001, total)
            });
        });
    });
    return out.sort(function (a, b) { return b.chance - a.chance; });
}

function renderDetailedGachaOdds() {
    var odds = gachaItemProbabilities();
    return '<details class="gacha-exact-odds">' +
        '<summary>Probabilités exactes par compagnon</summary>' +
        '<div class="gacha-exact-odds-list">' +
        odds.map(function (entry) {
            var companion = COMPANION[entry.id];
            var discovery = companionKnown(entry.id) ? '' : '<small>Inconnu · favorisé</small>';
            var percentage = Math.round(entry.chance * 10000) / 100;
            return '<div><span>' + img(companion.icon) + '<b>' + companion.name + '</b>' +
                discovery + '</span><strong>' + percentage + ' %</strong></div>';
        }).join('') +
        '</div></details>';
}

function gemShopPreviewCatalog() {
    return [
        { productId: 'gems_120', gems: 120, label: 'Petite lueur', price: '1,99 €' },
        { productId: 'gems_650', gems: 650, label: 'Bocal lumineux', price: '9,99 €' },
        { productId: 'gems_1400', gems: 1400, label: 'Grande lanterne', price: '19,99 €' },
        { productId: 'gems_3000', gems: 3000, label: 'Réserve du refuge', price: '39,99 €' }
    ];
}

function renderGemShopScreen() {
    var container = $('gemShopContent');
    if (!container || !state.echoesUnlocked) {
        return;
    }

    var enabled = billingAvailable();
    var products = enabled && billingCatalog.length ? billingCatalog : gemShopPreviewCatalog();
    var packs = products.map(function (pack) {
        var available = enabled && pack.available;
        return '<button class="gem-pack ui-action" data-gem-pack="' + pack.productId + '" ' +
            (available ? '' : 'disabled') + '>' +
            '<span>' + img('gemme.svg') + '<strong>' + pack.gems + ' Gemmes</strong>' +
            '<small>' + pack.label + '</small></span>' +
            '<b>' + (available ? pack.price : pack.price) + '</b>' +
            '</button>';
    }).join('');

    container.innerHTML =
        '<section class="gem-shop gem-shop-page">' +
        '<div class="gem-shop-status ' + (enabled ? 'is-enabled' : 'is-disabled') + '">' +
        '<span>' + img('gemme.svg') + '</span><div><p class="eyebrow">' +
        (enabled ? 'Google Play' : 'Bientôt disponible') + '</p><h2>' +
        (enabled ? 'Choisir un pack' : 'Les achats sont désactivés') + '</h2><p>' +
        (enabled
            ? 'Les Gemmes achetées rejoignent un portefeuille séparé de ta progression locale.'
            : 'Tu peux déjà gagner des Gemmes en jouant. Les achats en argent réel seront activés plus tard, après validation complète du système de paiement et de restauration.') +
        '</p></div></div>' +
        '<div class="gem-shop-notice"><strong>À quoi servent les Gemmes ?</strong>' +
        '<p>Elles permettent notamment d’appeler des compagnons dans la Lanterne des échos. Les résultats sont aléatoires et les probabilités applicables à ta progression sont indiquées ci-dessous avant tout futur achat.</p>' +
        renderGachaRates() + renderDetailedGachaOdds() + '</div>' +
        '<div class="section-title gem-pack-title"><h2>Packs prévus</h2><span>' +
        (enabled ? 'Paiement Google Play' : 'Aucun achat possible') + '</span></div>' +
        '<div class="gem-pack-grid">' + packs + '</div>' +
        '<small class="gem-shop-footnote">' +
        (enabled
            ? 'Paiement traité par Google Play. Les Gemmes achetées ne possèdent pas de valeur monétaire hors du jeu.'
            : 'Les montants affichés servent uniquement à préparer la future boutique. Aucun bouton ne déclenche actuellement de paiement.') +
        '</small></section>';

    bindGemShop();
    if (enabled && !billingCatalog.length) {
        requestGemCatalog();
    }
}

function bindGemShop() {
    document.querySelectorAll('[data-gem-pack]').forEach(function (button) {
        button.onclick = function () {
            var bridge = androidBridge();
            if (bridge && bridge.purchaseGemPack) {
                bridge.purchaseGemPack(button.getAttribute('data-gem-pack'));
            }
        };
    });
}

window.LucioleBilling = {
    onCatalog: function (products) {
        billingCatalog = Array.isArray(products) ? products : [];
        if (currentScreen === 'echoesScreen') {
            renderEchoes();
        }
        if (currentScreen === 'gemShopScreen') {
            renderGemShopScreen();
        }
    },

    onBalanceChanged: function () {
        if (currentScreen === 'echoesScreen') {
            renderEchoes();
        }
        if (currentScreen === 'gemShopScreen') {
            renderGemShopScreen();
        }
    },

    onPremiumSpend: function (requestId, success, balance, transactionId, message) {
        var pending = pendingPremiumSpends[String(requestId || '')];
        if (!pending) {
            return;
        }
        clearTimeout(pending.timeout);
        delete pendingPremiumSpends[String(requestId || '')];
        pending.resolve(!!success);
        if (!success && message) {
            showToast(String(message));
        }
        if (currentScreen === 'echoesScreen') {
            renderEchoes();
        }
        if (currentScreen === 'gemShopScreen') {
            renderGemShopScreen();
        }
    },

    onPurchaseGranted: function (productId, gems, balance) {
        showModal(
            'gemme.svg',
            'Gemmes reçues',
            '<p><strong>+' + Math.max(0, Number(gems) || 0) + ' Gemmes</strong> ont été ajoutées ' +
            'à ton portefeuille.</p><p>Solde acheté : ' + Math.max(0, Number(balance) || 0) +
            ' Gemmes.</p>'
        );
        if (currentScreen === 'echoesScreen') {
            renderEchoes();
        }
        if (currentScreen === 'gemShopScreen') {
            renderGemShopScreen();
        }
    },

    onMessage: function (message, error) {
        if (error) {
            showModal('gemme.svg', 'Boutique', '<p>' + String(message || 'Une erreur est survenue.') + '</p>');
        }
        else {
            showToast(String(message || ''));
        }
    }
};
function firstEchoCompanionPool() {
    return COMPANION_IDS.filter(function (id) {
        var companion = COMPANION[id];
        return companion && companion.rarity === 'common' && companionEffectActive(id, 0, 1);
    });
}
function firstEchoGuaranteeActive(pullOffset) {
    pullOffset = Math.max(0, Math.floor(Number(pullOffset) || 0));
    return Math.max(0, Number(state && state.gachaPulls) || 0) + pullOffset === 0;
}
function currentGachaRates(pullOffset) {
    if (firstEchoGuaranteeActive(pullOffset)) {
        var firstPool = firstEchoCompanionPool();
        if (firstPool.length)
            return { common: { ids: firstPool, chance: 1, equalWeights: true } };
    }
    var pool = availableCompanionPool(), groups = {}, total = 0;
    Object.keys(COMPANION_RARITY).forEach(function (r) { groups[r] = pool.filter(function (id) { return COMPANION[id].rarity === r; }); if (groups[r].length)
        total += COMPANION_RARITY[r].weight; });
    var out = {};
    Object.keys(groups).forEach(function (r) { if (groups[r].length)
        out[r] = { ids: groups[r], chance: COMPANION_RARITY[r].weight / Math.max(1, total) }; });
    return out;
}
function renderGachaRates() { var rates = currentGachaRates(), keys = Object.keys(COMPANION_RARITY); return '<div class="echo-rate-distribution" aria-hidden="true">' + keys.map(function (r) { var p = rates[r]; return p ? '<i class="' + r + '" style="flex:' + (p.chance * 1000) + ' 0 0"></i>' : ''; }).join('') + '</div><div class="echo-rate-list">' + keys.map(function (r) { var p = rates[r], d = COMPANION_RARITY[r]; return '<div class="echo-rate-row ' + r + ' ' + (!p ? 'unavailable' : '') + '"><span><i></i><b>' + d.name + '</b></span><strong>' + (p ? Math.round(p.chance * 1000) / 10 + ' %' : '—') + '</strong></div>'; }).join('') + '</div>'; }
function availableGachaPullCount() { return availableCompanionPool().length ? Math.floor(totalGemBalance() / GEM_PULL_COST) : 0; }
function renderEchoes() {
    if (!$('echoesContent') || !state.echoesUnlocked)
        return;
    var pullCount = availableGachaPullCount(), can = pullCount > 0 && !gachaSpendPending, allCost = pullCount * GEM_PULL_COST, totalGems = totalGemBalance(), premium = premiumGemBalance(), firstCall = firstEchoGuaranteeActive(0);
    var echoesUnlockNotice = pageNoticePills('echoesScreen', [{ key: 'echoes-unlocked', label: 'Nouveau' }]);
    $('echoesContent').innerHTML = '<div class="echo-lantern-card ' + (echoesUnlockNotice ? 'has-page-notice' : '') + '"' + itemNoticeData('echoesScreen', ['echoes-unlocked']) + '><div class="echo-lantern-top"><div class="echo-lantern-art">' + img('lanterne_echos.svg') + '</div><div class="echo-lantern-copy"><p class="eyebrow">Lanterne des échos</p>' + echoesUnlockNotice + '<h2>Appeler un compagnon</h2><p>Un appel coûte <strong>' + GEM_PULL_COST + ' Gemmes</strong> et rapporte <strong>10 fragments</strong>. Le premier appel d’un compagnon débloque son <strong>Écho</strong>, utilisable librement en balade.</p><span class="echo-gem-count ui-info">' + img('gemme.svg') + '<b>' + totalGems + '</b><small>Gemmes disponibles' + (premium ? ' · ' + state.gems + ' gagnées + ' + premium + ' achetées' : '') + '</small></span></div></div><div class="echo-pull-actions"><button id="echoPullBtn" class="echo-pull primary ui-action" ' + (can ? '' : 'disabled') + '>' + img('gemme.svg') + '<span><strong>Appeler</strong><small>' + GEM_PULL_COST + ' Gemmes</small></span></button><button id="echoPullAllBtn" class="echo-pull echo-pull-all ui-action" ' + (can ? '' : 'disabled') + '>' + img('gemme.svg') + '<span><strong>Tout appeler</strong><small>' + pullCount + ' appel' + (pullCount > 1 ? 's' : '') + ' · ' + allCost + ' Gemmes</small></span></button></div></div><div class="echo-rate-panel ui-info"><div class="echo-rate-head"><div><p class="eyebrow">Informations</p><strong>Probabilités d’un appel</strong></div><small>' + (firstCall ? 'Premier appel : compagnon Commun garanti, compatible avec la Clairière mousseuse. Les six réponses possibles ont la même chance.' : 'Chaque appel choisit d’abord une rareté. Dans cette rareté, tous les compagnons restent tirables ; ceux encore inconnus sont légèrement favorisés.') + '</small></div>' + renderGachaRates() + renderDetailedGachaOdds() + '<div class="echo-assembly-info"><strong>Fragments réservés à l’assemblage permanent</strong><span>Commun 50 · Rare 40 · Épique 30 · Légendaire 20 · aucun fragment consommé en balade</span></div></div><button id="openGemShopBtn" class="echo-shop-entry ui-action"><span>' + img('gemme.svg') + '<b>Boutique de Gemmes</b><small>Achats payants · bientôt disponible</small></span><strong>›</strong></button><div class="section-title echo-companion-title"><h2>Compagnons</h2><span>' + state.companionPermanent.length + ' permanent' + (state.companionPermanent.length > 1 ? 's' : '') + '</span></div><div class="companion-grid">' + COMPANION_IDS.map(function (id) { var c = COMPANION[id], known = companionKnown(id), eligible = companionPoolUnlocked(id), perm = companionIsPermanent(id), fr = companionFragments(id), companionKey = 'companion:' + id, assembleKey = 'companion-assemble:' + id, assembleReady = known && !perm && fr >= companionAssemblyCost(id), companionNotices = pageNoticePills('echoesScreen', [{ key: known ? companionKey : '', label: 'Nouveau' }, { key: assembleReady ? assembleKey : '', label: 'Assemblage prêt' }]); return '<button class="companion-tile ui-action rarity-' + c.rarity + ' ' + (known ? 'known' : 'unknown') + ' ' + (!eligible ? 'not-in-pool' : '') + ' ' + (companionNotices ? 'has-page-notice' : '') + '" data-companion-detail="' + id + '"' + itemNoticeData('echoesScreen', (known ? [companionKey] : []).concat(assembleReady ? [assembleKey] : [])) + '>' + (known ? img(c.icon) : '<span class="companion-silhouette">?</span>') + '<strong>' + (known ? c.name : 'Inconnu') + '</strong>' + companionNotices + (known ? companionRarityMarkup(c.rarity) : '') + (known ? '<small>' + (perm ? 'Permanent · effet renforcé' : 'Écho · ' + fr + ' / ' + companionAssemblyCost(id) + ' fragments') + '</small>' : '') + '</button>'; }).join('') + '</div>';
    var pull = $('echoPullBtn');
    if (pull)
        pull.onclick = pullGacha;
    var pullAll = $('echoPullAllBtn');
    if (pullAll)
        pullAll.onclick = pullAllGacha;
    var openShop = $('openGemShopBtn');
    if (openShop)
        openShop.onclick = function () { showScreen('gemShopScreen'); };
    document.querySelectorAll('[data-companion-detail]').forEach(function (button) { button.onclick = function () { showCompanionDetail(button.getAttribute('data-companion-detail')); }; });
    bindItemNoticeMarkers($('echoesContent'));
    updateBottomNavNotifications();
}
function chooseGachaResult(rng, pullOffset) { rng = rng || Math.random; var rates = currentGachaRates(pullOffset), roll = rng(), rarity = '', last = ''; Object.keys(COMPANION_RARITY).forEach(function (r) { if (!rates[r])
    return; last = r; if (rarity)
    return; roll -= rates[r].chance; if (roll <= 0)
    rarity = r; }); rarity = rarity || last; if (!rarity)
    return ''; var group = rates[rarity], ids = group.ids, total = 0, weights = ids.map(function (id) { var w = group.equalWeights ? 1 : (companionKnown(id) ? 1 : GACHA_UNKNOWN_WEIGHT); total += w; return w; }), pick = rng() * Math.max(.0001, total); for (var i = 0; i < ids.length; i++) {
    pick -= weights[i];
    if (pick < 0)
        return ids[i];
} return ids[ids.length - 1] || ''; }
function clearGachaTimers() { gachaTimers.forEach(clearTimeout); gachaTimers = []; }
function gachaRarityTone(r) { return r === 'legendary' ? 1046 : r === 'epic' ? 880 : r === 'rare' ? 698 : 523; }
function grantGachaResult(id) {
    if (!COMPANION[id])
        return null;
    var wasKnown = companionKnown(id), permanent = companionIsPermanent(id);
    state.gachaPulls++;
    if (state.companionDiscovered.indexOf(id) < 0)
        state.companionDiscovered.push(id);
    if (permanent)
        state.companionSurplus[id] = (state.companionSurplus[id] || 0) + 10;
    else
        state.companionFragments[id] = (state.companionFragments[id] || 0) + 10;
    return { id: id, newlyDiscovered: !wasKnown, permanent: permanent };
}
function setGachaSpendPending(pending) {
    gachaSpendPending = !!pending;
    if (currentScreen === 'echoesScreen') {
        renderEchoes();
    }
}

function pullGacha() {
    if (gachaSpendPending || !state.echoesUnlocked || totalGemBalance() < GEM_PULL_COST) {
        return Promise.resolve(false);
    }

    var plannedId = chooseGachaResult(Math.random, 0);
    if (!plannedId) {
        return Promise.resolve(false);
    }

    setGachaSpendPending(true);
    return spendGemCurrency(GEM_PULL_COST)
        .then(function (spent) {
            if (!spent) {
                return false;
            }

            grantGachaResult(plannedId);
            save();
            renderEchoes();
            runGachaAnimation(plannedId);
            return true;
        })
        .finally(function () {
            setGachaSpendPending(false);
        });
}

function pullAllGacha() {
    if (gachaSpendPending || !state.echoesUnlocked) {
        return Promise.resolve(false);
    }

    var count = availableGachaPullCount();
    if (count < 1) {
        return Promise.resolve(false);
    }

    var plannedIds = [];
    for (var i = 0; i < count; i++) {
        var plannedId = chooseGachaResult(Math.random, i);
        if (!plannedId) {
            return Promise.resolve(false);
        }
        plannedIds.push(plannedId);
    }

    var totalCost = plannedIds.length * GEM_PULL_COST;
    setGachaSpendPending(true);
    return spendGemCurrency(totalCost)
        .then(function (spent) {
            if (!spent) {
                return false;
            }

            var results = plannedIds.map(grantGachaResult).filter(Boolean);
            save();
            renderEchoes();
            runBulkGachaAnimation(results);
            return true;
        })
        .finally(function () {
            setGachaSpendPending(false);
        });
}
function bulkGachaGroups(results) {
    var byId = {};
    results.forEach(function (r) { if (!byId[r.id])
        byId[r.id] = { id: r.id, count: 0, newlyDiscovered: false, permanent: r.permanent }; byId[r.id].count++; if (r.newlyDiscovered)
        byId[r.id].newlyDiscovered = true; });
    var rank = { legendary: 0, epic: 1, rare: 2, common: 3 };
    return Object.keys(byId).map(function (id) { return byId[id]; }).sort(function (a, b) { var ca = COMPANION[a.id], cb = COMPANION[b.id], rd = rank[ca.rarity] - rank[cb.rarity]; return rd || ca.name.localeCompare(cb.name, 'fr'); });
}
function bulkGachaHighestRarity(results) { var rank = { common: 0, rare: 1, epic: 2, legendary: 3 }, best = 'common'; results.forEach(function (r) { var rarity = COMPANION[r.id].rarity; if (rank[rarity] > rank[best])
    best = rarity; }); return best; }
function bulkGachaSummaryMarkup(results) {
    var groups = bulkGachaGroups(results), spent = results.length * GEM_PULL_COST, newCount = groups.filter(function (g) { return g.newlyDiscovered; }).length;
    return '<div class="gacha-summary-head"><strong>' + results.length + ' appel' + (results.length > 1 ? 's' : '') + '</strong><small>' + spent + ' Gemmes dépensées · ' + totalGemBalance() + (totalGemBalance() === 1 ? ' restante' : ' restantes') + (newCount ? ' · ' + newCount + ' nouveau' + (newCount > 1 ? 'x' : '') : '') + '</small></div><div class="gacha-summary-list">' + groups.map(function (g) { var c = COMPANION[g.id], fragmentText = g.permanent ? '+' + (g.count * 10) + ' fragments en surplus' : '+' + (g.count * 10) + ' fragments'; return '<div class="gacha-summary-item rarity-' + c.rarity + '">' + img(c.icon) + '<div><strong>' + c.name + (g.newlyDiscovered ? '<em>Nouveau</em>' : '') + '</strong><small>' + COMPANION_RARITY[c.rarity].name + ' · ' + fragmentText + '</small></div><b>×' + g.count + '</b></div>'; }).join('') + '</div>';
}
function showBulkGachaSummary(results) { renderEchoes(); showModal('echos.svg', 'Les échos ont répondu', bulkGachaSummaryMarkup(results), '<button class="primary" id="modalClose">Continuer</button>'); }
function runBulkGachaAnimation(results) {
    var o = $('gachaOverlay');
    if (!o || !results || !results.length) {
        if (results && results.length)
            showBulkGachaSummary(results);
        return;
    }
    clearGachaTimers();
    gachaStartedAt = Date.now();
    gachaCanAccelerate = false;
    var rarity = bulkGachaHighestRarity(results);
    o.className = 'gacha-overlay rarity-' + rarity + ' bulk-gacha-overlay';
    o.innerHTML = '<div class="gacha-stars"></div><div class="gacha-stage"><p class="gacha-whisper">La Lanterne frissonne…</p><div class="gacha-lantern">' + img('lanterne_echos.svg') + '<span class="gacha-gem">' + img('gemme.svg') + '</span></div><p class="gacha-question">' + results.length + ' échos répondent ensemble…</p><div class="gacha-silhouette bulk-gacha-silhouette">' + img('echos.svg') + '</div></div>';
    o.classList.remove('hidden');
    duckAudio(3200, .32);
    playSfx('gacha_start', .76);
    vibrate(18);
    function finish() { if (o.classList.contains('hidden'))
        return; clearGachaTimers(); gachaCanAccelerate = false; o.onclick = null; o.classList.add('hidden'); o.innerHTML = ''; playSfx('ui_confirm', .66); showBulkGachaSummary(results); }
    gachaTimers.push(setTimeout(function () { o.classList.add('phase-gem'); playSfx('gacha_start', .58, 180); }, 500));
    gachaTimers.push(setTimeout(function () { o.classList.add('phase-pulse'); playSfx('gacha_pulse', .72); vibrate(24); }, 1050));
    gachaTimers.push(setTimeout(function () { o.classList.add('phase-rarity'); gachaCanAccelerate = true; playSfx(rarity === 'legendary' ? 'gacha_legendary' : rarity === 'epic' ? 'gacha_epic' : rarity === 'rare' ? 'gacha_rare' : 'gacha_pulse', rarity === 'legendary' ? .92 : .78); vibrate(rarity === 'legendary' ? 70 : rarity === 'epic' ? 48 : 30); }, 1650));
    gachaTimers.push(setTimeout(function () { o.classList.add('phase-silhouette'); }, 2150));
    gachaTimers.push(setTimeout(finish, 2950));
    o.onclick = function () { if (gachaCanAccelerate)
        finish(); };
}
function closeGachaAnimation(e) { var o = $('gachaOverlay'); if (e) {
    if (e.preventDefault)
        e.preventDefault();
    if (e.stopPropagation)
        e.stopPropagation();
} if (!o)
    return false; clearGachaTimers(); gachaCanAccelerate = false; o.onclick = null; o.classList.add('hidden'); o.innerHTML = ''; renderEchoes(); return true; }
function runGachaAnimation(id) {
    var c = COMPANION[id], o = $('gachaOverlay');
    if (!o)
        return;
    clearGachaTimers();
    gachaStartedAt = Date.now();
    gachaCanAccelerate = false;
    o.className = 'gacha-overlay rarity-' + c.rarity;
    o.innerHTML = '<div class="gacha-stars"></div><div class="gacha-stage"><p class="gacha-whisper">La Lanterne frissonne…</p><div class="gacha-lantern">' + img('lanterne_echos.svg') + '<span class="gacha-gem">' + img('gemme.svg') + '</span></div><p class="gacha-question">Quel écho va répondre ?</p><div class="gacha-silhouette">' + img(c.icon) + '</div><div class="gacha-reveal-card">' + img(c.icon) + '<span>' + COMPANION_RARITY[c.rarity].name + '</span><h2>' + c.name + '</h2><p>' + companionDisplayDescription(id) + '</p><strong>+10 fragments</strong><small>' + (companionIsPermanent(id) ? companionSurplus(id) + ' fragments en surplus' : 'Écho débloqué · ' + companionFragments(id) + ' / ' + companionAssemblyCost(id) + ' pour le rendre permanent') + '</small><button id="gachaContinue" class="primary">Continuer</button></div></div>';
    o.classList.remove('hidden');
    var continueBtn = $('gachaContinue');
    if (continueBtn) {
        continueBtn.onclick = closeGachaAnimation;
        continueBtn.ontouchend = closeGachaAnimation;
    }
    duckAudio(3900, .30);
    playSfx('gacha_start', .76);
    vibrate(18);
    gachaTimers.push(setTimeout(function () { o.classList.add('phase-gem'); playSfx('gacha_start', .58, 180); }, 550));
    gachaTimers.push(setTimeout(function () { o.classList.add('phase-pulse'); playSfx('gacha_pulse', .72); vibrate(24); }, 1250));
    gachaTimers.push(setTimeout(function () { o.classList.add('phase-rarity'); gachaCanAccelerate = true; playSfx(c.rarity === 'legendary' ? 'gacha_legendary' : c.rarity === 'epic' ? 'gacha_epic' : c.rarity === 'rare' ? 'gacha_rare' : 'gacha_pulse', c.rarity === 'legendary' ? .92 : .78); vibrate(c.rarity === 'legendary' ? 70 : c.rarity === 'epic' ? 48 : 30); }, 2050));
    gachaTimers.push(setTimeout(function () { o.classList.add('phase-silhouette'); }, 2650));
    gachaTimers.push(setTimeout(function () { finishGachaAnimation(false); }, 3500));
    o.onclick = function (e) { var t = e.target; if (t && ((t.id === 'gachaContinue') || (t.closest && t.closest('#gachaContinue')))) {
        closeGachaAnimation(e);
        return;
    } if (gachaCanAccelerate)
        finishGachaAnimation(true); };
}
function finishGachaAnimation(accelerated) { var o = $('gachaOverlay'); if (!o || o.classList.contains('phase-reveal'))
    return; clearGachaTimers(); o.classList.add('phase-rarity', 'phase-silhouette', 'phase-reveal'); var btn = $('gachaContinue'); if (btn) {
    btn.onclick = closeGachaAnimation;
    btn.ontouchend = closeGachaAnimation;
} playSfx('ui_confirm', .66); }
function clearFusionTimers() { while (fusionTimers.length)
    clearTimeout(fusionTimers.pop()); }
function fusionShardMarkup() { var out = '', count = 14; for (var i = 0; i < count; i++) {
    var a = (Math.PI * 2 * i / count) - Math.PI / 2, r = 112 + (i % 3) * 14, x = Math.round(Math.cos(a) * r), y = Math.round(Math.sin(a) * r), rot = Math.round(a * 180 / Math.PI + 90);
    out += '<span class="fusion-fragment" style="--x:' + x + 'px;--y:' + y + 'px;--rot:' + rot + 'deg;--delay:' + (i * 22) + 'ms"></span>';
} return out; }
function closeFusionAnimation(e) { if (e) {
    e.preventDefault();
    e.stopPropagation();
} var o = $('fusionOverlay'); if (!o)
    return; clearFusionTimers(); o.classList.add('hidden'); o.innerHTML = ''; renderEchoes(); }
function showFusionAnimation(id) {
    var c = COMPANION[id], o = $('fusionOverlay');
    if (!c || !o)
        return;
    clearFusionTimers();
    o.className = 'fusion-overlay rarity-' + c.rarity;
    o.innerHTML = '<div class="fusion-stars"></div><div class="fusion-stage"><p class="fusion-kicker">Assemblage des fragments</p><h2 class="fusion-name">' + c.name + '</h2><div class="fusion-core"><div class="fusion-aura fusion-aura-one"></div><div class="fusion-aura fusion-aura-two"></div><div class="fusion-fragments">' + fusionShardMarkup() + '</div><div class="fusion-companion">' + img(c.icon) + '</div><div class="fusion-spark"></div></div><p class="fusion-status">Les échos se rapprochent…</p><div class="fusion-result"><div class="fusion-result-icon">' + img(c.icon) + '</div><span>' + COMPANION_RARITY[c.rarity].name + '</span><h2>Fusion réussie</h2><strong>' + c.name + ' est permanent</strong><p>' + companionDisplayDescription(id) + '</p><small>Forme permanente · effet renforcé · utilisable librement</small><button id="fusionContinue" class="primary">Continuer</button></div></div>';
    o.classList.remove('hidden');
    requestAnimationFrame(function () { o.classList.add('phase-gather'); });
    duckAudio(3000, .28);
    playSfx('fusion_gather', .78);
    vibrate(18);
    fusionTimers.push(setTimeout(function () { o.classList.add('phase-compress'); var st = o.querySelector('.fusion-status'); if (st)
        st.textContent = 'La forme se stabilise…'; playSfx('gacha_pulse', .58); }, 900));
    fusionTimers.push(setTimeout(function () { o.classList.add('phase-burst'); var st = o.querySelector('.fusion-status'); if (st)
        st.textContent = 'Écho assemblé !'; playSfx('fusion_burst', c.rarity === 'legendary' ? .94 : .82); vibrate(c.rarity === 'legendary' ? 90 : 60); }, 1650));
    fusionTimers.push(setTimeout(function () { o.classList.add('phase-reveal'); var btn = $('fusionContinue'); if (btn) {
        btn.onclick = closeFusionAnimation;
        btn.ontouchend = closeFusionAnimation;
    } playSfx('fusion_done', .80); }, 2250));
    o.onclick = function (e) { var t = e.target; if (o.classList.contains('phase-reveal') && t && ((t.id === 'fusionContinue') || (t.closest && t.closest('#fusionContinue'))))
        closeFusionAnimation(e); };
}
function assembleCompanion(id) { var cost = companionAssemblyCost(id); if (!COMPANION[id] || companionIsPermanent(id) || companionFragments(id) < cost)
    return false; var remain = companionFragments(id) - cost; state.companionFragments[id] = 0; if (remain > 0)
    state.companionSurplus[id] = (state.companionSurplus[id] || 0) + remain; state.companionPermanent.push(id); save(); renderEchoes(); showFusionAnimation(id); return true; }
function saleRuleForCompanion(id) { var r = COMPANION[id].rarity; if (r === 'common')
    return { amount: 8, keys: TRADE_ORDINARY }; if (r === 'rare')
    return { amount: 12, keys: TRADE_ORDINARY }; if (r === 'epic')
    return { amount: 4, keys: EXCLUSIVE }; return { amount: 6, keys: EXCLUSIVE }; }
function companionSurplusSaleAmount(id, fragments) { var rule = saleRuleForCompanion(id), count = Math.max(0, Math.floor(Number(fragments) || 0)); if (!count)
    return 0; return Math.max(1, Math.round(count * rule.amount / 10)); }
function sellCompanionSurplus(id, target) { var rule = saleRuleForCompanion(id), sur = companionSurplus(id); if (!companionIsPermanent(id) || sur <= 0 || rule.keys.indexOf(target) < 0)
    return false; var amount = companionSurplusSaleAmount(id, sur); state.companionSurplus[id] = 0; state.resources[target] = (state.resources[target] || 0) + amount; discoverResource(target); save(); renderEchoes(); showModal(RESOURCE[target].icon, 'Fragments échangés', '<p>Les <strong>' + sur + ' fragments en surplus</strong> de ' + COMPANION[id].name + ' deviennent <strong>' + amount + ' ' + RESOURCE[target].name + '</strong>.</p>'); return true; }
function showCompanionDetail(id) {
    var c = COMPANION[id];
    if (!c)
        return;
    if (!companionKnown(id)) {
        showModal('echos.svg', 'Écho inconnu', '<p>Ce compagnon n’a pas encore répondu à la Lanterne.</p>');
        return;
    }
    var fr = companionFragments(id), perm = companionIsPermanent(id), sur = companionSurplus(id), cost = companionAssemblyCost(id), buttons = '<button class="primary" id="modalClose">Fermer</button>';
    var extra = '<div class="companion-effect-focus rarity-' + c.rarity + '"><span>Effet ' + companionFormLabel(id) + '</span><strong>' + companionDisplayDescription(id) + '</strong></div><div class="companion-detail-meta">' + companionRarityMarkup(c.rarity) + '<span>' + companionFormLabel(id) + '</span></div>';
    if (perm)
        extra += '<div class="companion-detail-stock is-permanent"><strong>Compagnon permanent</strong><small>Utilisable librement à chaque balade.</small></div>';
    else
        extra += '<div class="companion-detail-stock"><strong>' + fr + ' / ' + cost + ' fragments</strong><small>Assemblage permanent</small></div>';
    if (!perm && fr >= cost)
        buttons = '<button class="evolution-action companion-assemble-action" id="compAssemble">Assembler</button><button class="secondary" id="modalClose">Plus tard</button>';
    if (perm && sur > 0) {
        var rule = saleRuleForCompanion(id), saleAmount = companionSurplusSaleAmount(id, sur), opts = rule.keys.filter(function (k) { return state.discoveredResources.indexOf(k) >= 0; });
        extra += '<div class="companion-surplus"><strong>' + sur + ' fragments en surplus</strong><small>Tout vendre → ' + saleAmount + ' ressources</small><select id="compSaleTarget"><option value="">Choisir une ressource</option>' + opts.map(function (k) { return '<option value="' + k + '">' + RESOURCE[k].name + '</option>'; }).join('') + '</select></div>';
        buttons = '<button class="secondary" id="compSell">Vendre tout</button><button class="primary" id="modalClose">Fermer</button>';
    }
    showModal(c.icon, c.name, extra, buttons, 'companion-detail-modal');
    var a = $('compAssemble');
    if (a)
        a.onclick = function () { hideModal(true); assembleCompanion(id); };
    var sell = $('compSell');
    if (sell)
        sell.onclick = function () { var t = $('compSaleTarget') && $('compSaleTarget').value; if (!t) {
            showToast('Choisis la ressource reçue.');
            return;
        } hideModal(true); sellCompanionSurplus(id, t); };
}
function companionPickerGridCard(id, regionIndex) { var c = COMPANION[id], active = companionEffectActive(id, regionIndex, regionLevel(regionIndex)), perm = companionIsPermanent(id); return '<button class="companion-picker-grid-card rarity-' + c.rarity + ' ' + (active ? '' : 'no-effect') + '" data-grid-companion="' + id + '" ' + (active ? '' : 'disabled') + '>' + img(c.icon) + '<strong>' + c.name + '</strong><small>' + COMPANION_RARITY[c.rarity].name + '</small><span>' + (perm ? 'Permanent' : 'Écho') + (active ? '' : ' · hors balade') + '</span></button>'; }
function companionSelectedMarkup(regionIndex, id) { if (!id || !COMPANION[id])
    return ''; var c = COMPANION[id]; return '<div class="companion-selected-card rarity-' + c.rarity + '">' + img(c.icon) + '<div><p class="eyebrow">Compagnon sélectionné</p><strong>' + c.name + '</strong>' + companionRarityMarkup(c.rarity) + '<small>' + companionDisplayDescription(id) + '</small><b>' + companionStatusText(id) + '</b></div></div>'; }
function runChoiceSummaryMarkup(regionIndex, mode, id) {
    if (mode === 'solo')
        return '<div class="companion-selected-card solo-selected-card">' + img('hero.svg') + '<div><p class="eyebrow">Choix de balade</p><strong>Partir seul</strong><small>Tu exploreras avec ton personnage, sans bonus de compagnon.</small><b>Prêt pour la balade</b></div></div>';
    if (mode === 'companion' && id && COMPANION[id])
        return companionSelectedMarkup(regionIndex, id);
    return '<div class="companion-selected-empty choice-required"><span>?</span><div><strong>Choisis comment partir</strong><small>Sélectionne <b>Partir seul</b> ou choisis un compagnon avant de continuer.</small></div></div>';
}
function trackingResourcesForRegion(regionIndex) {
    if (!refugeTrackerUnlocked(state))
        return [];
    var r = REGION[regionIndex], level = regionLevel(regionIndex), known = state.discoveredResources || [], out = [];
    (r.items || []).forEach(function (k) { if (known.indexOf(k) >= 0 && out.indexOf(k) < 0) out.push(k); });
    if (level >= 2 && known.indexOf(r.unique) >= 0 && out.indexOf(r.unique) < 0)
        out.push(r.unique);
    return out;
}
function trackingSetupMarkup(regionIndex, selected) {
    if (!refugeTrackerUnlocked(state))
        return '';
    var resources = trackingResourcesForRegion(regionIndex), buttons = '<button class="tracking-resource-button none ' + (!selected ? 'selected' : '') + '" data-tracking-resource=""><span>×</span><b>Aucune</b></button>';
    buttons += resources.map(function (k) { return '<button class="tracking-resource-button ' + (selected === k ? 'selected' : '') + '" data-tracking-resource="' + k + '">' + img(RESOURCE[k].icon) + '<b>' + RESOURCE[k].name + '</b></button>'; }).join('');
    return '<div class="tracking-setup"><div class="tracking-setup-head">' + img(REFUGE_TRACKER.icon) + '<div><strong>Aiguille des trouvailles</strong></div></div><div class="tracking-resource-list">' + buttons + '</div></div>';
}
function openCompanionPicker(regionIndex) {
    var ids = ownedUsableCompanions(), knownIds = COMPANION_IDS.filter(companionKnown), o = $('companionPicker'), r = REGION[regionIndex], level = regionLevel(regionIndex), profile = walkProfile(regionIndex, level);
    companionDraft = { region: regionIndex, selected: '', mode: '', tracking: '' };
    o.classList.remove('hidden');
    function closePicker() { o.classList.add('hidden'); companionDraft = { region: -1, selected: '', mode: '', tracking: '' }; }
    function startChosen(id) { if (id && !companionUsable(id)) {
        showToast('Ce compagnon n’est pas encore débloqué.');
        return;
    } o.classList.add('hidden'); showScreen('expeditionScreen'); initAudio(); startRun(regionIndex, id || '', companionDraft.tracking || ''); }
    function runLoreMarkup() { var signature = state.discoveredResources.indexOf(r.signature) >= 0 ? RESOURCE[r.signature].name : 'Une ressource-signature encore inconnue'; return '<div class="run-setup-lore"><p>' + r.sub + ' ' + profile.desc + '.</p><small><strong>' + signature + '</strong> est la ressource-signature de ce chemin. <strong>' + RESOURCE[r.unique].name + '</strong> est sa ressource régionale et apparaît après évolution de la balade.</small></div>'; }
    function renderLanding() {
        var id = companionDraft.selected, mode = companionDraft.mode, conceptKnown = companionConceptKnown(), hasKnown = conceptKnown && knownIds.length > 0, chooseDisabled = !ids.length, choiceMarkup, summaryMarkup = '', confirmMarkup = '';
        if (!conceptKnown) {
            choiceMarkup = '<div class="companion-choice-actions solo-only pre-companion-choice"><button id="companionSoloBtn" class="companion-choice-button solo-choice primary"><span class="companion-choice-icon">→</span><div><strong>Démarrer la balade</strong><small>Commencer cette balade.</small></div></button></div>';
        }
        else if (hasKnown) {
            var soloSelected = mode === 'solo', companionSelected = mode === 'companion' && id && COMPANION[id], companionSubtitle = companionSelected ? COMPANION[id].name + ' sélectionné' : (ids.length ? ids.length + ' disponible' + (ids.length > 1 ? 's' : '') : 'Aucun compagnon disponible');
            choiceMarkup = '<div class="companion-choice-actions"><button id="companionSoloBtn" class="companion-choice-button solo-choice ' + (soloSelected ? 'is-selected' : '') + '" aria-pressed="' + (soloSelected ? 'true' : 'false') + '"><span class="companion-choice-icon">○</span><div><strong>Partir seul</strong><small>' + (soloSelected ? 'Choix actuel · sans bonus de compagnon.' : 'Sans bonus de compagnon.') + '</small></div></button><button id="companionChooseBtn" class="companion-choice-button choose-choice ' + (companionSelected ? 'is-selected' : '') + '" aria-pressed="' + (companionSelected ? 'true' : 'false') + '" ' + (chooseDisabled ? 'disabled' : '') + '><span class="companion-choice-icon">✦</span><div><strong>Choisir un compagnon</strong><small>' + companionSubtitle + '</small></div></button></div>';
            summaryMarkup = '<div class="companion-selected-wrap">' + runChoiceSummaryMarkup(regionIndex, mode, id) + '</div>';
            if (mode === 'solo')
                confirmMarkup = '<button id="companionConfirmStart" class="primary companion-start-selected">Démarrer la balade</button>';
            else if (companionSelected)
                confirmMarkup = '<button id="companionConfirmStart" class="primary companion-start-selected">Démarrer la balade</button>';
        }
        else {
            choiceMarkup = '<div class="companion-choice-actions solo-only"><button id="companionSoloBtn" class="companion-choice-button solo-choice primary"><span class="companion-choice-icon">→</span><div><strong>Partir seul</strong><small>Aucun compagnon disponible pour le moment.</small></div></button></div>';
        }
        o.innerHTML = '<div class="companion-picker-panel companion-choice-panel run-setup-panel"><div class="companion-picker-title run-setup-title"><button id="companionPickerClose" class="companion-picker-back" aria-label="Retour aux balades">‹</button><div><p class="eyebrow">Balade niveau ' + level + ' / ' + REGION_MAX_LEVEL + ' · ' + profile.name + '</p><h2>' + r.name + '</h2><small>Prépare ta balade</small></div></div><div class="run-setup-hero">' + img(r.img) + runLoreMarkup() + '</div>' + choiceMarkup + summaryMarkup + trackingSetupMarkup(regionIndex, companionDraft.tracking || '') + confirmMarkup + '</div>';
        $('companionPickerClose').onclick = closePicker;
        $('companionSoloBtn').onclick = function () { if (hasKnown) {
            companionDraft.mode = 'solo';
            companionDraft.selected = '';
            renderLanding();
        }
        else
            startChosen(''); };
        document.querySelectorAll('[data-tracking-resource]').forEach(function (b) { b.onclick = function () { companionDraft.tracking = b.getAttribute('data-tracking-resource') || ''; renderLanding(); }; });
        var choose = $('companionChooseBtn');
        if (choose && !choose.disabled)
            choose.onclick = renderGrid;
        var confirm = $('companionConfirmStart');
        if (confirm)
            confirm.onclick = function () { startChosen(companionDraft.mode === 'companion' ? companionDraft.selected : ''); };
    }
    function renderGrid() {
        o.innerHTML = '<div class="companion-picker-panel companion-grid-panel"><div class="companion-picker-title"><button id="companionGridBack" class="companion-picker-back">‹</button><div><p class="eyebrow">Choisir un compagnon</p><h2>Compagnons</h2><small>' + r.name + ' · touche un portrait</small></div><button id="companionPickerClose">×</button></div><div class="companion-picker-grid">' + ids.map(function (id) { return companionPickerGridCard(id, regionIndex); }).join('') + '</div></div>';
        $('companionGridBack').onclick = renderLanding;
        $('companionPickerClose').onclick = closePicker;
        document.querySelectorAll('[data-grid-companion]').forEach(function (b) { b.onclick = function () { if (b.disabled)
            return; companionDraft.mode = 'companion'; companionDraft.selected = b.getAttribute('data-grid-companion'); renderLanding(); }; });
    }
    renderLanding();
    if (typeof tutorialRunSetupOpened === 'function')
        tutorialRunSetupOpened(regionIndex);
    if (refugeTrackerUnlocked(state) && typeof startMechanicTutorial === 'function')
        startMechanicTutorial('tracker-choice');
    return true;
}
// Préparation de balade unifiée : la balade, le lore et le choix du compagnon vivent dans le même panneau.
prepareRun = function (regionIndex) { if (!isUnlocked(regionIndex)) {
    showToast('Il faut développer le refuge et terminer l’évolution de la balade précédente.');
    return false;
} return openCompanionPicker(regionIndex); };
function gemChestChance(regionIndex) { var base = GEM_CHEST_REGION_CHANCE[Math.max(0, Math.min(GEM_CHEST_REGION_CHANCE.length - 1, regionIndex | 0))], mult = activeLegendaryEffect('trefle') ? (activeCompanionPermanent() ? 1.35 : 1.20) : 1; return Math.min(.95, base * mult); }
function gemChestAttempts(regionIndex, level) { return level + (regionIndex >= 4 ? 1 : 0) + (regionIndex >= 6 ? 1 : 0); }
function gemChestAttemptChance(regionIndex, level) { var tries = Math.max(1, gemChestAttempts(regionIndex, level)); return 1 - Math.pow(1 - gemChestChance(regionIndex), 1 / tries); }
function gemChestAmount(regionIndex, level, rng) { rng = rng || Math.random; var jackpot = GEM_JACKPOT_CHANCE; if (activeLegendaryEffect('trefle'))
    jackpot = activeCompanionPermanent() ? .25 : .18; if ((regionIndex === 0 || regionIndex === REGION.length - 1) && rng() < jackpot)
    return 10; var min = 1 + (regionIndex >= 4 ? 1 : 0) + (regionIndex >= 6 && level >= 2 ? 1 : 0), max = min + (level >= 2 ? 1 : 0) + (level >= 3 ? 1 : 0); return min + Math.floor(rng() * (max - min + 1)); }
function generateGemChests(regionIndex, level, rng, world) { var out = []; if (!state.echoesUnlocked)
    return out; rng = rng || Math.random; var tries = gemChestAttempts(regionIndex, level), chance = gemChestAttemptChance(regionIndex, level); for (var i = 0; i < tries; i++) {
    if (rng() < chance) {
        var p = nodePosition(rng, world);
        out.push({ x: p.x, y: p.y, edge: p.edge, amount: gemChestAmount(regionIndex, level, rng), opened: false, revealed: false, bob: rng() * 6.28 });
    }
} if (activeLegendaryEffect('trefle') && !out.length) {
    var g = nodePosition(rng, world);
    out.push({ x: g.x, y: g.y, edge: g.edge, amount: gemChestAmount(regionIndex, level, rng), opened: false, revealed: false, bob: rng() * 6.28, companionGuaranteed: true });
} return out; }
function openGemChest(ch) { if (!game || !ch || ch.opened)
    return false; ch.opened = true; game.gemChestsOpened = (game.gemChestsOpened || 0) + 1; game.gemChestGems = (game.gemChestGems || 0) + ch.amount; state.gems += ch.amount; save(); showToast('Coffre à Gemmes · +' + ch.amount + ' Gemme' + (ch.amount > 1 ? 's' : '')); duckAudio(ch.amount >= 10 ? 1300 : 800, .42); playSfx(ch.amount >= 10 ? 'chest_jackpot' : 'chest', ch.amount >= 10 ? .9 : .78); vibrate(ch.amount >= 10 ? 70 : 38); return true; }
startRun = function (regionIndex, companionId, trackingResource) {
    var canvas = $('gameCanvas'), r = REGION[regionIndex], level = regionLevel(regionIndex), profile = walkProfile(regionIndex, level), seed = (Date.now() ^ hashString(r.name) ^ state.stats.expeditions ^ (level * 2654435761)) >>> 0, rng = mulberry32(seed), center = profile.world / 2;
    game = { region: regionIndex, level: level, profile: profile, r: r, canvas: canvas, ctx: canvas.getContext('2d'), rng: rng, world: profile.world, player: { x: center, y: center, targetX: center, targetY: center }, nodes: [], decor: [], lightOrbs: [], creatures: [], gemChests: [], gemChestsOpened: 0, gemChestGems: 0, fog: [], coverage: createMapCoverage(profile.world), mapComplete: false, inventory: {}, bag: 0, fullBagStopUsed: false, light: maxLight(), maxLight: maxLight(), last: performance.now(), lastUi: 0, running: true, started: Date.now(), distance: 0, visualDistance: 0, rare: 0, dialogOpen: false, companion: companionId ? { id: companionId, x: center - 42, y: center + 28 } : null, trackingResource: (trackingResource && RESOURCE[trackingResource]) ? trackingResource : '', trackingTarget: null, trackingExhausted: false };
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
    var resourceNodeCount = companionNodeCount(regionIndex, level, companionId);
    for (i = 0; i < resourceNodeCount; i++) {
        var pos = nodePosition(rng, game.world), type = pickNodeResourceWithCompanion(regionIndex, level, pos.edge, rng, companionId), rare = EXCLUSIVE.indexOf(type) >= 0;
        game.nodes.push({ x: pos.x, y: pos.y, edge: pos.edge, type: type, rare: rare, taken: false, revealed: false, near: false, bob: rng() * 6.28 });
    }
    ensureGuaranteedRegionalRares(game.nodes, r, level);
    ensureGuaranteedSignatureResources(game.nodes, r, level);
    ensureCompanionGenerationEffects(game.nodes, r, level, companionId);
    if (game.trackingResource && typeof refreshTrackingTarget === 'function')
        refreshTrackingTarget(true);
    if (typeof tutorialPrepareFirstRun === 'function')
        tutorialPrepareFirstRun(game);
    game.gemChests = generateGemChests(regionIndex, level, rng, game.world);
    var angle = rng() * Math.PI * 2, characterRadius = Math.min(game.world * .34, 245 + level * 105 + regionIndex * 18), cp = { x: center + Math.cos(angle) * characterRadius, y: center + Math.sin(angle) * characterRadius };
    game.creatures.push({ x: cp.x, y: cp.y, type: r.character, seen: false, phase: rng() * 6.28 });
    game.fog.push({ x: center, y: center, r: lightRadius() });
    markMapCoverage(center, center, lightRadius());
    state.visitedRegions = state.visitedRegions || [];
    if (state.visitedRegions.indexOf(regionIndex) < 0)
        state.visitedRegions.push(regionIndex);
    audio.stepDistance = 0;
    playSfx('start_run', .76);
    syncAudioScene(true);
    updateRunUI();
    if (typeof tutorialEvent === 'function')
        tutorialEvent('run-started', { region: regionIndex });
    requestAnimationFrame(gameLoop);
};
function applySolsticeMilestones() { if (!game || !activeLegendaryEffect('solstice'))
    return; game.solsticeMilestones = game.solsticeMilestones || {}; var pct = mapCoveragePercent(), steps = [25, 50, 75], restore = activeCompanionPermanent() ? 30 : 22; for (var i = 0; i < steps.length; i++) {
    var step = steps[i];
    if (pct >= step && !game.solsticeMilestones[step]) {
        game.solsticeMilestones[step] = true;
        var before = game.light;
        game.light = Math.min(game.maxLight, game.light + restore);
        var gained = Math.round((game.light - before) * 10) / 10;
        if (gained > 0) {
            showToast('Solstice · second soleil · +' + gained + '% lumière');
            playSfx('light_orb', .62, 90);
            vibrate(18);
        }
    }
} }
function showGemIntroduction() { state.echoesIntroSeen = true; save(); renderEchoVisibility(); showModal('gemme.svg', 'Une nouvelle lueur', '<p>En faisant évoluer ton premier chemin, tu as découvert <strong>10 Gemmes</strong>.</p><p>Les Gemmes servent uniquement à la <strong>Lanterne des échos</strong>. Elles permettent d’appeler des compagnons qui peuvent modifier les ressources d’une balade.</p><p>Les coffres à Gemmes peuvent désormais apparaître rarement pendant tes balades.</p>', '<button class="primary" id="discoverEchoesBtn">Découvrir les Échos</button>'); $('discoverEchoesBtn').onclick = function () { hideModal(true); showScreen('echoesScreen'); }; }
function evolutionGemReward(fromLevel) { return fromLevel >= 3 ? 5 : GEM_EVOLUTION_REWARD; }
function grantEvolutionGems(fromLevel) { var first = !state.echoesUnlocked, reward = evolutionGemReward(fromLevel); state.echoesUnlocked = true; state.gems += reward; renderEchoVisibility(); return { first: first, reward: reward }; }
buyRegionUpgrade = function (i) {
    if (!isUnlocked(i))
        return;
    var level = regionLevel(i);
    if (level >= REGION_MAX_LEVEL)
        return;
    var cost = regionUpgradeCost(i, level);
    if (!hasCost(cost)) {
        showRegionUpgradeNeedsModal(i, cost);
        return;
    }
    var before = unlockedCount(state);
    payCost(cost);
    state.regionLevels[i] = level + 1;
    if (level === 3)
        markBalanceV32FourthPaid(i);
    var gemReward = grantEvolutionGems(level), firstEcho = gemReward.first, after = unlockedCount(state);
    save();
    playSfx('region_upgrade', .76);
    renderRegions();
    var p = walkProfile(i, level + 1), newPath = after > before ? '<p><strong>Nouveau chemin :</strong> ' + REGION[after - 1].name + ' est maintenant accessible.</p>' : '';
    showModal(REGION[i].img, REGION[i].name + ' grandit', '<p>La balade atteint le niveau ' + (level + 1) + ' sur ' + REGION_MAX_LEVEL + '.</p><p><strong>' + p.name + '</strong><br>' + p.desc + '. La zone est maintenant plus vaste, et les chemins éloignés deviennent plus généreux.</p><p><strong>' + RESOURCE[REGION[i].signature].name + '</strong> reste la ressource-signature de ce chemin et sert à ses évolutions.</p><p><strong>' + RESOURCE[REGION[i].unique].name + '</strong> est la ressource régionale de cette balade.' + (level + 1 >= 2 ? ' Elle peut maintenant apparaître.' : '') + '</p>' + newPath + '<div class="evolution-gem-reward">' + img('gemme.svg') + '<div><strong>+' + gemReward.reward + ' Gemmes</strong><small>Une invitation pour la Lanterne des échos.</small></div></div>');
    if (firstEcho) {
        $('modalClose').onclick = function () { hideModal(true); showGemIntroduction(); };
    }
};
