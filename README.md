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

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | accueil en français |
| `en/index.html` | accueil en anglais |
| `style.css` | couleurs et look (les couleurs sont en haut) |
| `404.html` | page « Oups » quand une adresse n'existe pas |
| `images/` | images du site (à créer au besoin) |
| `robots.txt`, `sitemap.xml` | pour Google |
| `vercel.json` | adresses propres (`/jeux` au lieu de `/jeux.html`) |

## Voir le site sur l'ordinateur

```bash
python -m http.server 3960
```

Lancer depuis ce dossier, puis ouvrir http://localhost:3960.
