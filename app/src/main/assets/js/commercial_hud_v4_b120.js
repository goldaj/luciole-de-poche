'use strict';
// Commercial gameplay HUD for v4.0.0. Keeps all existing IDs used by tutorials/tests while
// presenting the expedition with the visual hierarchy of the commercial mockups.
(function () {
    function el(id) { return document.getElementById(id); }

    var baseStartRun = startRun;
    var baseUpdateRunUI = updateRunUI;
    var baseUpdateGame = updateGame;
    var baseBeginWalkContact = beginWalkContact;
    var baseEndRun = endRun;

    var RESOURCE_ART = {
        berry: 'v4b114/pickup_berry.png',
        seed: 'v4b114/pickup_seed.png',
        leaf: 'v4b114/pickup_leaf.png',
        mushroom: 'v4b114/pickup_mushroom.png',
        pebble: 'v4b114/pickup_ore.png',
        glow: 'v4b114/firefly_a.png'
    };

    function resourceIconPath(key) {
        if (RESOURCE_ART[key]) return 'img/' + RESOURCE_ART[key];
        return RESOURCE[key] ? 'img/' + RESOURCE[key].icon : 'img/luciole.svg';
    }

    function renderCommercialInventory() {
        if (!game) return;
        var host = el('runInventory');
        if (!host) return;
        var keys = Object.keys(game.inventory).filter(function (key) { return game.inventory[key] > 0; });
        keys.sort(function (a, b) {
            var delta = (game.inventory[b] || 0) - (game.inventory[a] || 0);
            return delta || String(a).localeCompare(String(b));
        });
        host.innerHTML = keys.slice(0, 7).map(function (key) {
            return '<span class="commercial-resource-row" title="' + (RESOURCE[key] ? RESOURCE[key].name : key) + '">' +
                '<img src="' + resourceIconPath(key) + '" alt=""><b>' + game.inventory[key] + '</b></span>';
        }).join('');
        host.classList.toggle('empty', keys.length === 0);
    }

    function drawMiniMap() {
        if (!game || !game.coverage) return;
        var canvas = el('runMiniMap');
        if (!canvas) return;
        var cssSize = Math.max(92, Math.round(canvas.getBoundingClientRect().width || 116));
        var dpr = Math.min(2, window.devicePixelRatio || 1);
        var pixel = Math.round(cssSize * dpr);
        if (canvas.width !== pixel || canvas.height !== pixel) {
            canvas.width = pixel;
            canvas.height = pixel;
        }
        var ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        var size = cssSize;
        ctx.clearRect(0, 0, size, size);

        var bg = ctx.createRadialGradient(size * .52, size * .48, 0, size * .52, size * .48, size * .72);
        bg.addColorStop(0, '#263a5f'); bg.addColorStop(1, '#07182b');
        ctx.fillStyle = bg;
        ctx.beginPath(); ctx.arc(size * .5, size * .5, size * .46, 0, Math.PI * 2); ctx.fill();

        var cov = game.coverage, pad = size * .17, usable = size - pad * 2;
        var cw = usable / cov.cols, ch = usable / cov.rows;
        ctx.save();
        ctx.beginPath(); ctx.arc(size * .5, size * .5, size * .42, 0, Math.PI * 2); ctx.clip();
        for (var gy = 0; gy < cov.rows; gy++) {
            for (var gx = 0; gx < cov.cols; gx++) {
                if (!cov.cells[gy * cov.cols + gx]) continue;
                var hue = ((gx * 17 + gy * 11 + game.region * 23) % 4);
                ctx.fillStyle = hue === 0 ? 'rgba(112,105,169,.90)' : hue === 1 ? 'rgba(84,103,151,.88)' : 'rgba(74,91,136,.88)';
                ctx.beginPath();
                ctx.roundRect ? ctx.roundRect(pad + gx * cw - .4, pad + gy * ch - .4, cw + .8, ch + .8, 2) : ctx.rect(pad + gx * cw, pad + gy * ch, cw + .5, ch + .5);
                ctx.fill();
            }
        }
        // Revealed chests become tiny warm landmarks.
        (game.gemChests || []).forEach(function (chest) {
            if (!chest.revealed || chest.opened) return;
            var x = pad + chest.x / game.world * usable, y = pad + chest.y / game.world * usable;
            ctx.fillStyle = '#d9a24d'; ctx.fillRect(x - 2.3, y - 1.8, 4.6, 3.6);
        });
        // Current player marker.
        var px = pad + game.player.x / game.world * usable, py = pad + game.player.y / game.world * usable;
        ctx.fillStyle = '#ffd050'; ctx.strokeStyle = '#412e1c'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(px, py - 5.5); ctx.lineTo(px + 4.2, py + 4); ctx.lineTo(px - 4.2, py + 4); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.restore();
    }

    function updateCommercialHud() {
        if (!game) return;
        var light = Math.max(0, Math.min(100, Math.ceil(game.light)));
        var lightLabel = el('lightLabel');
        if (lightLabel) lightLabel.textContent = light + '%';
        var fill = el('commercialLightFill');
        if (fill) fill.style.width = light + '%';
        var mapLabel = el('mapLabel');
        if (mapLabel) mapLabel.textContent = mapCoveragePercent() + '%';
        renderCommercialInventory();
        drawMiniMap();
    }

    function setPaused(paused) {
        if (!game || !game.running) return;
        game.v4Paused = !!paused;
        if (paused && typeof stopContinuousWalk === 'function') stopContinuousWalk();
        var overlay = el('runPauseOverlay');
        if (overlay) overlay.classList.toggle('hidden', !paused);
        var button = el('runPauseBtn');
        if (button) button.classList.toggle('active', !!paused);
    }

    startRun = function () {
        var result = baseStartRun.apply(this, arguments);
        if (game) game.v4Paused = false;
        var overlay = el('runPauseOverlay');
        if (overlay) overlay.classList.add('hidden');
        updateCommercialHud();
        return result;
    };

    updateRunUI = function () {
        baseUpdateRunUI.apply(this, arguments);
        updateCommercialHud();
    };

    updateGame = function (dt) {
        if (game && game.v4Paused) return;
        return baseUpdateGame.call(this, dt);
    };

    beginWalkContact = function () {
        if (game && game.v4Paused) return;
        return baseBeginWalkContact.apply(this, arguments);
    };

    endRun = function () {
        var overlay = el('runPauseOverlay');
        if (overlay) overlay.classList.add('hidden');
        return baseEndRun.apply(this, arguments);
    };

    var pauseButton = el('runPauseBtn');
    if (pauseButton) pauseButton.addEventListener('click', function (event) {
        event.preventDefault(); event.stopPropagation();
        setPaused(!(game && game.v4Paused));
    });
    var resumeButton = el('runResumeBtn');
    if (resumeButton) resumeButton.addEventListener('click', function (event) {
        event.preventDefault(); event.stopPropagation(); setPaused(false);
    });

    window.addEventListener('resize', function () {
        if (game && game.running) drawMiniMap();
    });
})();
