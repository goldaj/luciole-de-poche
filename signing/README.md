# Signature Android

Les clés privées ne sont volontairement **pas** stockées dans le dépôt ni dans les archives de sources.

Le package historique doit rester `com.jasongolda.lumieresdepoche` afin de conserver la compatibilité de mise à jour.

Pour Google Play App Signing, utiliser comme **clé de signature de l'application** le certificat historique dont l'empreinte SHA-256 est :

`48:B2:C8:07:72:AD:F4:8A:7C:A4:9D:A7:58:DF:FE:6F:0B:88:DB:E9:5D:9E:CC:12:29:AA:5D:C9:FA:35:46:F4`

Créer ensuite une clé d'upload distincte pour les futures soumissions Play Console.

Ne jamais remettre le keystore historique ni ses mots de passe dans Git, un ZIP de sources ou un script de build.


## Build signé local

Copier `keystore.properties.example` vers `keystore.properties` puis renseigner le chemin absolu et les secrets de la **clé d'upload**. Gradle détecte ce fichier automatiquement et signe le build `release`. Le fichier réel est ignoré par Git.

Pour une CI de production, injecter le keystore et les quatre propriétés depuis le gestionnaire de secrets du fournisseur CI. La workflow fournie dans ce dépôt reste volontairement une CI de vérification et ne contient aucun secret.
