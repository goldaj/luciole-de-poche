'use strict';
// Luciole de poche v4.0.0 — commercial 2.5D isometric expedition renderer — build120.
// The v3.2.7 simulation remains authoritative. This layer only projects canonical world coordinates
// and replaces prototype primitives with production art assets.
var ISO_X = 0.62;
var ISO_Y = 0.31;
var ISO_CENTER_Y = 0.54;
var V4_GROUND_CELL = 128;
var V4_OUTSIDE_PAD = 512;
var V4_BORDER_INSET = 46;
var V4_WALK_INSET = 58;
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
    function push(x, y, side) { border.push({ x: x, y: y, side: side, variant: index++ }); }
    for (var i = 0; i <= segments; i++) {
        var q = min + step * i;
        push(q, min, 'top');
        push(q, max, 'bottom');
        if (i > 0 && i < segments) {
            push(min, q, 'left');
            push(max, q, 'right');
        }
    }
    return border;
}
function isoBorderMainKey(b) {
    var v = b.variant || 0;
    if (game.region === 0) return v % 5 === 0 ? 'v4BorderFlower1' : 'v4BorderHedge1';
    if (game.region === 1) return v % 4 === 0 ? 'v4LanternN1' : 'v4BorderStone1';
    if (game.region === 2) return v % 5 === 0 ? 'v4BorderFlower2' : 'v4BorderHedge1';
    if (game.region === 3) return v % 4 === 0 ? 'v4BorderReed1' : 'v4BorderRope1';
    if (game.region === 4) return v % 4 === 0 ? 'v4LanternN2' : 'v4BorderRope1';
    if (game.region === 5) return v % 3 === 0 ? 'v4CrystalN2' : 'v4BorderStone2';
    if (game.region === 6) return v % 4 === 0 ? 'v4BorderFlower2' : 'v4BorderFlower1';
    return v % 4 === 0 ? 'v4LanternN3' : 'v4BorderRock1';
}
function isoDrawBorder(ctx, b) {
    var p = isoProject(b.x, b.y); if (!isoOnScreen(p, 80)) return;
    var key = isoBorderMainKey(b), glow = key.indexOf('Lantern') >= 0 || key.indexOf('Crystal') >= 0;
    var flipX = b.side === 'right' || (b.variant % 2 === 1);
    var horizontalBorder = key.indexOf('Border') >= 0;
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
        var accentKey = game.region === 6 ? 'v4FlowerB' : game.region === 3 ? 'v4BushA' : game.region === 1 ? 'v4RockA' : 'v4MushroomsSmall';
        var ap = { x: p.x + (b.side === 'right' ? -10 : 10), y: p.y + 2 };
        var asz = isoDecorSize(accentKey, { s: 22 });
        isoDrawImage(ctx, accentKey, ap, asz.w * .55, asz.h * .55, 0, .92, (b.variant % 12) < 6);
    }
}

function v4GroundPool() {
    return ['v4GroundA','v4GroundB','v4GroundC','v4GroundN1','v4GroundN2','v4GroundN3','v4GroundN4','v4GroundN5','v4GroundN6','v4GroundN7','v4GroundN8'];
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
    var forest = ['v4TreeN1','v4TreeN2','v4TreeN3','v4BushN1','v4FernN1','v4RockN1','v4MushroomsLarge'];
    var coast = ['v4RockN2','v4RockN3','v4GrassN1','v4LanternN1','v4BorderStone1','v4MushroomsSmall'];
    var marsh = ['v4BorderReed1','v4BushN2','v4GrassN1','v4FernN1','v4LanternGround','v4RootN1'];
    var sky = ['v4FlowerN1','v4FlowerN2','v4LanternN2','v4BushN1','v4RockN4','v4CrystalN1'];
    var cave = ['v4CrystalN1','v4CrystalN2','v4RockN1','v4RockN4','v4LanternN3','v4BorderStone2'];
    var moon = ['v4TreeN4','v4TreeN5','v4FlowerN2','v4CrystalAlt','v4LanternN2','v4BushN2'];
    var arch = ['v4TreeN6','v4TreeN7','v4LanternN3','v4RockN3','v4FlowerN1','v4BorderRock1'];
    var pool = region === 1 ? coast : region === 3 ? marsh : region === 4 ? sky : region === 5 ? cave : region === 6 ? moon : region === 7 ? arch : forest;
    return pool[variant % pool.length];
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
    var p = isoProject(d.x, d.y); if (!isoOnScreen(p, 190)) return;
    var key = d.outsideKey || 'v4TreeN1', size = isoDecorSize(key, d);
    isoShadow(ctx, p, size.w * .22, Math.max(3, size.w * .055), .12);
    isoDrawImage(ctx, key, p, size.w, size.h, size.y, .92, ((d.variant || 0) % 2) === 1);
}

