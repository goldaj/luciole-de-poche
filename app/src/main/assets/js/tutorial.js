'use strict';
// Onboarding guidé et moteur de surbrillance réutilisable pour les mécaniques découvertes plus tard.
var tutorialRefreshTimer = 0;
var tutorialMechanicRegistry = Object.create(null);
var tutorialBlockBound = false;

var CORE_TUTORIAL_STEPS = {
    'run-bag': {
        target: '#runBagHud', eyebrow: 'Pendant une balade', title: 'Ta sacoche',
        text: 'Elle indique la place utilisée. Quand elle est pleine, il est temps de penser au retour.',
        button: 'Et la lumière ?', next: 'run-light'
    },
    'run-light': {
        target: '#runLightHud', eyebrow: 'Pendant une balade', title: 'Ta lumière',
        text: 'La lumière baisse quand tu marches. Les zones déjà découvertes restent visibles, mais deviennent moins nettes quand elle faiblit.',
        button: 'Et les boules de lumière ?', next: 'run-light-orbs'
    },
    'run-light-orbs': {
        target: '#gameCanvas', padding: 6, eyebrow: 'Dans la brume', title: 'Boules de lumière',
        text: 'Ces boules créent un petit halo dans la brume. Elles peuvent rendre certaines choses plus faciles à repérer autour d’elles, même quand elles sont loin de toi.',
        button: 'Et la carte ?', next: 'run-map-progress'
    },
    'run-map-progress': {
        target: '.map-progress-pill', eyebrow: 'Explorer la carte', title: 'Pourcentage de complétion',
        text: 'Ce pourcentage indique la part de la carte que tu as réellement explorée. Atteindre 100 % permet de compléter entièrement cette balade.',
        button: 'Voir les besoins', next: 'run-needs'
    },
    'run-needs': {
        target: '#runNeedsBtn', eyebrow: 'Préparer la suite', title: 'Ce qu’il te manque',
        text: 'Le bouton Besoins te montre les ressources encore utiles pour faire évoluer la balade ou améliorer le refuge. Tu peux le consulter pendant la balade pour savoir quoi chercher.',
        button: 'Marcher', next: 'run-move'
    },
    'run-move': {
        target: '#gameCanvas', padding: 6, eyebrow: 'À toi', title: 'Maintiens pour marcher',
        text: 'Pose le doigt dans la direction voulue. Tant que tu le gardes posé, ton explorateur continue d’avancer.',
        action: true, allow: '#gameCanvas'
    },
    'run-gather': {
        target: '#gameCanvas', padding: 6, eyebrow: 'Premières trouvailles', title: 'Prépare ta Sacoche',
        text: '', action: true, allow: '#gameCanvas'
    },
    'run-return': {
        target: '#returnBtn', eyebrow: 'Tout est prêt', title: 'Rentre au refuge',
        text: 'Tu as ce qu’il faut pour ta première amélioration. Rentre maintenant au refuge.',
        action: true, allow: '#returnBtn'
    },
    'run-summary': {
        target: '#modalClose', eyebrow: 'Fin de balade', title: 'Ce que tu rapportes',
        text: 'Au retour, tout le contenu de la sacoche rejoint tes réserves. On va maintenant utiliser une partie de ces ressources.',
        action: true, allow: '#modalClose'
    },
    'refuge-intro': {
        target: '.refuge-scene', eyebrow: 'Le refuge', title: 'Faire grandir le camp',
        text: 'Les améliorations du refuge changent durablement tes prochaines balades. Commençons par quelque chose de très simple.',
        button: 'Améliorer la Sacoche', next: 'refuge-bag'
    },
    'refuge-bag': {
        target: '[data-upgrade="bag"]', eyebrow: 'Première amélioration', title: 'Sacoche niveau 2',
        text: 'Cette première évolution est volontairement légère : 2 Graines et 2 Galets pour un petit peu plus de place. Touche Améliorer.',
        action: true, allow: '[data-upgrade="bag"]'
    },
    'refuge-done': {
        target: '[data-upgrade="bag"]', eyebrow: 'C’est parti', title: 'Ton refuge peut évoluer',
        text: 'Tu connais maintenant la boucle essentielle : partir, rapporter, améliorer. Les nouvelles mécaniques seront expliquées de la même manière quand elles apparaîtront.',
        button: 'Terminer', next: 'complete'
    }
};

