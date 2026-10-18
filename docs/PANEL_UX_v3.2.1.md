# Panel UX & systèmes — v3.2.1

Ce document consigne une revue de conception multi-personas utilisée pour arbitrer la v3.2.1. Les personas sont des rôles de conception simulés, pas des personnes réelles ayant participé à un test utilisateur.

## Personas fixés avant la revue

### Camille Morel — Lead Economy Designer mobile
38 ans, France, 12 ans d'expérience. Spécialiste des sources/sinks et du coût d'opportunité. Elle vérifie qu'une nouvelle aide ne court-circuite pas l'économie et qu'un nouvel équipement possède un prix cohérent avec son utilité. Veto : une mécanique qui crée gratuitement la ressource que le joueur essaie justement de cibler.

### Kenji Sato — Senior Systems Designer cosy/casual
42 ans, Japon. Spécialiste du rythme de découverte, des paliers de maîtrise et de l'exploration non punitive. Il défend une aide qui réduit la frustration sans supprimer la promenade. Veto : transformer la balade en GPS où le joueur suit mécaniquement le chemin optimal.

### Maya Fernandes — UX Researcher mobile
34 ans, Portugal/Brésil. Spécialiste des nouveaux joueurs, sessions courtes et charge cognitive. Elle se concentre ici sur le Refuge et les alertes. Veto : montrer dix améliorations ou plusieurs badges de notification au joueur avant qu'il comprenne à quoi ils servent.

### Elias Novak — Analyste quantitatif d'économie de jeu
36 ans, Allemagne. Spécialiste des probabilités, temps vers objectif et comportements de ciblage. Il vérifie que l'Aiguille améliore l'information sans augmenter le rendement brut d'une balade. Veto : un gain invisible de ressources qui invaliderait l'équilibrage de la v3.2.0.

### Nora Benali — Game UX & Accessibility Designer
40 ans, France/Maroc. Spécialiste de la relation information/action et de la lisibilité mobile. Elle arbitre le langage visuel des `!`, l'ordre des coûts et l'interaction avec les PNJ. Veto : une notification sans action compréhensible ou qui revient continuellement pour la même information.

### Victor Huang — Live Ops / Release Engineer
45 ans, Canada. Spécialiste des migrations et de la compatibilité des sauvegardes. Il veille à ce que les nouveautés puissent être ajoutées à une partie v3.2.0 sans avalanche d'alertes ni réinitialisation de connaissances déjà acquises. Veto : modifier rétroactivement les dialogues déjà appris ou marquer tout l'historique comme « nouveau » après migration.

## Itération 1 — révélation progressive du Refuge

Trois modèles ont été comparés :

1. révélation selon les ressources découvertes ;
2. révélation selon les ressources possédées ;
3. révélation selon le nombre de balades terminées.

Camille et Elias ont rejeté le modèle basé sur la possession : un drop chanceux pourrait ouvrir plusieurs cartes très tôt, tandis qu'un joueur malchanceux pourrait rester bloqué. Maya a également rejeté la découverte brute comme seul déclencheur, car plusieurs ressources peuvent être découvertes pendant une même balade.

### Décision

Le Refuge utilise un calendrier **déterministe par nombre de balades**, une seule nouvelle amélioration à chaque seuil :

| Balades terminées | Nouvelle amélioration visible |
|---:|---|
| 0 | Sacoche |
| 2 | Lanterne |
| 3 | Bottes souples |
| 5 | Herbier de route |
| 7 | Trousse de cueillette |
| 9 | Lentille de brume |
| 11 | Boîte d'échantillons |
| 13 | Bocal à lueurs |
| 15 | Boussole |
| 18 | Petit jardin |
| 22 | Jetée de brume |

Une amélioration déjà achetée reste évidemment visible. Le rythme ralentit légèrement avec l'avancement pour conserver des découvertes au milieu de partie sans encombrer les premières sessions.

## Itération 2 — système de notifications

Le panel a distingué « quelque chose vient d'apparaître » de « une action est actuellement possible ».

Une simple règle « si amélioration achetable alors `!` » a été rejetée : après avoir dépensé puis regagné des ressources, le joueur reverrait le même signal indéfiniment. Nora l'a considéré comme une notification de rappel agressive, pas une notification de nouveauté.

### Décision

Chaque notification est associée à une **clé d'événement mémorisée** : nouveau terrain, nouveau palier achetable, nouvelle amélioration visible, nouveau contenu du Carnet, nouveau compagnon, assemblage nouvellement disponible, etc. Ouvrir le menu concerné marque les événements actuellement présents comme vus. Le même événement ne revient pas simplement parce qu'un solde de ressources fluctue.

Lors d'une migration v3.2.0 → v3.2.1, l'historique existant sert de baseline afin d'éviter une avalanche de `!`. Seule une vraie nouveauté apportée par la release, comme l'Aiguille si elle est déjà éligible, peut apparaître comme nouvelle.