startRun = function (regionIndex) {
    isoBaseStartRun(regionIndex);
    if (!game) return;
    var rng = game.rng || Math.random;
    for (var i = 0; i < game.decor.length; i++) {
        game.decor[i].variant = Math.floor(rng() * 12);
        game.decor[i].phase = rng() * Math.PI * 2;
    }
    // Extra objects are visual-only. They never enter loot/collision/progression logic.
    var extra = 68 + game.level * 14;
    for (i = 0; i < extra; i++) {
        game.decor.push({
            x: 35 + rng() * (game.world - 70),
            y: 35 + rng() * (game.world - 70),
            s: 24 + rng() * 48,
            t: 4 + Math.floor(rng() * 4),
            rot: rng() * Math.PI * 2,
            variant: Math.floor(rng() * 12),
            phase: rng() * Math.PI * 2
        });
    }
    game.v4GroundSeed = Math.floor(rng() * 1000000);
    game.v4GroundCache = buildV4GroundCache();
    game.v4OutsideDecor = buildV4OutsideDecor(rng);
    game.v4Border = buildV4Border();
};

function isoGround(ctx, t) {
    var w = game.viewW, h = game.viewH, region = game.region;
    var top = region === 5 ? '#07131f' : region === 4 || region === 7 ? '#0b1730' : '#071d24';
    var bottom = region === 5 ? '#11192a' : '#10261f';
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
    var v = d.variant || 0;
    var trees = ['v4Tree','v4TreeN1','v4TreeN2','v4TreeN3','v4TreeN4','v4TreeN5','v4TreeN6','v4TreeN7'];
    var rocks = ['v4RockA','v4RockB','v4RockN1','v4RockN2','v4RockN3','v4RockN4'];
    var flowers = ['v4FlowerA','v4FlowerB','v4FlowerN1','v4FlowerN2','v4GrassN1','v4FernN1'];
    var bushes = ['v4BushA','v4BushB','v4BushC','v4BushN1','v4BushN2','v4FernN1'];
    var wood = ['v4FallenLog','v4Stump','v4LogN1','v4RootN1','v4RootN2'];
    var mushrooms = ['v4Mushrooms','v4MushroomsSmall','v4MushroomsLarge','v4MushN1','v4MushN2'];
    var lanterns = ['v4LanternAlt','v4LanternGround','v4LanternN1','v4LanternN2','v4LanternN3','v4LanternN4'];
    var crystals = ['v4Crystal','v4CrystalAlt','v4CrystalN1','v4CrystalN2'];
    if (d.t === 0) {
        if (game.region === 5) return crystals[v % crystals.length];
        if (game.region === 4 && v % 5 === 0) return lanterns[v % lanterns.length];
        return trees[(v + game.region) % trees.length];
    }
    if (d.t === 1) return rocks[(v + game.region) % rocks.length];
    if (d.t === 2) return v % 3 === 0 ? 'v4OrbA' : v % 3 === 1 ? 'v4OrbB' : 'v4LightOrb';
    if (d.t === 3) return flowers[(v + game.region) % flowers.length];
    if (d.t === 4) return wood[(v + game.region) % wood.length];
    if (d.t === 5) {
        if (game.region === 5) return crystals[v % crystals.length];
        if (game.region === 3) return v % 3 === 0 ? 'v4PondN1' : bushes[v % bushes.length];
        if (game.region === 1) return v % 3 === 0 ? lanterns[v % lanterns.length] : rocks[v % rocks.length];
        if (game.region === 6) return v % 4 === 0 ? crystals[v % crystals.length] : flowers[v % flowers.length];
        if (game.region === 7) return v % 4 === 0 ? lanterns[v % lanterns.length] : bushes[v % bushes.length];
        return v % 4 === 0 ? lanterns[v % lanterns.length] : mushrooms[v % mushrooms.length];
    }
    if (d.t === 6) return bushes[(v + game.region) % bushes.length];
    var misc = ['v4RocksFlowers','v4MushroomsSmall','v4BushA','v4RockN1','v4GrassN1','v4FlowerN2','v4JarN1','v4JarN2','v4JarN3'];
    return misc[(v + game.region) % misc.length];
}
function isoDecorSize(key, d) {
    var scale = Math.max(.72, Math.min(1.28, (d.s || 42) / 42));
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
    if (key.indexOf('JarN') >= 0) return { w: 42 * scale, h: 60 * scale, y: 0 };
    if (key.indexOf('Orb') >= 0) return { w: 32 * scale, h: 32 * scale, y: 16 };
    return { w: 70 * scale, h: 62 * scale, y: 0 };
}
function isoDrawDecor(ctx, d, t) {
    if (d.t === 2 && d.collected) return;
    var p = isoProject(d.x, d.y); if (!isoOnScreen(p, 180)) return;
    var key = isoDecorSprite(d), sz = isoDecorSize(key, d);
    if (key.indexOf('Orb') >= 0) {
        var pulse = 1 + Math.sin(t * 2.2 + (d.phase || 0)) * .08;
        sz.w *= pulse; sz.h *= pulse;
    } else {
        isoShadow(ctx, p, sz.w * .25, Math.max(3, sz.w * .065), key.indexOf('v4Tree') === 0 ? .28 : .17);
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
        var accentKey = key.indexOf('v4Tree') === 0 ? 'v4MushroomsSmall' : (key.indexOf('Bush') >= 0 ? 'v4FlowerB' : (key.indexOf('Rock') >= 0 ? 'v4FlowerA' : null));
        if (accentKey) {
            var ap = { x: p.x + (((d.variant || 0) % 3) - 1) * 10, y: p.y + 2 };
            var asz = isoDecorSize(accentKey, { s: 20 + ((d.variant || 0) % 4) * 3 });
            isoDrawImage(ctx, accentKey, ap, asz.w * .55, asz.h * .55, 0, .92, false);
        }
    }
}

