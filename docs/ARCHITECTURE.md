# Architecture v3

## Hôte Android

`MainActivity` héberge une WebView réservée aux ressources empaquetées dans l'application. La navigation vers des contenus distants est refusée, les chargements réseau de la WebView sont bloqués et le document applique aussi une Content Security Policy restrictive.

L'activité gère les insets des barres système pour Android 15/16, le Retour système, les sauvegardes natives et le sélecteur de documents pour l'import/export.

`AppBridge` constitue l'unique frontière entre le client JavaScript et les fonctions Android. Les opérations de portefeuille premium ne modifient jamais directement un solde local : elles passent par `PremiumWalletGateway`.

## Client de jeu

Le client est séparé par responsabilités :

- `data.js` : contenu et constantes ;
- `state.js` : état, migrations, économie et persistance ;
- `ui.js` : écrans, options, journal et modales ;
- `audio.js` : musique, ambiances et effets ;
- `expedition.js` : simulation et rendu des balades ;
- `bindings.js` : entrées et navigation Retour ;
- `companions.js` : Échos, compagnons, Gemmes et boutique ;
- `bootstrap.js` : démarrage.

Les anciennes surcharges de fonctions et scripts de patch ne font plus partie du projet. Les règles de la version courante vivent dans leurs modules respectifs.

## Sauvegardes

Chaque partie conserve sa clé historique afin de préserver la migration des installations existantes. Une écriture :

1. conserve la dernière sauvegarde locale valide comme secours ;
2. écrit le nouvel état ;
3. maintient la compatibilité de la Partie 1 avec la clé historique ;
4. crée une copie de secours dans le stockage privé Android.

Au chargement, une valeur illisible est restaurée depuis la copie locale puis, si nécessaire, depuis la copie Android. Une erreur d'écriture est visible par le joueur.

L'import/export transporte uniquement la progression. Les Gemmes achetées ne font jamais partie d'un fichier de sauvegarde de partie.

## Gemmes

`state.gems` contient uniquement les Gemmes gagnées en jeu. Le solde de Gemmes achetées est un cache en lecture d'un portefeuille qui devra être autoritaire côté serveur.

Une dépense utilise d'abord les Gemmes gagnées. Si un complément premium est nécessaire, le client demande un débit distant idempotent et n'applique la suite de l'action qu'après confirmation.

Une réinitialisation de partie n'efface donc jamais un achat réel.

## Google Play Billing

`PlayBillingManager` utilise Play Billing 9.1.0 pour :

- ouvrir et maintenir la connexion au service Play ;
- récupérer les produits et leurs prix localisés ;
- gérer les achats en attente ;
- retrouver les achats non encore traités ;
- transmettre chaque `purchaseToken` au portefeuille sécurisé.

Le serveur attendu vérifie l'achat auprès de Google Play, crédite le ledger de manière idempotente et consomme le produit seulement après crédit confirmé. Le client ne crée jamais lui-même des Gemmes achetées.

La v3.1.0 utilise volontairement `DisabledPremiumWalletGateway` et `BILLING_ENABLED=false`. Activer les achats nécessite une identité stable pour les acheteurs et une implémentation authentifiée de `PremiumWalletGateway`. Le jeu gratuit peut rester entièrement en mode invité.

L'activation commerciale devra également rendre l'action financée par Gemmes premium récupérable après interruption. Un débit serveur idempotent empêche un double débit, mais ne garantit pas à lui seul qu'une récompense locale a été persistée avant un crash.
