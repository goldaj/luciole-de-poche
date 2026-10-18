# Notes Data Safety

## Build actuelle avec Billing désactivé

- Pas de publicité.
- Pas d'analytics tiers.
- Pas de trafic réseau initié par le contenu WebView.
- Progression conservée localement.

## Build commerciale avec achats

Revalider le formulaire après choix du backend et de l'identité. Le service de paiement/portefeuille transmettra au minimum des données de transaction et un identifiant pseudonyme. La déclaration exacte dépendra du fournisseur d'identité, de l'hébergeur et des journaux conservés.

Ne pas copier aveuglément la déclaration de la build hors ligne : l'activation du portefeuille serveur modifie le flux de données.
