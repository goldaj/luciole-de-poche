#!/usr/bin/env python3
"""Release checks for Luciole de poche.

The script deliberately checks only invariants that must stay true for every release.
Historical game-design assertions belong in archived release notes, not in the current
release gate.
"""

from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "app" / "src" / "main" / "assets"
JS_DIR = ASSETS / "js"
APP_GRADLE = ROOT / "app" / "build.gradle"
INDEX_HTML = ASSETS / "index.html"
MANIFEST = ROOT / "app" / "src" / "main" / "AndroidManifest.xml"

JS_ORDER = [
    "data.js",
    "state.js",
    "ui.js",
    "audio.js",
    "biome_art_v126.js",
    "expedition.js",
    "bindings.js",
    "companions.js",
    "isometric_v4_b126.js",
    "commercial_hud_v4_b120.js",
    "tutorial.js",
    "bootstrap.js",
]

ERRORS: list[str] = []


def fail(message: str) -> None:
    ERRORS.append(message)


def require(condition: bool, message: str) -> None:
    if not condition:
        fail(message)


def run(command: list[str], *, cwd: Path = ROOT) -> None:
    try:
        result = subprocess.run(command, cwd=cwd, text=True, capture_output=True)
    except OSError as exc:
        fail(f"Impossible d'exécuter {' '.join(command)} : {exc}")
        return
    if result.returncode != 0:
        details = (result.stdout + result.stderr).strip()
        fail(f"Commande en échec: {' '.join(command)}\n{details}")


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def check_javascript() -> None:
    for filename in JS_ORDER:
        path = JS_DIR / filename
        require(path.exists(), f"Module JavaScript manquant: {filename}")
        if path.exists():
            run(["node", "--check", str(path)])

    run(["node", "tests/release_smoke.test.js"])


def check_android_release_config() -> None:
    gradle = read(APP_GRADLE)
    require("compileSdk 36" in gradle, "compileSdk doit être 36")
    require("targetSdk 36" in gradle, "targetSdk doit être 36")
    require("versionCode 133" in gradle, "versionCode attendu: 133")
    require("versionName '4.0.0'" in gradle, "versionName attendue: 4.0.0")
    require("billing:9.1.0" in gradle, "Google Play Billing 9.1.0 attendu")
    require(gradle.count("BILLING_ENABLED', 'false'") >= 2, "Les achats réels doivent rester verrouillés sans backend")
    require("store {" in gradle and "devLocal {" in gradle, "Les flavors store et devLocal doivent rester séparés")
    require("LOCAL_TEST_MODE', 'false'" in gradle, "La variante Store doit désactiver le mode de test local")
    require(gradle.count("LOCAL_TEST_MODE', 'false'") >= 2, "Tous les flavors doivent désactiver le mock d’achat dans cette version")

    manifest = read(MANIFEST)
    require('android:usesCleartextTraffic="false"' in manifest, "Le trafic HTTP en clair doit rester interdit")
    require('android:appCategory="game"' in manifest, "Le manifeste doit déclarer explicitement la catégorie game")
    require("android.permission.INTERNET" in manifest, "Le portefeuille premium commercial nécessite la permission INTERNET")


def check_web_shell() -> None:
    html = read(INDEX_HTML)
    require("Luciole de poche" in html, "Le nom public Luciole de poche doit être présent")
    require("user-scalable=no" not in html, "Le zoom d'accessibilité ne doit pas être bloqué")
    require('id="gemShopScreen"' in html, "Écran Boutique de Gemmes manquant")

    companions = read(JS_DIR / "companions.js")
    require("openGemShopBtn" in companions, "Les Échos doivent donner accès à la boutique")
    require("renderGemShopScreen" in companions, "Le rendu de boutique dédiée est manquant")
    require("+ renderGemShop()" not in companions, "La boutique ne doit plus être injectée dans l’écran des Échos")

    positions = []
    for filename in JS_ORDER:
        marker = f"js/{filename}"
        position = html.find(marker)
        require(position >= 0, f"Script absent de index.html: {marker}")
        positions.append(position)
    require(positions == sorted(positions), "L'ordre de chargement des modules JavaScript a changé")



