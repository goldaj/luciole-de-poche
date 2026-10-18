'use strict';
// Screen rendering, modals, journal, options and navigation.
function showScreen(id, fromBack) {
    if (game && id !== 'expeditionScreen' && currentScreen === 'expeditionScreen')
        return;
    if (id === 'tradeScreen' && !state.gameWon)
        id = 'homeScreen';
    if ((id === 'echoesScreen' || id === 'gemShopScreen') && !state.echoesUnlocked)
        id = 'homeScreen';
    if (!fromBack && id !== currentScreen && currentScreen !== 'endingScreen') {
        if (id === 'homeScreen')
            screenHistory = [];
        else if (currentScreen !== 'expeditionScreen') {
            if (screenHistory[screenHistory.length - 1] !== currentScreen)
                screenHistory.push(currentScreen);
            if (screenHistory.length > 12)
                screenHistory.shift();
        }
    }
    var ending = id === 'endingScreen';
    document.querySelectorAll('.screen').forEach(function (s) { s.classList.toggle('active', s.id === id); });
    document.querySelectorAll('.bottom-nav button').forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-screen') === id); });
    currentScreen = id;
    $('app').classList.toggle('ending-mode', ending);
    $('app').classList.toggle('expedition-mode', id === 'expeditionScreen');
    $('bottomNav').classList.toggle('hidden', id === 'expeditionScreen' || ending);
    $('backBtn').classList.toggle('hidden', id === 'homeScreen' || id === 'expeditionScreen' || ending);
    if ($('optionsBtn'))
        $('optionsBtn').classList.toggle('hidden', id === 'expeditionScreen' || ending);
    if (id === 'homeScreen') {
        renderHome();
        setTimeout(showOfflineGainPopup, 90);
    }
    if (id === 'mapScreen')
        renderRegions();
    if (id === 'refugeScreen')
        renderRefuge();
    if (id === 'journalScreen')
        renderJournal();
    if (id === 'tradeScreen')
        renderTrade();
    if (id === 'optionsScreen')
        renderOptions();
    if (id === 'echoesScreen')
        renderEchoes();
    if (id === 'gemShopScreen')
        renderGemShopScreen();
    renderEchoVisibility();
    var titles = { homeScreen: 'Un refuge au bout du trajet', mapScreen: 'Choisir une balade', refugeScreen: 'Faire grandir le camp', journalScreen: 'Tout noter', tradeScreen: 'Échanger les surplus', optionsScreen: 'Options et parties', echoesScreen: 'Appeler des compagnons', gemShopScreen: 'Boutique de Gemmes', endingScreen: 'Merci d’avoir joué' };
    $('subtitle').textContent = titles[id] || 'Une petite balade';
    if (!fromBack && id !== 'expeditionScreen' && !ending)
        window.scrollTo(0, 0);
    syncAudioScene();
    updateBottomNavNotifications();
    if (typeof tutorialScreenChanged === 'function')
        tutorialScreenChanged(id);
}
function renderHome() {
    var hour = new Date().getHours();
    var explore = $('exploreBtn');
    if (explore) explore.classList.toggle('first-walk-attention', ((state.stats && state.stats.expeditions) || 0) === 0);
    $('greeting').textContent = (hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir') + ', voyageur';
    var g = state.offlineGain || { hours: 0 }, offlineTotal = Object.keys(g).filter(function (k) { return k !== 'hours'; }).reduce(function (sum, k) { return sum + (g[k] || 0); }, 0);
    $('offlineMessage').textContent = offlineTotal ? 'Le jardin a préparé ' + offlineTotal + ' ressource' + (offlineTotal > 1 ? 's' : '') + ' pendant ton absence.' : 'Les lucioles ont veillé pendant ton absence.';
    if ($('activeSaveLabel'))
        $('activeSaveLabel').textContent = 'Partie ' + activeSaveSlot + ' active';
    var tradeMenu = $('tradeMenuBtn');
    if (tradeMenu)
        tradeMenu.classList.toggle('hidden', !state.gameWon);
    $('streakLabel').textContent = '☀ ' + state.streak + ' jour' + (state.streak > 1 ? 's' : '') + ' de suite';
    var q = state.daily, dailyVisible = !!q, dailyTitle = $('dailySectionTitle'), dailyCard = $('dailyCard');
    if (dailyTitle) dailyTitle.classList.toggle('hidden', !dailyVisible);
    if (dailyCard) dailyCard.classList.toggle('hidden', !dailyVisible);
    if (dailyVisible) {
        var p = Math.min(100, Math.round(q.progress / q.target * 100)), dailyPending = !q.claimed && q.progress < q.target, dailyReady = !q.claimed && q.progress >= q.target;
        var dailyRight = dailyPending ? '<span class="daily-reward-total" aria-hidden="true">+' + Object.values(q.reward).reduce(function (a, b) { return a + b; }, 0) + '</span>' : dailyReady ? '<button class="claim" id="claimBtn">Recevoir</button>' : '<span class="daily-claimed">Reçu</span>';
        dailyCard.classList.toggle('daily-card-clickable', dailyPending);
        dailyCard.setAttribute('aria-label', dailyPending ? 'Voir les récompenses de la quête journalière' : 'Quête journalière');
        dailyCard.setAttribute('tabindex', dailyPending ? '0' : '-1');
        dailyCard.setAttribute('role', dailyPending ? 'button' : 'group');
        dailyCard.innerHTML = '<div class="quest-row"><div class="quest-icon">' + (q.type === 'collect' ? '🧺' : q.type === 'walk' ? '🥾' : '✨') + '</div><div class="quest-copy"><strong>' + q.title + '</strong><small>' + q.text + ' ' + q.progress + ' / ' + q.target + '</small>' + (dailyPending ? '<span class="daily-reward-hint">Voir les récompenses</span>' : '') + '<div class="progress"><i style="width:' + p + '%"></i></div></div>' + dailyRight + '</div>';
        dailyCard.onclick = dailyPending ? showDailyRewards : null;
        dailyCard.onkeydown = dailyPending ? function (e) { if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            showDailyRewards();
        } } : null;
        if ($('claimBtn')) $('claimBtn').onclick = function (e) { e.stopPropagation(); claimDaily(); };
    } else if (dailyCard) {
        dailyCard.classList.remove('daily-card-clickable');
        dailyCard.innerHTML = '';
        dailyCard.onclick = null;
        dailyCard.onkeydown = null;
        dailyCard.removeAttribute('aria-label');
        dailyCard.removeAttribute('tabindex');
        dailyCard.removeAttribute('role');
    }
    renderFinalGoal();
    renderEchoVisibility();
}
// La notion de compagnons reste cachée tant que le joueur n'a encore jamais obtenu de Gemme
// et n'a découvert aucun compagnon. echoesUnlocked sert de mémoire durable après dépense des Gemmes.
function companionConceptKnown(s) {
    s = s || state || {};
    if (s.echoesUnlocked || Number(s.gems) > 0 || Number(s.gachaPulls) > 0)
        return true;
    if (Array.isArray(s.companionPermanent) && s.companionPermanent.length)
        return true;
    if (Array.isArray(s.companionDiscovered) && s.companionDiscovered.length)
        return true;
    var stores = [s.companionFragments, s.companionSurplus];
    for (var i = 0; i < stores.length; i++) {
        var o = stores[i] || {};
        for (var k in o)
            if (Number(o[k]) > 0)
                return true;
    }
    return false;
}
function itemNoticeSeen(screen, key) {
    var seen = (state && state.itemSeenNotices && state.itemSeenNotices[screen]) || [];
    return seen.indexOf(key) >= 0;
}
function itemNoticePending(screen, key) {
    return !!key && menuNoticeKeys(screen).indexOf(key) >= 0 && !itemNoticeSeen(screen, key);
}
function pageNoticePills(screen, notices) {
    var html = (notices || []).filter(function (notice) { return notice && itemNoticePending(screen, notice.key); }).map(function (notice) {
        return '<span class="page-notice-pill">' + (notice.label || 'Nouveau') + '</span>';
    }).join('');
    return html ? '<span class="page-notice-pills">' + html + '</span>' : '';
}
function itemNoticeData(screen, keys) {
    var pending = (keys || []).filter(function (key) { return itemNoticePending(screen, key); });
    return pending.length ? ' data-item-notice-screen="' + screen + '" data-item-notice-keys="' + pending.join('|') + '"' : '';
}
function markItemNoticesSeen(screen, keys) {
    if (!state || !screen)
        return false;
    state.itemSeenNotices = state.itemSeenNotices || {};
    var seen = state.itemSeenNotices[screen] || (state.itemSeenNotices[screen] = []), changed = false;
    (keys || []).forEach(function (key) { if (key && seen.indexOf(key) < 0) { seen.push(key); changed = true; } });
    if (changed)
        save();
    return changed;
}
function bindItemNoticeMarkers(root) {
    var scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll('[data-item-notice-keys]').forEach(function (el) {
        if (el._itemNoticeBound)
            return;
        el._itemNoticeBound = true;
        el.addEventListener('click', function () {
            var screen = el.getAttribute('data-item-notice-screen'), keys = (el.getAttribute('data-item-notice-keys') || '').split('|').filter(Boolean);
            if (markItemNoticesSeen(screen, keys)) {
                el.classList.remove('has-page-notice');
                el.querySelectorAll('.page-notice-pills').forEach(function (pill) { pill.remove(); });
                if (screen === 'journalScreen')
                    document.querySelectorAll('#journalTabs button').forEach(function (button) { button.classList.toggle('has-page-notification', journalTabHasNew(button.getAttribute('data-tab'))); });
            }
        }, true);
    });
}
function initializeItemNoticeBaselineFromMenu() {
    if (!state)
        return false;
    state.itemSeenNotices = state.itemSeenNotices || {};
    ['mapScreen', 'refugeScreen', 'journalScreen', 'echoesScreen'].forEach(function (screen) {
        state.itemSeenNotices[screen] = ((state.menuSeenNotices && state.menuSeenNotices[screen]) || []).slice();
    });
    return true;
}
function journalTabHasNew(tab) {
    var prefixes = tab === 'collections' ? ['resource:'] : tab === 'creatures' ? ['creature:'] : ['badge:'];
    return menuNoticeKeys('journalScreen').some(function (key) {
        return prefixes.some(function (prefix) { return key.indexOf(prefix) === 0; }) && !itemNoticeSeen('journalScreen', key);
    });
}
function menuNoticeKeys(screen) {
    var keys = [];
    if (!state)
        return keys;
    if (screen === 'mapScreen') {
        for (var i = 0; i < unlockedCount(state); i++) {
            keys.push('region-open:' + i);
            var level = regionLevel(i);
            if (level < REGION_MAX_LEVEL && hasCost(regionUpgradeCost(i, level)))
                keys.push('region-upgrade:' + i + ':' + level);
        }
    }
    else if (screen === 'refugeScreen') {
        UPGRADE.forEach(function (u) {
            if (!upgradeVisible(u))
                return;
            keys.push('refuge-visible:' + u.id);
            var level = (state.upgrades && state.upgrades[u.id]) || 1;
            if (level < u.max && hasCost(upgradeCost(u, level)))
                keys.push('refuge-upgrade:' + u.id + ':' + level);
        });
        if (refugeTrackerVisible(state)) {
            keys.push('refuge-feature:' + REFUGE_TRACKER.id);
            if (!refugeTrackerUnlocked(state) && hasCost(REFUGE_TRACKER.cost))
                keys.push('refuge-feature-affordable:' + REFUGE_TRACKER.id);
        }
    }
    else if (screen === 'journalScreen') {
        (state.discoveredResources || []).forEach(function (k) { keys.push('resource:' + k); });
        (state.discoveredCreatures || []).forEach(function (k) { keys.push('creature:' + k + ':' + ((state.characterKnowledge && state.characterKnowledge[k]) || 0)); });
        (state.badges || []).forEach(function (k) { keys.push('badge:' + k); });
    }
    else if (screen === 'echoesScreen' && state.echoesUnlocked) {
        keys.push('echoes-unlocked');
        (state.companionDiscovered || []).forEach(function (id) { keys.push('companion:' + id); });
        if (typeof companionAssemblyCost === 'function' && typeof companionFragments === 'function' && typeof companionIsPermanent === 'function')
            COMPANION_IDS.forEach(function (id) { if (!companionIsPermanent(id) && companionFragments(id) >= companionAssemblyCost(id)) keys.push('companion-assemble:' + id); });
    }
    return keys;
}
function initializeMenuNoticeBaseline(keepV321ReleaseNew) {
    if (!state)
        return false;
    state.menuSeenNotices = state.menuSeenNotices || {};
    ['mapScreen', 'refugeScreen', 'journalScreen', 'echoesScreen'].forEach(function (screen) { state.menuSeenNotices[screen] = menuNoticeKeys(screen); });
    if (keepV321ReleaseNew && state.menuSeenNotices.refugeScreen) {
        state.menuSeenNotices.refugeScreen = state.menuSeenNotices.refugeScreen.filter(function (key) { return key !== 'refuge-feature:' + REFUGE_TRACKER.id && key !== 'refuge-feature-affordable:' + REFUGE_TRACKER.id; });
    }
    state.menuNoticesInitialized = true;
    return true;
}
function markMenuNoticesSeen(screen) {
    if (!state || ['mapScreen', 'refugeScreen', 'journalScreen', 'echoesScreen'].indexOf(screen) < 0)
        return false;
    state.menuSeenNotices = state.menuSeenNotices || {};
    var seen = state.menuSeenNotices[screen] || [];
    menuNoticeKeys(screen).forEach(function (key) { if (seen.indexOf(key) < 0) seen.push(key); });
    state.menuSeenNotices[screen] = seen;
    save();
    updateBottomNavNotifications();
    return true;
}
function updateBottomNavNotifications() {
    if (!state || !state.menuNoticesInitialized)
        return;
    document.querySelectorAll('.bottom-nav button[data-screen]').forEach(function (button) {
        var screen = button.getAttribute('data-screen'), seen = (state.menuSeenNotices && state.menuSeenNotices[screen]) || [], pending = menuNoticeKeys(screen).some(function (key) { return seen.indexOf(key) < 0; });
        button.classList.toggle('has-notification', !!pending);
        if (pending)
            button.setAttribute('aria-label', (button.textContent || '').trim() + ' · nouveauté');
        else
            button.removeAttribute('aria-label');
    });
}
function saveSlotSummary(slot) {
    var s = rawSaveSlot(slot);
    if (!s)
        return null;
    var expeditions = Math.max(0, Math.floor(Number(s.stats && s.stats.expeditions) || 0)), regions = 1;
    try {
        regions = unlockedCount(s);
    }
    catch (e) {
        regions = Math.max(1, Math.min(REGION.length, s.unlockFloor || 1));
    }
    var companions = Array.isArray(s.companionPermanent) ? s.companionPermanent.length : 0, won = !!s.gameWon, companionsKnown = companionConceptKnown(s);
    return { expeditions: expeditions, regions: regions, companions: companions, companionsKnown: companionsKnown, won: won, createdAt: Number(s.createdAt) || 0 };
}
function saveSlotMetaText(slot) {
    var m = saveSlotSummary(slot);
    if (!m)
        return 'Emplacement disponible';
    var parts = [m.expeditions + ' balade' + (m.expeditions > 1 ? 's' : ''), m.regions + ' / ' + REGION.length + ' chemins'];
    if (m.companionsKnown)
        parts.push(m.companions + ' compagnon' + (m.companions > 1 ? 's' : '') + ' permanent' + (m.companions > 1 ? 's' : ''));
    if (m.won)
        parts.push('Grand Fanal allumé');
    return parts.join(' · ');
}
function freshStartState(settingsSource) {
    var fresh = defaultState();
    Object.keys(fresh.resources || {}).forEach(function (k) { fresh.resources[k] = 0; });
    fresh.gems = 0;
    if (settingsSource && typeof settingsSource === 'object')
        fresh.settings = JSON.parse(JSON.stringify(settingsSource));
    return fresh;
}
function createSaveSlot(slot) {
    slot = Math.floor(Number(slot) || 0);
    if (slot < 1 || slot > 2 || saveSlotExists(slot))
        return false;
    var fresh = freshStartState(state && state.settings);
    try {
        localStorage.setItem(saveSlotKey(slot), JSON.stringify(fresh));
        if (slot === 1)
            localStorage.setItem(LEGACY_SAVE_KEY, JSON.stringify(fresh));
        return true;
    }
    catch (e) {
        return false;
    }
}
function resetSaveSlot(slot) {
    slot = Math.floor(Number(slot) || 0);
    if (slot < 1 || slot > 2 || !saveSlotExists(slot))
        return false;
    if (slot !== activeSaveSlot)
        save();
    var previous = rawSaveSlot(slot), fresh = freshStartState(previous && previous.settings ? previous.settings : (state && state.settings));
    try {
        var json = JSON.stringify(fresh);
        localStorage.setItem(saveSlotKey(slot), json);
        if (slot === 1)
            localStorage.setItem(LEGACY_SAVE_KEY, json);
    }
    catch (e) {
        return false;
    }
    if (slot === activeSaveSlot) {
        loadState();
        refreshAfterSaveSwitch();
    }
    else
        renderOptions();
    return true;
}
function activateSaveSlot(slot) {
    slot = Math.floor(Number(slot) || 0);
    if (slot < 1 || slot > 2 || !saveSlotExists(slot) || slot === activeSaveSlot)
        return false;
    save();
    activeSaveSlot = slot;
    try {
        localStorage.setItem(ACTIVE_SAVE_SLOT_KEY, String(slot));
    }
    catch (e) { }
    loadState();
    return true;
}
function refreshAfterSaveSwitch() {
    game = null;
    tradeDraft = { ordinary: { target: '', inputs: {} }, regional: { target: '', inputs: {} } };
    companionDraft = { region: -1, selected: '', mode: '' };
    journalTab = 'collections';
    updateSoundButton();
    renderHome();
    renderRegions();
    renderRefuge();
    renderJournal();
    renderEchoVisibility();
    showScreen('homeScreen', true);
    syncAudioScene(true);
}
function switchToSaveSlot(slot) { if (!activateSaveSlot(slot))
    return false; playSfx('ui_confirm', .42); refreshAfterSaveSwitch(); return true; }
