# Jarona.ca

Le site de Fakefile, construit par lui-même avec ChatGPT. Français + anglais.

- **En ligne** : https://jarona.ca (anglais : https://jarona.ca/en)
- **Code** : GitHub `pmlareau-stack/Jarona`
- **Hébergement** : Vercel. Chaque changement sur `main` est en ligne environ une minute plus tard.
- **Domaine** : jarona.ca chez GoDaddy (A @ et CNAME www vers Vercel).
- **YouTube** : https://www.youtube.com/@fakefileYT
- **Règles pour ChatGPT** : [AGENTS.md](AGENTS.md) (sécurité, façon de parler, deux langues, structure du site).

## Brancher ChatGPT (PM le fait une seule fois)

1. PM crée le 2e compte ChatGPT, à son nom (OpenAI exige 13 ans). Il faut un plan qui inclut Codex.
2. Dans ChatGPT, PM ouvre **Codex** et connecte GitHub. À la question des dépôts : « Only select repositories »,
   puis **Jarona seulement**.
3. PM crée un environnement Codex pour `pmlareau-stack/Jarona`. Il n'y a rien à installer.
4. Fakefile écrit ce qu'il veut, par exemple « Ajoute une page Mes jeux ». Codex lit `AGENTS.md` tout seul.
5. Quand le résultat lui plaît : « Créer une PR » dans Codex, puis « Merge pull request » sur GitHub.
   jarona.ca change environ une minute plus tard.

Si Vercel affiche un déploiement « Blocked », c'est l'auteur du commit qui n'est pas reconnu. Fusionner avec
« Create a merge commit » : le commit est alors au nom de PM.

## Code secret et stockage (dessins, idées)

- Les dessins (trombone 📎) et les idées (blogue) sont gardés dans **Vercel Blob** (projet `jarona`, onglet Storage).
- Seul quelqu'un qui connaît le **code secret** peut ajouter ou retirer. Le code est la variable `JARONA_CODE`
  dans Vercel (Settings → Environment Variables). PM le choisit et le change là ; il n'est écrit dans aucun fichier.
- Sur un appareil, le code est retenu après la première fois. Le bouton « 🔒 Verrouiller » le fait oublier.
- Les photos sont réduites à 1600 px et refaites en WebP sur l'appareil : l'endroit où la photo a été prise
  (GPS) n'est jamais envoyé.

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html`, `en/index.html` | accueil (titre, YouTube, menu, radio) |
| `jeux.html`, `en/games.html` | Mes jeux |
| `jeux/petales.html`, `en/games/petals.html`, `jeux/petales.js` | le jeu « Esquive les pétales » |
| `dessins.html`, `en/drawings.html`, `dessins.js` | Mes dessins (galerie + trombone) |
| `idees.html`, `en/ideas.html`, `idees.js` | Mes idées (blogue) |
| `coffre.js` | demande et retient le code secret |
| `api/` | adresses du serveur : `code`, `dessins`, `idees` (Vercel Functions + Blob) |
| `radio.js` | la radio de Flowery |
| `style.css` | couleurs et look (les couleurs sont en haut) |
| `404.html` | page « Oups » quand une adresse n'existe pas |
| `robots.txt`, `sitemap.xml` | pour Google (Search Console : propriété Domaine jarona.ca, compte pmlareau@gmail.com) |
| `vercel.json` | adresses propres (`/jeux` au lieu de `/jeux.html`) |
| `outils/serveur-local.mjs` | serveur d'essai sur l'ordinateur (pas envoyé en ligne) |

## Voir le site sur l'ordinateur

```bash
npm install
node outils/serveur-local.mjs
```

Puis ouvrir http://localhost:3960. Le code d'essai local est `essai-local` ; les dessins et idées d'essai vont dans
`.stockage-local/` (jamais envoyé en ligne).