function tutorialData() { return state && state.tutorial ? state.tutorial : null; }
function tutorialCoreStage() { var data = tutorialData(); return data ? data.coreStage || 'complete' : 'complete'; }
function tutorialCoreActive() { var stage = tutorialCoreStage(); return stage !== 'complete' && stage !== 'waiting-run'; }
function tutorialCoreIsFirstRun() { var stage = tutorialCoreStage(); return stage !== 'complete' && stage !== 'waiting-run' && (state.stats && state.stats.expeditions || 0) === 0; }
function tutorialCoreStep() { return CORE_TUTORIAL_STEPS[tutorialCoreStage()] || null; }
function tutorialSetCoreStage(stage) {
    var data = tutorialData();
    if (!data)
        return;
    data.coreStage = stage || 'complete';
    save();
    tutorialScheduleRefresh();
}

function registerMechanicTutorial(id, steps) {
    if (!id || !Array.isArray(steps) || !steps.length)
        return false;
    tutorialMechanicRegistry[id] = steps.slice();
    return true;
}
registerMechanicTutorial('tracker-choice', [
    {
        target: '.tracking-setup', eyebrow: 'Nouvel outil du refuge', title: 'Aiguille des trouvailles',
        text: 'Avant de partir, tu peux choisir une ressource à suivre. « Aucune » est sélectionné par défaut si tu préfères explorer librement.',
        button: 'Compris'
    }
]);

function startMechanicTutorial(id) {
    var data = tutorialData(), steps = tutorialMechanicRegistry[id];
    if (!data || tutorialCoreActive() || !steps || !steps.length || data.seenMechanics[id])
        return false;
    data.activeMechanic = id;
    data.mechanicStep = 0;
    save();
    tutorialScheduleRefresh();
    return true;
}
function tutorialActiveMechanicStep() {
    var data = tutorialData();
    if (!data || !data.activeMechanic)
        return null;
    var steps = tutorialMechanicRegistry[data.activeMechanic] || [];
    return steps[data.mechanicStep] || null;
}
function tutorialFinishMechanic() {
    var data = tutorialData();
    if (!data || !data.activeMechanic)
        return;
    data.seenMechanics[data.activeMechanic] = true;
    data.activeMechanic = '';
    data.mechanicStep = 0;
    save();
    tutorialScheduleRefresh();
}
function tutorialAdvanceMechanic() {
    var data = tutorialData(), steps = data && tutorialMechanicRegistry[data.activeMechanic];
    if (!data || !steps)
        return;
    data.mechanicStep++;
    if (data.mechanicStep >= steps.length)
        tutorialFinishMechanic();
    else {
        save();
        tutorialScheduleRefresh();
    }
}

function tutorialGatherReady() {
    if (!game || !game.inventory)
        return false;
    return (game.inventory.seed || 0) >= 2 && (game.inventory.pebble || 0) >= 2;
}
function tutorialGatherText() {
    var seed = game && game.inventory ? Math.min(2, game.inventory.seed || 0) : 0;
    var pebble = game && game.inventory ? Math.min(2, game.inventory.pebble || 0) : 0;
    return 'Marche près des ressources pour les ramasser automatiquement. Pour préparer ta Sacoche : Graines ' + seed + ' / 2 · Galets ' + pebble + ' / 2.';
}
function tutorialPrepareFirstRun(run) {
    if (!run || tutorialCoreStage() !== 'waiting-run' || (state.stats.expeditions || 0) !== 0)
        return false;
    var cx = run.player.x, cy = run.player.y, radius = 72;
    var guided = [
        { type: 'seed', x: cx + radius, y: cy },
        { type: 'pebble', x: cx, y: cy + radius },
        { type: 'seed', x: cx - radius, y: cy },
        { type: 'pebble', x: cx, y: cy - radius }
    ];
    guided.forEach(function (entry, index) {
        run.nodes.unshift({
            x: Math.max(28, Math.min(run.world - 28, entry.x)),
            y: Math.max(28, Math.min(run.world - 28, entry.y)),
            edge: 0, type: entry.type, rare: false, taken: false, revealed: true,
            near: false, bob: index * 1.4, tutorial: true
        });
    });
    return true;
}

