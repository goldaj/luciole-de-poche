# Rollback d'équilibrage v3.2.0

## Objectif
La v3.2.0 modifie la courbe de Sacoche, les coûts du Refuge et fait passer les terrains de 3 à 4 niveaux. Le changement de schéma de sauvegarde reste réversible par une release corrective de version supérieure.

## Sauvegarde de migration
Au premier chargement d'une sauvegarde antérieure à la v3.2.0 :

- `balanceV32.regionLevelsV31` conserve les niveaux de terrain avant migration ;
- les anciens niveaux 3, qui étaient le maximum, deviennent automatiquement niveau 4 ;
- les niveaux 1 et 2 restent inchangés ;
- `balanceV32.paidFourthLevels` ne contient que les niveaux 4 réellement achetés après migration.

## Fonction de rollback
`restoreBalanceV31State(state)` est conservée dans `state.js` pour une release corrective éventuelle.

Elle :

1. ramène tous les niveaux de terrain au maximum historique 3 ;
2. rembourse intégralement le coût v3.2.0 de chaque évolution 3→4 réellement achetée ;
3. ne rembourse pas les anciens niveaux 3 migrés gratuitement en niveau 4 ;
4. conserve une trace `rollbackRefund` dans `balanceV32`.

Un downgrade direct vers un APK v3.1.x n'est pas prévu : Android n'accepte pas normalement un `versionCode` inférieur et l'ancien code ne connaît pas le schéma v3.2.0. Le rollback doit donc être livré dans un APK correctif de version supérieure.
