# Processus de release Android

## 1. Vérifier les sources

```bash
python3 tools/qa.py
```

Aucune release ne doit être créée si ce contrôle échoue.

## 2. Compiler

Prérequis : JDK 17, Android SDK 36, Gradle 8.13.

```bash
gradle --no-daemon :app:assembleDebug
gradle --no-daemon :app:bundleRelease
```

Sans fichier `signing/keystore.properties`, le bundle de release est compilé sans secret de signature. Ce mode est utile pour la CI de vérification.

## 3. Signer pour Google Play

Créer localement `signing/keystore.properties` à partir de l'exemple fourni. Le fichier réel et le keystore restent hors Git et hors archives de sources.

La clé de signature de l'application dans Play App Signing doit préserver la continuité avec les versions Android déjà distribuées. Les soumissions courantes utilisent ensuite une clé d'upload distincte.

## 4. Valider une mise à jour réelle

Avant chaque mise en production :

- installer la dernière APK publique sur un appareil physique ;
- créer ou charger une progression dans les deux emplacements de sauvegarde ;
- installer la nouvelle build par-dessus ;
- vérifier la migration, la navigation, les balades et la persistance après redémarrage ;
- tester export puis import des sauvegardes ;
- lorsque Billing est activé, tester achat immédiat, achat en attente, annulation, remboursement, réinstallation et changement d'appareil.

## 5. Déployer progressivement

Passer par les pistes interne puis fermée avant la production. Conserver le même `versionCode` pour un artefact donné et l'incrémenter à chaque nouveau bundle envoyé à Google Play.