function tutorialEvent(name, payload) {
    var stage = tutorialCoreStage();
    if (stage === 'waiting-run' && name === 'run-started')
        tutorialSetCoreStage('run-bag');
    else if (stage === 'run-move' && name === 'walk-started')
        tutorialSetCoreStage('run-gather');
    else if (stage === 'run-gather' && name === 'resource-collected') {
        if (tutorialGatherReady())
            tutorialSetCoreStage('run-return');
        else
            tutorialScheduleRefresh();
    }
    else if (stage === 'run-return' && name === 'first-run-ended')
        tutorialSetCoreStage('run-summary');
    else if (stage === 'run-summary' && name === 'run-summary-closed')
        tutorialSetCoreStage('refuge-intro');
    else if (stage === 'refuge-bag' && name === 'bag-upgraded')
        tutorialSetCoreStage('refuge-done');

    var mechanic = tutorialActiveMechanicStep();
    if (mechanic && mechanic.expectEvent === name)
        tutorialAdvanceMechanic();
}
function tutorialScreenChanged(id) { tutorialScheduleRefresh(); }

function tutorialRunSetupOpened(regionIndex) {
    // La carte et la préparation restent libres : le tutoriel démarre seulement une fois la balade lancée.
    tutorialScheduleRefresh();
}
function tutorialAfterFirstRunSummaryClosed() {
    if (tutorialCoreStage() !== 'run-summary')
        return false;
    tutorialEvent('run-summary-closed');
    showScreen('refugeScreen');
    return true;
}
function tutorialOnBagUpgrade(previousLevel, newLevel) {
    if (tutorialCoreStage() === 'refuge-bag' && previousLevel === 1 && newLevel === 2)
        tutorialEvent('bag-upgraded');
}
function tutorialHandleSystemBack() {
    if (!tutorialCoreActive() && !tutorialActiveMechanicStep())
        return false;
    if (typeof showToast === 'function')
        showToast('Suis l’élément en surbrillance pour continuer le tutoriel.');
    return true;
}

