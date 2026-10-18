# Panel contradictoire — v4.0.0 2.5D isométrique

## Rôles

- Camille Morel — économie mobile : veto sur tout changement involontaire de progression pendant la migration visuelle.
- Kenji Sato — systems/game feel : contrôle de la lisibilité du déplacement et du rythme de balade.
- Nora Benali — UX/accessibilité : contrôle des cibles tactiles, HUD et contraste.
- Maya Fernandes — recherche utilisateur mobile : contrôle de la continuité entre accueil, préparation et balade.
- Elias Novak — performance : contrôle densité d’objets, cadence de rendu et coût mobile.
- Victor Huang — release/QA : contrôle migration, package, versionCode, signature et rollback.
- Direction artistique mobile — contrôle cohérence avec la promesse cosy/commerciale et différenciation des balades.

## Itération 1 — Perspective

Rejet d’un simple embellissement top-down. Validation d’une projection réellement isométrique avec inversion du toucher vers les coordonnées canoniques.

## Itération 2 — Continuité produit

Validation d’une couche visuelle séparée : l’économie, les sauvegardes, la collecte, les PNJ, l’Aiguille, les compagnons et la progression restent pilotés par les règles v3.2.7.

## Itération 3 — Identité des balades

Rejet du principe « même forêt recolorée ». Ajout de micro-décors propres aux familles de balades : coquillages/rivage, roseaux/marais, nuages/zones célestes, cristaux/grotte, fleurs/jardin lunaire, ambre/archipel.

## Itération 4 — Performance

Validation avec contraintes : DPR plafonné à 1.5, pas de physique 3D supplémentaire, pas de pathfinding, nombre d’éléments borné, simulation inchangée.

## Incident corrigé sur la branche Godot

Le contrôleur tactile 2.5D déclarait devoir reproduire exactement la caméra orthographique de `commercial_25d_world_director.gd`, mais utilisait des constantes différentes. Les constantes du mapping ont été alignées sur `CAMERA_SIZE=9.45`, offset `(4.35, 10.0, 4.35)` et point de visée `y=0.24`.

## Verdict du checkpoint

GO pour APK de review v4.0.0. Pas encore GO « commercial final » : la migration visuelle doit encore être itérée à partir des retours réels sur téléphone et étendue/raffinée écran par écran.
