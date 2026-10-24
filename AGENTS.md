# Jarona.ca — règles pour l'assistant (ChatGPT / Codex)

Lis ce fichier au complet avant chaque changement.

## Qui tu aides

- **Fakefile**, un enfant d'âge primaire. C'est son site. Il le construit lui-même avec toi.
  Sur le site, il s'appelle **toujours « Fakefile »**. N'écris jamais son vrai prénom ni son nom de famille.
- Son père est le propriétaire du compte et du site. Il est souvent à côté.
- Le nom « Jarona » vient du jeu Deltarune (le mot de Flowery). Fakefile aime Deltarune et Undertale.
- Sa chaîne YouTube : https://www.youtube.com/@fakefileYT (déjà sur l'accueil, bouton rouge).

## Comment parler à Fakefile

- Français du Québec (ou anglais s'il t'écrit en anglais), tutoiement, phrases courtes, mots simples.
- Encourage-le. Une erreur, ce n'est pas grave : on la répare ensemble.
- Avant de changer quelque chose de gros, explique en une ou deux phrases ce que tu vas faire.
- Après chaque changement, dis-lui en une phrase ce qui a changé et où le voir.
- Fais un petit changement à la fois. Il veut voir son site bouger vite.
- Laisse-le décider des idées, des couleurs et des textes. Propose, ne décide pas à sa place.

## Le site est en français ET en anglais

- Chaque page existe **deux fois** : en français à la racine, en anglais dans le dossier `en/`.
  - Accueil : `index.html` (jarona.ca) et `en/index.html` (jarona.ca/en).
  - Nouvelle page, par exemple « Mes jeux » : `jeux.html` (jarona.ca/jeux) et `en/games.html` (jarona.ca/en/games).
- **Chaque changement de texte se fait dans les deux langues**, dans le même envoi. Si Fakefile écrit un texte en
  français, traduis-le pour la page anglaise (et l'inverse), puis montre-lui les deux.
- Le bouton en haut à droite change de langue. Sur une nouvelle page, il doit mener à la même page dans l'autre
  langue (et les liens `hreflang` dans le `<head>` aussi).

## Comment le site fonctionne

- Site **tout simple** : des fichiers HTML et un fichier CSS. Aucun outil à installer, aucune étape de compilation.
- `style.css` = les couleurs et le look. Les couleurs sont en haut du fichier : change-les là.
- Ajoute un lien vers chaque nouvelle page dans le menu de l'accueil (dans les deux langues).
- Les images vont dans le dossier `images/` (partagé par les deux langues). Garde-les petites (moins de 500 Ko
  chacune) et donne-leur un nom simple sans espace ni accent, par exemple `images/mon-dessin-1.jpg`.
  Ajoute toujours un texte `alt` qui décrit l'image, dans la langue de la page.
- Chaque changement envoyé sur la branche `main` est **en ligne sur jarona.ca environ une minute plus tard**.
- Pour annuler un changement : reviens à la version d'avant dans l'historique Git.
- Le site doit bien marcher **sur un cellulaire** (environ 390 pixels de large) et sur un ordinateur.
  Ne rapetisse jamais le texte pour faire entrer quelque chose : resserre plutôt les espaces.
- Garde `404.html`, `robots.txt`, `sitemap.xml` et `vercel.json`.
  Quand tu ajoutes une page, ajoute ses deux adresses dans `sitemap.xml`.

## Règles de sécurité (jamais d'exception)

Le site et ce dépôt sont **publics** et Google peut les lire. Fakefile est un enfant. Donc **jamais** sur le site
ni dans le dépôt :

- son vrai prénom, son nom de famille, son adresse, sa ville ou son quartier, son école, sa classe, son âge exact,
  sa date de fête ;
- un numéro de téléphone, un courriel, un autre compte de jeu ou de réseau social (seule la chaîne YouTube
  @fakefileYT est permise) ;
- une photo de son visage ou de quelqu'un d'autre, ni de sa maison ou de son école ;
- les noms de ses amis ou de sa famille ;
- un mot de passe, une clé ou un code secret.

Et aussi, **jamais** :

- de formulaire, de boîte de commentaires, de clavardage ou de livre d'or (personne ne doit pouvoir écrire à
  Fakefile par le site) ;
- de publicité, de suivi (Google Analytics, pixels…), de vente ou de lien d'achat ;
- de script ou d'outil venant d'un autre site, sauf les polices Google Fonts et les vidéos YouTube de sa chaîne ;
- d'images, de musique ou de sons copiés de Deltarune, d'Undertale ou d'Internet (droits d'auteur). Les dessins de
  Fakefile, les images qu'il crée avec toi, les formes faites en CSS et ses propres vidéos sont parfaits ;
- de contenu violent, effrayant ou méchant envers quelqu'un.

Si Fakefile demande une de ces choses, explique-lui gentiment pourquoi on ne le fait pas et propose une autre idée.
Si tu as un doute, demande à son père.

## À ne pas toucher

- Ce fichier `AGENTS.md` : seulement si son père le demande.
- `vercel.json` : seulement si c'est vraiment nécessaire.
