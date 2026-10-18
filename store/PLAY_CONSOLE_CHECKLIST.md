# Checklist Google Play Console

## À faire par le propriétaire du compte

- Créer ou vérifier le compte développeur Google Play.
- Confirmer les exigences de test applicables au compte avant l'accès à la production.
- Configurer Play App Signing en préservant la continuité de signature et créer une clé d'upload distincte.
- Créer l'application **Luciole de poche** avec le package historique `com.jasongolda.lumieresdepoche`.
- Publier la politique de confidentialité sur une URL HTTPS publique.
- Renseigner une adresse e-mail de support.
- Compléter Data Safety, public cible, classification du contenu, publicité, accès à l'application et déclarations requises.
- Créer les quatre produits consommables listés dans `MONETIZATION.md` et fixer leurs prix.
- Configurer une identité stable pour les acheteurs, sans imposer de compte aux joueurs gratuits, puis déployer le backend authentifié du portefeuille premium.
- Configurer les notifications serveur Google Play et le traitement des achats annulés, révoqués ou remboursés.
- Relier le client à une implémentation authentifiée de `PremiumWalletGateway`, puis seulement activer `BILLING_ENABLED`.
- Tester achats immédiats, achats en attente, annulations, remboursements, interruption pendant une dépense, réinstallations et changement d'appareil avec les outils de test Play.
- Fournir captures d'écran, feature graphic, textes et coordonnées de la fiche Store.

## Garde-fous de release

- Ne jamais remettre le keystore historique ou ses mots de passe dans le dépôt ou une archive source.
- Ne pas considérer le cache `PremiumGemWallet` comme un ledger : il ne fait que refléter le dernier solde serveur confirmé.
- Ne jamais inclure les Gemmes achetées dans `localStorage`, les slots ou les exports de progression.
- Ne pas activer les achats avant que vérification, consommation et dépenses soient autoritaires côté serveur.
