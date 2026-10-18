'use strict';
// Application startup and native bridge exposure.
function boot() {
    loadState();
    preloadAudioAssets();
    bind();
    bindAudioInteractions();
    updateSoundButton();
    loadImages(function () { });
    preloadEndingFrames();
    renderHome();
    renderRegions();
    renderRefuge();
    renderJournal();
    showScreen('homeScreen', true);
    if (typeof tutorialBoot === 'function')
        tutorialBoot();
    window.LuciolePlatform = {
        handleSystemBack: handleSystemBack,
        receiveImportedSaves: receiveImportedSaves,
        onExportResult: function (success, message) { if (message)
            showToast(message); },
        buildSaveArchive: buildSaveArchive
    };
    if (saveRecoveryNotice) {
        setTimeout(function () { showModal('carnet.svg', 'Sauvegarde récupérée', '<p>' + saveRecoveryNotice + '</p>'); saveRecoveryNotice = ''; }, 180);
    }
    if (billingAvailable())
        requestGemCatalog();
}
boot();