function confirmCreateSecondSave() {
    if (saveSlotExists(2)) {
        switchToSaveSlot(2);
        return;
    }
    showModal('options.svg', 'Commencer une deuxième partie ?', '<p>La <strong>Partie 1 restera intacte</strong>. La Partie 2 commencera depuis le début avec sa propre progression, ses ressources, ses améliorations et son Grand Fanal.</p><p>Tu pourras revenir à la Partie 1 à tout moment depuis Options.</p>', '<button class="secondary" id="cancelSecondSaveBtn">Annuler</button><button class="primary" id="createSecondSaveBtn">Créer la Partie 2</button>');
    if ($('cancelSecondSaveBtn'))
        $('cancelSecondSaveBtn').onclick = function () { hideModal(true); };
    if ($('createSecondSaveBtn'))
        $('createSecondSaveBtn').onclick = function () { if (!createSaveSlot(2))
            return; hideModal(true); switchToSaveSlot(2); };
}
function confirmResetSaveSlot(slot) {
    slot = Math.floor(Number(slot) || 0);
    if (slot < 1 || slot > 2 || !saveSlotExists(slot))
        return;
    showModal('carnet.svg', 'Réinitialiser la Partie ' + slot + ' ?', '<p>Toute la progression de la <strong>Partie ' + slot + '</strong> sera effacée : ressources, améliorations, régions, découvertes et Grand Fanal.</p><p>L’autre partie restera intacte. La Partie ' + slot + ' recommencera avec <strong>zéro ressource</strong>.</p>', '<button class="secondary" id="cancelResetSaveBtn">Annuler</button><button class="save-reset-confirm" id="confirmResetSaveBtn">Réinitialiser</button>');
    if ($('cancelResetSaveBtn'))
        $('cancelResetSaveBtn').onclick = function () { hideModal(true); };
    if ($('confirmResetSaveBtn'))
        $('confirmResetSaveBtn').onclick = function () { hideModal(true); if (resetSaveSlot(slot)) {
            playSfx('ui_confirm', .42);
            showToast('Partie ' + slot + ' réinitialisée.');
        } };
}
function buildSaveArchive() {
    var slots = {};
    [1, 2].forEach(function (slot) { var value = rawSaveSlot(slot); if (value)
        slots[String(slot)] = value; });
    return { schema: SAVE_EXPORT_SCHEMA, formatVersion: SAVE_EXPORT_VERSION, exportedAt: new Date().toISOString(), appVersion: androidBridge() && androidBridge().appVersion ? String(androidBridge().appVersion()) : '3.2.2', activeSlot: activeSaveSlot, slots: slots };
}
function exportSaveArchive() {
    save();
    var bridge = androidBridge();
    if (!bridge || typeof bridge.exportSaves !== 'function') {
        showToast('L’export est disponible dans l’application Android.');
        return false;
    }
    try {
        bridge.exportSaves(JSON.stringify(buildSaveArchive()));
        return true;
    }
    catch (e) {
        showToast('L’export n’a pas pu démarrer.');
        return false;
    }
}
function requestSaveImport() {
    var bridge = androidBridge();
    if (!bridge || typeof bridge.importSaves !== 'function') {
        showToast('L’import est disponible dans l’application Android.');
        return false;
    }
    try {
        bridge.importSaves();
        return true;
    }
    catch (e) {
        showToast('L’import n’a pas pu démarrer.');
        return false;
    }
}
function importedSlotValid(value) { return !!(value && typeof value === 'object' && !Array.isArray(value) && value.resources && typeof value.resources === 'object' && value.upgrades && typeof value.upgrades === 'object' && value.stats && typeof value.stats === 'object'); }
function applyImportedArchive() {
    var archive = pendingImportedArchive;
    if (!archive)
        return false;
    var slots = archive.slots || {}, written = 0;
    try {
        [1, 2].forEach(function (slot) { var value = slots[String(slot)]; if (!importedSlotValid(value))
            return; var json = JSON.stringify(value); localStorage.setItem(saveSlotKey(slot), json); localStorage.setItem(localSaveBackupKey(slot), json); if (slot === 1)
            localStorage.setItem(LEGACY_SAVE_KEY, json); var bridge = androidBridge(); if (bridge && typeof bridge.backupSave === 'function')
            bridge.backupSave(slot, json); written++; });
        if (!written)
            throw new Error('no valid slot');
        var requested = Math.floor(Number(archive.activeSlot) || 1);
        activeSaveSlot = (requested === 2 && saveSlotExists(2)) ? 2 : 1;
        localStorage.setItem(ACTIVE_SAVE_SLOT_KEY, String(activeSaveSlot));
        pendingImportedArchive = null;
        hideModal(true);
        loadState();
        refreshAfterSaveSwitch();
        showToast(written + ' partie' + (written > 1 ? 's' : '') + ' importée' + (written > 1 ? 's' : '') + '.');
        return true;
    }
    catch (e) {
        pendingImportedArchive = null;
        hideModal(true);
        showToast('Le fichier n’a pas pu être importé.');
        return false;
    }
}
function receiveImportedSaves(payload) {
    if (payload && payload.error) {
        showToast(payload.error);
        return false;
    }
    if (!payload || payload.schema !== SAVE_EXPORT_SCHEMA || Number(payload.formatVersion) !== SAVE_EXPORT_VERSION || !payload.slots) {
        showToast('Ce fichier n’est pas une sauvegarde Luciole de poche reconnue.');
        return false;
    }
    var valid = [1, 2].filter(function (slot) { return importedSlotValid(payload.slots[String(slot)]); });
    if (!valid.length) {
        showToast('Aucune partie valide dans ce fichier.');
        return false;
    }
    pendingImportedArchive = payload;
    showModal('carnet.svg', 'Importer ' + valid.length + ' partie' + (valid.length > 1 ? 's' : '') + ' ?', '<p>Les emplacements présents dans le fichier remplaceront les mêmes emplacements sur cet appareil.</p><p><strong>Les Gemmes achetées ne sont jamais modifiées par un import de progression.</strong></p>', '<button class="secondary" id="cancelImportBtn">Annuler</button><button class="primary" id="confirmImportBtn">Importer</button>');
    $('cancelImportBtn').onclick = function () { pendingImportedArchive = null; hideModal(true); };
    $('confirmImportBtn').onclick = applyImportedArchive;
    return true;
}
function showPrivacyPolicy() {
    showModal('luciole.svg', 'Confidentialité', '<p><strong>La progression de Luciole de poche fonctionne hors ligne.</strong> Les sauvegardes de partie restent sur ton appareil et ne sont pas envoyées au service d’achat.</p><p>Si les achats de Gemmes sont activés, le paiement passe par Google Play. Un service sécurisé vérifie alors la transaction et conserve uniquement les informations nécessaires au portefeuille de Gemmes achetées et à sa restauration.</p><p>Le jeu n’intègre ni publicité ni traqueur publicitaire.</p>', null, 'privacy-modal');
}
function updateOptionsPlatformDetails() {
    setSaveHealth(saveHealth.ok, saveHealth.backup, saveHealth.message);
    var version = $('appVersionLabel'), bridge = androidBridge();
    if (version)
        version.textContent = 'Version ' + (bridge && bridge.appVersion ? String(bridge.appVersion()) : '4.0.0-b133');
}
function renderOptions() {
    var box = $('saveSlots');
    if (!box)
        return;
    var html = '';
    [1, 2].forEach(function (slot) { var exists = saveSlotExists(slot), active = slot === activeSaveSlot, summary = saveSlotSummary(slot); var mainAction = active ? '<button disabled>Partie active</button>' : exists ? '<button class="primary" data-switch-save="' + slot + '">Jouer cette partie</button>' : slot === 2 ? '<button class="primary" id="newSecondSaveBtn">Nouvelle partie</button>' : ''; var resetAction = exists ? '<button class="save-reset-button" data-reset-save="' + slot + '">Réinitialiser</button>' : ''; html += '<div class="save-slot-card ' + (active ? 'active' : '') + ' ' + (!exists ? 'empty' : '') + '"><div class="save-slot-number">' + slot + '</div><div class="save-slot-copy"><div class="save-slot-title"><strong>Partie ' + slot + '</strong>' + (active ? '<span>Active</span>' : '') + '</div><small>' + saveSlotMetaText(slot) + '</small>' + (summary && summary.createdAt ? '<em>Créée le ' + new Date(summary.createdAt).toLocaleDateString('fr-FR') + '</em>' : '') + '</div><div class="save-slot-action">' + mainAction + resetAction + '</div></div>'; });
    box.innerHTML = html;
    box.querySelectorAll('[data-switch-save]').forEach(function (b) { b.onclick = function () { switchToSaveSlot(Number(b.getAttribute('data-switch-save'))); }; });
    box.querySelectorAll('[data-reset-save]').forEach(function (b) { b.onclick = function () { confirmResetSaveSlot(Number(b.getAttribute('data-reset-save'))); }; });
    var create = $('newSecondSaveBtn');
    if (create)
        create.onclick = confirmCreateSecondSave;
    var exportBtn = $('exportSavesBtn'), importBtn = $('importSavesBtn'), privacyBtn = $('privacyBtn');
    if (exportBtn)
        exportBtn.onclick = exportSaveArchive;
    if (importBtn)
        importBtn.onclick = requestSaveImport;
    if (privacyBtn)
        privacyBtn.onclick = showPrivacyPolicy;
    updateOptionsPlatformDetails();
    if (typeof syncWalkRenderModeOptions === 'function') syncWalkRenderModeOptions();
}
function finalGroupStatus(keys) { var done = keys.filter(function (k) { return fanalStored(k) >= FINAL_TARGET[k]; }).length; return done + ' / ' + keys.length; }
function finalUpgradeStatus() { var done = UPGRADE.filter(function (u) { return (state.upgrades[u.id] || 0) >= FINAL_UPGRADE_LEVEL; }).length; return done + ' / ' + UPGRADE.length; }
function finalResourceDetailMarkup(keys) { keys = (keys || []).slice().sort(function (a, b) { return (FINAL_TARGET[b] || 0) - (FINAL_TARGET[a] || 0) || RESOURCE[a].name.localeCompare(RESOURCE[b].name); }); return '<div class="fanal-detail-list fanal-deposit-list">' + keys.map(function (k) { var stored = fanalStored(k), target = FINAL_TARGET[k], missing = fanalMissing(k), available = state.resources[k] || 0, max = Math.min(missing, available), ready = !missing; return '<div class="fanal-detail-item fanal-deposit-item ' + (ready ? 'ready' : '') + '" data-fanal-resource="' + k + '">' + img(RESOURCE[k].icon) + '<div class="fanal-deposit-copy"><strong>' + RESOURCE[k].name + '</strong><small><b>' + format(stored) + '</b> / ' + target + ' déposés · ' + format(available) + ' disponibles</small>' + (ready ? '<span class="fanal-stored-label">Réserve complète</span>' : '<div class="fanal-deposit-controls"><button class="fanal-step" data-fanal-minus="' + k + '" ' + (max ? '' : 'disabled') + '>−</button><input data-fanal-amount="' + k + '" type="number" inputmode="numeric" min="1" max="' + max + '" value="' + (max ? Math.min(max, 1) : 0) + '" ' + (max ? '' : 'disabled') + '><button class="fanal-step" data-fanal-plus="' + k + '" ' + (max ? '' : 'disabled') + '>+</button><button class="fanal-deposit" data-fanal-deposit="' + k + '" ' + (max ? '' : 'disabled') + '>Déposer</button><button class="fanal-deposit-all" data-fanal-all="' + k + '" ' + (max ? '' : 'disabled') + '>Tout</button></div>') + '</div></div>'; }).join('') + '</div>'; }
function bindFanalDepositControls(kind) {
    document.querySelectorAll('[data-fanal-amount]').forEach(function (input) { var k = input.getAttribute('data-fanal-amount'); function clamp(v) { var max = Math.min(fanalMissing(k), state.resources[k] || 0); return Math.max(max ? 1 : 0, Math.min(max, Math.floor(Number(v) || 0))); } input.onchange = function () { input.value = clamp(input.value); }; });
    document.querySelectorAll('[data-fanal-minus]').forEach(function (b) { b.onclick = function () { var k = b.getAttribute('data-fanal-minus'), input = document.querySelector('[data-fanal-amount="' + k + '"]'); if (input)
        input.value = Math.max(1, (Math.floor(Number(input.value) || 1) - 1)); }; });
    document.querySelectorAll('[data-fanal-plus]').forEach(function (b) { b.onclick = function () { var k = b.getAttribute('data-fanal-plus'), input = document.querySelector('[data-fanal-amount="' + k + '"]'), max = Math.min(fanalMissing(k), state.resources[k] || 0); if (input)
        input.value = Math.min(max, Math.floor(Number(input.value) || 0) + 1); }; });
    document.querySelectorAll('[data-fanal-deposit]').forEach(function (b) { b.onclick = function () { var k = b.getAttribute('data-fanal-deposit'), input = document.querySelector('[data-fanal-amount="' + k + '"]'), taken = fanalDepositAmount(k, input ? input.value : 0); if (taken) {
        showToast('+' + taken + ' ' + RESOURCE[k].name + ' confié' + (taken > 1 ? 's' : '') + ' au Fanal');
        showFinalElementDetails(kind);
    } }; });
    document.querySelectorAll('[data-fanal-all]').forEach(function (b) { b.onclick = function () { var k = b.getAttribute('data-fanal-all'), taken = fanalDepositAll(k); if (taken) {
        showToast('+' + taken + ' ' + RESOURCE[k].name + ' confié' + (taken > 1 ? 's' : '') + ' au Fanal');
        showFinalElementDetails(kind);
    } }; });
}
function finalUpgradeDetailMarkup() { return '<div class="fanal-detail-list">' + UPGRADE.map(function (u) { var level = state.upgrades[u.id] || 0, missing = Math.max(0, FINAL_UPGRADE_LEVEL - level); return '<div class="fanal-detail-item ' + (missing ? '' : 'ready') + '">' + img(u.icon) + '<div><strong>' + u.name + '</strong><small>Niveau ' + level + ' / ' + FINAL_UPGRADE_LEVEL + (missing ? ' · encore ' + missing + ' niveau' + (missing > 1 ? 'x' : '') : ' · prêt') + '</small></div></div>'; }).join('') + '</div>'; }
function finalPathDetailMarkup() { return '<div class="fanal-detail-list">' + REGION.map(function (r, i) { var level = regionLevel(i), last = i === REGION.length - 1; return '<div class="fanal-detail-item ' + (level >= REGION_MAX_LEVEL ? 'ready' : '') + '">' + img(r.img) + '<div><strong>' + r.name + '</strong><small>Niveau ' + level + ' / ' + REGION_MAX_LEVEL + (last ? ' · balade niveau ' + REGION_MAX_LEVEL + ' accomplie' : '') + '</small></div></div>'; }).join('') + '</div>'; }
function finalLoreDetailMarkup() { return '<div class="fanal-detail-list">' + Object.keys(CREATURE).map(function (k) { var ch = CREATURE[k], known = Math.max(0, Math.min(4, (state.characterKnowledge && state.characterKnowledge[k]) || 0)); return '<div class="fanal-detail-item ' + (known >= 3 ? 'ready' : '') + '">' + img(ch.icon) + '<div><strong>' + ch.name + '</strong><small>' + known + ' / 3 récits débloqués</small></div></div>'; }).join('') + '</div>'; }
function showFinalElementDetails(kind) {
    var essentials = ['seed', 'berry', 'pebble', 'leaf', 'shell', 'glow'].concat(ADVANCED_COMMON), title = 'Le Grand Fanal', text = '';
    if (kind === 'paths') {
        title = 'Les huit chemins';
        text = '<p>Le Fanal ne pouvait se révéler qu’après que les huit chemins aient atteint leur forme complète, puis après une balade complète dans l’Archipel des nuages au niveau 4.</p>' + finalPathDetailMarkup();
    }
    else if (kind === 'voices') {
        title = 'Les huit voix';
        text = '<p>Les trois récits de chacun des huit habitants devaient être entendus avant que leurs histoires puissent se répondre autour du Fanal.</p>' + finalLoreDetailMarkup();
    }
    else if (kind === 'upgrades') {
        title = 'Le refuge';
        text = '<p>Chaque amélioration du refuge doit atteindre au moins le niveau ' + FINAL_UPGRADE_LEVEL + '.</p>' + finalUpgradeDetailMarkup();
    }
    else if (kind === 'core' || kind === 'advanced') {
        title = 'Ressources non régionales';
        text = '<p>Le Fanal attend 200 exemplaires de chaque ressource, à l’exception des Lucioles dont il faut 500. Ce qui lui est confié est retiré définitivement de ton inventaire.</p>' + finalResourceDetailMarkup(essentials);
    }
    else if (kind === 'exclusive') {
        title = 'Ressources régionales';
        text = '<p>Les huit ressources régionales sont uniques à leur balade. Elles servent de réponses propres aux huit chemins.</p>' + finalResourceDetailMarkup(EXCLUSIVE);
    }
    else {
        text = '<p>Les huit chemins, les huit voix, le refuge et les réserves doivent répondre ensemble.</p>';
    }
    showModal('luciole.svg', title, text, null, 'fanal-detail-modal');
    if (kind === 'core' || kind === 'advanced' || kind === 'exclusive')
        bindFanalDepositControls(kind);
}
function renderFinalGoal() {
    var el = $('finalGoalCard'), section = $('finalGoalSection');
    if (!el)
        return;
    var revealed = finalGoalRevealed();
    if (section)
        section.classList.toggle('hidden', !revealed);
    if (!revealed) {
        el.innerHTML = '';
        return;
    }
    var p = finalGoalProgress();
    if (state.gameWon) {
        el.innerHTML = '<div class="final-complete-note"><div class="final-complete-main"><div class="final-icon">🏮</div><div><strong>Le Grand Fanal a été allumé</strong><small>Les huit chemins brillent de nouveau. L’aventure principale est terminée.</small></div></div><button class="final-replay-button" id="finalReplayBtn">Revoir le feu d’artifice</button></div>';
        if (section) {
            var doneLabel = section.querySelector ? section.querySelector('.final-section-title span') : null;
            if (doneLabel)
                doneLabel.textContent = 'Accompli';
        }
    }
    else {
        var essentials = ['seed', 'berry', 'pebble', 'leaf', 'shell', 'glow'].concat(ADVANCED_COMMON), exclusive = EXCLUSIVE;
        el.innerHTML = '<div class="final-head"><div class="final-icon">🏮</div><div><strong>Le Grand Fanal</strong><small>Les huit chemins se répondent à nouveau. Au cœur du refuge, une ancienne lumière attend que les traces rapportées de chaque horizon se rejoignent.</small></div></div><div class="fanal-elements"><button data-final-detail="paths"><span>Les huit chemins</span><b>8 / 8</b><small>Les routes qui portent la lumière</small></button><button data-final-detail="voices"><span>Les huit voix</span><b>24 / 24</b><small>Les récits qui donnent un sens aux chemins</small></button><button data-final-detail="upgrades"><span>Le refuge</span><b>' + finalUpgradeStatus() + '</b><small>Les outils qui entretiennent le lien</small></button><button data-final-detail="core"><span>Ressources non régionales</span><b>' + finalGroupStatus(essentials) + '</b><small>Les ressources qui circulent entre les balades</small></button><button data-final-detail="exclusive"><span>Ressources régionales</span><b>' + finalGroupStatus(exclusive) + '</b><small>Les huit ressources uniques des balades</small></button></div><div class="progress final-progress"><i style="width:' + p.percent + '%"></i></div><div class="goal-foot"><small>' + p.percent + '% · dépose les ressources au Fanal pour les mettre à l’abri</small><button class="final-button" id="finalWinBtn">' + (finalReady() ? 'Allumer le Grand Fanal' : 'Voir l’ensemble') + '</button></div>';
    }
    document.querySelectorAll('[data-final-detail]').forEach(function (b) { b.onclick = function () { showFinalElementDetails(b.getAttribute('data-final-detail')); }; });
    var b = $('finalWinBtn');
    if (b)
        b.onclick = function () { if (finalReady())
            winGame();
        else
            showFinalDetails(); };
    var replay = $('finalReplayBtn');
    if (replay)
        replay.onclick = function () { showEndingCelebration(); };
}
function showFinalDetails() { showFinalElementDetails('overview'); }
function showFanalRevealPopup(after) {
    showModal('luciole.svg', 'Le Grand Fanal se révèle', '<div class="fanal-reveal-story"><p>L’Archipel des nuages a été parcouru jusqu’au bout. Pourtant, il manquait encore quelques voix.</p><p>Une lueur ancienne traverse le refuge : <strong>le Grand Fanal</strong> est le point où les chemins, les souvenirs et leurs habitants rallient leurs lumières.</p><p>Il est désormais visible au refuge. Sa lumière est faible, mais elle attend encore des réponses.</p></div>', '<button class="primary" id="modalClose">Approcher le Grand Fanal</button>', 'fanal-reveal-modal');
    var close = $('modalClose');
    if (close)
        close.onclick = function () { hideModal(true); renderHome(); renderJournal(); if (after)
            after(); };
}
function clearEndingSequence() { endingTimers.forEach(function (t) { clearTimeout(t); }); endingTimers = []; }
function preloadEndingFrames() { ENDING_FRAMES.forEach(function (src) { var im = new Image(); im.src = src; }); }
function updateEndingProgress(index) { document.querySelectorAll('#endingProgress span').forEach(function (dot, i) { dot.classList.toggle('lit', i <= index); }); }
function showEndingFrame(index, instant) {
    var src = ENDING_FRAMES[Math.max(0, Math.min(ENDING_FRAMES.length - 1, index))], current = $(endingVisibleFrame === 'A' ? 'endingFrameA' : 'endingFrameB'), next = $(endingVisibleFrame === 'A' ? 'endingFrameB' : 'endingFrameA');
    if (!current || !next)
        return;
    if (instant) {
        current.src = src;
        current.classList.add('visible');
        next.classList.remove('visible');
    }
    else {
        next.src = src;
        next.classList.add('visible');
        current.classList.remove('visible');
        endingVisibleFrame = endingVisibleFrame === 'A' ? 'B' : 'A';
    }
    var backdrop = $('endingBackdrop');
    if (backdrop)
        backdrop.style.backgroundImage = 'url("' + src + '")';
    updateEndingProgress(index);
}
function playEndingFirework(index, instant) { showEndingFrame(index, !!instant); playSfx('firework_' + ((index % 4) + 1), .78, 80); vibrate(index === ENDING_FRAMES.length - 1 ? 26 : 12); }
function showEndingCelebration() {
    clearEndingSequence();
    hideModal(true);
    showScreen('endingScreen', true);
    endingVisibleFrame = 'A';
    var back = $('endingReturnBtn');
    if (back) {
        back.classList.remove('ready');
        back.setAttribute('aria-hidden', 'true');
    }
    document.querySelectorAll('#endingProgress span').forEach(function (dot) { dot.classList.remove('lit'); });
    playEndingFirework(0, true);
    for (var i = 1; i < ENDING_FRAMES.length; i++)
        (function (step) { endingTimers.push(setTimeout(function () { playEndingFirework(step, false); }, step * ENDING_FRAME_MS)); })(i);
    endingTimers.push(setTimeout(function () { var btn = $('endingReturnBtn'); if (btn) {
        btn.classList.add('ready');
        btn.setAttribute('aria-hidden', 'false');
    } }, (ENDING_FRAMES.length - 1) * ENDING_FRAME_MS + 1200));
}
function exitEndingCelebration() { clearEndingSequence(); showScreen('homeScreen', true); }
function winGame() { if (!finalReady() || state.gameWon)
    return; state.gameWon = true; checkBadges(false); save(); renderHome(); renderJournal(); showEndingCelebration(); }
