'use strict';
// Game constants, content tables and save-slot identifiers.
'use strict';
var LEGACY_SAVE_KEY = 'lumieres_de_poche_save_v3';
var SAVE_SLOT_PREFIX = 'lumieres_de_poche_save_v3_slot_';
var ACTIVE_SAVE_SLOT_KEY = 'lumieres_de_poche_active_slot_v1';
var SAVE_BACKUP_PREFIX = 'lumieres_de_poche_save_v3_backup_';
var SAVE_EXPORT_SCHEMA = 'luciole-de-poche.save-export';
var SAVE_EXPORT_VERSION = 1;
var SAVE_VERSION = 35;
var activeSaveSlot = 1;
function saveSlotKey(slot) { return SAVE_SLOT_PREFIX + Math.max(1, Math.min(2, Math.floor(Number(slot) || 1))); }
function currentSaveKey() { return saveSlotKey(activeSaveSlot); }
function initializeSaveSlots() {
    try {
        var stored = Math.floor(Number(localStorage.getItem(ACTIVE_SAVE_SLOT_KEY)) || 1);
        activeSaveSlot = stored === 2 ? 2 : 1;
        if (!localStorage.getItem(saveSlotKey(1))) {
            var legacy = localStorage.getItem(LEGACY_SAVE_KEY);
            if (legacy)
                localStorage.setItem(saveSlotKey(1), legacy);
        }
        if (activeSaveSlot === 2 && !localStorage.getItem(saveSlotKey(2)))
            activeSaveSlot = 1;
        localStorage.setItem(ACTIVE_SAVE_SLOT_KEY, String(activeSaveSlot));
    }
    catch (e) {
        activeSaveSlot = 1;
    }
}
function parseSavePayload(raw) {
    if (!raw || typeof raw !== 'string')
        return null;
    try {
        var parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
    }
    catch (e) {
        return null;
    }
}
function saveSlotExists(slot) { try {
    return !!parseSavePayload(localStorage.getItem(saveSlotKey(slot)));
}
catch (e) {
    return false;
} }
function rawSaveSlot(slot) { try {
    return parseSavePayload(localStorage.getItem(saveSlotKey(slot)));
}
catch (e) {
    return null;
} }
function localSaveBackupKey(slot) { return SAVE_BACKUP_PREFIX + Math.max(1, Math.min(2, Math.floor(Number(slot) || 1))); }
function androidBridge() { return window.LucioleAndroid && typeof window.LucioleAndroid === 'object' ? window.LucioleAndroid : null; }
var saveHealth = { ok: true, backup: true, message: 'Sauvegarde locale protégée' };
var saveRecoveryNotice = '';
function setSaveHealth(ok, backup, message) {
    saveHealth = { ok: !!ok, backup: !!backup, message: message || '' };
    var label = document.getElementById('saveHealthLabel');
    if (label) {
        label.textContent = saveHealth.message;
        label.classList.toggle('warning', !saveHealth.ok || !saveHealth.backup);
    }
}
function recoverSaveSlot(slot) {
    var key = saveSlotKey(slot), primary = null, backup = null, nativeBackup = '';
    try {
        primary = localStorage.getItem(key);
    }
    catch (e) { }
    if (parseSavePayload(primary))
        return true;
    try {
        backup = localStorage.getItem(localSaveBackupKey(slot));
    }
    catch (e) { }
    if (parseSavePayload(backup)) {
        try {
            localStorage.setItem(key, backup);
            if (slot === 1)
                localStorage.setItem(LEGACY_SAVE_KEY, backup);
        }
        catch (e) { }
        saveRecoveryNotice = 'Une sauvegarde locale endommagée a été restaurée depuis sa copie de secours.';
        setSaveHealth(true, true, 'Sauvegarde restaurée');
        return true;
    }
    var bridge = androidBridge();
    if (bridge && typeof bridge.readSaveBackup === 'function') {
        try {
            nativeBackup = String(bridge.readSaveBackup(slot) || '');
        }
        catch (e) { }
        if (parseSavePayload(nativeBackup)) {
            try {
                localStorage.setItem(key, nativeBackup);
                localStorage.setItem(localSaveBackupKey(slot), nativeBackup);
                if (slot === 1)
                    localStorage.setItem(LEGACY_SAVE_KEY, nativeBackup);
            }
            catch (e) { }
            saveRecoveryNotice = 'Une sauvegarde endommagée a été restaurée depuis la copie de secours Android.';
            setSaveHealth(true, true, 'Sauvegarde restaurée');
            return true;
        }
    }
    if (primary || backup || nativeBackup) {
        saveRecoveryNotice = 'La sauvegarde de cette partie est illisible et aucune copie valide n’a pu être récupérée. Une nouvelle partie a été créée sans écraser les autres emplacements.';
        setSaveHealth(false, false, 'Sauvegarde à vérifier');
    }
    return false;
}
var LEGACY_REGION_REQ = [0, 2, 5, 8, 12, 16, 21, 27];
var RESOURCE = {
    seed: { name: 'Graines', icon: 'v4resources/seed.png', color: '#d7aa68', desc: 'Des promesses minuscules avec une excellente stratégie marketing.' },
    berry: { name: 'Baies', icon: 'v4resources/berry.png', color: '#c77982', desc: 'Douces, un peu acidulées, toujours trouvées avant d’avoir vraiment faim.' },
    pebble: { name: 'Galets', icon: 'v4resources/pebble.png', color: '#9ab0ad', desc: 'Ronds, polis, inexplicablement difficiles à laisser sur place.' },
    leaf: { name: 'Feuilles', icon: 'v4resources/leaf.png', color: '#83ad73', desc: 'Certaines gardent la lumière comme une goutte de pluie.' },
    shell: { name: 'Coquillages', icon: 'v4resources/shell.png', color: '#efbfa8', desc: 'On prétend entendre la mer dedans. Elle n’a jamais confirmé.' },
    glow: { name: 'Lucioles', icon: 'v4resources/glow.png', color: '#ffe98f', desc: 'Une lumière assez petite pour tenir dans une poche.' },
    mushroom: { name: 'Champignons', icon: 'v4resources/mushroom.png', color: '#d98c78', desc: 'Ils poussent surtout quand personne ne regarde.' },
    pearl: { name: 'Perles de brume', icon: 'v4resources/pearl.png', color: '#e7e2ef', desc: 'Rares, fraîches et parfaitement rondes. Donc suspectes.' },
    flower: { name: 'Fleurs-lunes', icon: 'v4resources/flower.png', color: '#e9acd0', desc: 'Elles s’ouvrent au crépuscule et bâillent au petit matin.' },
    waterlily: { name: 'Nénuphars', icon: 'v4resources/waterlily.png', color: '#78b99a', desc: 'Ils flottent avec un calme assez insultant pour les gens pressés.' },
    crystal: { name: 'Cristaux', icon: 'v4resources/crystal.png', color: '#9fd7dc', desc: 'Des éclats de ciel qui ont oublié comment remonter.' },
    echostone: { name: 'Pierres d’écho', icon: 'v4resources/echostone.png', color: '#9caec1', desc: 'Elles gardent un son très longtemps. Les secrets apprécient moyennement.' },
    moonpollen: { name: 'Pollen lunaire', icon: 'v4resources/moonpollen.png', color: '#d7c4ef', desc: 'Une poussière pâle qui brille mieux quand personne n’allume la lumière.' },
    cloudfeather: { name: 'Plumes de nuage', icon: 'v4resources/cloudfeather.png', color: '#d5e6ee', desc: 'Plus légères qu’une plume normale, ce qui semblait pourtant déjà suffisant.' },
    moss: { name: 'Mousses-étoiles', icon: 'v4resources/moss.png', color: '#8fbd7e', desc: 'Une mousse douce qui scintille quand on la froisse. Très légèrement susceptible.' },
    glass: { name: 'Verres de mer', icon: 'v4resources/glass.png', color: '#83c9c5', desc: 'Des morceaux polis par la mer jusqu’à devenir fréquentables.' },
    acorn: { name: 'Glands dorés', icon: 'v4resources/acorn.png', color: '#c79a55', desc: 'Le Bois doré les traite comme une monnaie. Les écureuils aussi.' },
    reed: { name: 'Roseaux chantants', icon: 'v4resources/reed.png', color: '#8eb59d', desc: 'Ils sifflent avec le vent, même quand personne n’a demandé de concert.' },
    cloud: { name: 'Graines de nuage', icon: 'v4resources/cloud.png', color: '#c7dfe8', desc: 'Légères comme rien, mais assez réelles pour remplir une poche.' },
    prism: { name: 'Prismes doux', icon: 'v4resources/prism.png', color: '#b8c8ef', desc: 'Ils cassent la lumière sans jamais se disputer les morceaux.' },
    dew: { name: 'Rosée lunaire', icon: 'v4resources/dew.png', color: '#c7bce7', desc: 'Elle n’apparaît qu’après la nuit. La ponctualité est donc relative.' },
    amber: { name: 'Ambre céleste', icon: 'v4resources/amber.png', color: '#e8b86e', desc: 'Un petit morceau de ciel qui aurait décidé de devenir solide.' }
};
var REGION = [
    { name: 'Clairière mousseuse', sub: 'Des sentiers tendres et des lucioles patientes.', img: 'clairiere.svg', palette: ['#b9d9a8', '#93bd82', '#658e64'], req: 0, items: ['seed', 'berry', 'pebble', 'leaf', 'glow', 'mushroom'], introduced: ['seed', 'berry', 'pebble', 'leaf', 'glow', 'mushroom'], signature: 'mushroom', unique: 'moss', rare: 'moss', evolve: ['seed', 'berry'], craft: 'mushroom', character: 'escargot', desc: 'Le premier chemin. La mousse y étouffe les pas et les mauvaises idées.' },
    { name: 'Rivage des tasses', sub: 'Une plage calme où la marée dépose des trésors.', img: 'rivage.svg', palette: ['#ead8a8', '#a9d3d8', '#6fa7b2'], req: 4, items: ['shell', 'pebble', 'berry', 'glow', 'leaf', 'pearl'], introduced: ['shell', 'pearl'], signature: 'pearl', unique: 'glass', rare: 'glass', evolve: ['shell', 'pebble'], craft: 'pearl', character: 'oiseau', desc: 'La mer abandonne ici des coquillages comme des lettres sans destinataire.' },
    { name: 'Bois doré', sub: 'Les feuilles y tintent doucement comme des clochettes.', img: 'foret.svg', palette: ['#cbd9a4', '#8aa76e', '#526f55'], req: 8, items: ['leaf', 'seed', 'mushroom', 'berry', 'glow', 'flower'], introduced: ['flower'], signature: 'flower', unique: 'acorn', rare: 'acorn', evolve: ['leaf', 'berry'], craft: 'flower', character: 'renard', desc: 'Un bois ancien, aimable tant qu’on ne prétend pas connaître le raccourci.' },
    { name: 'Marais des siestes', sub: 'Des nénuphars, des grenouilles et aucune urgence.', img: 'marais.svg', palette: ['#a8cbb6', '#79a49a', '#597c6e'], req: 13, items: ['leaf', 'flower', 'pebble', 'glow', 'pearl', 'waterlily'], introduced: ['waterlily'], signature: 'waterlily', unique: 'reed', rare: 'reed', evolve: ['pebble', 'leaf'], craft: 'waterlily', character: 'grenouille', desc: 'L’eau y avance moins vite que les nuages.' },
    { name: 'Îles flottantes', sub: 'Des jardins suspendus au-dessus des nuages.', img: 'nuages.svg', palette: ['#cae2e5', '#a9cfa6', '#708f74'], req: 18, items: ['flower', 'seed', 'glow', 'crystal', 'pearl', 'waterlily'], introduced: ['crystal'], signature: 'crystal', unique: 'cloud', rare: 'cloud', evolve: ['seed', 'glow'], craft: 'crystal', character: 'papillon', desc: 'De petites îles dérivent sans itinéraire, ce qui les rend très ponctuelles.' },
    { name: 'Grotte de verre', sub: 'Chaque pas réveille un reflet coloré.', img: 'grotte.svg', palette: ['#637d78', '#405b57', '#223c38'], req: 24, items: ['crystal', 'pebble', 'mushroom', 'glow', 'pearl', 'echostone'], introduced: ['echostone'], signature: 'echostone', unique: 'prism', rare: 'prism', evolve: ['crystal', 'pebble'], craft: 'echostone', character: 'chauve_souris', desc: 'Les parois gardent des couleurs qu’aucun soleil n’a déposées.' },
    { name: 'Jardin lunaire', sub: 'Les fleurs attendent la nuit pour raconter leurs secrets.', img: 'lune.svg', palette: ['#9697bd', '#7779a3', '#4c5779'], req: 30, items: ['flower', 'glow', 'crystal', 'mushroom', 'waterlily', 'moonpollen'], introduced: ['moonpollen'], signature: 'moonpollen', unique: 'dew', rare: 'dew', evolve: ['glow', 'crystal'], craft: 'moonpollen', character: 'chouette', desc: 'Un jardin qui ne fleurit qu’après le coucher du soleil.' },
    { name: 'Archipel des nuages', sub: 'Le bout du monde, puis encore un petit chemin.', img: 'archipel.svg', palette: ['#b9dce8', '#89b8c8', '#5f899b'], req: 37, items: ['glow', 'shell', 'seed', 'echostone', 'moonpollen', 'cloudfeather'], introduced: ['cloudfeather'], signature: 'cloudfeather', unique: 'amber', rare: 'amber', evolve: ['shell', 'seed'], craft: 'cloudfeather', character: 'chat_nuage', desc: 'Des fragments de terre naviguent dans le ciel. On y trouve toujours quelque chose à ramener.' }
];
var REGION_MAX_LEVEL = 4;
var WALK_TIER = [
    { name: 'Sentier naissant', world: 1400, baseNodes: 27, regionNodes: 2, rareBase: 0, rareEdge: 0, desc: 'Découverte de la balade · la ressource régionale est encore absente' },
    { name: 'Chemin vivant', world: 1825, baseNodes: 42, regionNodes: 3, rareBase: .005, rareEdge: .030, desc: 'La ressource régionale apparaît · la signature devient plus facile à cibler' },
    { name: 'Horizon ouvert', world: 2250, baseNodes: 58, regionNodes: 4, rareBase: .012, rareEdge: .058, desc: 'Zone plus vaste · davantage de ressources régionales' },
    { name: 'Terre familière', world: 2700, baseNodes: 76, regionNodes: 5, rareBase: .020, rareEdge: .090, desc: 'Balade maîtrisée · abondance maximale et chemins les plus généreux' }
];
var CREATURE = {
    escargot: { name: 'Milo l’escargot', icon: 'escargot.svg', home: 'Clairière mousseuse', dialogue: [
            'Moi, c’est Milo. Je distribue le courrier des sentiers ; personne n’a encore réussi à me reprocher d’arriver trop tôt.',
            'Pico m’a confié une lettre pour Roux il y a longtemps. Je la garde au sec : certains messages doivent attendre que leur chemin réapparaisse.',
            'Avant que le Grand Fanal ne pâlisse, ma tournée reliait les huit chemins. Ils s’effacent quand plus personne ne les parcourt.',
            'Depuis que tu as allumé le Grand Fanal, ma tournée rejoint de nouveau les huit chemins. J’ai enfin livré la vieille lettre de Pico à Roux. Il a dit « déjà ? ». J’attendais ce moment depuis des années.'
        ] },
    oiseau: { name: 'Pico l’oiseau', icon: 'oiseau.svg', home: 'Rivage des tasses', dialogue: [
            'Pico, courrier du rivage. Je livre vite, sauf quand une tasse particulièrement intéressante demande une inspection professionnelle.',
            'Milo prétend que je vais trop vite et Roux prétend connaître de meilleurs raccourcis. J’ai testé les deux méthodes : Milo arrive après moi, Roux parfois jamais.',
            'Autrefois, nous portions de petites lumières jusqu’au Grand Fanal. Ce n’était pas une seule flamme qui éclairait le monde, mais des multiples retours de voyage.',
            'J’ai fait huit fois le tour du Grand Fanal depuis que tu l’as allumé : il brille encore à chaque passage. Milo dit que je pourrais simplement attendre. Absurde. Comment saurais-je qu’il brille toujours ?'
        ] },
    renard: { name: 'Roux le renard', icon: 'renard.svg', home: 'Bois doré', dialogue: [
            'Roux. Je connais tous les chemins du Bois doré, y compris plusieurs qui n’existaient pas hier.',
            'Quand le marais déborde, Mina me demande de redessiner ses passages. Elle dit que mes cartes sont fausses ; je préfère dire qu’elles anticipent le paysage.',
            'Les vieux chemins du Fanal ne sont pas tracés dans la terre. Ils se reforment là où quelqu’un explore et rapporte une lumière.',
            'Depuis que tu as allumé le Grand Fanal, des chemins réapparaissent partout. Je refais toutes mes cartes en ce moment. J’ai écrit ton nom dans la marge, en remerciement.'
        ] },
    grenouille: { name: 'Mina la grenouille', icon: 'grenouille.svg', home: 'Marais des siestes', dialogue: [
            'Moi, c’est Mina. Si tu entends chanter les roseaux, ce n’est pas toujours moi. Mais parfois si.',
            'Pollen connaît ma chanson préférée. Je la lui ai apprise parce qu’il oublie les directions, mais une mélodie, curieusement, ça reste.',
            'La chanson vient d’avant le silence du Grand Fanal. Huit couplets, huit chemins : chaque endroit répondait aux autres avec sa propre petite lumière.',
            'Tu l’as entendu, le huitième couplet ? Quand tu as allumé le Grand Fanal, tous les roseaux l’ont repris d’un coup. J’avais oublié la fin. Elle attendait juste quelqu’un pour rallumer la mesure.'
        ] },
    papillon: { name: 'Pollen le papillon', icon: 'papillon.svg', home: 'Îles flottantes', dialogue: [
            'Pollen. Je transporte des graines de nuage. Je ne me souviens pas toujours de la destination, alors je choisis les endroits qui ont l’air contents de me voir.',
            'Luma récupère parfois mes graines tombées dans la Grotte de verre. En échange elle me montre les couleurs cachées dans les prismes.',
            'Les îles dérivent depuis que le Grand Fanal répond moins fort. Quand sa lumière circulait encore entre les chemins, même les nuages savaient où rentrer.',
            'Depuis que tu as rallumé le Grand Fanal, les îles recommencent à retrouver leurs voisines. Moi aussi, parfois. Tous les chemins finissent quelque part.'
        ] },
    chauve_souris: { name: 'Luma la chauve-souris', icon: 'chauve_souris.svg', home: 'Grotte de verre', dialogue: [
            'Je suis Luma. Ici je m’occupe des échos et des reflets ; les échos sont mes petits favoris.',
            'Sélène m’apporte parfois de la rosée lunaire. Je lui donne des prismes en retour : elle observe le ciel, moi je vérifie ce qu’il devient quand on le casse en couleurs.',
            'Les prismes servaient autrefois à répartir la lumière du Grand Fanal vers les autres chemins. Ce réseau n’est pas mort ; il attend seulement que quelqu’un recommence à le nourrir.',
            'J’ai placé huit prismes après que tu as allumé le Grand Fanal. Sa lumière est revenue dans chacun, différente à chaque fois. C\'est un spectacle fabuleux, merci.'
        ] },
    chouette: { name: 'Sélène la chouette', icon: 'chouette.svg', home: 'Jardin lunaire', dialogue: [
            'Sélène. Je veille sur le jardin quand les fleurs se réveillent. Elles n\'ont pas besoin de moi pour dormir.',
            'Luma pense que j’étudie les étoiles. En réalité j’observe surtout l’Archipel : Nimbo y garde une lumière qu’il refuse obstinément d’appeler un trésor.',
            'Le Grand Fanal n’est pas éteint. Je vois encore son reflet certaines nuits ; il lui manque les réponses des huit chemins.',
            'Quand tu as allumé le Grand Fanal, j’ai vu les huit reflets revenir en même temps. J’aurais aimé prétendre que je n’étais pas surprise. Les chouettes ont une réputation à tenir.'
        ] },
    chat_nuage: { name: 'Nimbo le chat-nuage', icon: 'chat_nuage.svg', home: 'Archipel des nuages', dialogue: [
            'Nimbo. Je garde le bord du monde. Il n’y a rien derrière, sauf davantage de ciel.',
            'Sélène me surveille depuis son jardin, Luma m’envoie des éclats, Pollen oublie des graines ici et Pico apporte parfois le courrier de Milo. On finit par connaître ses voisins, même séparés par des nuages.',
            'Le Grand Fanal n’a jamais appartenu à un gardien. Il brille quand les huit chemins renvoient leurs lumières les uns vers les autres. Si tu l’allumes un jour, ce sera parce que tu les auras reliés de nouveau.',
            'Tu as rallumé le Grand Fanal en reliant les huit chemins. Maintenant ils brillent jusque d’ici. Je garde toujours le bord du monde, mais maintenant il ressemble moins à une fin. Merci.'
        ] }
};
var UPGRADE = [
    { id: 'bag', name: 'Sacoche', icon: 'sac.svg', max: 8, group: 'Exploration', desc: 'Plus de place pour les trouvailles.', base: { seed: 4, pebble: 4 }, matOffset: 1 },
    { id: 'boots', name: 'Bottes souples', icon: 'hero.svg', max: 8, group: 'Exploration', desc: 'Marcher plus vite sans brusquer la mousse.', base: { berry: 4, leaf: 4 }, matOffset: 5 },
    { id: 'lantern', name: 'Lanterne', icon: 'luciole.svg', max: 8, group: 'Exploration', desc: 'Éclaire plus loin et ralentit la perte de lumière.', base: { glow: 4, seed: 3 }, matOffset: 0 },
    { id: 'compass', name: 'Boussole', icon: 'map.svg', max: 8, group: 'Exploration', desc: 'Fait apparaître plus souvent la ressource régionale unique de la balade.', base: { pebble: 4, shell: 3 }, matOffset: 3 },
    { id: 'herbarium', name: 'Herbier de route', icon: 'carnet.svg', max: 8, group: 'Exploration', desc: 'Fait apparaître plus souvent la ressource-signature de la balade.', base: { seed: 3, leaf: 4 }, matOffset: 2 },
    { id: 'lens', name: 'Lentille de brume', icon: 'lentille.svg', max: 8, group: 'Exploration', desc: 'Élargit la brume de proximité et le halo des boules lumineuses.', base: { leaf: 4, berry: 3 }, matOffset: 4 },
    { id: 'harvest', name: 'Trousse de cueillette', icon: 'panier.svg', max: 8, group: 'Récolte', desc: 'Donne parfois une trouvaille supplémentaire sans dépasser la sacoche.', base: { berry: 4, pebble: 3 }, matOffset: 2 },
    { id: 'samplebox', name: 'Boîte d’échantillons', icon: 'boite_echantillons.svg', max: 8, group: 'Récolte', desc: 'Range parfois une trouvaille sans occuper de place dans la sacoche.', base: { seed: 4, pebble: 3 }, matOffset: 7 },
    { id: 'jar', name: 'Bocal à lueurs', icon: 'bocal.svg', max: 8, group: 'Récolte', desc: 'Permet de capturer les boules lumineuses comme Lucioles et recharge fortement la lumière.', base: { glow: 4, leaf: 3 }, matOffset: 6 },
    { id: 'garden', name: 'Petit jardin', icon: 'fleur.svg', max: 8, group: 'Refuge', desc: 'Reproduit lentement les ressources non régionales déjà découvertes, en privilégiant légèrement ce qui manque.', base: { seed: 4, leaf: 3 }, matOffset: 8 },
    { id: 'dock', name: 'Jetée de brume', icon: 'coquillage.svg', max: 8, group: 'Refuge', desc: 'Rapporte parfois un présent après une balade, en privilégiant souvent ce dont le refuge manque.', base: { shell: 4, glow: 3 }, matOffset: 9 }
];
var EXPLORATION_UPGRADE_IDS = ['bag', 'boots', 'lantern', 'compass', 'herbarium', 'lens'];

