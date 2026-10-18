# Panel d'équilibrage v3.2.0

Ce document consigne le panel de personas de conception utilisé pour arbitrer la refonte. Il s'agit d'une méthode de revue multi-points de vue, pas de personnes réelles ayant testé le build.

## Personas

### Camille Morel — Lead Economy Designer mobile
38 ans, France, 12 ans d'expérience. Spécialiste des sources/sinks, des économies de collection et des goulets d'étranglement. Priorité : éviter les ressources mortes et les choix de dépense qui ressemblent à une taxe. Veto : farmer une ressource hors de son contexte naturel.

### Kenji Sato — Senior Systems Designer cosy/casual
42 ans, Japon. Spécialiste du rythme de découverte, des paliers de maîtrise et de la sensation de progression. Priorité : chaque niveau doit avoir une identité. Veto : ajouter un niveau qui ne serait qu'une copie plus chère du précédent.

### Maya Fernandes — UX Researcher mobile
34 ans, Portugal/Brésil. Spécialiste des nouveaux joueurs, sessions courtes et charge cognitive. Priorité : la contrainte doit être comprise avant d'être ressentie comme punitive. Veto : rendre les vingt premières minutes plus frustrantes.

### Elias Novak — Analyste quantitatif d'économie de jeu
36 ans, Allemagne. Spécialiste des distributions de drops, temps moyen vers objectif et pression par ressource. Priorité : plafonner le nombre de balades ciblées nécessaires à un palier. Veto : un coût séduisant sur le papier mais anormal en simulation.

### Nora Benali — Game UX & Accessibility Designer
40 ans, France/Maroc. Spécialiste de la lisibilité des systèmes et de la relation entre information et action. Priorité : si le jeu demande une ressource, le joueur doit savoir intuitivement où la chercher. Veto : un besoin sans source évidente.

### Victor Huang — Live Ops / Release Engineer
45 ans, Canada. Spécialiste des migrations de sauvegarde et retours arrière. Priorité : aucun équilibrage ne doit détruire silencieusement une progression existante. Veto : migration irréversible.

## Itération 1 — problème initial

Désaccord principal : ajouter un quatrième niveau en conservant les coûts actuels aurait fortement augmenté le farm sans apporter de nouvelle décision. Le passage de la Sacoche 18→20 du tutoriel aurait également été trop faible si la capacité initiale tombait à 10.

Décisions intermédiaires :

- Sacoche 10→18 dès le tutoriel, puis gains quasi linéaires ;
- niveau 4 défini comme palier de maîtrise régionale ;
- séparation économique : Refuge = communs + Lucioles, terrains = signatures + régionales + Lucioles.

## Itération 2 — chiffrage

La première proposition de coûts de terrain ajoutait un niveau mais augmentait à peine les sinks cumulés. Elias a demandé que le niveau 4 exige typiquement plusieurs balades ciblées de ressource régionale, sans dépasser une fourchette raisonnable.

Ajustement retenu : le coût 3→4 place la ressource régionale en première position et vise environ 3 à 4 balades de niveau 3 à Compass/Herbier bas, selon le terrain.

## Itération 3 — consensus

Consensus des six personas :

- 4 niveaux apportent assez de durée supplémentaire sans augmenter fortement tous les coûts ;
- niveaux 1→2 et 2→3 : la quantité de ressource-signature est strictement supérieure à chaque autre ressource du coût ;
- niveau 2→3 : la ressource régionale du terrain actuel est toujours demandée en plus grande quantité que celle du terrain précédent ;
- niveau 3→4 : la ressource régionale actuelle devient le besoin dominant ;
- la ressource-signature représente environ 26–35 % des emplacements communs de son terrain avec Herbier 1, contre au maximum environ 12 % sur un autre terrain ;
- les coûts du Refuge ne consomment plus de ressource-signature ni de ressource régionale ; les Lucioles restent partagées ;
- anciens terrains 3/3 migrés gratuitement en 4/4 ;
- les évolutions 3→4 donnent 5 Gemmes, les deux premières restent à 10.

## Courbe de Sacoche

| Niveau | Places |
|---:|---:|
| 1 | 10 |
| 2 | 18 |
| 3 | 25 |
| 4 | 32 |
| 5 | 39 |
| 6 | 46 |
| 7 | 53 |
| 8 | 60 |

Le coût tutoriel reste 2 Graines + 2 Galets. Le coût cumulé de la Sacoche reste 190 unités, mais il n'utilise désormais que des ressources communes et des Lucioles.

## Identité des niveaux de balade

| Niveau | Profil | Nœuds de base | Ressource régionale garantie |
|---:|---|---:|---:|
| 1 | Sentier naissant | 27 | 0 |
| 2 | Chemin vivant | 42 | 2 |
| 3 | Horizon ouvert | 58 | 4 |
| 4 | Terre familière | 76 | 7 |

Les terrains tardifs ajoutent quelques nœuds supplémentaires par niveau comme auparavant.

## Coûts exacts des terrains

Format : `signature / régionale actuelle / régionale précédente / autres`.

### Clairière mousseuse
- 1→2 : Champignons 8 ; Graines 4 ; Baies 3 ; Lucioles 2.
- 2→3 : Champignons 12 ; Mousses-étoiles 5 ; Graines 6 ; Baies 5 ; Lucioles 3.
- 3→4 : Mousses-étoiles 12 ; Champignons 10 ; Graines 6 ; Baies 5 ; Lucioles 4.