function showVictory() { showEndingCelebration(); }
function regionUnlockRequirementsMarkup(i, levels) {
    var r = REGION[i], rows = [], missingCount = 0, refugeReady = levels >= r.req;
    if (!refugeReady)
        missingCount++;
    rows.push('<div class="region-lock-requirement ' + (refugeReady ? 'ready' : 'missing') + '"><span class="region-lock-dot">' + (refugeReady ? '✓' : '!') + '</span><div><strong>Améliorations du Refuge</strong><small>' + levels + ' / ' + r.req + ' niveaux requis</small></div></div>');
    if (i > 0) {
        var previous = REGION[i - 1], previousLevel = regionLevel(i - 1), previousReady = previousLevel >= REGION_MAX_LEVEL;
        if (!previousReady)
            missingCount++;
        rows.push('<div class="region-lock-requirement ' + (previousReady ? 'ready' : 'missing') + '"><span class="region-lock-dot">' + (previousReady ? '✓' : '!') + '</span><div><strong>' + previous.name + '</strong><small>Niveau ' + previousLevel + ' / ' + REGION_MAX_LEVEL + ' · atteindre le niveau ' + REGION_MAX_LEVEL + '</small></div></div>');
    }
    var status = missingCount > 0 ? (missingCount + ' condition' + (missingCount > 1 ? 's' : '') + ' à remplir') : 'Conditions remplies';
    return '<div class="region-lock-panel"><div class="region-lock-heading"><span class="region-lock-icon">🔒</span><div><strong>Balade verrouillée</strong><small>' + status + '</small></div></div><div class="region-lock-requirements">' + rows.join('') + '</div></div>';
}
function regionUnlockToast(i) {
    var r = REGION[i], levels = totalLevels(state), requirements = [];
    if (levels < r.req)
        requirements.push('Améliorations du Refuge : ' + levels + ' / ' + r.req + ' niveaux');
    if (i > 0 && regionLevel(i - 1) < REGION_MAX_LEVEL)
        requirements.push(REGION[i - 1].name + ' : niveau ' + regionLevel(i - 1) + ' / ' + REGION_MAX_LEVEL);
    return requirements.length ? 'Pour débloquer ' + r.name + ' : ' + requirements.join(' · ') + '.' : 'Cette balade est encore verrouillée.';
}
function renderRegions() {
    var levels = totalLevels(state);
    $('regionList').innerHTML = REGION.map(function (r, i) {
        var unlocked = isUnlocked(i), level = regionLevel(i), profile = walkProfile(i, level);
        if (!unlocked)
            return '<div class="region-card locked" style="background:linear-gradient(135deg,' + r.palette[0] + ',#fff)"><button class="region-open region-open-locked" data-region="' + i + '"><div class="region-copy region-copy-locked"><h3>' + r.name + '</h3>' + regionUnlockRequirementsMarkup(i, levels) + '</div><div class="region-locked-art">' + img(r.img) + '</div></button></div>';
        var max = level >= REGION_MAX_LEVEL, cost = max ? {} : regionUpgradeCost(i, level), can = !max && hasCost(cost), blocked = !max && !can;
        var openKey = 'region-open:' + i, upgradeKey = 'region-upgrade:' + i + ':' + level;
        var openNotice = pageNoticePills('mapScreen', [{ key: openKey, label: 'Nouvelle balade' }]), upgradeNotice = can ? pageNoticePills('mapScreen', [{ key: upgradeKey, label: 'Évolution disponible' }]) : '';
        var resources = '<button class="region-resources-btn ui-action" data-region-resources="' + i + '">Voir les ressources</button>';
        var upgradeStrip = max ? '<div class="region-upgrade-strip complete ui-info"><span class="region-upgrade-main"><strong>Évolution terminée</strong><small>Niveau maximum atteint</small></span></div>' : '<button class="region-upgrade-strip region-upgrade ui-action evolution-action ' + (blocked ? 'needs-resources' : '') + ' ' + (upgradeNotice ? 'has-page-notice' : '') + '" data-region-upgrade="' + i + '"' + itemNoticeData('mapScreen', can ? [upgradeKey] : []) + '><span class="region-upgrade-main"><strong>Faire évoluer</strong>' + upgradeNotice + '<small>Balade ' + level + ' → ' + (level + 1) + '</small><span class="region-upgrade-costs">' + upgradeCostMarkup(cost) + '</span></span><span class="region-upgrade-arrow">›</span></button>';
        var actions = '<div class="region-evolution"><div><strong>Niveau ' + level + ' / ' + REGION_MAX_LEVEL + ' · ' + profile.name + '</strong><small>' + profile.desc + '</small></div><button class="region-start-btn ui-action" data-region-start="' + i + '">Choix de la balade</button></div>';
        return '<div class="region-card" style="background:linear-gradient(135deg,' + r.palette[0] + ',#fff)">' + resources + '<button class="region-open ' + (openNotice ? 'has-page-notice' : '') + '" data-region="' + i + '"' + itemNoticeData('mapScreen', [openKey]) + '><div class="region-copy"><h3>' + r.name + '</h3>' + openNotice + '<p>' + r.sub + '</p><div class="region-tags"><span>Balade ' + level + ' / ' + REGION_MAX_LEVEL + '</span></div></div>' + img(r.img) + '</button>' + upgradeStrip + actions + '</div>';
    }).join('');
    document.querySelectorAll('[data-region]').forEach(function (el) { el.onclick = function () { var i = +el.getAttribute('data-region'); if (isUnlocked(i))
        prepareRun(i);
    else
        showToast(regionUnlockToast(i)); }; });
    document.querySelectorAll('[data-region-start]').forEach(function (el) { el.onclick = function (e) { if (e && e.stopPropagation)
        e.stopPropagation(); prepareRun(+el.getAttribute('data-region-start')); }; });
    document.querySelectorAll('[data-region-resources]').forEach(function (el) { el.onclick = function (e) { if (e && e.stopPropagation)
        e.stopPropagation(); showTerrainResources(+el.getAttribute('data-region-resources')); }; });
    document.querySelectorAll('[data-region-upgrade]').forEach(function (el) { el.onclick = function (e) { if (e && e.stopPropagation)
        e.stopPropagation(); buyRegionUpgrade(+el.getAttribute('data-region-upgrade')); }; });
    bindItemNoticeMarkers($('regionList'));
}
function buyRegionUpgrade(i) {
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
    var after = unlockedCount(state);
    save();
    playSfx('region_upgrade', .76);
    renderRegions();
    var p = walkProfile(i, level + 1), newPath = after > before ? '<p><strong>Nouveau chemin :</strong> ' + REGION[after - 1].name + ' est maintenant accessible.</p>' : '';
    showModal(REGION[i].img, REGION[i].name + ' grandit', '<p>La balade atteint le niveau ' + (level + 1) + ' sur ' + REGION_MAX_LEVEL + '.</p><p><strong>' + p.name + '</strong><br>' + p.desc + '. La zone est maintenant plus vaste, et les chemins éloignés deviennent plus généreux.</p><p><strong>' + RESOURCE[REGION[i].signature].name + '</strong> reste la ressource-signature de ce chemin et sert à ses évolutions.</p><p><strong>' + RESOURCE[REGION[i].unique].name + '</strong> est la ressource régionale de cette balade.' + (level + 1 >= 2 ? ' Elle peut maintenant apparaître.' : '') + '</p>' + newPath);
}
function renderRefuge() {
    var levels = totalLevels(state);
    $('refugeLevel').textContent = 'Refuge niveau ' + (levels + 1);
    var garden = state.upgrades.garden || 1, gardenPower = upgradeEffectLevel('garden', garden), harvest = Math.round(harvestBonusChance() * 100), lens = state.upgrades.lens || 1, jar = state.upgrades.jar || 1, jarPower = upgradeEffectLevel('jar', jar);
    $('gardenYield').textContent = (gardenPower > 0 ? 'Jardin ' + garden + '/8 · ' + gardenEligibleResources(gardenPower).length + ' ressources apprises' : 'Jardin ' + garden + '/8 · au repos') + ' · récolte bonus ' + harvest + '% · halos +' + (lens * 9) + ' · bocal ' + jar + '/8' + (jarPower > 0 ? '' : ' · au repos') + '.';
    var group = '', visibleUpgrades = UPGRADE.filter(function (u) { return upgradeVisible(u); });
    var upgradeHtml = visibleUpgrades.map(function (u) {
        var level = state.upgrades[u.id], max = level >= u.max, cost = max ? {} : upgradeCost(u, level), can = !max && hasCost(cost), blocked = !max && !can;
        var head = u.group !== group ? '<div class="upgrade-group-title"><strong>' + u.group + '</strong></div>' : '';
        group = u.group;
        var details = max ? '' : ('<span class="cost">' + upgradeCostMarkup(cost) + '</span>'), visibleKey = 'refuge-visible:' + u.id, affordableKey = 'refuge-upgrade:' + u.id + ':' + level;
        var refugeNotices = pageNoticePills('refugeScreen', [{ key: visibleKey, label: 'Nouveau' }, { key: can ? affordableKey : '', label: 'Amélioration disponible' }]), refugeNoticeKeys = [visibleKey].concat(can ? [affordableKey] : []);
        return head + '<div class="upgrade-card ' + (refugeNotices ? 'has-page-notice' : '') + '"' + itemNoticeData('refugeScreen', refugeNoticeKeys) + '>' + img(u.icon) + '<div class="upgrade-copy"><h3>' + u.name + '</h3>' + refugeNotices + '<p>' + u.desc + '</p><span class="level">Niveau ' + level + ' / ' + u.max + '</span></div><button class="evolution-action ' + (blocked ? 'blocked-action' : '') + '" data-upgrade="' + u.id + '" ' + (max ? 'disabled' : (blocked ? 'aria-disabled="true"' : '')) + '>' + (max ? 'Complet' : 'Améliorer') + details + '</button></div>';
    }).join('');
    if (refugeTrackerVisible(state)) {
        var trackerUnlocked = refugeTrackerUnlocked(state), trackerBlocked = !trackerUnlocked && !hasCost(REFUGE_TRACKER.cost), trackerDetails = trackerUnlocked ? '' : '<span class="cost">' + upgradeCostMarkup(REFUGE_TRACKER.cost) + '</span>', trackerCan = !trackerUnlocked && !trackerBlocked;
        var trackerVisibleKey = 'refuge-feature:' + REFUGE_TRACKER.id, trackerAffordableKey = 'refuge-feature-affordable:' + REFUGE_TRACKER.id, trackerNotices = pageNoticePills('refugeScreen', [{ key: trackerVisibleKey, label: 'Nouveau' }, { key: trackerCan ? trackerAffordableKey : '', label: 'Installation disponible' }]);
        upgradeHtml += '<div class="upgrade-group-title"><strong>Repérage</strong><small>Débloqué avec ' + REFUGE_TRACKER.badgesRequired + ' badges</small></div><div class="upgrade-card refuge-feature-card ' + (trackerNotices ? 'has-page-notice' : '') + '"' + itemNoticeData('refugeScreen', [trackerVisibleKey].concat(trackerCan ? [trackerAffordableKey] : [])) + '>' + img(REFUGE_TRACKER.icon) + '<div class="upgrade-copy"><h3>' + REFUGE_TRACKER.name + '</h3>' + trackerNotices + '<p>' + REFUGE_TRACKER.desc + '</p><span class="level">Amélioration unique · sans niveau</span></div><button class="evolution-action ' + (trackerBlocked ? 'blocked-action' : '') + '" data-refuge-feature="' + REFUGE_TRACKER.id + '" ' + (trackerUnlocked ? 'disabled' : (trackerBlocked ? 'aria-disabled="true"' : '')) + '>' + (trackerUnlocked ? 'Installée' : 'Installer') + trackerDetails + '</button></div>';
    }
    $('upgradeList').innerHTML = upgradeHtml;
    document.querySelectorAll('[data-upgrade]').forEach(function (b) { b.onclick = function () { buyUpgrade(b.getAttribute('data-upgrade')); }; });
    document.querySelectorAll('[data-refuge-feature]').forEach(function (b) { b.onclick = function () { if (b.getAttribute('data-refuge-feature') === REFUGE_TRACKER.id) buyRefugeTracker(); }; });
    bindItemNoticeMarkers($('upgradeList'));
    updateBottomNavNotifications();
}
function buyUpgrade(id) {
    var u = UPGRADE.filter(function (x) { return x.id === id; })[0], level = state.upgrades[id], previousLevel = level;
    if (level >= u.max)
        return;
    var cost = upgradeCost(u, level);
    if (!hasCost(cost)) {
        showMissingCostModal(u.icon, 'Il te manque encore quelques ressources pour améliorer ' + u.name + '.', cost);
        return;
    }
    var before = unlockedCount(state);
    payCost(cost);
    state.upgrades[id]++;
    var after = unlockedCount(state);
    save();
    playSfx('upgrade', .72);
    renderRefuge();
    checkBadges(true);
    if (id === 'bag' && typeof tutorialOnBagUpgrade === 'function')
        tutorialOnBagUpgrade(previousLevel, state.upgrades[id]);
    if (after > before) {
        var r = REGION[after - 1];
        showModal(r.img, 'Nouveau chemin : ' + r.name, '<p>' + r.desc + '</p><p><strong>Une nouvelle ressource</strong> t’y attend. Il faudra la rapporter pour faire évoluer ce chemin.</p>');
    }
}
function tradeRule(kind) { return TRADE_RULES[kind] || null; }
function ensureTradeDraft(kind) { var rule = tradeRule(kind); if (!rule)
    return null; var d = tradeDraft[kind] || (tradeDraft[kind] = { target: '', inputs: {} }); if (rule.keys.indexOf(d.target) < 0)
    d.target = ''; if (!d.inputs || typeof d.inputs !== 'object')
    d.inputs = {}; Object.keys(d.inputs).forEach(function (k) { if (rule.keys.indexOf(k) < 0)
    d.inputs[k] = 0; d.inputs[k] = Math.max(0, Math.min(Math.floor(Number(d.inputs[k]) || 0), Math.floor(state.resources[k] || 0))); }); if (d.target)
    d.inputs[d.target] = 0; return d; }
