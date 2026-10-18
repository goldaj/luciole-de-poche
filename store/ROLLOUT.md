# Stratégie de mise en production

## Objectif

Publier une première version commerciale gratuite, sans publicité, avec achats intégrés facultatifs de Gemmes, tout en limitant le risque technique et réglementaire du premier lancement.

## Déploiement recommandé

1. **Test interne** : vérifier installation, mise à jour depuis une ancienne APK, sauvegardes, restauration, achats de test et remboursements.
2. **Test fermé** : petit groupe de joueurs réels sur plusieurs appareils et versions Android.
3. **Production France** : lancement initial sur le marché principal en français, avec déploiement progressif si Play Console le permet pour le compte.
4. **Extension francophone** : Belgique, Luxembourg, Suisse et Canada après validation de la télémétrie opérationnelle disponible dans Play Console, des retours support et des achats.
5. **Autres territoires** : ouverture après revue spécifique des règles locales applicables aux achats intégrés et aux objets virtuels aléatoires.

## Public cible

Le public cible déclaré dans Play Console doit correspondre au public réellement visé par le produit. Ne pas sélectionner artificiellement « 18 ans et plus » uniquement pour contourner des règles liées aux mineurs.

Si le jeu vise des adolescents, conserver une revue pays par pays avant extension. Avec la mécanique actuelle, des Gemmes achetées peuvent financer un appel aléatoire de compagnon. Cela impose au minimum une transparence stricte des probabilités et peut entraîner des restrictions supplémentaires selon les territoires.

### Brésil

Ne pas inclure le Brésil dans le premier déploiement tant que la mécanique payante aléatoire reste inchangée. La documentation de distribution Google Play signale une restriction locale sur les loot boxes dans les jeux destinés aux enfants ou adolescents, ou susceptibles d'être utilisés par eux.

## Variante produit recommandée à moyen terme

Pour simplifier une distribution mondiale et réduire la perception « gacha payant », envisager de dissocier l'argent réel du résultat aléatoire. Deux options compatibles avec l'économie actuelle :

- conserver les appels aléatoires uniquement avec des Gemmes gagnées en jeu et utiliser les Gemmes achetées pour des achats déterministes ;
- révéler le résultat d'un appel avant toute dépense, puis laisser le joueur décider s'il souhaite l'accepter contre des Gemmes.

Cette évolution n'est pas appliquée dans la v3.0.0 car elle modifie sensiblement le game design et doit être décidée comme telle.