### Rivage des tasses
- 1→2 : Perles de brume 9 ; Coquillages 4 ; Galets 3 ; Lucioles 2.
- 2→3 : Perles de brume 13 ; Verres de mer 5 ; Mousses-étoiles 2 ; Coquillages 6 ; Galets 5 ; Lucioles 3.
- 3→4 : Verres de mer 13 ; Perles de brume 10 ; Coquillages 6 ; Galets 5 ; Lucioles 4.

### Bois doré
- 1→2 : Fleurs-lunes 10 ; Feuilles 5 ; Baies 4 ; Lucioles 2.
- 2→3 : Fleurs-lunes 14 ; Glands dorés 6 ; Verres de mer 2 ; Feuilles 7 ; Baies 6 ; Lucioles 4.
- 3→4 : Glands dorés 14 ; Fleurs-lunes 11 ; Feuilles 7 ; Baies 6 ; Lucioles 4.

### Marais des siestes
- 1→2 : Nénuphars 11 ; Galets 6 ; Feuilles 4 ; Lucioles 3.
- 2→3 : Nénuphars 15 ; Roseaux chantants 6 ; Glands dorés 2 ; Galets 8 ; Feuilles 6 ; Lucioles 4.
- 3→4 : Roseaux chantants 15 ; Nénuphars 12 ; Galets 7 ; Feuilles 6 ; Lucioles 5.

### Îles flottantes
- 1→2 : Cristaux 12 ; Lucioles 8 ; Graines 6.
- 2→3 : Cristaux 16 ; Graines de nuage 7 ; Roseaux chantants 3 ; Graines 9 ; Lucioles 12.
- 3→4 : Graines de nuage 16 ; Cristaux 13 ; Graines 8 ; Lucioles 12.

### Grotte de verre
- 1→2 : Pierres d'écho 13 ; Cristaux 7 ; Galets 5 ; Lucioles 3.
- 2→3 : Pierres d'écho 17 ; Prismes doux 7 ; Graines de nuage 3 ; Cristaux 10 ; Galets 8 ; Lucioles 5.
- 3→4 : Prismes doux 17 ; Pierres d'écho 14 ; Cristaux 9 ; Galets 7 ; Lucioles 5.

### Jardin lunaire
- 1→2 : Pollen lunaire 14 ; Lucioles 12 ; Cristaux 6.
- 2→3 : Pollen lunaire 18 ; Rosée lunaire 8 ; Prismes doux 3 ; Lucioles 16 ; Cristaux 8.
- 3→4 : Rosée lunaire 18 ; Lucioles 15 ; Pollen lunaire 14 ; Cristaux 8.

### Archipel des nuages
- 1→2 : Plumes de nuage 15 ; Coquillages 8 ; Graines 6 ; Lucioles 4.
- 2→3 : Plumes de nuage 19 ; Ambre céleste 8 ; Rosée lunaire 3 ; Coquillages 11 ; Graines 9 ; Lucioles 6.
- 3→4 : Ambre céleste 19 ; Plumes de nuage 15 ; Coquillages 10 ; Graines 8 ; Lucioles 6.

## Contrôles quantitatifs

- Sink total des évolutions de terrain : 926 unités, contre 836 auparavant, soit environ +10,8 %.
- Sink total des améliorations du Refuge : 1 896 unités, proche des 1 948 précédentes, mais sans signatures/régionales.
- La ressource-signature est toujours plus concentrée sur son terrain que sur toute autre carte, testée avec Herbier niveau 1 et niveau 8.
- Une balade niveau 3 produit en moyenne environ 4,2 à 4,8 ressources régionales avant bonus de Boussole avancée ; les coûts 3→4 demandent 12 à 19 unités selon l'avancement.

## Recommandations du panel

### Intégrées à la v3.2.0
1. Ne pas faire payer aux anciens joueurs le nouveau quatrième niveau s'ils avaient déjà terminé un terrain.
2. Réduire la récompense du nouveau palier 3→4 à 5 Gemmes pour éviter une inflation des Échos.
3. Conserver les exigences de niveaux du Refuge pour débloquer les terrains : leur économie désormais séparée permet aux deux progressions d'avancer en parallèle.
4. Ne pas augmenter simultanément les objectifs du Grand Fanal : le nouveau niveau 4 suffit déjà à rallonger le milieu de jeu.

### À observer avant une nouvelle retouche
1. Taux de Sacoche pleine pendant les deux premières balades. Si le joueur reste longtemps à 10 places parce qu'il ignore le tutoriel, il faudra éventuellement forcer plus clairement le retour au Refuge, pas remonter la capacité de départ immédiatement.
2. Nombre médian de balades nécessaires pour 2→3 et 3→4 sur les terrains 6 à 8. Cible : environ 3–4 balades ciblées par palier, pas 6+.
3. Surplus de ressources communes. La séparation Refuge/Terrains doit transformer ces surplus en progression du Refuge plutôt qu'en stock inutile.
4. Pression sur les Lucioles. C'est volontairement la seule ressource partagée fortement par les deux systèmes ; si elle devient le goulet unique, réduire ses coûts de terrain avant de toucher aux drops.
