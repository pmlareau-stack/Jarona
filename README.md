# Jarona.ca

Le site de Fakefile, construit par lui-même avec ChatGPT. Français + anglais.

- **En ligne** : https://jarona.ca (anglais : https://jarona.ca/en)
- **Code** : GitHub `pmlareau-stack/Jarona`
- **Hébergement** : Vercel. Chaque changement sur `main` est en ligne environ une minute plus tard.
- **Domaine** : jarona.ca chez GoDaddy (A @ et CNAME www vers Vercel).
- **YouTube** : https://www.youtube.com/@fakefileYT
- **Règles pour ChatGPT** : [AGENTS.md](AGENTS.md) (sécurité, façon de parler, deux langues, structure du site).

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