def check_asset_references() -> None:
    javascript = "\n".join(read(path) for path in JS_DIR.glob("*.js"))

    svg_names = set(re.findall(r"[\"']([A-Za-z0-9_-]+\.svg)[\"']", javascript))
    missing_svg = sorted(name for name in svg_names if not (ASSETS / "img" / name).exists())
    require(not missing_svg, "Images SVG référencées mais absentes: " + ", ".join(missing_svg))

    ogg_names = set(re.findall(r"[\"']([A-Za-z0-9_./-]+\.ogg)[\"']", javascript))
    missing_ogg = []
    for name in sorted(ogg_names):
        candidates = [
            ASSETS / name,
            ASSETS / "audio" / name,
            ASSETS / "audio" / "sfx" / name,
            ASSETS / "audio" / "music" / name,
            ASSETS / "audio" / "ambience" / name,
        ]
        if not any(candidate.exists() for candidate in candidates):
            missing_ogg.append(name)
    require(not missing_ogg, "Fichiers audio référencés mais absents: " + ", ".join(missing_ogg))

    html = read(INDEX_HTML)
    require('v4-commercial-b120.css' in html, 'CSS commercial b114 non chargé')
    require('js/isometric_v4_b126.js' in html, 'renderer isométrique b114 non chargé')
    require('js/commercial_hud_v4_b120.js' in html, 'HUD commercial b114 non chargé')
    require('img/v4b114/' in html, 'assets HUD b114 non référencés')
    v4_dir = ASSETS / 'img' / 'v4b114'
    png_count = len(list(v4_dir.glob('*.png'))) if v4_dir.exists() else 0
    require(png_count >= 120, f'assets PNG commerciaux b114 insuffisants: {png_count}')
    biome_root = ASSETS / 'img' / 'biomes'
    for region_id in range(1, 8):
        matches = list(biome_root.glob(f'r{region_id}_*'))
        require(len(matches) == 1, f'bibliothèque exclusive manquante pour la balade {region_id}')
        if matches:
            grounds = list(matches[0].glob('ground_*.png'))
            require(len(grounds) == 11, f'la balade {region_id} doit avoir exactement 11 tiles exclusives, trouvé {len(grounds)}')
    resource_dir = ASSETS / 'img' / 'v4resources'
    require(resource_dir.exists() and len(list(resource_dir.glob('*.png'))) == 22, 'les 22 ressources doivent avoir leurs nouveaux PNG')
    require('js/biome_art_v126.js' in html, 'bibliothèques visuelles par balade non chargées')
    expedition = read(JS_DIR / 'expedition.js')
    require("'v4b114/hero_'" in expedition and "files['v4Hero' + dir + i]" in expedition, 'sprites directionnels commerciaux b114 non chargés')
    require("'v4b114/tree.png'" in expedition, 'arbre commercial b114 non chargé')
    require("'v4b114/ground_tile_a.png'" in expedition, 'sol commercial b114 non chargé')

def check_repository_hygiene() -> None:
    forbidden_files = []
    for pattern in ("*.jks", "*.keystore", "*.p12", "*.pfx"):
        forbidden_files.extend(ROOT.rglob(pattern))
    require(not forbidden_files, "Clé privée présente dans le dépôt: " + ", ".join(map(str, forbidden_files)))

    text_extensions = {".java", ".js", ".html", ".css", ".gradle", ".md", ".txt", ".yaml", ".yml", ".xml", ".properties"}
    forbidden_markers = {
        "__LDP_DEBUG__": "ancien hook de debug LDP",
        "__baseDefaultState": "ancien wrapper de patch",
        "__baseLoadState": "ancien wrapper de patch",
        "storePassword=": "mot de passe de signature",
        "keyPassword=": "mot de passe de signature",
    }

    for path in ROOT.rglob("*"):
        if not path.is_file() or ".git" in path.parts or path.suffix.lower() not in text_extensions:
            continue
        content = read(path)
        for marker, label in forbidden_markers.items():
            if marker in content:
                fail(f"{label} trouvé dans {path.relative_to(ROOT)}")

    source_text = "\n".join(
        read(path)
        for path in (ROOT / "app" / "src" / "main").rglob("*")
        if path.is_file() and path.suffix.lower() in text_extensions
    )
    require("Lumières de poche" not in source_text, "Ancien nom public encore présent dans les sources de l'application")
    require("Lumières_de_poche" not in source_text, "Ancien nom de release encore présent dans les sources de l'application")