function tradeInputTotal(kind) { var rule = tradeRule(kind), d = ensureTradeDraft(kind); if (!rule || !d)
    return 0; return rule.keys.reduce(function (sum, k) { return sum + (d.inputs[k] || 0); }, 0); }
function tradeSetTarget(kind, k) { var rule = tradeRule(kind), d = ensureTradeDraft(kind); if (!rule || rule.keys.indexOf(k) < 0)
    return false; d.target = k; d.inputs[k] = 0; return true; }
function tradeSetAmount(kind, k, amount) { var rule = tradeRule(kind), d = ensureTradeDraft(kind); if (!rule || rule.keys.indexOf(k) < 0 || k === d.target)
    return 0; var current = d.inputs[k] || 0, other = tradeInputTotal(kind) - current, stock = Math.max(0, Math.floor(state.resources[k] || 0)), max = Math.max(0, Math.min(stock, rule.cost - other)), v = Math.max(0, Math.min(max, Math.floor(Number(amount) || 0))); d.inputs[k] = v; return v; }
function tradeReset(kind) { var rule = tradeRule(kind), d = ensureTradeDraft(kind); if (!rule || !d)
    return; rule.keys.forEach(function (k) { d.inputs[k] = 0; }); }
function tradeAutoFill(kind) { var rule = tradeRule(kind), d = ensureTradeDraft(kind); if (!rule || !d)
    return false; tradeReset(kind); var left = rule.cost, keys = rule.keys.filter(function (k) { return k !== d.target; }).sort(function (a, b) { return (state.resources[b] || 0) - (state.resources[a] || 0); }); keys.forEach(function (k) { if (left <= 0)
    return; var take = Math.min(left, Math.max(0, Math.floor(state.resources[k] || 0))); d.inputs[k] = take; left -= take; }); return left === 0; }