function tutorialNext() {
    var step = tutorialCoreStep();
    if (step && step.next) {
        tutorialSetCoreStage(step.next);
        return;
    }
    var mechanic = tutorialActiveMechanicStep();
    if (mechanic && !mechanic.action)
        tutorialAdvanceMechanic();
}
function tutorialSkipCurrent() {
    var data = tutorialData();
    if (!data)
        return;
    if (tutorialCoreActive()) {
        data.coreStage = 'complete';
        save();
        tutorialScheduleRefresh();
        return;
    }
    if (data.activeMechanic)
        tutorialFinishMechanic();
}
function tutorialCurrentStep() {
    if (tutorialCoreActive()) {
        var step = tutorialCoreStep();
        if (step && tutorialCoreStage() === 'run-gather') {
            var dynamic = {};
            Object.keys(step).forEach(function (key) { dynamic[key] = step[key]; });
            dynamic.text = tutorialGatherText();
            return dynamic;
        }
        return step;
    }
    return tutorialActiveMechanicStep();
}
function tutorialAllowedSelector(step) {
    if (!step || !step.action)
        return '';
    return step.allow || step.target || '';
}
function tutorialEventAllowedTarget(target, step) {
    if (!target)
        return false;
    if (target.closest && target.closest('#tutorialCoach'))
        return true;
    var selector = tutorialAllowedSelector(step);
    if (!selector || !target.closest)
        return false;
    try { return !!target.closest(selector); }
    catch (_) { return false; }
}
function tutorialBlockInput(event) {
    var step = tutorialCurrentStep();
    if (!step)
        return;
    if (tutorialEventAllowedTarget(event.target, step))
        return;
    if (event.type === 'keydown' && ['Shift', 'Control', 'Alt', 'Meta'].indexOf(event.key) >= 0)
        return;
    if (event.cancelable)
        event.preventDefault();
    if (event.stopImmediatePropagation)
        event.stopImmediatePropagation();
    else if (event.stopPropagation)
        event.stopPropagation();
}
function tutorialBindInputGuard() {
    if (tutorialBlockBound)
        return;
    tutorialBlockBound = true;
    ['pointerdown', 'click', 'touchstart'].forEach(function (type) { document.addEventListener(type, tutorialBlockInput, true); });
    document.addEventListener('keydown', tutorialBlockInput, true);
    window.addEventListener('resize', tutorialScheduleRefresh);
    window.addEventListener('scroll', tutorialScheduleRefresh, true);
}
function tutorialHide() {
    var layer = $('tutorialLayer');
    if (layer)
        layer.classList.add('hidden');
}
function tutorialScheduleRefresh() {
    clearTimeout(tutorialRefreshTimer);
    tutorialRefreshTimer = setTimeout(tutorialRefresh, 24);
}
function tutorialTargetRect(target, step) {
    var rect = target.getBoundingClientRect(), pad = Math.max(6, Number(step && step.padding) || 8);
    return {
        left: Math.max(6, rect.left - pad), top: Math.max(6, rect.top - pad),
        width: Math.max(42, Math.min(window.innerWidth - 12, rect.width + pad * 2)),
        height: Math.max(42, Math.min(window.innerHeight - 12, rect.height + pad * 2)),
        right: Math.min(window.innerWidth - 6, rect.right + pad),
        bottom: Math.min(window.innerHeight - 6, rect.bottom + pad)
    };
}
function tutorialPositionCoach(rect) {
    var coach = $('tutorialCoach');
    if (!coach)
        return;
    var margin = 12, width = Math.min(340, window.innerWidth - 24);
    coach.style.width = width + 'px';
    coach.style.left = Math.max(12, Math.min(window.innerWidth - width - 12, rect.left + rect.width / 2 - width / 2)) + 'px';
    coach.style.top = '12px';
    requestAnimationFrame(function () {
        var height = coach.offsetHeight || 180, below = window.innerHeight - rect.bottom, above = rect.top;
        var top = below >= height + 22 || below >= above ? rect.bottom + margin : rect.top - height - margin;
        top = Math.max(12, Math.min(window.innerHeight - height - 12, top));
        coach.style.top = top + 'px';
        coach.classList.toggle('tutorial-coach-above', top < rect.top);
    });
}
function tutorialRefresh() {
    var layer = $('tutorialLayer'), spot = $('tutorialSpotlight'), coach = $('tutorialCoach');
    if (!layer || !spot || !coach)
        return;
    var step = tutorialCurrentStep();
    if (!step) {
        tutorialHide();
        return;
    }
    var target = null;
    try { target = step.target ? document.querySelector(step.target) : null; }
    catch (_) { target = null; }
    if (!target || !target.getBoundingClientRect) {
        layer.classList.add('hidden');
        tutorialRefreshTimer = setTimeout(tutorialRefresh, 90);
        return;
    }
    var raw = target.getBoundingClientRect();
    if (currentScreen !== 'expeditionScreen' && (raw.bottom < 12 || raw.top > window.innerHeight - 12) && target.scrollIntoView) {
        try { target.scrollIntoView({ block: 'center', behavior: 'auto' }); }
        catch (_) { target.scrollIntoView(); }
        raw = target.getBoundingClientRect();
    }
    var rect = tutorialTargetRect(target, step);
    spot.style.left = rect.left + 'px';
    spot.style.top = rect.top + 'px';
    spot.style.width = rect.width + 'px';
    spot.style.height = rect.height + 'px';
    $('tutorialEyebrow').textContent = step.eyebrow || 'Tutoriel';
    $('tutorialTitle').textContent = step.title || '';
    $('tutorialText').textContent = step.text || '';
    var skip = $('tutorialSkipBtn');
    if (skip) {
        skip.classList.remove('hidden');
        skip.onclick = tutorialSkipCurrent;
    }
    var next = $('tutorialNextBtn');
    if (step.button) {
        next.textContent = step.button;
        next.classList.remove('hidden');
        next.onclick = tutorialNext;
    }
    else {
        next.classList.add('hidden');
        next.onclick = null;
    }
    var hint = $('tutorialActionHint');
    hint.textContent = step.action ? 'Touche la zone éclairée pour continuer' : '';
    hint.classList.toggle('hidden', !step.action);
    layer.classList.remove('hidden');
    tutorialPositionCoach(rect);
}

function tutorialBoot() {
    tutorialBindInputGuard();
    tutorialScheduleRefresh();
}
