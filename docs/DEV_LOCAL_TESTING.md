# Tests Android locaux

Deux chemins de test sont prévus sans toucher à la future release Play Store.

## Variante Android `devLocal`

La variante `devLocal` utilise le code Android moderne, mais remplace le portefeuille premium distant par un portefeuille local de test. Les packs n'ouvrent aucun paiement Google Play et créditent seulement des Gemmes fictives sur l'appareil.

Build normal, dès qu'un SDK Android est disponible :

```bash
./gradlew assembleDevLocalRelease
```

Pour mettre à jour une ancienne installation sans perdre la progression, la build doit être signée avec le certificat historique via `signing/keystore.properties`. Le keystore lui-même reste hors dépôt.

## APK temporaire sans SDK Android

`tools/build_phone_test_apk.py` existe uniquement pour poursuivre les tests tant que l'environnement de build Android complet n'est pas disponible. Il réutilise le shell WebView historique, injecte les assets actuels et un bridge local de test, puis signe l'APK avec le certificat historique.

Ce chemin :

- conserve le package historique et les données de jeu ;
- utilise `versionCode 102` / `versionName 3.2.4` ;
- simule les achats de Gemmes ;
- n'effectue aucun paiement ;
- ne doit jamais produire un artefact destiné au Play Store ;
- ne fournit pas les nouvelles fonctions natives v3 qui nécessitent le vrai bridge Android, notamment l'import/export via le sélecteur de fichiers Android.

Le conteneur téléphone reste temporaire, mais il n'expose plus aucun achat simulé et utilise le nom public `Luciole de poche`.
