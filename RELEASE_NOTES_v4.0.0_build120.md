# v4.0.0 build120

- Correction racine du sol 2.5D : le renderer isométrique est chargé après `companions.js`, afin que son wrapper de `startRun()` enveloppe la définition finale et ne soit plus écrasé.
- Les 11 tiles de sol sont choisies une fois au lancement de la balade dans `v4GroundCache`, puis restent figées jusqu’à la fin.
- Conservation des 4 directions, marche synchronisée à la distance, halo amélioré, exploration persistante, barrières accessibles et décor hors-limites.
- URLs renderer/HUD/CSS renouvelées en b120 pour éviter le cache WebView.
