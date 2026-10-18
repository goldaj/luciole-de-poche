# Backend des Gemmes payantes

Le client est volontairement verrouillé tant que ce service n'existe pas.

## Pourquoi il est nécessaire

Un achat consommable uniquement mémorisé sur le téléphone peut être falsifié et son solde peut disparaître après désinstallation. Le serveur doit devenir la source de vérité du portefeuille premium.

## Identité

Le jeu doit rester utilisable sans compte. Une identité stable n'est nécessaire que pour le portefeuille de Gemmes achetées.

Recommandation : déclencher une authentification Google minimale au premier accès à la boutique payante, créer côté serveur un identifiant interne de portefeuille, puis conserver le jeu en mode invité pour les joueurs qui n'achètent rien. Google Play Games peut compléter cette architecture pour l'authentification de plateforme et la restauration, mais ne doit pas être utilisé comme identité principale du compte de jeu.

Un simple UUID d'installation n'est pas suffisant pour restaurer des achats après désinstallation ou sur un nouvel appareil.

## Responsabilités

- vérifier chaque achat Google Play avant crédit ;
- garantir l'idempotence du `purchaseToken` ;
- consommer l'achat seulement après crédit confirmé ;
- stocker le solde premium ;
- appliquer les dépenses avec une clé d'idempotence ;
- authentifier toutes les opérations de portefeuille ;
- rendre toute dépense liée à de l'argent réel récupérable après un crash ou une interruption ;
- fournir le solde courant à la connexion ;
- écouter les événements Google Play pertinents et traiter les achats annulés, révoqués ou remboursés ;
- journaliser les corrections/remboursements ;
- ne jamais exposer les identifiants de service Google dans l'application.

Voir `openapi.yaml` pour le contrat client attendu.

## Transaction de jeu et crash

L'idempotence du débit évite les doubles prélèvements, mais elle ne suffit pas à elle seule. Si le serveur débite des Gemmes premium puis que l'application est interrompue avant d'enregistrer la récompense locale, le joueur ne doit perdre ni monnaie ni contenu.

Avant d'activer les achats, choisir l'une de ces stratégies :

1. rendre l'action payante elle-même autoritaire et rejouable côté serveur ; ou
2. limiter les Gemmes achetées à des achats déterministes pouvant être restaurés depuis le ledger.

La première option conserve le design actuel des Échos mais demande davantage de logique serveur. La seconde simplifie fortement les remboursements, la restauration et la distribution internationale.

## Cycle de vie Google Play

Le backend commercial doit rester synchronisé avec Google Play même lorsque l'application n'est pas ouverte. Prévoir les Real-time Developer Notifications et la vérification de l'état réel via la Google Play Developer API. Les achats annulés, révoqués ou remboursés doivent être rapprochés du ledger premium ; les décisions de reprise de Gemmes doivent être explicites et auditées.