def check_billing_safety_boundary() -> None:
    main_activity = read(ROOT / "app" / "src" / "main" / "java" / "com" / "jasongolda" / "lumieresdepoche" / "MainActivity.java")
    billing = read(ROOT / "app" / "src" / "main" / "java" / "com" / "jasongolda" / "lumieresdepoche" / "PlayBillingManager.java")
    disabled_gateway = ROOT / "app" / "src" / "main" / "java" / "com" / "jasongolda" / "lumieresdepoche" / "DisabledPremiumWalletGateway.java"
    wallet_cache = read(ROOT / "app" / "src" / "main" / "java" / "com" / "jasongolda" / "lumieresdepoche" / "PremiumGemWallet.java")
    app_bridge = read(ROOT / "app" / "src" / "main" / "java" / "com" / "jasongolda" / "lumieresdepoche" / "AppBridge.java")

    require("DisabledPremiumWalletGateway" in main_activity, "La release doit utiliser le gateway premium verrouillé")
    require(disabled_gateway.exists(), "Gateway premium verrouillé manquant")
    require("verifyAndGrant" in billing, "Les achats doivent passer par la vérification distante")
    require("PendingPurchasesParams" in billing, "Billing 9 doit configurer explicitement les achats en attente")
    require("consumeAsync" not in billing, "Avec le backend prévu, la consommation Google Play ne doit pas être client-only")
    require("spend(" not in wallet_cache, "Le cache premium local ne doit jamais débiter de monnaie")
    require("requestPremiumGemSpend" in app_bridge, "Le débit premium doit passer par le gateway distant")
    require((ROOT / "backend" / "openapi.yaml").exists(), "Contrat backend IAP manquant")



def check_local_test_isolation() -> None:
    main_activity = read(ROOT / "app" / "src" / "main" / "java" / "com" / "jasongolda" / "lumieresdepoche" / "MainActivity.java")
    dev_gateway = ROOT / "app" / "src" / "main" / "java" / "com" / "jasongolda" / "lumieresdepoche" / "DevLocalPremiumWalletGateway.java"
    phone_bridge = ROOT / "tools" / "phone_test" / "dev-local-bridge.js"
    html = read(INDEX_HTML)

    require(dev_gateway.exists(), "Gateway premium local de test manquant")
    require("BuildConfig.LOCAL_TEST_MODE" in main_activity, "Le choix du gateway local doit rester protégé par BuildConfig")
    require(phone_bridge.exists(), "Bridge du builder APK temporaire manquant")
    if phone_bridge.exists():
        run(["node", "--check", str(phone_bridge)])
    require("dev-local-bridge.js" not in html, "Le bridge temporaire ne doit jamais être chargé par les assets Store")
    require(not (ASSETS / "js" / "dev-local-bridge.js").exists(), "Le mock temporaire ne doit pas être présent dans les assets commerciaux")
    if phone_bridge.exists():
        phone_text = read(phone_bridge)
        require("return false;" in phone_text and "isBillingEnabled" in phone_text, "Le bridge téléphone doit garder les achats désactivés")
        require("MODE TEST" not in phone_text, "Le bridge téléphone ne doit plus afficher de badge d’achats simulés")


