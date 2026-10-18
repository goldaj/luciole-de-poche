'use strict';
// Test A/B switch between the historical v3.2.7 2D presentation and the current v4 2.5D presentation.
// Save data and game rules remain shared. The selected mode changes rendering, menu skin and resource art.
(function () {
    var STORAGE_KEY = 'luciole_walk_render_mode_test';
    var MODE_2D = '2d', MODE_ISO = 'iso';
    var LEGACY_RESOURCE_ICONS = {
        seed:'graine.svg', berry:'baie.svg', pebble:'galet.svg', leaf:'feuille.svg', shell:'coquillage.svg', glow:'luciole.svg',
        mushroom:'champignon.svg', pearl:'perle.svg', flower:'fleur.svg', waterlily:'nenuphar.svg', crystal:'cristal.svg',
        echostone:'pierre_echo.svg', moonpollen:'pollen_lunaire.svg', cloudfeather:'plume_nuage.svg', moss:'mousse.svg',
        glass:'verre_mer.svg', acorn:'gland.svg', reed:'roseau.svg', cloud:'graine_nuage.svg', prism:'prisme.svg',
        dew:'rosee.svg', amber:'ambre.svg'
    };
    var iso = {
        drawGame: typeof drawGame === 'function' ? drawGame : null,
        screenToWorld: typeof screenToWorld === 'function' ? screenToWorld : null,
        getCamera: typeof getCamera === 'function' ? getCamera : null,
        movement: typeof isometricMovementSpeedMultiplier === 'function' ? isometricMovementSpeedMultiplier : null,
        visualStep: typeof isometricVisualDistanceStep === 'function' ? isometricVisualDistanceStep : null,
        boundaryInset: typeof walkBoundaryInset === 'function' ? walkBoundaryInset : null,
        targetCollision: typeof walkResolveTargetPosition === 'function' ? walkResolveTargetPosition : null,
        playerCollision: typeof walkResolvePlayerPosition === 'function' ? walkResolvePlayerPosition : null
    };
    var legacy = typeof WALK_RENDER_LEGACY_2D !== 'undefined' ? WALK_RENDER_LEGACY_2D : {};
    var finalUpdateRunUI = typeof updateRunUI === 'function' ? updateRunUI : null;
    var finalStartRun = typeof startRun === 'function' ? startRun : null;

    Object.keys(RESOURCE || {}).forEach(function (key) {
        if (!RESOURCE[key].v4Icon) RESOURCE[key].v4Icon = RESOURCE[key].icon;
        if (!RESOURCE[key].legacyIcon) RESOURCE[key].legacyIcon = LEGACY_RESOURCE_ICONS[key] || RESOURCE[key].icon;
    });

    function normalize(value) { return value === MODE_2D ? MODE_2D : MODE_ISO; }
    function current() {
        try { return normalize(localStorage.getItem(STORAGE_KEY)); }
        catch (e) { return MODE_ISO; }
    }
    function syncModeButton() {
        var twoD = current() === MODE_2D, button = document.getElementById('walkRenderModeToggle'), label = document.getElementById('walkRenderModeToggleLabel'), hint = document.getElementById('walkRenderModeHint');
        if (label) label.textContent = twoD ? '2D' : '2.5D';
        if (button) {
            button.classList.toggle('is-legacy', twoD);
            button.setAttribute('aria-pressed', twoD ? 'true' : 'false');
            button.title = twoD ? 'Mode 2D v3.2.7 actif' : 'Mode 2.5D v4 actif';
        }
        if (hint) hint.textContent = twoD ? 'Menu, balade et ressources utilisent la présentation historique v3.2.7.' : 'Menu, balade et ressources utilisent la présentation 2.5D v4.';
    }
    function applyResourceIcons(twoD) {
        Object.keys(RESOURCE || {}).forEach(function (key) {
            RESOURCE[key].icon = twoD ? RESOURCE[key].legacyIcon : RESOURCE[key].v4Icon;
        });
    }
    function applyPresentation(reloadImages) {
        var twoD = current() === MODE_2D, sheet = document.getElementById('v4CommercialStyles'), app = document.getElementById('app');
        if (sheet) sheet.disabled = twoD;
        if (app) app.classList.toggle('legacy-2d-ui', twoD);
        document.body.classList.toggle('legacy-2d-ui', twoD);
        applyResourceIcons(twoD);
        syncModeButton();
        if (reloadImages && typeof loadImages === 'function') loadImages(function () {});
        syncLegacyRunHud();
    }
    function setMode(mode) {
        mode = normalize(mode);
        try { localStorage.setItem(STORAGE_KEY, mode); } catch (e) {}
        applyPresentation(true);
        if (typeof currentScreen !== 'undefined' && currentScreen === 'optionsScreen' && typeof renderOptions === 'function') renderOptions();
        return mode;
    }
    window.walkRenderMode = current;
    window.setWalkRenderMode = setMode;
    window.toggleWalkRenderMode = function () { return setMode(current() === MODE_2D ? MODE_ISO : MODE_2D); };
    window.walkRenderModeLabel = function () { return current() === MODE_2D ? '2D v3.2.7' : '2.5D v4'; };
    window.syncWalkRenderModeOptions = syncModeButton;

    drawGame = function (t) {
        if (current() === MODE_2D && legacy.drawGame) return legacy.drawGame(t);
        return iso.drawGame ? iso.drawGame(t) : undefined;
    };
    screenToWorld = function (clientX, clientY) {
        if (current() === MODE_2D && legacy.screenToWorld) return legacy.screenToWorld(clientX, clientY);
        return iso.screenToWorld ? iso.screenToWorld(clientX, clientY) : { x: 0, y: 0 };
    };
    getCamera = function () {
        if (current() === MODE_2D && legacy.getCamera) return legacy.getCamera();
        return iso.getCamera ? iso.getCamera() : { x: 0, y: 0 };
    };
    isometricMovementSpeedMultiplier = function (dx, dy) {
        if (current() === MODE_2D) return 1;
        return iso.movement ? iso.movement(dx, dy) : 1;
    };
    isometricVisualDistanceStep = function (dx, dy, worldStep) {
        if (current() === MODE_2D) return worldStep;
        return iso.visualStep ? iso.visualStep(dx, dy, worldStep) : worldStep;
    };
    walkBoundaryInset = function () {
        if (current() === MODE_2D) return 25;
        return iso.boundaryInset ? iso.boundaryInset() : 25;
    };
    walkResolveTargetPosition = function (x, y) {
        if (current() === MODE_2D || !iso.targetCollision) return { x: x, y: y };
        return iso.targetCollision(x, y);
    };
    walkResolvePlayerPosition = function (x, y, previousX, previousY) {
        if (current() === MODE_2D || !iso.playerCollision) return { x: x, y: y };
        return iso.playerCollision(x, y, previousX, previousY);
    };

    function syncLegacyRunHud() {
        if (!game) return;
        var bag = document.getElementById('legacyBagLabel'), light = document.getElementById('legacyLightLabel'), map = document.getElementById('legacyMapLabel'), inv = document.getElementById('legacyRunInventory'), needs = document.getElementById('legacyRunNeedsBtn');
        if (bag) bag.textContent = game.bag + ' / ' + bagCapacity();
        if (light) light.textContent = Math.ceil(game.light) + '%';
        if (map) map.textContent = mapCoveragePercent() + '%';
        if (inv) inv.innerHTML = Object.keys(game.inventory).map(function (key) { return '<span class="mini-resource">' + img(RESOURCE[key].icon) + game.inventory[key] + '</span>'; }).join('');
        var sourceNeeds = document.getElementById('runNeedsBtn');
        if (needs && sourceNeeds) needs.classList.toggle('hidden', sourceNeeds.classList.contains('hidden'));
    }
    if (finalUpdateRunUI) updateRunUI = function () { var result = finalUpdateRunUI.apply(this, arguments); syncLegacyRunHud(); return result; };
    if (finalStartRun) startRun = function () { var result = finalStartRun.apply(this, arguments); syncLegacyRunHud(); return result; };

    var legacyReturn = document.getElementById('legacyReturnBtn');
    if (legacyReturn) legacyReturn.addEventListener('click', function () { if (typeof endRun === 'function') endRun(); });
    var legacyNeeds = document.getElementById('legacyRunNeedsBtn');
    if (legacyNeeds) legacyNeeds.addEventListener('click', function () { if (typeof showRunNeeds === 'function') showRunNeeds(); });
    var optionsToggle = document.getElementById('walkRenderModeToggle');
    if (optionsToggle) optionsToggle.addEventListener('click', function () { window.toggleWalkRenderMode(); });

    // Apply before bootstrap renders the first screen and before loadImages captures RESOURCE icons.
    applyPresentation(false);
})();
