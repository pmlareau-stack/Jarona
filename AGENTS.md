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

## La radio de Flowery

- Sur l'accueil, la radio joue 10 musiques officielles de Deltarune (chapitre 5) dans le lecteur YouTube officiel de
  Toby Fox (`radio.js`, section `#radio`, boutons avec `data-video`). Le lecteur ne se charge qu'au clic.
- Pour changer une musique : remplacer le `data-video` par l'identifiant d'une vidéo de la chaîne officielle
  **@toby-fox-music** seulement, dans les deux langues. Garder les titres officiels en anglais.
- **Jamais** de fichier MP3 ou de son du jeu copié sur le site : Toby Fox demande de ne pas re-téléverser sa musique.
- Garder la ligne « © Toby Fox / Materia Collective » avec le lien Bandcamp.

## Les pages

| Page | Français | Anglais | Ce qu'elle fait |
|---|---|---|---|
| Accueil | `index.html` | `en/index.html` | titre, YouTube, menu (le cœur reste sur un choix et le joueur le bouge : flèches, Entrée ou Z, souris, doigt — `menu.js`), radio |
| Mes jeux | `jeux.html` | `en/games.html` | la liste des jeux de Fakefile |
| Esquive les pétales | `jeux/petales.html` | `en/games/petals.html` | le premier jeu (`jeux/petales.js`, partagé) |
| Kris contre le Chevalier | `jeux/chevalier.html` | `en/games/knight.html` | labyrinthe : Kris ferme les fontaines noires, fuit le Roaring Knight, l'épée des coins le rend faible (`jeux/chevalier.js`, partagé) |
| Mes dessins | `dessins.html` | `en/drawings.html` | galerie + trombone 📎 (`dessins.js`) |
| Mes idées | `idees.html` | `en/ideas.html` | le blogue (`idees.js`) |

- **Nouveau jeu** : une page `jeux/<nom>.html` et `en/games/<name>.html`, son code dans `jeux/<nom>.js` (un seul
  fichier pour les deux langues, comme `petales.js`), une carte dans `jeux.html` et `en/games.html`, les deux
  adresses dans `sitemap.xml`. Tout est dessiné en code ou avec les dessins de Fakefile.
- Les personnages (Kris, le Chevalier, le cœur) sont des dessins en pixels faits maison, dans des grilles de lettres
  au début du fichier du jeu (ex. `KRIS_A`, `CHEVALIER`) : pour changer un dessin, change les lettres, jamais une
  image copiée du jeu. Pour vérifier un jeu dans la console : `JaronaChevalier.etat()`.
- Les flèches à l'écran (`.manette`) s'affichent seulement sur les écrans tactiles.
- Vérifier les 21 écrans : `node outils/ecrans.mjs https://jarona.ca <dossier>` (seul 320 × 568 peut défiler).
- **Dessins et idées** : Fakefile les ajoute lui-même sur le site, avec le trombone ou le bouton « Écrire ».
  Ils ne sont pas dans le dépôt : ils sont gardés dans Vercel Blob par les adresses `api/`. Pas besoin de toi.

## Le site est en français ET en anglais

- Chaque page existe **deux fois** : en français à la racine, en anglais dans le dossier `en/`.
  - Accueil : `index.html` (jarona.ca) et `en/index.html` (jarona.ca/en).
  - Nouvelle page, par exemple « Mes jeux » : `jeux.html` (jarona.ca/jeux) et `en/games.html` (jarona.ca/en/games).
- **Chaque changement de texte se fait dans les deux langues**, dans le même envoi. Si Fakefile écrit un texte en
  français, traduis-le pour la page anglaise (et l'inverse), puis montre-lui les deux.
- Le bouton en haut à droite change de langue. Sur une nouvelle page, il doit mener à la même page dans l'autre
  langue (et les liens `hreflang` dans le `<head>` aussi).

## Comment le site fonctionne

- Site **tout simple** : des fichiers HTML, un fichier CSS et un peu de JavaScript. Aucune étape de compilation.
- Le dossier `api/` (avec `package.json`) fait marcher le trombone et le blogue : il garde les dessins et les idées
  dans Vercel Blob et vérifie le code secret. `coffre.js` demande le code sur la page.
- Pour essayer sur l'ordinateur : `node outils/serveur-local.mjs`, puis http://localhost:3960
  (le code d'essai local est `essai-local` ; il ne marche pas en ligne).
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

- de formulaire pour les visiteurs, de boîte de commentaires, de clavardage ou de livre d'or (personne ne doit
  pouvoir écrire à Fakefile par le site). Les seules fenêtres pour écrire sont celles de Fakefile (trombone et
  blogue), protégées par le code secret ;
- d'affaiblir le code secret : il est dans la variable `JARONA_CODE` de Vercel, jamais dans un fichier, et chaque
  adresse `api/` qui ajoute ou retire quelque chose doit appeler `verifierCode` ;
- de publicité, de suivi (Google Analytics, pixels…), de vente ou de lien d'achat ;
- de script ou d'outil venant d'un autre site, sauf les polices Google Fonts, les vidéos YouTube de sa chaîne et
  le lecteur YouTube de la radio ;
- d'images, de musique ou de sons copiés de Deltarune, d'Undertale ou d'Internet (droits d'auteur). Les dessins de
  Fakefile, les images qu'il crée avec toi, les formes faites en CSS et ses propres vidéos sont parfaits ;
- de contenu violent, effrayant ou méchant envers quelqu'un.

Si Fakefile demande une de ces choses, explique-lui gentiment pourquoi on ne le fait pas et propose une autre idée.
Si tu as un doute, demande à son père.

## À ne pas toucher

- Ce fichier `AGENTS.md` : seulement si son père le demande.
- `vercel.json`, `package.json`, le dossier `api/` et `coffre.js` : seulement si c'est vraiment nécessaire.