function tradeCanExecute(kind) { var rule = tradeRule(kind), d = ensureTradeDraft(kind); if (!state.gameWon || !rule || !d || !d.target || tradeInputTotal(kind) !== rule.cost)
    return false; return rule.keys.every(function (k) { var amount = d.inputs[k] || 0; return k === d.target ? amount === 0 : amount <= Math.max(0, Math.floor(state.resources[k] || 0)); }); }
function tradeExecute(kind) { var rule = tradeRule(kind), d = ensureTradeDraft(kind); if (!tradeCanExecute(kind))
    return false; rule.keys.forEach(function (k) { var amount = d.inputs[k] || 0; if (amount)
    state.resources[k] -= amount; }); state.resources[d.target] = (state.resources[d.target] || 0) + rule.reward; discoverResource(d.target); var target = d.target; tradeReset(kind); save(); renderTrade(); renderHome(); playSfx('trade', kind === 'regional' ? .78 : .70); vibrate(kind === 'regional' ? 24 : 16); showModal(RESOURCE[target].icon, 'Troc terminé', '<p><strong>+' + rule.reward + ' ' + RESOURCE[target].name + '</strong></p><p>Le refuge a échangé exactement ' + rule.cost + ' ressources ' + (kind === 'regional' ? 'régionales' : 'non régionales') + '. Rien ne se perd.</p>'); return true; }
