'use strict';
// Luciole de poche v4.0.0 — commercial 2.5D isometric expedition renderer — build124.
// The v3.2.7 simulation remains authoritative. This layer only projects canonical world coordinates
// and replaces prototype primitives with production art assets.
var ISO_X = 0.62;
var ISO_Y = 0.31;
var ISO_CENTER_Y = 0.54;
var ISO_SPEED_BASELINE = Math.sqrt(ISO_X * ISO_X + ISO_Y * ISO_Y);
function isoProjectedUnitScale(dx, dy) {
    var len = Math.sqrt(dx * dx + dy * dy);
    if (len < .0001) return ISO_SPEED_BASELINE;
    var ux = dx / len, uy = dy / len;
    var sx = ISO_X * (ux - uy), sy = ISO_Y * (ux + uy);
    return Math.max(.0001, Math.sqrt(sx * sx + sy * sy));
}
function isometricMovementSpeedMultiplier(dx, dy) {
    // Keep apparent screen velocity constant despite the non-uniform isometric projection.
    var factor = ISO_SPEED_BASELINE / isoProjectedUnitScale(dx, dy);
    return Math.max(.76, Math.min(1.60, factor));
}
function isometricVisualDistanceStep(dx, dy, worldStep) {
    return worldStep * isoProjectedUnitScale(dx, dy) / ISO_SPEED_BASELINE;
}
var V4_GROUND_CELL = 128;
var V4_OUTSIDE_PAD = 512;
var V4_BORDER_INSET = 46;
var V4_WALK_INSET = 68;
var isoBaseStartRun = startRun;

function isoViewCenter() {
    return { x: game.viewW * 0.5, y: game.viewH * ISO_CENTER_Y };
}
function isoProject(x, y) {
    var center = isoViewCenter(), dx = x - game.player.x, dy = y - game.player.y;
    return { x: center.x + (dx - dy) * ISO_X, y: center.y + (dx + dy) * ISO_Y };
}
function isoUnproject(screenX, screenY) {
    var center = isoViewCenter(), a = (screenX - center.x) / ISO_X, b = (screenY - center.y) / ISO_Y;
    return { x: game.player.x + (a + b) * .5, y: game.player.y + (b - a) * .5 };
}
function screenToWorld(clientX, clientY) {
    var rect = game.canvasRect || game.canvas.getBoundingClientRect();
    var p = isoUnproject(clientX - rect.left, clientY - rect.top);
    return { x: p.x, y: p.y };
}
function getCamera() {
    return { x: game.player.x - game.viewW * .5, y: game.player.y - game.viewH * .5 };
}
function isoOnScreen(p, margin) {
    margin = margin || 100;
    return p.x >= -margin && p.x <= game.viewW + margin && p.y >= -margin && p.y <= game.viewH + margin;
}
function isoDepth(x, y, bias) { return x + y + (bias || 0); }
function isoImage(key) {
    var image = IMG[key];
    return image && image.complete && image.naturalWidth ? image : null;
}
function isoDrawImage(ctx, key, p, width, height, anchorY, alpha, flipX) {
    var image = isoImage(key);
    if (!image) return false;
    ctx.save();
    if (alpha != null) ctx.globalAlpha = alpha;
    ctx.translate(p.x, p.y - (anchorY == null ? 0 : anchorY));
    if (flipX) ctx.scale(-1, 1);
    ctx.drawImage(image, -width * .5, -height, width, height);
    ctx.restore();
    return true;
}
function isoShadow(ctx, p, rx, ry, alpha) {
    ctx.save();
    ctx.fillStyle = 'rgba(8,19,20,' + (alpha == null ? .30 : alpha) + ')';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + 4, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}
function isoHex(hex) {
    var h = String(hex || '#70927b').replace('#', '');
    if (h.length === 3) h = h.split('').map(function (x) { return x + x; }).join('');
    var n = parseInt(h, 16);
    return isFinite(n) ? { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 } : { r: 112, g: 146, b: 123 };
}
function isoMix(a, b, t) {
    var x = isoHex(a), y = isoHex(b); t = Math.max(0, Math.min(1, t));
    return 'rgb(' + Math.round(x.r + (y.r - x.r) * t) + ',' + Math.round(x.g + (y.g - x.g) * t) + ',' + Math.round(x.b + (y.b - x.b) * t) + ')';
}
function isoRgba(hex, a) { var c = isoHex(hex); return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + a + ')'; }
function isoHash(a, b, c) {
    var n = ((a * 73856093) ^ (b * 19349663) ^ ((c || 0) * 83492791)) >>> 0;
    n ^= n << 13; n ^= n >>> 17; n ^= n << 5;
    return (n >>> 0) / 4294967295;
}


