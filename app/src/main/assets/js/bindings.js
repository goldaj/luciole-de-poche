'use strict';
// Input bindings and Android-style back navigation.
function bind() {
    document.querySelectorAll('[data-screen]').forEach(function (b) { b.addEventListener('click', function () { var screen = b.getAttribute('data-screen'); showScreen(screen); if (typeof markMenuNoticesSeen === 'function') markMenuNoticesSeen(screen); }); });
    $('exploreBtn').onclick = function () { showScreen('mapScreen'); };
    $('backBtn').onclick = handleSystemBack;
    if ($('optionsBtn'))
        $('optionsBtn').onclick = function () { showScreen('optionsScreen'); };
    $('soundBtn').onclick = toggleSound;
    $('returnBtn').onclick = endRun;
    if ($('runNeedsBtn'))
        $('runNeedsBtn').onclick = showRunNeeds;
    if ($('endingReturnBtn'))
        $('endingReturnBtn').onclick = exitEndingCelebration;
    $('modal').onclick = function (e) { if (e.target === $('modal'))
        hideModal(); };
    document.querySelectorAll('#journalTabs button').forEach(function (b) { b.onclick = function () { setJournalTab(b.getAttribute('data-tab')); }; });
    bindJournalSwipe();
    var canvas = $('gameCanvas');
    if (window.PointerEvent) {
        canvas.addEventListener('pointerdown', function (e) { if (canvas.setPointerCapture && e.pointerId !== undefined) {
            try {
                canvas.setPointerCapture(e.pointerId);
            }
            catch (_) { }
        } beginWalkContact(e.pointerId, e.clientX, e.clientY, e); });
        canvas.addEventListener('pointermove', function (e) { moveWalkContact(e.pointerId, e.clientX, e.clientY); });
        canvas.addEventListener('pointerup', function (e) { endWalkContact(e.pointerId); });
        canvas.addEventListener('pointercancel', function (e) { endWalkContact(e.pointerId); });
        window.addEventListener('pointerup', function (e) { endWalkContact(e.pointerId); });
        window.addEventListener('pointercancel', function (e) { endWalkContact(e.pointerId); });
    }
    else {
        canvas.addEventListener('touchstart', function (e) { e.preventDefault(); Array.prototype.forEach.call(e.changedTouches || [], function (t) { beginWalkContact('t' + t.identifier, t.clientX, t.clientY, e); }); }, { passive: false });
        canvas.addEventListener('touchmove', function (e) { e.preventDefault(); Array.prototype.forEach.call(e.changedTouches || [], function (t) { moveWalkContact('t' + t.identifier, t.clientX, t.clientY); }); }, { passive: false });
        canvas.addEventListener('touchend', function (e) { e.preventDefault(); Array.prototype.forEach.call(e.changedTouches || [], function (t) { endWalkContact('t' + t.identifier); }); }, { passive: false });
        canvas.addEventListener('touchcancel', function (e) { e.preventDefault(); Array.prototype.forEach.call(e.changedTouches || [], function (t) { endWalkContact('t' + t.identifier); }); }, { passive: false });
        canvas.addEventListener('mousedown', function (e) { beginWalkContact('mouse', e.clientX, e.clientY, e); });
        window.addEventListener('mousemove', function (e) { moveWalkContact('mouse', e.clientX, e.clientY); });
        window.addEventListener('mouseup', function () { endWalkContact('mouse'); });
    }
    window.addEventListener('blur', stopContinuousWalk);
    window.addEventListener('resize', resizeCanvas);
    document.addEventListener('visibilitychange', function () { if (document.hidden) {
        save();
        return;
    } applyOffline(); touchDay(); ensureDaily(); checkBadges(false); save(); if (currentScreen === 'homeScreen') {
        renderHome();
        setTimeout(showOfflineGainPopup, 90);
    } });
    window.addEventListener('beforeunload', save);
}
