# Luciole de poche

**Jeu mobile cosy | Android · JavaScript · Gradle · tests automatisés**

Projet de jeu mobile orienté balade et progression, développé de façon itérative avec des cycles d'ajustement de l'interface, des assets et des règles de gameplay. Il prolonge l'historique du projet **Lumières de poche**.

## Fonctionnalités

- Exploration et interface de jeu en **2D** et **2.5D**.
- Mécanismes de sauvegarde locale et écrans d'options.
- Ressources graphiques, animations, environnements et contrôles adaptés au téléphone.
- Contrats et tests de non-régression JavaScript.
- Scripts de build/QA, historiques de versions et documentation de livraison.

## Arborescence de référence

- `app/` : application Android et assets web du jeu.
- `tests/` : tests de rendu, navigation, options et sauvegardes.
- `tools/` : scripts de QA et compilation.
- `store/` : descriptions et documents de préparation à la distribution.
- `RELEASE_NOTES_*.md` : journal des itérations.

## Développement

Ouvrir le projet avec Android Studio pour les builds Android et utiliser Node.js pour les tests JavaScript lorsque leurs scripts le prévoient. Le projet conserve des versions historiques de son architecture : certaines commandes supposent un SDK Android et une configuration locale adéquats.

**État :** prototype avancé, version source de référence `v4.0.0 build 133`. Les APK signés et les secrets de signature ne sont pas nécessaires à la compilation de développement.

## Démarche produit

Ce projet illustre la création d'un jeu à partir d'itérations fonctionnelles, d'essais et de vérifications de l'interface, de mécanismes de progression, de tests contractuels et de livraisons successives.

## Vérification locale du code

Avec Python 3 et Node.js disponibles, lancer `python tools/qa.py` depuis la racine. Ce script contrôle notamment la syntaxe JavaScript, les tests de fumée de release, les références d'assets et les invariants de configuration Android. Les builds Android nécessitent le SDK et le JDK adaptés au projet ; les variantes `store` et `devLocal` restent distinctes et les achats réels sont désactivés dans la configuration source examinée.

Cette revue documentaire n'a pas exécuté les tests, construit un APK ni validé une publication commerciale.