function isoResourceArtKey(type) {
    if (type === 'berry') return 'v4PickupBerry';
    if (type === 'seed') return 'v4PickupSeed';
    if (type === 'leaf') return 'v4PickupLeaf';
    if (type === 'mushroom') return 'v4PickupMushroom';
    if (type === 'pebble') return 'v4PickupOre';
    if (type === 'glow') return 'v4FireflyA';
    return null;
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
    // One complete walk cycle every ~96 world pixels. The animation therefore accelerates only
    // when the character truly moves faster, and slows with the actual movement speed.
    var cycleDistance = 144;
    var walkIndex = moving ? 1 + Math.floor((game.distance % cycleDistance) / (cycleDistance / 4)) : 0;
    walkIndex = Math.max(0, Math.min(4, walkIndex));
    var key = 'v4Hero' + game.isoDirection + walkIndex;
    var art = isoImage(key);
    var h = 120, w = art && art.naturalHeight ? h * art.naturalWidth / art.naturalHeight : 82;
    var phase = moving ? (game.distance / cycleDistance) * Math.PI * 2 : t * 1.2;
    var bob = moving ? Math.sin(phase * 2) * 1.2 : Math.sin(phase) * .45;
    isoShadow(ctx, p, 23, 7, .28);
    if (!art) return;
    ctx.save();
    ctx.translate(p.x, p.y + bob);
    if (moving) ctx.rotate(Math.sin(phase) * .006);
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
    fog.fillStyle = game.region >= 5 ? 'rgba(3,8,24,.86)' : 'rgba(4,15,22,.83)'; fog.fillRect(0, 0, w, h);
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
            isoReveal(fog, { x: fp.x, y: fp.y - 8 }, cov.cell * 1.28, .86);
        }
    }
    game.lightOrbs.forEach(function (o) { if (!o.explored && !o.collected) isoReveal(fog, isoProject(o.x, o.y), visibility.passiveRadius * 1.05, .46); });
    var playerFog = isoProject(game.player.x, game.player.y);
    isoRevealPlayer(fog, playerFog, visibility.lightRadius);
    fog.globalCompositeOperation = 'source-over'; fog.globalAlpha = 1; ctx.drawImage(game.fogLayer, 0, 0, w, h);
}
function isoWarmLight(ctx, visibility) {
    var p = isoProject(game.player.x, game.player.y), rx = visibility.lightRadius * 1.12, ry = visibility.lightRadius * .62;
    ctx.save(); ctx.translate(p.x, p.y - 38); ctx.scale(1, ry / Math.max(1, rx));
    var g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    g.addColorStop(0, 'rgba(255,205,77,.34)'); g.addColorStop(.42, 'rgba(255,194,58,.16)'); g.addColorStop(1, 'rgba(255,194,58,0)');
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