def check_current_gameplay_invariants() -> None:
    state_js = read(JS_DIR / "state.js")
    data_js = read(JS_DIR / "data.js")
    expedition_js = read(JS_DIR / "expedition.js")
    companions_js = read(JS_DIR / "companions.js")
    tutorial_js = read(JS_DIR / "tutorial.js")
    audio_js = read(JS_DIR / "audio.js")
    css = read(ASSETS / "style.css")
    html = read(INDEX_HTML)

    require(re.search(r"\.expedition-bottom\s*\{[^}]*pointer-events:\s*none", css, re.S) is not None,
            "Le dock bas de balade doit laisser passer les touches dans ses zones transparentes")
    require(re.search(r"\.return-button\s*\{[^}]*pointer-events:\s*auto", css, re.S) is not None,
            "Le bouton Retour doit rester cliquable malgré le dock traversant")

    require("terrainResourceRate(e.expected) + ' par balade" not in state_js,
            "Les listes de ressources ne doivent plus afficher le nombre moyen par balade")
    require("firstEchoCompanionPool" in companions_js,
            "La garantie du premier appel des Échos doit rester explicite dans le code")
    require("companion.rarity === 'common' && companionEffectActive(id, 0, 1)" in companions_js,
            "Le premier appel doit rester Commun et compatible avec la première balade")

    require('id="tutorialLayer"' in html and 'id="tutorialSpotlight"' in html,
            "Le calque de tutoriel guidé doit rester dans l’interface")
    require('id="wallet"' not in html and "home-resources" not in tutorial_js,
            "Les ressources ne doivent plus apparaître sur l’accueil ni dans son tutoriel")
    require('id="tutorialSkipBtn"' in html and "tutorialSkipCurrent" in tutorial_js,
            "Le tutoriel doit pouvoir être quitté depuis chaque étape")
    require("registerMechanicTutorial" in tutorial_js and "startMechanicTutorial" in tutorial_js,
            "Le moteur de tutoriel doit rester réutilisable pour les nouvelles mécaniques")
    require("'run-gather'" in tutorial_js and "'run-light-orbs'" in tutorial_js and "'run-map-progress'" in tutorial_js and "'run-needs'" in tutorial_js and "'refuge-bag'" in tutorial_js,
            "Le tutoriel de première balade doit couvrir lumière, boules de lumière, carte, besoins, récolte et Sacoche")
    require("waiting-run" in tutorial_js and "name === 'run-started'" in tutorial_js and "map-first" not in tutorial_js and "'run-setup':" not in tutorial_js,
            "Le tutoriel principal doit démarrer uniquement une fois la première balade réellement lancée")
    require("first-walk-attention" in read(JS_DIR / "ui.js") and "firstWalkAttention" in css,
            "Le bouton Partir en balade doit être subtilement mis en avant avant la première balade")
    require("Choix de la balade" in read(JS_DIR / "ui.js") and "Démarrer la balade" in companions_js,
            "Les libellés du parcours de départ de balade ne sont pas à jour")
    require("dailyUnlocked" in state_js and "dailyWasAvailable" in expedition_js and 'id="dailySectionTitle"' in html,
            "La quête journalière doit rester masquée jusqu’à la première balade terminée")
    require(re.search(r"\.bottom-nav button\.active\s*\{[^}]*background:", css, re.S) is not None,
            "Le menu actif doit être visuellement distinct au-delà d’un simple changement de couleur")
    require(re.search(r"\.tutorial-coach \.tutorial-skip\s*\{[^}]*position:\s*absolute[^}]*background:\s*transparent", css, re.S) is not None,
            "Le bouton Passer doit rester discret en haut à droite du tutoriel")
    require("box-shadow: 0 0 0 9999px" in css,
            "La surbrillance du tutoriel doit assombrir le reste de l’interface")
    require("BAG_CAPACITY_BY_LEVEL = [0, 10, 18, 25, 32, 39, 46, 53, 60]" in data_js,
            "La progression v3.2.0 de Sacoche a changé")
    require("var REGION_MAX_LEVEL = 4" in data_js and "Terre familière" in data_js,
            "Les terrains doivent conserver leurs quatre niveaux distincts")
    require("playerPhase" in expedition_js and "game.distance * .105" in expedition_js and "playerTilt" in expedition_js and "playerScaleY" in expedition_js,
            "Le personnage jouable doit avoir une animation douce liée au déplacement")
    require("LUCIOLE_COST_MULTIPLIER = 4 / 3" in data_js and "raiseExistingLucioleCost" in data_js and "raiseRegionLucioleCost" in data_js,
            "Les coûts existants en Lucioles doivent être relevés sans modifier les autres matériaux")
    require("glow: 320" in data_js and "glow: 16" in data_js,
            "Le Grand Fanal et l'Aiguille doivent refléter la hausse modérée du coût en Lucioles")
    require("1.8 + herbariumSignatureBonus()" in audio_js,
            "La ressource-signature doit conserver son avantage de présence sur son terrain")
    require("REFUGE_SUPPORT_MATERIALS" in state_js and "UPGRADE_PATH_POOLS" not in state_js,
            "Le Refuge doit rester principalement séparé des signatures/régionales")
    require("previousUnique" in state_js and "r.unique, 5 + Math.floor(i / 2)" in state_js,
            "Le niveau 2→3 doit conserver la dépendance aux ressources régionales")
    require("restoreBalanceV31State" in state_js and "paidFourthLevels" in state_js,
            "Le rollback v3.2.0 doit rester disponible et rembourser les niveaux 4 achetés")
    require("1: { seed: 2, pebble: 2 }" in data_js,
            "La première amélioration de Sacoche doit coûter 2 Graines + 2 Galets")

    require("REFUGE_REVEAL_EXPEDITIONS" in data_js and "dock: 22" in data_js,
            "La révélation progressive des améliorations du Refuge doit rester déterministe")
    require("REFUGE_TRACKER" in data_js and "badgesRequired: 3" in data_js and "Aiguille des trouvailles" in data_js,
            "L'amélioration unique de pistage du Refuge est manquante")
    require("menuNoticeKeys" in read(JS_DIR / "ui.js") and "markMenuNoticesSeen" in read(JS_DIR / "ui.js") and "has-notification" in css,
            "Les menus du bas doivent signaler les nouveautés avec une alerte mémorisée")
    require("itemSeenNotices" in state_js and "pageNoticePills" in read(JS_DIR / "ui.js") and "bindItemNoticeMarkers" in read(JS_DIR / "ui.js") and "page-notice-pill" in css,
            "Les nouveautés doivent rester identifiables sur les éléments de la page après ouverture du menu")
    require("#journalTabs button.has-page-notification" in css and "journalTabHasNew" in read(JS_DIR / "ui.js"),
            "Le Carnet doit indiquer dans quel sous-onglet se trouvent les nouveautés")
    require('class="nav-icon"' in html and ".bottom-nav .nav-icon" in css,
            "Les icônes SVG de navigation basse doivent être centrées dans une boîte commune")
    require("interactCharacter(c)" in expedition_js and "meetCharacter(creature)" not in expedition_js,
            "Les PNJ ne doivent plus interrompre automatiquement la balade")
    require("creatureHasNewDialogue(o)" in expedition_js and "normalizedLevel >= 4 ? 3" in state_js,
            "Les PNJ doivent signaler uniquement les nouveaux dialogues et réserver le dernier récit au niveau 4")
    require("creatureDirectlyLit" in state_js and "!creatureDirectlyLit(c)" in state_js and "creatureDirectlyLit(o, visibility)" in expedition_js,
            "Les PNJ et leur alerte doivent être interactifs uniquement dans le halo direct du joueur")
    require("'run-light-orbs'" in tutorial_js and "petit halo" in tutorial_js and "Lucioles" not in tutorial_js[tutorial_js.find("'run-light-orbs'"):tutorial_js.find("'run-map-progress'")],
            "Le tutoriel doit expliquer les boules de lumière sans révéler leur future nature")
    require("trackingSetupMarkup" in companions_js and "trackingResource" in companions_js and "drawTrackingArrow" in expedition_js,
            "L'Aiguille des trouvailles doit être sélectionnable avant la balade et visible en exploration")
    require("registerMechanicTutorial('tracker-choice'" in tutorial_js and "« Aucune » est sélectionné par défaut" in tutorial_js and "expectEvent: 'tracker-selected'" not in tutorial_js,
            "Le tutoriel de l'Aiguille doit expliquer son caractère optionnel sans imposer de sélection")
    require("tracking-resource-button none" in companions_js and "!selected ? 'selected'" in companions_js,
            "L'Aiguille doit proposer Aucune et la présélectionner par défaut")
    require("v3.2.6 · préparation de balade compacte" in css, "Les règles de compacité v3.2.6 de la préparation doivent rester présentes")
    require("Optionnel · « Aucune » est sélectionné par défaut." not in companions_js and re.search(r"\.tracking-setup-head strong\s*\{[^}]*font-size:\s*12px", css, re.S) is not None,
            "L'Aiguille doit supprimer son sous-texte et récupérer la place pour un titre légèrement plus grand")
    require(re.search(r"\.run-setup-title h2\s*\{[^}]*font-size:\s*23px", css, re.S) is not None, "Le titre de préparation doit rester légèrement compacté")
    require(re.search(r"\.tracking-resource-button\s*\{[^}]*min-height:\s*39px", css, re.S) is not None, "Les choix de l’Aiguille doivent rester compacts sans réduire leur texte")
    require(re.search(r"\.tracking-resource-list\s*\{[^}]*display:\s*grid[^}]*grid-template-columns:\s*repeat\(4", css, re.S) is not None
            and "overflow-x:auto" not in css[css.find(".tracking-resource-list"):css.find(".tracking-resource-button.selected")],
            "Toutes les ressources de l'Aiguille doivent tenir sans défilement dans une grille 4 × 2")
    public_text = "\n".join([data_js, companions_js, expedition_js, tutorial_js, state_js, read(JS_DIR / "ui.js")])
    forbidden_terrain_phrases = [
        "Terrain verrouillé", "Ce terrain", "du terrain", "de ce terrain", "des terrains",
        "aux terrains", "terrain précédent", "hors terrain", "Terrain maîtrisé", "Découverte du terrain"
    ]
    require(not any(phrase in public_text for phrase in forbidden_terrain_phrases),
            "Le vocabulaire public doit utiliser « balade » plutôt que « terrain »")
    require("Elle ne crée" not in tutorial_js and "ne crée pas de ressources" not in state_js,
            "L'interface ne doit plus préciser inutilement que l'Aiguille ne crée pas de ressource")
    require("sortedResourceKeysByAmount" in state_js and "sortedResourceKeysByAmount(cost)" in expedition_js and "FINAL_TARGET[b]" in read(JS_DIR / "ui.js"),
            "Les besoins en ressources doivent être classés du plus demandé au moins demandé")

    require("dailyRewardMarkup(q, true)" in state_js and "Le refuge reçoit ' + costText(q.reward)" not in state_js,
            "La collecte de quête journalière doit afficher visuellement les ressources reçues")
    require("daily-reward-list-collected" in css and "dailyRewardCollected" in css,
            "Les récompenses journalières collectées doivent bénéficier d'une apparition visuelle dédiée")

    require("samplePacked = Math.random() < sampleBoxSaveChance()" in expedition_js,
            "La Boîte d’échantillons doit pouvoir ranger n’importe quelle trouvaille")
    require("free <= 0 && !samplePacked" in expedition_js,
            "La Boîte d’échantillons doit pouvoir sauver une trouvaille même sacoche pleine")
    require("PATH_MATERIALS.indexOf(n.type)" not in expedition_js[expedition_js.find('function collectNode'):expedition_js.find('function runProjectedResourceCount')],
            "La Boîte d’échantillons ne doit plus être limitée aux anciennes ressources de chemin")

    require("Math.min(1.5, window.devicePixelRatio || 1)" in expedition_js,
            "Le rendu de balade doit plafonner sa densité de pixels")
    require("game.canvasRect" in expedition_js and "distSquared" in audio_js,
            "Les calculs chauds de déplacement doivent conserver leurs caches simples")
    require("fogStamp(" in expedition_js and "drawFogStamp(" in expedition_js,
            "Les gradients de brume doivent rester mis en cache")
    require("currentVisibilityMetrics" in audio_js,
            "Les métriques de visibilité doivent être calculées une seule fois par frame")