function tradeTargetOptions(kind) { var rule = tradeRule(kind), d = ensureTradeDraft(kind); return '<option value="">Choisir la ressource reçue</option>' + rule.keys.map(function (k) { return '<option value="' + k + '" ' + (d.target === k ? 'selected' : '') + '>' + RESOURCE[k].name + '</option>'; }).join(''); }
function tradeGroupMarkup(kind) { var rule = tradeRule(kind), d = ensureTradeDraft(kind), total = tradeInputTotal(kind), ready = tradeCanExecute(kind), regional = kind === 'regional'; return '<section class="trade-card ' + kind + '"><div class="trade-head"><div class="trade-symbol">' + (regional ? '✦' : '⇄') + '</div><div><strong>' + rule.title + '</strong><small>' + (regional ? 'Uniquement les huit ressources régionales, chacune propre à une balade.' : 'Toutes les ressources hors raretés régionales.') + '</small></div></div><div class="trade-rate"><b>' + rule.cost + '</b><span>ressources données</span><i>→</i><b>' + rule.reward + '</b><span>de la ressource choisie</span></div><label class="trade-target"><span>Ressource à recevoir</span><select data-trade-target="' + kind + '">' + tradeTargetOptions(kind) + '</select></label><div class="trade-basket-title"><div><strong>Paquet à donner</strong><small>Tu peux mélanger autant de ressources que nécessaire.</small></div><b class="' + (total === rule.cost ? 'complete' : '') + '">' + total + ' / ' + rule.cost + '</b></div><div class="trade-resource-list">' + rule.keys.map(function (k) { var amount = d.inputs[k] || 0, stock = Math.max(0, Math.floor(state.resources[k] || 0)), target = k === d.target; return '<div class="trade-resource-row ' + (target ? 'target' : '') + '" data-trade-row="' + kind + ':' + k + '">' + img(RESOURCE[k].icon) + '<div class="trade-resource-copy"><strong>' + RESOURCE[k].name + '</strong><small>' + format(stock) + ' disponibles' + (target ? ' · ressource reçue' : '') + '</small></div>' + (target ? '<span class="trade-target-chip">Cible</span>' : '<div class="trade-stepper"><button data-trade-minus="' + kind + ':' + k + '" ' + (amount ? '' : 'disabled') + '>−</button><input data-trade-amount="' + kind + ':' + k + '" type="number" inputmode="numeric" min="0" value="' + amount + '"><button data-trade-plus="' + kind + ':' + k + '" ' + (amount >= stock || total >= rule.cost ? 'disabled' : '') + '>+</button><button data-trade-max="' + kind + ':' + k + '" ' + (!stock || total >= rule.cost ? 'disabled' : '') + '>Max</button></div>') + '</div>'; }).join('') + '</div><div class="trade-actions"><button class="secondary" data-trade-reset="' + kind + '">Vider</button><button class="secondary" data-trade-fill="' + kind + '">Remplir</button><button class="primary" data-trade-execute="' + kind + '" ' + (ready ? '' : 'disabled') + '>Échanger</button></div></section>'; }
function renderTrade() { var c = $('tradeContent'); if (!c)
    return; if (!state.gameWon) {
    c.innerHTML = '';
    return;
} c.innerHTML = tradeGroupMarkup('ordinary') + tradeGroupMarkup('regional'); bindTradeControls(); }
function bindTradeControls() { document.querySelectorAll('[data-trade-target]').forEach(function (el) { el.onchange = function () { if (tradeSetTarget(el.getAttribute('data-trade-target'), el.value))
    renderTrade(); }; }); document.querySelectorAll('[data-trade-amount]').forEach(function (el) { el.onchange = function () { var p = el.getAttribute('data-trade-amount').split(':'); tradeSetAmount(p[0], p[1], el.value); renderTrade(); }; }); document.querySelectorAll('[data-trade-minus]').forEach(function (el) { el.onclick = function () { var p = el.getAttribute('data-trade-minus').split(':'), d = ensureTradeDraft(p[0]); tradeSetAmount(p[0], p[1], (d.inputs[p[1]] || 0) - 1); renderTrade(); }; }); document.querySelectorAll('[data-trade-plus]').forEach(function (el) { el.onclick = function () { var p = el.getAttribute('data-trade-plus').split(':'), d = ensureTradeDraft(p[0]); tradeSetAmount(p[0], p[1], (d.inputs[p[1]] || 0) + 1); renderTrade(); }; }); document.querySelectorAll('[data-trade-max]').forEach(function (el) { el.onclick = function () { var p = el.getAttribute('data-trade-max').split(':'), rule = tradeRule(p[0]), d = ensureTradeDraft(p[0]), current = d.inputs[p[1]] || 0, other = tradeInputTotal(p[0]) - current; tradeSetAmount(p[0], p[1], Math.min(state.resources[p[1]] || 0, rule.cost - other)); renderTrade(); }; }); document.querySelectorAll('[data-trade-reset]').forEach(function (el) { el.onclick = function () { tradeReset(el.getAttribute('data-trade-reset')); renderTrade(); }; }); document.querySelectorAll('[data-trade-fill]').forEach(function (el) { el.onclick = function () { var kind = el.getAttribute('data-trade-fill'); tradeAutoFill(kind); renderTrade(); }; }); document.querySelectorAll('[data-trade-execute]').forEach(function (el) { el.onclick = function () { tradeExecute(el.getAttribute('data-trade-execute')); }; }); }
