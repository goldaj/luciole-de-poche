# Luciole de poche v3.1.0 — validation du panel

## Panel retenu

- **Amina El Mansouri** — femme, Maroc / France — Lead UX mobile et accessibilité. Priorité : compréhension sans surcharge, zones forcées explicites, tutoriel non ambigu.
- **Kenji Satō** — homme, Japon — Producer / game designer mobile cosy. Priorité : onboarding, rythme de découverte, boucle balade → refuge.
- **Nora Leclerc** — femme, France — Ingénieure performance mobile / WebView. Priorité : coût CPU/GPU, rendu Canvas, allocations et lectures de layout dans la boucle chaude.
- **Marcus Reed** — homme, Royaume-Uni — Lead QA mobile. Priorité : migrations, non-régressions, parcours frais et sauvegardes existantes.
- **Léa Martin** — femme, France — Lead Android / release engineering. Priorité : compatibilité APK, signature, isolation du mock et architecture Store.
- **Thomas Keller** — homme, Suisse — Product / économie de jeu. Priorité : progression de la Sacoche et conservation de l’économie cumulée.

## Itération 1 — tutoriel

Première proposition rejetée : trop de bulles explicatives et pas assez d’actions réelles.

Consensus retenu : un moteur de surbrillance générique et persistant. Le joueur est guidé sur l’accueil, les ressources, le menu, la Clairière mousseuse, la préparation de balade, la Sacoche, la lumière, le déplacement, la récolte, le retour et le Refuge. Les actions structurantes sont forcées : première balade, collecte minimale, retour et première amélioration de Sacoche. Le moteur expose `registerMechanicTutorial()` et `startMechanicTutorial()` afin que les futures mécaniques utilisent la même logique au moment de leur découverte.

## Itération 2 — première balade et Sacoche

Proposition rejetée : créditer artificiellement les ressources nécessaires au retour.

Consensus retenu : placer quatre ressources guidées près du départ, exactement **2 Graines + 2 Galets**. Le joueur doit réellement marcher et les collecter avant que le retour soit autorisé.

La Sacoche passe de 18 à **20 places** au niveau 2, pour un coût de **2 Graines + 2 Galets**. Les niveaux suivants absorbent la différence. Le niveau 8 reste à **60 places**.

Contrôle économique : le coût cumulé niveau 1 → 8 reste strictement identique à l’ancien barème pour chaque ressource. Les anciennes sauvegardes reçoivent uniquement le différentiel positif déjà payé afin qu’aucun joueur existant ne soit lésé.

## Itération 3 — migration

Une première logique de remboursement a été rejetée pendant la revue car elle pouvait surcompenser certaines ressources communes.

Consensus retenu : calculer le remboursement par différence cumulée entre ancien et nouveau barème, uniquement lorsque cette différence est positive. Les tests couvrent notamment le niveau 2 et la convergence du différentiel à zéro aux niveaux avancés.

Les joueurs ayant déjà commencé la partie ne subissent pas le tutoriel forcé lors de la mise à jour. Une sauvegarde ancienne mais réellement intacte reçoit en revanche le nouvel onboarding.

## Itération 4 — Boîte d’échantillons

Consensus immédiat après revue gameplay : l’effet n’est plus limité à une catégorie de ressources. À son déclenchement, la Boîte peut ranger **n’importe quelle trouvaille** sans consommer de place, y compris une ressource régionale et y compris lorsque la Sacoche est déjà pleine.

La probabilité existante de la Boîte est conservée. Seule la portée de l’effet change.

## Itération 5 — fluidité des balades

Diagnostic du panel performance : le poids du jeu n’est pas le problème principal. Le coût venait surtout du rendu Canvas haute densité et de travaux répétés dans la boucle 60 FPS.

Première passe retenue :

- densité de rendu de la balade plafonnée à **1,5×** au lieu de 2× ; sur un téléphone DPR ≥ 2, cela réduit de **43,75 %** le nombre de pixels des deux canvas de balade ;
- rectangle du Canvas mis en cache au redimensionnement au lieu d’une lecture de layout continue pendant le déplacement ;
- distances de collision/proximité comparées au carré pour supprimer les racines carrées inutiles ;
- métriques de lumière et de visibilité calculées une fois par frame ;
- gradients de brume remplacés par des masques radiaux réutilisables.

Deuxième passe après revue :

- suppression d’un calcul complet de `resourceStage()` qui était effectué une seconde fois dans `updateGame()` sans être utilisé ailleurs ;
- suppression des lectures répétées de `performance.now()` à l’intérieur de chaque décor lumineux ;
- le nombre de sites `createRadialGradient()` exécutés directement dans `drawGame()` passe de **5 à 1**. Les gradients de brume sont créés une fois puis réutilisés.

Le panel a refusé de réduire la fréquence logique du déplacement ou de plafonner artificiellement le jeu à 30 FPS : la réactivité reste donc inchangée.

## Itération 6 — release gate

Validation finale :

- syntaxe de tous les modules JavaScript : OK ;
- smoke tests : OK ;
- tutoriel frais et transitions principales : OK ;
- migration v3.0.3 : OK ;
- économie cumulée Sacoche : identique ;
- Boîte d’échantillons à Sacoche pleine : OK ;
- première garantie des Échos : inchangée ;
- achats réels : toujours désactivés ;
- signature APK historique : conservée ;
- package historique : conservé ;
- version : **3.1.0 / versionCode 95**.

## Verdict

**GO unanime du panel pour la v3.1.0 de test.**

La seule validation qui reste nécessaire sur la performance est empirique sur téléphone réel : l’environnement de build ne reproduit pas le GPU/WebView de l’appareil cible. Les optimisations livrées portent néanmoins directement sur les chemins chauds identifiés et sont couvertes par des invariants de release pour éviter leur régression.