def check_historical_continuity() -> None:
    gradle = read(APP_GRADLE)
    require("applicationId 'com.jasongolda.lumieresdepoche'" in gradle, "Le package historique ne doit pas changer")

    state = read(JS_DIR / "state.js") + read(JS_DIR / "data.js")
    require("lumieres_de_poche" in state, "Les clés de sauvegarde historiques doivent être conservées pour la migration")


def main() -> int:
    check_javascript()
    check_android_release_config()
    check_web_shell()
    check_asset_references()
    check_repository_hygiene()
    check_billing_safety_boundary()
    check_local_test_isolation()
    check_current_gameplay_invariants()
    check_historical_continuity()

    # v4.0.0 2.5D isometric presentation contract.
    iso_path = ROOT / "app/src/main/assets/js/isometric_v4_b126.js"
    require(iso_path.exists(), "renderer isométrique v4 absent")
    if iso_path.exists():
        iso_js = iso_path.read_text(encoding="utf-8")
        require("function isoProject" in iso_js and "function isoUnproject" in iso_js, "projection/inversion isométrique absente")
        require("function screenToWorld" in iso_js and "isoUnproject" in iso_js, "touch non reconverti vers le monde canonique")
        require("items.sort" in iso_js and "isoDepth" in iso_js, "tri de profondeur isométrique absent")
        require("function isoFog" in iso_js and "function isoWarmLight" in iso_js, "lumière/brouillard isométriques absents")
        require("game.isoDirection = screenDx >= 0 ? 'DR' : 'DL'" in iso_js and "game.isoDirection = screenDx >= 0 ? 'UR' : 'UL'" in iso_js, "Les quatre directions du personnage doivent avoir des sprites dédiés")
        require("var cycleDistance = 144" in iso_js and "gaitDistance % cycleDistance" in iso_js, "Le cycle de marche doit être cadencé par la distance réellement parcourue")
        require("function isoRevealPlayer" in iso_js, "Le halo niveau 1 doit englober le personnage")
        require("cov.litIndices" in iso_js and "Permanent discovery" in iso_js, "Les zones découvertes doivent rester visibles pendant toute la balade")
        require("buildV4Border" in iso_js and "isoDrawBorder" in iso_js, "La bordure de balade doit être matérialisée visuellement")
    index_html = (ROOT / "app/src/main/assets/index.html").read_text(encoding="utf-8")
    require('js/isometric_v4_b126.js' in index_html, "renderer isométrique non chargé par index.html")
    require('js/commercial_hud_v4_b120.js' in index_html, "HUD commercial v4 non chargé par index.html")
    companions_pos = index_html.find('js/companions.js')
    iso_pos = index_html.find('js/isometric_v4_b126.js')
    hud_pos = index_html.find('js/commercial_hud_v4_b120.js')
    require(companions_pos >= 0 and iso_pos > companions_pos and hud_pos > iso_pos, 'ordre scripts invalide: companions doit charger avant renderer isométrique puis HUD')
    require('id="runMiniMap"' in index_html and 'id="runPauseBtn"' in index_html and 'commercial-resource-rail' in index_html,
            "HUD de balade commercial incomplet")
    commercial = read(JS_DIR / "commercial_hud_v4_b120.js")
    require("drawMiniMap" in commercial and "commercialLightFill" in commercial and "renderCommercialInventory" in commercial,
            "Mini-carte, lumière ou rail de ressources commercial manquant")
    require("files['v4Hero' + dir + i]" in read(JS_DIR / "expedition.js") and "v4TreeN1" in read(JS_DIR / "expedition.js") and "v4GroundN8" in read(JS_DIR / "expedition.js"),
            "Le renderer v4 doit utiliser les assets peints, pas seulement des primitives")
    v4_dir = ASSETS / "img" / "v4b114"
    required_v4 = ["hero_idle.png", "hero_walk.png", "tree.png", "crystal.png", "chest.png", "ground_tile_a.png",
                   "ground_tile_b.png", "ground_tile_c.png", "ui_pause.png", "ui_minimap_frame.png",
                   "ui_resource_panel_frame.png", "ui_sacoche_alt.png"]
    require(all((v4_dir / name).exists() for name in required_v4), "Assets commerciaux v4 manquants")
    require(sum((v4_dir / name).stat().st_size for name in required_v4 if (v4_dir / name).exists()) < 6_000_000,
            "Les assets critiques v4 ne sont pas suffisamment optimisés pour mobile")

    if ERRORS:
        print("QA release v4.0.0 : ÉCHEC", file=sys.stderr)
        for error in ERRORS:
            print(f" - {error}", file=sys.stderr)
        return 1

    print("QA release v4.0.0 : OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
