# Contexte ChatGPT pour Luciole de poche

**Initialisé le 2026-10-24. Couverture : partielle, sauf les sources originales référencées explicitement.** Codex doit lire ce fichier après `AGENTS.md` et avant toute reprise du projet. Une mémoire reconstruite n'est pas la totalité du chat.

## Projet confirmé par le dépôt
- Dépôt : `goldaj/luciole-de-poche`.
- Objet : Jeu mobile cosy Android 2D/2.5D d'exploration et progression, itéré depuis Lumières de poche, avec sources, assets, tests et versions successives jusqu'à v4.0.0 build 133.
- Contraintes : Conserver l'historique des versions et la distinction builds `store`/`devLocal`, protéger clés de signature et données privées. Ne jamais déclarer un APK construit ou testé sans preuve.
- Validation : `python tools/qa.py` pour les contrôles statiques (Python 3 + Node.js) ; Android SDK/JDK requis pour les builds.

## Échanges attestés ou sources à lire

2026-10-18 13:24:13 UTC — Utilisateur (extrait verbatim de l'inventaire GitHub) : « D'ailleurs je suis presque sûr qu'il y en a d'autres que tu as oublié, notamment sur luciole de poche si je ne me trompe pas, entre autres. »

Assistant — Résumé reconstruit, non verbatim : travail d'identification et d'archivage des projets oubliés, dont Luciole de poche. Les anciens échanges de conception du jeu ne sont pas intégralement récupérés ici.

2026-10-24 — Utilisateur (verbatim, heure non vérifiable) : « je te demande de lire mes repo git où tu es le dernier utilisateur, de rajouter un AGENTS.md pertinent s'il n'y en a pas. Mais en plus, tu rajoutera un document repérable par codex (peut être le référencer dans le AGENTS.md justement ?) où tu mets l'intégralité de nos échanges liés à ce projet. Mes questions, tes réponses (de sorte à les différencier) et les horodatages si tu les as. »

## Limites de couverture, fidélité et mise à jour
- Les passages marqués `verbatim` sont des extraits exacts disponibles dans le contexte ; les résumés ne doivent **jamais** être cités comme du dialogue mot pour mot. Aucune réponse complète de l'assistant n'a été inventée.
- Pour obtenir l'intégralité des questions, réponses et horodatages : intégrer un export authentique des conversations pertinentes ; conserver l'ordre et le rôle des messages, et expurger avant publication les éléments sensibles et hors projet.
- En intervention future, ajouter en bas les nouveaux dialogues sourcés et les décisions vérifiées, sans effacer les entrées précédentes. Ce journal et `AGENTS.md` sont versionnés dans Git.

## 2026-10-24 — Revue parallèle multi-dépôts (heure non disponible)

**Utilisateur (verbatim, message visible dans cette conversation)** :

> tu vois tout le boulot qu'on a fait sur la conversation Avancement projets codex ?
> Tu vas refaire la même chose sur TOUT mon repo git. Tu vas commencer par les projets les plus gros, regarder ce que tu peux faire dessus et le faire sur ta branch (même consignes que sur l'autre conversation).
> Tu vas ensuite me faire un rapport très succint des projets que t'as touché et de ce que t'as avancé dessus.
> Amuse toi !

**Assistant (résumé reconstruit, non verbatim)** : revue des gros dépôts et amélioration isolée sur `chatgpt/review-20261024`. QA : erreurs d'exécution externe converties en diagnostics lisibles ; tests unitaires du lanceur QA intégrés à la CI.

**Validation et confiance** : confiance élevée sur la portée du changement ; aucune exécution locale des tests ne peut être attestée depuis l'accès GitHub disponible. Consulter les statuts GitHub Actions de la PR avant intégration. Aucune modification de `main`/`develop`, aucun déploiement. Codex doit inspecter le diff, relancer les tests et choisir les commits à intégrer sans écraser son travail.
