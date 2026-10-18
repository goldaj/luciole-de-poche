# Préparation monétisation

## Produits prévus

| Product ID | Gemmes | Nom interne |
|---|---:|---|
| `gems_120` | 120 | Petite lueur |
| `gems_650` | 650 | Bocal lumineux |
| `gems_1400` | 1 400 | Grande lanterne |
| `gems_3000` | 3 000 | Réserve du refuge |

Prix de départ à tester en piste fermée, pas à considérer comme verrouillés : **1,99 € / 9,99 € / 19,99 € / 39,99 €**. Les prix réels doivent être définis dans Play Console et sont toujours affichés depuis `ProductDetails`, jamais codés en dur dans le client.

Un appel coûte actuellement 10 Gemmes. La plus grosse offre représente donc 300 appels. Avant lancement, vérifier l'effet de ce volume sur la durée de collection et ajuster soit les quantités soit les prix.

## Transparence des Échos

La boutique affiche, avant tout achat :

- les probabilités par rareté ;
- les probabilités exactes de chaque compagnon ;
- la faveur appliquée aux compagnons encore inconnus ;
- le fait que les Gemmes peuvent servir à des résultats aléatoires.

La liste est recalculée avec l'état réel du joueur, afin de ne pas présenter des probabilités devenues fausses après une découverte.