function walkBoundaryInset() { return V4_WALK_INSET; }
function buildV4Border() {
    var border = [], index = 0, min = V4_BORDER_INSET, max = game.world - V4_BORDER_INSET;
    var length = Math.max(1, max - min), segments = Math.max(8, Math.ceil(length / 72)), step = length / segments;
    function push(x, y, side, segment) {
        // Every fourth segment is a deliberate sight window. Large trees may still live near the
        // border in general, but these windows guarantee the player can always spot a piece of it.
        var sight = segment > 0 && segment < segments && (segment % 4 === 2);
        border.push({ x: x, y: y, side: side, variant: index++, sight: sight });
    }
    for (var i = 0; i <= segments; i++) {
        var q = min + step * i;
        push(q, min, 'top', i);
        push(q, max, 'bottom', i);
        if (i > 0 && i < segments) {
            push(min, q, 'left', i);
            push(max, q, 'right', i);
        }
    }
    return border;
}
function v4LargeTreeKey(key) { return v4IsLargeDecorKey(key); }
function v4TreeBlocksBarrierSight(x, y, border) {
    var radius = 112, radiusSq = radius * radius;
    for (var i = 0; i < border.length; i++) {
        var b = border[i];
        if (!b.sight) continue;
        if (distSquared(x, y, b.x, b.y) <= radiusSq) return true;
    }
    return false;
}
function applyV4BarrierSightWindows() {
    var border = game.v4Border || [];
    for (var i = 0; i < game.decor.length; i++) {
        var d = game.decor[i], key = isoDecorSprite(d);
        d.v4HideForBarrierSight = v4LargeTreeKey(key) && v4TreeBlocksBarrierSight(d.x, d.y, border);
    }
    var outside = game.v4OutsideDecor || [];
    for (i = 0; i < outside.length; i++) {
        var o = outside[i], outsideKey = o.outsideKey || '';
        o.v4HideForBarrierSight = v4LargeTreeKey(outsideKey) && v4TreeBlocksBarrierSight(o.x, o.y, border);
    }
}
function v4BiomeArt(region) {
    if (typeof V4_BIOME_ART !== 'undefined' && V4_BIOME_ART[region]) return V4_BIOME_ART[region];
    // Standalone/headless fallback: the Clairière remains the only built-in art library.
    return {
        ground: ['v4GroundA','v4GroundB','v4GroundC','v4GroundN1','v4GroundN2','v4GroundN3','v4GroundN4','v4GroundN5','v4GroundN6','v4GroundN7','v4GroundN8'],
        large: ['v4Tree','v4TreeN1','v4TreeN2','v4TreeN3','v4TreeN4','v4TreeN5','v4TreeN6','v4TreeN7'],
        small: ['v4FlowerA','v4FlowerB','v4FlowerN1','v4FlowerN2','v4GrassN1','v4FernN1','v4RockA','v4RockB','v4RockN1','v4RockN2','v4RockN3','v4RockN4','v4BushA','v4BushB','v4BushC','v4BushN1','v4BushN2','v4FallenLog','v4Stump','v4Mushrooms','v4MushroomsSmall','v4MushroomsLarge'],
        border: ['v4BorderFlower1','v4BorderHedge1','v4Fence','v4BorderRock1'],
        orb: ['v4OrbA','v4OrbB','v4LightOrb']
    };
}
function v4PoolPick(pool, variant) {
    if (!pool || !pool.length) return null;
    return pool[Math.abs(variant || 0) % pool.length];
}
function v4IsLargeDecorKey(key) {
    return !!key && (key.indexOf('_large_') >= 0 || key.indexOf('v4Tree') === 0);
}
function isoBorderMainKey(b) {
    var art = v4BiomeArt(game.region);
    return v4PoolPick(art.border, b.variant);
}
function isoDrawBorder(ctx, b) {
    var p = isoProject(b.x, b.y); if (!isoOnScreen(p, 80)) return;
    var key = isoBorderMainKey(b), glow = key.indexOf('Lantern') >= 0 || key.indexOf('Crystal') >= 0;
    // Most generated border atlases have a native up-left / down-right diagonal, so the top and
    // bottom edges are mirrored together. The original Clairière assets from the first balade were
    // painted in the opposite direction, so forcing that mirror there makes both the top and the
    // bottom look reversed. Special-case that biome to preserve the correct visual read.
    var useNativeHorizontal = game.region === 0;
    var flipX = (b.side === 'top' || b.side === 'bottom') ? !useNativeHorizontal : (b.side === 'right' ? false : (b.variant % 2 === 1));
    if (b.side === 'top') { p.x += 4; p.y -= 7; }
    else if (b.side === 'bottom') { p.x -= 4; p.y += 7; }
    else if (b.side === 'right') { p.x += 4; p.y += 7; }
    var horizontalBorder = key.indexOf('Border') >= 0 || key.indexOf('_border_') >= 0;
    var size = horizontalBorder ? { w: 104, h: 64, y: 0 } : isoDecorSize(key, { s: 34 });
    isoShadow(ctx, p, Math.max(10, size.w * .22), Math.max(3, size.w * .055), .16);
    if (glow) {
        var gy = p.y - size.h * .45, radius = key.indexOf('Crystal') >= 0 ? 30 : 22;
        var g = ctx.createRadialGradient(p.x, gy, 0, p.x, gy, radius);
        g.addColorStop(0, key.indexOf('Crystal') >= 0 ? 'rgba(157,79,255,.16)' : 'rgba(255,188,51,.12)');
        g.addColorStop(1, 'rgba(255,188,51,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, gy, radius, 0, Math.PI * 2); ctx.fill();
    }
    isoDrawImage(ctx, key, p, size.w, size.h, size.y, .96, flipX);
    if ((b.variant % 7) === 0 && horizontalBorder) {
        var art = v4BiomeArt(game.region), accentKey = v4PoolPick(art.small, b.variant + 5);
        if (accentKey) {
            var ap = { x: p.x + (b.side === 'right' ? -10 : 10), y: p.y + 2 };
            var asz = isoDecorSize(accentKey, { s: 22 });
            isoDrawImage(ctx, accentKey, ap, asz.w * .48, asz.h * .48, 0, .92, (b.variant % 12) < 6);
        }
    }
}

function v4GroundPool() {
    return v4BiomeArt(game.region).ground;
}
function buildV4GroundCache() {
    var byCell = Object.create(null), pool = v4GroundPool(), cell = V4_GROUND_CELL, region = game.region;
    var minGrid = Math.floor(-V4_OUTSIDE_PAD / cell), maxGrid = Math.ceil((game.world + V4_OUTSIDE_PAD) / cell);
    for (var gy = minGrid; gy <= maxGrid; gy++) {
        for (var gx = minGrid; gx <= maxGrid; gx++) {
            var hsh = isoHash(gx, gy, game.v4GroundSeed || region), shift = (region * 3 + game.level) % pool.length;
            var width = 236 + Math.round(isoHash(gx + 11, gy - 3, region) * 34);
            byCell[gx + ':' + gy] = {
                gx: gx, gy: gy,
                x: gx * cell + cell * .5,
                y: gy * cell + cell * .5,
                key: pool[(Math.floor(hsh * pool.length) + shift) % pool.length],
                w: width, h: width * .73,
                rot: (isoHash(gx - 7, gy + 13, region) - .5) * .08,
                alpha: .88 + isoHash(gx + 2, gy + 9, region) * .10,
                flip: ((gx + gy) % 2) !== 0
            };
        }
    }
    return byCell;
}
function v4OutsideDecorKey(region, variant) {
    var art = v4BiomeArt(region), pool = (art.large || []).concat(art.small || []);
    return v4PoolPick(pool, variant);
}
function buildV4OutsideDecor(rng) {
    var items = [], band = Math.max(170, V4_OUTSIDE_PAD * .72), countPerSide = 42;
    function add(x, y, side, i) {
        items.push({ x: x, y: y, s: 28 + rng() * 42, t: 7, rot: rng() * Math.PI * 2, variant: (i + side * 7) % 19, phase: rng() * Math.PI * 2, outsideKey: v4OutsideDecorKey(game.region, i + side * 7) });
    }
    for (var i = 0; i < countPerSide; i++) {
        var qx = -band + rng() * (game.world + band * 2), qy = -band + rng() * (game.world + band * 2);
        add(qx, -24 - rng() * band, 0, i);
        add(qx, game.world + 24 + rng() * band, 1, i);
        add(-24 - rng() * band, qy, 2, i);
        add(game.world + 24 + rng() * band, qy, 3, i);
    }
    return items;
}
function isoDrawOutsideDecor(ctx, d) {
    if (d.v4HideForBarrierSight) return;
    var p = isoProject(d.x, d.y); if (!isoOnScreen(p, 190)) return;
    var key = d.outsideKey || v4PoolPick(v4BiomeArt(game.region).large, d.variant), size = isoDecorSize(key, d);
    isoShadow(ctx, p, size.w * .22, Math.max(3, size.w * .055), .12);
    isoDrawImage(ctx, key, p, size.w, size.h, size.y, .92, ((d.variant || 0) % 2) === 1);
}


function v4DecorRingLevel(x, y) {
    var cx = game.world * .5, cy = game.world * .5;
    var edgeDistance = Math.max(Math.abs(x - cx), Math.abs(y - cy));
    for (var level = 1; level <= 4; level++) {
        var tier = WALK_TIER[level - 1];
        if (tier && edgeDistance <= tier.world * .5 + .001) return level;
    }
    return 4;
}
function v4DecorDensityForRing(ring) {
    return [0, .55, .75, 1.00, 1.35][Math.max(1, Math.min(4, ring | 0))];
}
function v4BaseDecorVisible(d, index) {
    if (d.t === 2) return true; // Light orbs are gameplay, never density-filtered.
    var ring = v4DecorRingLevel(d.x, d.y);
    var chance = Math.min(1, v4DecorDensityForRing(ring));
    // Stable per object for the full walk; no frame-time randomness.
    var roll = isoHash(Math.round(d.x * .17) + index * 11, Math.round(d.y * .13) - index * 7, game.region * 13 + game.level);
    return roll < chance;
}
function v4RingBounds(ring) {
    var outer = WALK_TIER[Math.max(0, Math.min(3, ring - 1))].world * .5;
    var inner = ring <= 1 ? 0 : WALK_TIER[ring - 2].world * .5;
    return { inner: inner, outer: outer };
}
function v4RingArea(ring) {
    var b = v4RingBounds(ring);
    return Math.max(0, (b.outer * 2) * (b.outer * 2) - (b.inner * 2) * (b.inner * 2));
}
function v4VisualExtraCountForRing(ring) {
    // Decorations per million world units. Ring 3 intentionally matches the build124 visual load.
    var densityPerMillion = [0, 17, 23, 31, 50][ring];
    return Math.max(0, Math.round(v4RingArea(ring) / 1000000 * densityPerMillion));
}
function v4RandomPointInRing(rng, ring) {
    var bounds = v4RingBounds(ring), cx = game.world * .5, cy = game.world * .5;
    for (var tries = 0; tries < 80; tries++) {
        var x = cx + (rng() * 2 - 1) * bounds.outer;
        var y = cy + (rng() * 2 - 1) * bounds.outer;
        var d = Math.max(Math.abs(x - cx), Math.abs(y - cy));
        if (d <= bounds.outer && (ring === 1 || d > bounds.inner)) {
            return { x: Math.max(35, Math.min(game.world - 35, x)), y: Math.max(35, Math.min(game.world - 35, y)) };
        }
    }
    return { x: cx, y: cy };
}
function buildV4TieredVisualDecor(rng) {
    var maxRing = Math.max(1, Math.min(4, game.level | 0));
    for (var ring = 1; ring <= maxRing; ring++) {
        var count = v4VisualExtraCountForRing(ring);
        for (var i = 0; i < count; i++) {
            var p = v4RandomPointInRing(rng, ring);
            game.decor.push({
                x: p.x, y: p.y,
                s: 24 + rng() * 48,
                t: 4 + Math.floor(rng() * 4),
                rot: rng() * Math.PI * 2,
                variant: Math.floor(rng() * 12),
                phase: rng() * Math.PI * 2,
                v4VisualOnly: true,
                v4Ring: ring,
                v4Density: v4DecorDensityForRing(ring)
            });
        }
    }
}

function v4KeepLargeDecor(d, kept) {
    if (!d || d.t !== 0) return true;
    var ring = d.v4Ring || v4DecorRingLevel(d.x, d.y);
    var roll = isoHash(Math.round(d.x * .11), Math.round(d.y * .09), game.region * 97 + ring * 17);
    var keepChance = [0, .48, .62, .74, .82][Math.max(1, Math.min(4, ring))];
    if (roll > keepChance) return false;
    var minDistance = [0, 176, 162, 150, 138][Math.max(1, Math.min(4, ring))];
    for (var i = 0; i < kept.length; i++) {
        var other = kept[i], dx = d.x - other.x, dy = d.y - other.y;
        if (dx * dx + dy * dy < minDistance * minDistance) return false;
    }
    return true;
}
function v4RebalanceDecor() {
    var kept = [], out = [];
    for (var i = 0; i < game.decor.length; i++) {
        var d = game.decor[i];
        if (d.t === 0) {
            if (!v4KeepLargeDecor(d, kept)) continue;
            kept.push(d);
        }
        out.push(d);
    }
    game.decor = out;
    game.lightOrbs = out.filter(function (d) { return d.t === 2; });
}
function v4ObstacleForDecor(d) {
    var key = isoDecorSprite(d), sz = isoDecorSize(key, d);
    if (!v4IsLargeDecorKey(key)) return null;
    var rx = Math.max(28, Math.min(48, sz.w * .28));
    var ry = Math.max(18, Math.min(34, sz.w * .18));
    return { x: d.x, y: d.y + 2, rx: rx, ry: ry, source: d, key: key };
}
function v4BuildObstacles() {
    var obs = [];
    for (var i = 0; i < game.decor.length; i++) {
        var o = v4ObstacleForDecor(game.decor[i]);
        if (o) obs.push(o);
    }
    game.v4Obstacles = obs;
}
function v4PushOutOfObstacle(x, y, obstacle, padding) {
    var rx = obstacle.rx + padding, ry = obstacle.ry + padding;
    var dx = x - obstacle.x, dy = y - obstacle.y;
    var nx = dx / Math.max(.001, rx), ny = dy / Math.max(.001, ry);
    var q = nx * nx + ny * ny;
    if (q >= 1) return { x: x, y: y, moved: false };
    if (Math.abs(dx) < .001 && Math.abs(dy) < .001) {
        dx = rx; dy = 0; q = 0;
    }
    var scale = 1 / Math.sqrt(Math.max(.0001, q));
    return { x: obstacle.x + dx * scale, y: obstacle.y + dy * scale, moved: true };
}
function v4ResolvePosition(x, y, padding, previousX, previousY) {
    var inset = walkBoundaryInset(), resolved = { x: Math.max(inset, Math.min(game.world - inset, x)), y: Math.max(inset, Math.min(game.world - inset, y)) };
    var obs = game.v4Obstacles || [];
    for (var pass = 0; pass < 3; pass++) {
        var changed = false;
        for (var i = 0; i < obs.length; i++) {
            var o = obs[i];
            if (Math.abs(resolved.x - o.x) > o.rx + padding + 12 || Math.abs(resolved.y - o.y) > o.ry + padding + 12) continue;
            var pushed = v4PushOutOfObstacle(resolved.x, resolved.y, o, padding);
            if (pushed.moved) {
                resolved.x = Math.max(inset, Math.min(game.world - inset, pushed.x));
                resolved.y = Math.max(inset, Math.min(game.world - inset, pushed.y));
                changed = true;
            }
        }
        if (!changed) break;
    }
    return resolved;
}
function v4ResolveGameplayPlacements() {
    function adjust(item) {
        if (!item) return;
        var p = v4ResolvePosition(item.x, item.y, 8, item.x, item.y);
        item.x = p.x; item.y = p.y;
    }
    (game.nodes || []).forEach(adjust);
    (game.creatures || []).forEach(adjust);
    (game.gemChests || []).forEach(adjust);
    if (game.companion) adjust(game.companion);
}
function walkResolveTargetPosition(x, y) {
    if (!game || !game.v4Obstacles) return { x: x, y: y };
    return v4ResolvePosition(x, y, 10, game.player ? game.player.x : x, game.player ? game.player.y : y);
}
function walkResolvePlayerPosition(x, y, previousX, previousY) {
    if (!game || !game.v4Obstacles) return { x: x, y: y };
    return v4ResolvePosition(x, y, 16, previousX, previousY);
}

startRun = function (regionIndex) {
    isoBaseStartRun(regionIndex);
    if (!game) return;
    var rng = game.rng || Math.random;
    for (var i = 0; i < game.decor.length; i++) {
        game.decor[i].variant = Math.floor(rng() * 12);
        game.decor[i].phase = rng() * Math.PI * 2;
        game.decor[i].v4Ring = v4DecorRingLevel(game.decor[i].x, game.decor[i].y);
        game.decor[i].v4DensityVisible = v4BaseDecorVisible(game.decor[i], i);
    }
    v4RebalanceDecor();
    // Visual-only ornamentation is built ring by ring. The inner level-1 footprint stays sparse at
    // every upgrade; each newly unlocked outer band is deliberately richer than the previous one.
    buildV4TieredVisualDecor(rng);
    game.v4GroundSeed = Math.floor(rng() * 1000000);
    game.v4GroundCache = buildV4GroundCache();
    game.v4OutsideDecor = buildV4OutsideDecor(rng);
    game.v4Border = buildV4Border();
    v4BuildObstacles();
    v4ResolveGameplayPlacements();
    applyV4BarrierSightWindows();
};

function isoGround(ctx, t) {
    var w = game.viewW, h = game.viewH, region = game.region;
    var bg = [
        ['#071d24','#10261f'], ['#06202a','#12333a'], ['#20170b','#342711'], ['#071b20','#0e2927'],
        ['#0c1933','#1c3150'], ['#07131f','#11192a'], ['#11152e','#26233f'], ['#0d1930','#20344d']
    ][region] || ['#071d24','#10261f'];
    var top = bg[0], bottom = bg[1];
    var grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, top);
    grad.addColorStop(.54, bottom);
    grad.addColorStop(1, '#071417');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // build120: keep the exact proven build114 viewport traversal and draw budget.
    // The only difference is that every cell descriptor was frozen in startRun().
    var cell = V4_GROUND_CELL, gx0 = Math.floor(game.player.x / cell), gy0 = Math.floor(game.player.y / cell);
    var cache = game.v4GroundCache || Object.create(null);
    for (var gy = gy0 - 4; gy <= gy0 + 4; gy++) {
        for (var gx = gx0 - 4; gx <= gx0 + 4; gx++) {
            var tile = cache[gx + ':' + gy];
            if (!tile) continue;
            var p = isoProject(tile.x, tile.y);
            if (!isoOnScreen(p, 190)) continue;
            var image = isoImage(tile.key);
            if (!image) continue;
            ctx.save();
            ctx.globalAlpha = tile.alpha;
            ctx.translate(p.x, p.y - tile.h * .10);
            ctx.rotate(tile.rot);
            ctx.scale(tile.flip ? -1 : 1, 1);
            ctx.drawImage(image, -tile.w * .5, -tile.h * .38, tile.w, tile.h);
            ctx.restore();
        }
    }

    // Same lightweight build114 warm-light treatment; no large offscreen surface or world-wide ground pass.
    ctx.save();
    for (var i = 0; i < 11; i++) {
        var wx2 = game.player.x + (((i * 167 + 31) % 520) - 260);
        var wy2 = game.player.y + (((i * 109 + 71) % 520) - 260);
        var p2 = isoProject(wx2, wy2);
        if (!isoOnScreen(p2, 40)) continue;
        var glow = ctx.createRadialGradient(p2.x, p2.y, 0, p2.x, p2.y, 44 + i % 3 * 12);
        glow.addColorStop(0, 'rgba(245,194,82,.08)');
        glow.addColorStop(1, 'rgba(245,194,82,0)');
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(p2.x, p2.y, 58, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
}

function isoDecorSprite(d) {
    var v = d.variant || 0, art = v4BiomeArt(game.region);
    if (d.t === 0) return v4PoolPick(art.large, v);
    if (d.t === 2) return v4PoolPick(art.orb, v);
    return v4PoolPick(art.small, v + d.t * 3);
}
function isoDecorSize(key, d) {
    var scale = Math.max(.72, Math.min(1.28, (d.s || 42) / 42));
    if (key && key.indexOf('_large_') >= 0) {
        var li = IMG[key], lh = 174 * scale, lr = li && li.naturalHeight ? li.naturalWidth / li.naturalHeight : .8;
        return { w: Math.max(92, Math.min(210, lh * lr)), h: lh, y: 5 };
    }
    if (key && key.indexOf('_border_') >= 0) {
        var bi = IMG[key], bh = 64 * scale, br = bi && bi.naturalHeight ? bi.naturalWidth / bi.naturalHeight : 1.45;
        return { w: Math.max(84, Math.min(150, bh * br)), h: bh, y: 0 };
    }
    if (key && key.indexOf('_small_') >= 0) {
        var si = IMG[key], sh = 68 * scale, sr = si && si.naturalHeight ? si.naturalWidth / si.naturalHeight : 1.1;
        return { w: Math.max(48, Math.min(112, sh * sr)), h: sh, y: 0 };
    }
    if (key.indexOf('v4Tree') === 0) return { w: 126 * scale, h: 174 * scale, y: 5 };
    if (key.indexOf('Crystal') >= 0) return { w: 76 * scale, h: 80 * scale, y: 2 };
    if (key.indexOf('Lantern') >= 0) return { w: 58 * scale, h: 84 * scale, y: 1 };
    if (key === 'v4FallenLog' || key === 'v4LogN1' || key.indexOf('RootN') >= 0) return { w: 94 * scale, h: 64 * scale, y: 0 };
    if (key === 'v4Fence') return { w: 82 * scale, h: 57 * scale, y: 0 };
    if (key === 'v4Stump') return { w: 72 * scale, h: 69 * scale, y: 0 };
    if (key.indexOf('Mushroom') >= 0 || key.indexOf('MushN') >= 0) return { w: 70 * scale, h: 76 * scale, y: 0 };
    if (key.indexOf('Bush') >= 0 || key.indexOf('Flower') >= 0 || key.indexOf('Rock') >= 0 || key.indexOf('Fern') >= 0 || key.indexOf('Grass') >= 0 || key === 'v4RocksFlowers') return { w: 78 * scale, h: 66 * scale, y: 0 };
    if (key === 'v4PondN1') return { w: 118 * scale, h: 66 * scale, y: 0 };
    if (key === 'v4WaterfallN1') return { w: 120 * scale, h: 98 * scale, y: 0 };
    if (key.indexOf('Orb') >= 0) return { w: 32 * scale, h: 32 * scale, y: 16 };
    return { w: 70 * scale, h: 62 * scale, y: 0 };
}
function isoDrawDecor(ctx, d, t) {
    if (d.v4HideForBarrierSight) return;
    if (d.t === 2 && d.collected) return;
    var p = isoProject(d.x, d.y); if (!isoOnScreen(p, 180)) return;
    var key = isoDecorSprite(d), sz = isoDecorSize(key, d);
    if (d.t === 2) {
        var pulse = 1 + Math.sin(t * 2.2 + (d.phase || 0)) * .08;
        sz = { w: 34 * pulse, h: 34 * pulse, y: 16 };
    } else {
        isoShadow(ctx, p, sz.w * .25, Math.max(3, sz.w * .065), v4IsLargeDecorKey(key) ? .28 : .17);
    }
    var flipX = ((d.variant || 0) % 2) === 1;
    if (key.indexOf('Crystal') >= 0 || key.indexOf('Lantern') >= 0) {
        var magic = key.indexOf('Crystal') >= 0, glowRadius = magic ? 45 : 35;
        var glow = ctx.createRadialGradient(p.x, p.y - sz.h * .45, 0, p.x, p.y - sz.h * .45, glowRadius);
        glow.addColorStop(0, magic ? 'rgba(157,79,255,.18)' : 'rgba(255,188,51,.16)');
        glow.addColorStop(1, magic ? 'rgba(157,79,255,0)' : 'rgba(255,188,51,0)');
        ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(p.x, p.y - sz.h * .45, glowRadius, 0, Math.PI * 2); ctx.fill();
    }
    // No primitive fallback in v4: a late asset decode may hide this prop for a frame,
    // but it must never resurrect the prototype art direction.
    isoDrawImage(ctx, key, p, sz.w, sz.h, sz.y, 1, flipX);
    if (d.t !== 2 && (d.variant || 0) % 5 === 0) {
        var localArt = v4BiomeArt(game.region), accentKey = v4PoolPick(localArt.small, (d.variant || 0) + 11);
        if (accentKey && accentKey !== key) {
            var ap = { x: p.x + (((d.variant || 0) % 3) - 1) * 10, y: p.y + 2 };
            var asz = isoDecorSize(accentKey, { s: 20 + ((d.variant || 0) % 4) * 3 });
            isoDrawImage(ctx, accentKey, ap, asz.w * .48, asz.h * .48, 0, .92, false);
        }
    }
}

function isoResourceArtKey(type) {
    return type;
}
function isoDrawResource(ctx, n, t, visibility) {
    var pd2 = distSquared(game.player.x, game.player.y, n.x, n.y), stage = resourceStage(n, game.player, game.lightOrbs, visibility, pd2);
    var alpha = stage === 'lit' ? 1 : stage === 'near' ? .34 : stage === 'remembered' ? visibility.rememberedAlpha : stage === 'rememberedRare' ? visibility.rememberedRareAlpha : 0;
    if (n.taken || alpha <= 0) return;
    var p = isoProject(n.x, n.y); if (!isoOnScreen(p, 80)) return;
    var bob = Math.sin(t * 2 + n.bob) * 2, key = isoResourceArtKey(n.type), sz = n.rare ? 48 : 40;
    isoShadow(ctx, p, 13, 4, .16);
    ctx.save(); ctx.globalAlpha = alpha;
    if (n.rare && stage === 'lit') {
        var rareGlow = ctx.createRadialGradient(p.x, p.y - 20, 0, p.x, p.y - 20, 31);
        rareGlow.addColorStop(0, 'rgba(185,118,255,.28)'); rareGlow.addColorStop(1, 'rgba(185,118,255,0)');
        ctx.fillStyle = rareGlow; ctx.beginPath(); ctx.arc(p.x, p.y - 20, 31, 0, Math.PI * 2); ctx.fill();
    }
    if (key && isoImage(key)) {
        var art = isoImage(key); ctx.drawImage(art, p.x - sz * .5, p.y - sz + 5 + bob, sz, sz);
    } else if (IMG[n.type] && IMG[n.type].complete) {
        ctx.drawImage(IMG[n.type], p.x - sz * .5, p.y - sz + 5 + bob, sz, sz);
    }
    ctx.restore();
}
function isoDrawCreature(ctx, o, t, visibility) {
    var p = isoProject(o.x, o.y); if (!isoOnScreen(p, 90)) return;
    var bob = Math.sin(t * 1.3 + o.phase) * 2.5, sz = 57;
    isoShadow(ctx, p, 18, 5, .18);
    if (IMG[o.type] && IMG[o.type].complete) ctx.drawImage(IMG[o.type], p.x - sz * .5, p.y - sz + 8 + bob, sz, sz);
    if (creatureHasNewDialogue(o) && creatureDirectlyLit(o, visibility)) {
        ctx.save(); ctx.translate(p.x + 22, p.y - 51 + bob); ctx.fillStyle = '#d91828'; ctx.strokeStyle = '#f3c66b'; ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#fff5d4'; ctx.font = '900 13px Georgia,serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('!', 0, .5); ctx.restore();
    }
}
function isoDrawPlayer(ctx, t) {
    var p = isoProject(game.player.x, game.player.y), moving = distSquared(game.player.x, game.player.y, game.player.targetX, game.player.targetY) > 9;
    var target = isoProject(game.player.targetX, game.player.targetY), screenDx = target.x - p.x, screenDy = target.y - p.y;
    if (moving) {
        if (screenDy >= 0) game.isoDirection = screenDx >= 0 ? 'DR' : 'DL';
        else game.isoDirection = screenDx >= 0 ? 'UR' : 'UL';
    }
    if (!game.isoDirection) game.isoDirection = 'DR';
    // The gait is distance-driven: A -> neutral -> B -> neutral. B comes from the opposite diagonal
    // view mirrored back into the current direction, which gives a genuinely opposite leading leg
    // without changing the established character art direction.
    var cycleDistance = 144, gaitDistance = typeof game.visualDistance === 'number' ? game.visualDistance : game.distance;
    var gaitFrame = moving ? Math.floor((gaitDistance % cycleDistance) / (cycleDistance / 4)) : -1;
    var direction = game.isoDirection, spriteDirection = direction, spriteFrame = 0, flipSprite = false;
    if (moving) {
        if (gaitFrame === 0) spriteFrame = 1;
        else if (gaitFrame === 1 || gaitFrame === 3) spriteFrame = 0;
        else {
            spriteFrame = 1;
            if (direction === 'DR') spriteDirection = 'DL';
            else if (direction === 'DL') spriteDirection = 'DR';
            else if (direction === 'UR') spriteDirection = 'UL';
            else spriteDirection = 'UR';
            flipSprite = true;
        }
    }
    var key = 'v4Hero' + spriteDirection + spriteFrame;
    var art = isoImage(key);
    var h = 120, w = art && art.naturalHeight ? h * art.naturalWidth / art.naturalHeight : 82;
    var phase = moving ? (gaitDistance / cycleDistance) * Math.PI * 2 : t * 1.2;
    var bob = moving ? Math.sin(phase * 2) * 1.2 : Math.sin(phase) * .45;
    isoShadow(ctx, p, 23, 7, .28);
    if (!art) return;
    ctx.save();
    ctx.translate(p.x, p.y + bob);
    if (moving) ctx.rotate(Math.sin(phase) * .006);
    if (flipSprite) ctx.scale(-1, 1);
    ctx.drawImage(art, -w * .5, -h + 7, w, h);
    ctx.restore();
}

function isoDrawCompanion(ctx, t) {
    if (!game.companion) return;
    var p = isoProject(game.companion.x, game.companion.y); if (!isoOnScreen(p, 75)) return;
    var bob = Math.sin(t * 2.4) * 1.7;
    isoShadow(ctx, p, 15, 4, .15);
    var halo = ctx.createRadialGradient(p.x, p.y - 24, 0, p.x, p.y - 24, 31);
    halo.addColorStop(0, 'rgba(142,190,255,.13)'); halo.addColorStop(1, 'rgba(142,190,255,0)');
    ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(p.x, p.y - 24, 31, 0, Math.PI * 2); ctx.fill();
    var image = IMG['comp_' + game.companion.id];
    if (image && image.complete) ctx.drawImage(image, p.x - 25, p.y - 50 + bob, 50, 50);
    else {
        var art = isoImage('v4Companion');
        if (art) ctx.drawImage(art, p.x - 29, p.y - 64 + bob, 58, 68);
    }
}
function isoDrawChest(ctx, chest, t) {
    if (chest.opened || (!chest.revealed && !game.mapComplete)) return;
    var p = isoProject(chest.x, chest.y); if (!isoOnScreen(p, 90)) return;
    var bob = Math.sin(t * 2 + chest.bob) * 1.4;
    isoShadow(ctx, p, 23, 6, .24);
    var g = ctx.createRadialGradient(p.x, p.y - 30, 0, p.x, p.y - 30, 42); g.addColorStop(0, 'rgba(164,92,255,.18)'); g.addColorStop(1, 'rgba(164,92,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y - 30, 42, 0, Math.PI * 2); ctx.fill();
    var key = chest.amount && chest.amount >= 10 ? 'v4ChestAlt' : 'v4Chest';
    if (!isoDrawImage(ctx, key, {x:p.x,y:p.y+bob}, 76, 62, 0, 1, false) && IMG.gemChest) ctx.drawImage(IMG.gemChest, p.x - 26, p.y - 52 + bob, 52, 52);
}
function isoDrawTarget(ctx, t) {
    if (distSquared(game.player.x, game.player.y, game.player.targetX, game.player.targetY) <= 64) return;
    var p = isoProject(game.player.targetX, game.player.targetY); if (!isoOnScreen(p, 15)) return;
    ctx.strokeStyle = 'rgba(255,211,91,.78)'; ctx.lineWidth = 2.3; ctx.beginPath();
    ctx.ellipse(p.x, p.y, 13 + Math.sin(t * 4) * 2, 6.5 + Math.sin(t * 4), 0, 0, Math.PI * 2); ctx.stroke();
}
function isoReveal(ctx, p, worldRadius, alpha) {
    if (!isoOnScreen(p, worldRadius)) return;
    var rx = Math.max(12, worldRadius * .88), ry = Math.max(8, worldRadius * .44);
    ctx.save(); ctx.translate(p.x, p.y); ctx.scale(1, ry / rx);
    var g = ctx.createRadialGradient(0, 0, rx * .10, 0, 0, rx);
    g.addColorStop(0, 'rgba(0,0,0,' + alpha + ')'); g.addColorStop(.72, 'rgba(0,0,0,' + alpha + ')'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, rx, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}
function isoRevealPlayer(ctx, p, radius) {
    var rx = Math.max(18, radius * 1.25), ry = Math.max(18, radius * .96);
    ctx.save();
    ctx.translate(p.x, p.y - 50);
    ctx.scale(1, ry / rx);
    var g = ctx.createRadialGradient(0, 0, rx * .06, 0, 0, rx);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(.76, 'rgba(0,0,0,.98)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, 0, rx, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}

function isoFog(ctx, visibility) {
    if (fullMapVisualReveal()) return;
    var fog = game.fogCtx, w = game.viewW, h = game.viewH;
    fog.setTransform(game.dpr, 0, 0, game.dpr, 0, 0); fog.globalCompositeOperation = 'source-over'; fog.globalAlpha = 1; fog.clearRect(0, 0, w, h);
    fog.fillStyle = game.region >= 5 ? 'rgba(2,6,20,.98)' : 'rgba(2,9,14,.97)'; fog.fillRect(0, 0, w, h);
    fog.globalCompositeOperation = 'destination-out';
    // Permanent discovery: use the bounded exploration grid rather than an ever-growing trail.
    // Once a cell has been lit, it stays visually revealed for the rest of the walk.
    var cov = game.coverage;
    if (cov && cov.litIndices && cov.litIndices.length) {
        for (var i = 0; i < cov.litIndices.length; i++) {
            var idx = cov.litIndices[i], gx = idx % cov.cols, gy = Math.floor(idx / cov.cols);
            var wx = Math.min(game.world - 1, gx * cov.cell + cov.cell * .5), wy = Math.min(game.world - 1, gy * cov.cell + cov.cell * .5);
            var fp = isoProject(wx, wy);
            if (!isoOnScreen(fp, 65)) continue;
            isoReveal(fog, { x: fp.x, y: fp.y - 8 }, cov.cell * 1.28, .10);
        }
    }
    game.lightOrbs.forEach(function (o) { if (!o.explored && !o.collected) isoReveal(fog, isoProject(o.x, o.y), visibility.passiveRadius * 1.05, .26); });
    var playerFog = isoProject(game.player.x, game.player.y);
    // Three immediately readable states: remembered darkness, nearby penumbra, full lantern light.
    if (visibility.proximityRadius > visibility.lightRadius + 2)
        isoReveal(fog, { x: playerFog.x, y: playerFog.y - 26 }, visibility.proximityRadius * .96, .25);
    isoRevealPlayer(fog, playerFog, visibility.lightRadius);
    fog.globalCompositeOperation = 'source-over'; fog.globalAlpha = 1; ctx.drawImage(game.fogLayer, 0, 0, w, h);
}
function isoWarmLight(ctx, visibility) {
    var p = isoProject(game.player.x, game.player.y), rx = visibility.lightRadius * 1.12, ry = visibility.lightRadius * .62;
    ctx.save(); ctx.translate(p.x, p.y - 38); ctx.scale(1, ry / Math.max(1, rx));
    var g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    g.addColorStop(0, 'rgba(255,212,88,.42)'); g.addColorStop(.42, 'rgba(255,198,64,.22)'); g.addColorStop(1, 'rgba(255,194,58,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, rx, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}
function drawTrackingArrow(ctx) {
    var target = ensureTrackingTarget(); if (!target) return;
    var pp = isoProject(game.player.x, game.player.y), tp = isoProject(target.x, target.y), dx = tp.x - pp.x, dy = tp.y - pp.y, len = Math.sqrt(dx * dx + dy * dy); if (len < 1) return;
    var radius = 54, x = pp.x + dx / len * radius, y = pp.y + dy / len * radius, angle = Math.atan2(dy, dx);
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.fillStyle = 'rgba(7,28,38,.90)'; ctx.strokeStyle = '#e7bd55'; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#ffd86b';
    ctx.beginPath(); ctx.moveTo(9, 0); ctx.lineTo(-4, -5.5); ctx.lineTo(-1.5, 0); ctx.lineTo(-4, 5.5); ctx.closePath(); ctx.fill(); ctx.restore();
}
function isoAtmosphere(ctx, t) {
    var w = game.viewW, h = game.viewH;
    ctx.save();
    for (var i = 0; i < 18; i++) {
        var x = (i * 91 + t * (1.1 + i % 3) * 4) % (w + 40) - 20, y = (i * 61 + Math.sin(t * .35 + i) * 18 + h) % h;
        var warm = i % 3 === 0;
        ctx.fillStyle = warm ? 'rgba(255,204,73,.34)' : 'rgba(206,227,210,.08)';
        ctx.beginPath(); ctx.arc(x, y, warm ? 1.9 : 1.1, 0, Math.PI * 2); ctx.fill();
        if (warm && i % 2 === 0) { ctx.fillStyle = 'rgba(255,201,67,.07)'; ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.fill(); }
    }
    var vignette = ctx.createRadialGradient(w * .5, h * .47, Math.min(w, h) * .22, w * .5, h * .47, Math.max(w, h) * .72);
    vignette.addColorStop(0, 'rgba(0,8,16,0)'); vignette.addColorStop(.74, 'rgba(0,8,16,.08)'); vignette.addColorStop(1, 'rgba(0,7,14,.36)');
    ctx.fillStyle = vignette; ctx.fillRect(0, 0, w, h); ctx.restore();
}
function drawGame(t) {
    var ctx = game.ctx, visibility = currentVisibilityMetrics();
    ctx.clearRect(0, 0, game.viewW, game.viewH); isoGround(ctx, t);
    var items = [];
    game.decor.forEach(function (d, i) { if (!(d.t === 2 && d.collected)) items.push({ depth: isoDepth(d.x, d.y, d.t === 0 ? -8 : -16), type: 'decor', value: d, index: i }); });
    (game.v4OutsideDecor || []).forEach(function (d) { items.push({ depth: isoDepth(d.x, d.y, -18), type: 'outside', value: d }); });
    (game.v4Border || []).forEach(function (b) { items.push({ depth: isoDepth(b.x, b.y, -24), type: 'border', value: b }); });
    game.nodes.forEach(function (n) { if (!n.taken) items.push({ depth: isoDepth(n.x, n.y, 1), type: 'resource', value: n }); });
    game.creatures.forEach(function (o) { items.push({ depth: isoDepth(o.x, o.y, 9), type: 'creature', value: o }); });
    (game.gemChests || []).forEach(function (ch) { if (!ch.opened) items.push({ depth: isoDepth(ch.x, ch.y, 6), type: 'chest', value: ch }); });
    if (game.companion) items.push({ depth: isoDepth(game.companion.x, game.companion.y, 12), type: 'companion', value: game.companion });
    items.push({ depth: isoDepth(game.player.x, game.player.y, 11), type: 'player', value: game.player });
    items.sort(function (a, b) { return a.depth - b.depth; });
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (item.type === 'decor') isoDrawDecor(ctx, item.value, t);
        else if (item.type === 'outside') isoDrawOutsideDecor(ctx, item.value);
        else if (item.type === 'border') isoDrawBorder(ctx, item.value);
        else if (item.type === 'resource') isoDrawResource(ctx, item.value, t, visibility);
        else if (item.type === 'creature') isoDrawCreature(ctx, item.value, t, visibility);
        else if (item.type === 'chest') isoDrawChest(ctx, item.value, t);
        else if (item.type === 'companion') isoDrawCompanion(ctx, t);
        else if (item.type === 'player') isoDrawPlayer(ctx, t);
    }
    isoDrawTarget(ctx, t);
    isoFog(ctx, visibility);
    isoWarmLight(ctx, visibility);
    isoAtmosphere(ctx, t);
    drawTrackingArrow(ctx);
}
