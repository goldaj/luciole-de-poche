# Panel animation & premier parcours — v3.2.2

Cette revue réutilise le panel fixé en v3.2.1. Les personas sont des rôles de conception simulés, pas des personnes réelles ayant participé à un test utilisateur.

## Personas

- **Camille Morel — Lead Economy Designer mobile, 38 ans, France.** Sur cette passe, elle veille surtout à ce que la hausse des Lucioles ne détruise pas les rôles économiques définis en v3.2.0.
- **Kenji Sato — Senior Systems Designer cosy/casual, 42 ans, Japon.** Il arbitre l'animation du personnage et le rythme visuel de la balade. Veto : une animation qui détourne l'attention de l'exploration.
- **Maya Fernandes — UX Researcher mobile, 34 ans, Portugal/Brésil.** Elle surveille la première minute de jeu et la quantité d'actions demandées avant la première balade.
- **Elias Novak — Analyste quantitatif d'économie de jeu, 36 ans, Allemagne.** Il vérifie que la hausse des Lucioles reste locale aux coûts déjà concernés et ne modifie aucune probabilité de drop.
- **Nora Benali — Game UX & Accessibility Designer, 40 ans, France/Maroc.** Elle contrôle la subtilité de la surbrillance du CTA et la lisibilité de l'animation sur petit écran.
- **Victor Huang — Live Ops / Release Engineer, 45 ans, Canada.** Il contrôle les migrations de tutoriel, la compatibilité des sauvegardes et les parties déjà terminées.

## Débat : animation du personnage jouable

Trois solutions ont été comparées :

1. ajouter plusieurs frames/sprites de marche ;
2. faire rebondir en permanence le sprite actuel ;
3. conserver le sprite et lui appliquer une animation procédurale légère liée au mouvement réel.

Kenji et Nora ont rejeté le rebond permanent : il donne un ton trop cartoon et attire inutilement l'œil. Maya a déconseillé de charger de nouveaux sprites pour une modification aussi petite, surtout si l'animation devient moins cohérente que celles des compagnons. Victor préfère également éviter de nouveaux assets pour limiter le risque de rendu et de packaging.

### Consensus

- À l'arrêt : micro-respiration verticale inférieure à un pixel en moyenne, sans inclinaison.
- En marche : oscillation verticale d'environ 2 px, inclinaison maximale d'environ 1,5 degré et compression verticale très légère.
- La phase de marche dépend de la **distance parcourue**, pas seulement du temps : arrêter le déplacement arrête immédiatement le cycle de marche.
- L'ombre sous le personnage réagit légèrement au pas pour ancrer le mouvement au sol.
- Aucun changement de vitesse, collision ou hitbox : l'animation est purement visuelle.

Le panel considère cette solution plus cohérente avec l'animation existante des compagnons tout en conservant le calme visuel du jeu.

## Débat : première balade

Le tutoriel ne doit plus apparaître sur l'accueil, la carte ou la popup de préparation. Le seul guidage avant la première balade est une mise en valeur douce du bouton **Partir en balade**, supprimée après la première balade terminée. Le tutoriel principal démarre lorsque la scène de balade est réellement initialisée.

## Aiguille des trouvailles

Le choix **Aucune** reste disponible et devient la valeur par défaut. Le mini-tutoriel de découverte se limite à expliquer que l'outil est facultatif ; il n'impose plus de sélectionner une ressource. Les textes ne précisent plus que l'Aiguille n'ajoute pas de ressource, information jugée superflue dans l'interface.

## Lucioles

Camille et Elias recommandent une hausse modérée et systématique d'environ un tiers sur les recettes qui demandaient déjà des Lucioles. Aucune nouvelle recette ne reçoit artificiellement un coût en Lucioles.

Exception structurelle : sur les évolutions de terrain, la hausse est plafonnée si nécessaire pour préserver les règles déjà validées en v3.2.0 :

- aux passages 1→2 et 2→3, la ressource signature reste le besoin individuel dominant ;
- au passage 3→4, la ressource régionale reste le besoin individuel dominant.

Le Grand Fanal passe de 240 à 320 Lucioles. Une partie déjà terminée reste terminée après migration.