// v3.2.0 : la petite Sacoche de départ sert uniquement à faire sentir immédiatement la
// valeur du premier upgrade tutoriel. Ce premier saut est volontairement spectaculaire,
// puis les gains sont presque linéaires jusqu'au plafond historique de 60 places.
var BAG_CAPACITY_BY_LEVEL = [0, 10, 18, 25, 32, 39, 46, 53, 60];
var LEGACY_BAG_UPGRADE_COSTS = {
    1: { seed: 5, pebble: 5, glow: 1, pearl: 3 },
    2: { seed: 6, pebble: 6, glow: 1, pearl: 5, moss: 1 },
    3: { seed: 8, pebble: 8, glow: 1, waterlily: 4, glass: 1 },
    4: { seed: 9, pebble: 9, glow: 2, crystal: 4, acorn: 1 },
    5: { seed: 11, pebble: 11, glow: 2, echostone: 4, reed: 1 },
    6: { seed: 14, pebble: 14, glow: 2, moonpollen: 5, cloud: 1, prism: 1 },
    7: { seed: 17, pebble: 17, glow: 3, cloudfeather: 5, dew: 1, amber: 1 }
};
var BAG_UPGRADE_COSTS = {
    1: { seed: 2, pebble: 2 },
    2: { seed: 7, pebble: 7, berry: 3, glow: 1 },
    3: { seed: 8, pebble: 8, leaf: 5, glow: 2 },
    4: { seed: 9, pebble: 9, shell: 6, berry: 3, glow: 2 },
    5: { seed: 10, pebble: 10, leaf: 7, shell: 5, glow: 2 },
    6: { seed: 12, pebble: 12, berry: 8, shell: 4, glow: 3 },
    7: { seed: 13, pebble: 13, leaf: 8, shell: 6, glow: 3 }
};
// v3.2.2 : les Lucioles restent faciles à obtenir et deviennent un peu plus présentes
// dans tous les coûts qui en demandaient déjà, sans modifier les autres ressources.
var LUCIOLE_COST_MULTIPLIER = 4 / 3;
function raiseExistingLucioleCost(cost) {
    if (cost && (cost.glow || 0) > 0)
        cost.glow = Math.max((cost.glow || 0) + 1, Math.ceil((cost.glow || 0) * LUCIOLE_COST_MULTIPLIER));
    return cost;
}
function raiseRegionLucioleCost(cost, region, level) {
    if (!cost || !(cost.glow > 0))
        return cost;
    var before = cost.glow, raised = Math.max(before + 1, Math.ceil(before * LUCIOLE_COST_MULTIPLIER));
    // La hausse des Lucioles ne doit pas casser les rôles économiques décidés en v3.2.0 :
    // signature dominante aux niveaux 2/3, ressource régionale dominante au niveau 4.
    var anchorKey = Number(level) <= 2 ? region.signature : region.unique;
    var ceiling = Math.max(before + 1, (cost[anchorKey] || raised + 1) - 1);
    cost.glow = Math.min(raised, ceiling);
    return cost;
}
function cloneResourceCost(cost) {
    var out = {};
    Object.keys(cost || {}).forEach(function (key) { out[key] = cost[key]; });
    return out;
}
function bagUpgradeCost(level) { return raiseExistingLucioleCost(cloneResourceCost(BAG_UPGRADE_COSTS[Math.max(1, Math.min(7, Number(level) || 1))] || {})); }
function legacyBagUpgradeCost(level) { return cloneResourceCost(LEGACY_BAG_UPGRADE_COSTS[Math.max(1, Math.min(7, Number(level) || 1))] || {}); }
function bagCapacityForLevel(level) { return BAG_CAPACITY_BY_LEVEL[Math.max(1, Math.min(8, Number(level) || 1))]; }
function bagMigrationRefund(level) {
    level = Math.max(1, Math.min(8, Number(level) || 1));
    var delta = {};
    for (var purchased = 1; purchased < level; purchased++) {
        var before = legacyBagUpgradeCost(purchased), after = bagUpgradeCost(purchased), keys = Object.keys(before).concat(Object.keys(after)).filter(function (key, index, all) { return all.indexOf(key) === index; });
        keys.forEach(function (key) { delta[key] = (delta[key] || 0) + (before[key] || 0) - (after[key] || 0); });
    }
    Object.keys(delta).forEach(function (key) { if (delta[key] <= 0) delete delta[key]; });
    return delta;
}
var SUPPORT_UPGRADE_IDS = ['harvest', 'samplebox', 'jar', 'garden', 'dock'];
// v3.2.1 : révélation progressive, déterministe et lisible du Refuge.
// Chaque seuil est distinct afin qu'un nouveau joueur ne reçoive jamais une grappe de nouvelles cartes d'un coup.
var REFUGE_REVEAL_EXPEDITIONS = {
    bag: 0,
    lantern: 2,
    boots: 3,
    herbarium: 5,
    harvest: 7,
    lens: 9,
    samplebox: 11,
    jar: 13,
    compass: 15,
    garden: 18,
    dock: 22
};
var REFUGE_TRACKER = {
    id: 'tracker',
    name: 'Aiguille des trouvailles',
    icon: 'map.svg',
    badgesRequired: 3,
    cost: { seed: 42, pebble: 36, leaf: 30, berry: 24, glow: 16 },
    desc: 'Avant une balade, choisis une ressource de la balade. Une petite aiguille indique une trouvaille de ce type, puis en désigne une autre après chaque collecte.'
};
function isExplorationUpgrade(id) { return EXPLORATION_UPGRADE_IDS.indexOf(id) >= 0; }
// Depuis la 2.1.10, toutes les améliorations du Refuge sont affichées de 1 à 8.
// L'Exploration démarre avec l'ancien bonus de niveau 1. Les autres familles ont un niveau 1 neutre
// et redistribuent l'ancienne puissance 0→8 de façon linéaire sur les nouveaux niveaux 1→8.
function upgradeEffectLevel(id, level) {
    level = Math.max(1, Math.min(8, Number(level) || 1));
    return isExplorationUpgrade(id) ? level : ((level - 1) * 8 / 7);
}
function purchasedUpgradeLevels(s) {
    s = s || state || {};
    var ups = s.upgrades || {};
    return Object.keys(ups).reduce(function (a, k) { return a + Math.max(0, (Number(ups[k]) || 1) - 1); }, 0);
}
var PATH_MATERIALS = ['mushroom', 'pearl', 'flower', 'waterlily', 'crystal', 'echostone', 'moonpollen', 'cloudfeather'];
var ADVANCED_COMMON = PATH_MATERIALS.slice();
var EXCLUSIVE = ['moss', 'glass', 'acorn', 'reed', 'cloud', 'prism', 'dew', 'amber'];
var SPECIAL_MATERIALS = PATH_MATERIALS.concat(EXCLUSIVE);
// Tout ce qui n'est pas une ressource régionale unique appartient au même groupe d'échange.
var TRADE_ORDINARY = Object.keys(RESOURCE).filter(function (k) { return EXCLUSIVE.indexOf(k) < 0; });
var TRADE_RULES = { ordinary: { cost: 60, reward: 10, keys: TRADE_ORDINARY, title: 'Ressources non régionales' }, regional: { cost: 30, reward: 5, keys: EXCLUSIVE, title: 'Ressources régionales' } };
// Les vieux coefficients sont conservés vides dans le debug afin de ne pas casser les outils historiques.
var LEGACY_PATH_TERRAIN_COUNT = { mushroom: 5, pearl: 6, flower: 6, waterlily: 3, crystal: 4, echostone: 2, moonpollen: 2, cloudfeather: 1 };
var LATE_TERRAIN_RESOURCE_BALANCE = {};
// Le Rivage reste la meilleure source de Coquillages, sans écraser les autres ressources de la balade.
var TERRAIN_RESOURCE_WEIGHT_BONUS = { 1: { shell: 1.4 } };
var FINAL_UPGRADE_LEVEL = 5;
var MAP_COVERAGE_CELL = 44;
var FULL_MAP_RARE_CHANCE = .70;
var ENDING_FRAME_MS = 600;
var ENDING_FRAMES = ['finale/frame01.webp', 'finale/frame02.webp', 'finale/frame03.webp', 'finale/frame04.webp', 'finale/frame05.webp', 'finale/frame06.webp', 'finale/frame07.webp', 'finale/frame08.webp'];
var endingTimers = [], endingVisibleFrame = 'A';
var FINAL_TARGET = { seed: 130, berry: 100, pebble: 120, leaf: 120, shell: 90, glow: 320, mushroom: 90, pearl: 80, flower: 80, waterlily: 70, crystal: 70, echostone: 55, moonpollen: 45, cloudfeather: 35, moss: 18, glass: 18, acorn: 18, reed: 16, cloud: 16, prism: 16, dew: 14, amber: 14 };
function emptyFanalDeposits() { var out = {}; Object.keys(FINAL_TARGET).forEach(function (k) { out[k] = 0; }); return out; }
var BADGES = [
    { id: 'first', icon: '🌱', name: 'Premier pas', desc: 'Terminer une balade.', test: function (s) { return s.stats.expeditions >= 1; } },
    { id: 'collector', icon: '🧺', name: 'Poches pleines', desc: 'Ramasser 100 ressources.', test: function (s) { return s.stats.collected >= 100; } },
    { id: 'wanderer', icon: '🗺️', name: 'Petits détours', desc: 'Terminer 20 balades.', test: function (s) { return s.stats.expeditions >= 20; } },
    { id: 'friend', icon: '🐌', name: 'Présentations faites', desc: 'Rencontrer trois personnages.', test: function (s) { return s.discoveredCreatures.length >= 3; } },
    { id: 'neighbors', icon: '✨', name: 'Huit chemins, huit visages', desc: 'Rencontrer le personnage de chaque balade.', test: function (s) { return s.discoveredCreatures.length >= Object.keys(CREATURE).length; } },
    { id: 'illuminator', icon: '☀️', name: 'Plus un coin d’ombre', desc: 'Éclairer entièrement une carte au cours d’une balade.', test: function (s) { return (s.stats.fullMaps || 0) >= 1; } },
    { id: 'naturalist', icon: '🍄', name: 'Tout observer', desc: 'Découvrir toutes les ressources.', test: function (s) { return s.discoveredResources.length >= Object.keys(RESOURCE).length; } },
    { id: 'builder', icon: '🏕️', name: 'Un vrai chez-soi', desc: 'Atteindre 15 niveaux d’amélioration.', test: function (s) { return totalLevels(s) >= 15; } },
    { id: 'faraway', icon: '☁️', name: 'Au-delà du dernier nuage', desc: 'Débloquer toutes les régions.', test: function (s) { return unlockedCount(s) >= REGION.length; } },
    { id: 'tram', icon: '🚋', name: 'Terminus cosy', desc: 'Terminer 100 balades.', test: function (s) { return s.stats.expeditions >= 100; } },
    { id: 'beacon', icon: '🏮', name: 'Le Grand Fanal', desc: 'Allumer le Grand Fanal et terminer le jeu.', test: function (s) { return !!s.gameWon; } }
];