function setJournalTab(tab) { if (JOURNAL_TABS.indexOf(tab) < 0)
    return false; journalTab = tab; renderJournal(); return true; }
function shiftJournalTab(direction) { var i = JOURNAL_TABS.indexOf(journalTab), next = Math.max(0, Math.min(JOURNAL_TABS.length - 1, i + (direction < 0 ? -1 : 1))); if (next === i)
    return false; journalTab = JOURNAL_TABS[next]; renderJournal(); return true; }
function bindJournalSwipe() { var zone = $('journalScreen'); if (!zone || zone._journalSwipeBound)
    return; zone._journalSwipeBound = true; zone.addEventListener('touchstart', function (e) { if (currentScreen !== 'journalScreen' || !e.touches || e.touches.length !== 1)
    return; var t = e.touches[0]; journalSwipeStart = { x: t.clientX, y: t.clientY, time: Date.now() }; }, { passive: true }); zone.addEventListener('touchend', function (e) { if (!journalSwipeStart || currentScreen !== 'journalScreen') {
    journalSwipeStart = null;
    return;
} var t = e.changedTouches && e.changedTouches[0], start = journalSwipeStart; journalSwipeStart = null; if (!t)
    return; var dx = t.clientX - start.x, dy = t.clientY - start.y; if (Math.abs(dx) < 52 || Math.abs(dx) < Math.abs(dy) * 1.25 || Date.now() - start.time > 900)
    return; if (e.preventDefault)
    e.preventDefault(); shiftJournalTab(dx < 0 ? 1 : -1); }, { passive: false }); }