## Itération 3 — PNJ en balade

Le panel a unanimement rejeté l'arrêt automatique de la balade à proximité d'un PNJ. L'interruption se produit au mauvais moment, particulièrement lorsque le joueur cherche une ressource ou gère sa lumière.

### Décision

- un PNJ ne déclenche plus aucun dialogue par proximité ;
- un `!` est dessiné au-dessus du personnage lorsqu'un **nouveau** dialogue est disponible ;
- le joueur touche le PNJ pour lancer l'échange ;
- après lecture, le `!` disparaît ;
- aucun `!` n'est affiché pour relire un dialogue connu ;
- le troisième récit normal est réservé au **niveau 4**, désormais dernier niveau du terrain ;
- un ancien joueur qui avait déjà appris ce troisième récit ne le perd pas après migration ;
- au maximum un nouveau récit est appris par PNJ pendant une même balade, pour éviter de vider plusieurs étapes narratives d'un coup.

## Itération 4 — Aiguille des trouvailles

### Concept initial challengé

Le panel a étudié quatre variantes :

1. faire apparaître davantage de la ressource sélectionnée ;
2. remplacer certains drops par la ressource sélectionnée ;
3. pointer toujours vers l'occurrence la plus proche ;
4. pointer vers une occurrence existante choisie aléatoirement, puis en choisir une autre après collecte.

Camille et Elias ont rejeté 1 et 2 : cela augmenterait directement le rendement et obligerait à rééquilibrer toute l'économie immédiatement après la v3.2.0. Kenji a rejeté 3 : pointer systématiquement vers la plus proche transforme l'exploration en trajectoire optimale et réduit l'intérêt de regarder la carte.

### Consensus

**Aiguille des trouvailles** :

- amélioration unique, sans niveau ;
- devient visible après **3 badges** ;
- coût : **42 Graines, 36 Galets, 30 Feuilles, 24 Baies et 12 Lucioles**, soit 144 unités ;
- n'est pas nécessaire au Grand Fanal ;
- une fois installée, ajoute une sélection facultative de ressource dans la préparation de balade, au même endroit que le choix du compagnon ;
- seules les ressources déjà connues et réellement présentes sur le terrain sont proposées ; la ressource régionale requiert naturellement que le terrain puisse déjà la produire ;
- en balade, l'Aiguille choisit **au hasard une occurrence existante** du type sélectionné et affiche une petite flèche directionnelle ;
- la cible reste stable tant qu'elle n'est pas ramassée ;
- après collecte, une nouvelle occurrence restante est choisie au hasard ;
- quand il n'en reste plus, l'aide s'éteint et l'indique au joueur ;
- aucune ressource n'est créée, convertie ou garantie par ce système.

Le compromis améliore fortement la capacité à **chercher intentionnellement** une ressource sans augmenter le rendement théorique du terrain.

## Tutoriel de l'Aiguille

Le panel recommande de ne pas présenter l'Aiguille avant son installation. À sa première préparation de balade :

1. la zone Aiguille est mise en surbrillance et explique que l'outil pointe uniquement des ressources existantes ;
2. le joueur choisit une première ressource dans la zone mise en évidence ;
3. le tutoriel se termine et la flèche devient l'explication visuelle naturelle pendant la balade.

Cette mécanique utilise le moteur de tutoriel contextuel existant et peut être passée comme les autres tutoriels.

## Ordre des coûts

Consensus immédiat : afficher systématiquement les ressources du **plus grand montant demandé au plus petit** facilite le balayage visuel et montre en premier le principal objectif de farm. Cette règle est appliquée aux évolutions de terrain, au Refuge, à l'Aiguille, aux besoins en balade et au Grand Fanal.

## Recommandations après v3.2.1

1. **Ne pas ajouter de compteur rouge numérique.** Le `!` suffit tant que chaque destination reste peu fréquente ; un compteur transformerait une invitation en backlog.
2. **Mesurer le taux d'utilisation de l'Aiguille** avant de modifier son coût. Si elle devient quasiment obligatoire sur toutes les balades, réduire son efficacité informative plutôt que d'augmenter son prix.
3. **Observer les abandons de cible.** Si les joueurs suivent trop longtemps une flèche vers une ressource lointaine, une future version pourrait permettre de « relancer » manuellement la cible, mais pas automatiquement choisir la plus proche.
4. **Ne pas accélérer immédiatement la révélation du Refuge.** Vérifier d'abord si les seuils 15/18/22 paraissent trop tardifs dans de vraies parties longues.
5. **Conserver le dialogue PNJ volontaire.** Même si le taux d'ouverture baisse légèrement, l'absence d'interruption respecte mieux le rythme cosy ; le `!` doit servir d'invitation suffisante.