function renderJournal() {
    document.querySelectorAll('#journalTabs button').forEach(function (b) {
        var tab = b.getAttribute('data-tab');
        b.classList.toggle('active', tab === journalTab);
        b.classList.toggle('has-page-notification', journalTabHasNew(tab));
    });
    var c = $('journalContent');
    if (journalTab === 'collections') {
        c.innerHTML = '<div class="collection-grid resource-collection-grid">' + Object.keys(RESOURCE).map(function (k) {
            var known = state.discoveredResources.indexOf(k) >= 0, r = RESOURCE[k], key = 'resource:' + k, notices = known ? pageNoticePills('journalScreen', [{ key: key, label: 'Nouveau' }]) : '';
            return '<div class="collection-item resource-collection-item ' + (known ? '' : 'unknown') + ' ' + (notices ? 'has-page-notice' : '') + '"' + itemNoticeData('journalScreen', known ? [key] : []) + '><div class="resource-collection-art" style="--resource-color:' + r.color + '">' + img(r.icon, 'resource-collection-image') + '</div><div class="resource-collection-copy"><strong>' + (known ? r.name : 'Inconnu') + '</strong>' + notices + '<small>' + (known ? format(state.resources[k]) + ' au refuge' : 'Pas encore trouvé') + '</small></div></div>';
        }).join('') + '</div>';
    }
    if (journalTab === 'creatures') {
        c.innerHTML = '<div class="collection-grid">' + Object.keys(CREATURE).map(function (k) {
            var known = state.discoveredCreatures.indexOf(k) >= 0, knowledge = (state.characterKnowledge && state.characterKnowledge[k]) || 0, key = 'creature:' + k + ':' + knowledge, notices = known ? pageNoticePills('journalScreen', [{ key: key, label: knowledge > 1 ? 'Nouveau récit' : 'Nouveau' }]) : '';
            return '<button class="collection-item ' + (known ? '' : 'unknown') + ' ' + (notices ? 'has-page-notice' : '') + '" data-creature="' + k + '"' + itemNoticeData('journalScreen', known ? [key] : []) + '>' + img(CREATURE[k].icon) + '<strong>' + (known ? CREATURE[k].name : 'Silhouette inconnue') + '</strong>' + notices + '<small>' + (known ? CREATURE[k].home + ' · ' + knowledge + ' / 3' : 'Encore caché') + '</small></button>';
        }).join('') + '</div>';
        document.querySelectorAll('[data-creature]').forEach(function (b) { b.onclick = function () { var k = b.getAttribute('data-creature'); if (state.discoveredCreatures.indexOf(k) >= 0)
            showModal(CREATURE[k].icon, CREATURE[k].name, characterJournalText(k)); }; });
    }
    if (journalTab === 'badges') {
        c.innerHTML = '<div class="badge-list">' + visibleBadges().map(function (b) {
            var got = state.badges.indexOf(b.id) >= 0, key = 'badge:' + b.id, notices = got ? pageNoticePills('journalScreen', [{ key: key, label: 'Nouveau badge' }]) : '';
            return '<div class="badge ' + (got ? '' : 'locked') + ' ' + (notices ? 'has-page-notice' : '') + '"' + itemNoticeData('journalScreen', got ? [key] : []) + '><div class="badge-icon">' + b.icon + '</div><div><strong>' + b.name + '</strong>' + notices + '<small>' + b.desc + '</small></div></div>';
        }).join('') + '</div>';
    }
    bindItemNoticeMarkers(c);
}

function showModal(icon, title, text, buttons, cardClass) {
    playSfx('modal_open', .52, 100);
    ['run-end-modal', 'fanal-reveal-modal', 'fanal-detail-modal', 'terrain-resource-modal', 'run-needs-modal', 'companion-detail-modal'].forEach(function (c) { $('modalCard').classList.toggle(c, cardClass === c); });
    $('modalCard').innerHTML = img(icon) + '<h2>' + title + '</h2><div class="modal-copy">' + text + '</div><div class="modal-actions">' + (buttons || '<button class="primary" id="modalClose">Continuer tranquillement</button>') + '</div>';
    $('modal').classList.remove('hidden');
    var close = $('modalClose');
    if (close)
        close.onclick = hideModal;
}
function hideModal(suppressHomePopup) { $('modal').classList.add('hidden'); if (game)
    game.dialogOpen = false; if (!suppressHomePopup && currentScreen === 'homeScreen')
    setTimeout(showOfflineGainPopup, 90); }
var toastTimer;
function showToast(t) { var el = $('toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(function () { el.classList.remove('show'); }, 1900); }
