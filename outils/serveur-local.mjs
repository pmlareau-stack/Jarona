// Serveur d'essai sur l'ordinateur : node outils/serveur-local.mjs
// Il sert les pages comme Vercel (adresses sans .html) et fait marcher /api/...
// Les dessins et les idées d'essai vont dans le dossier .stockage-local (jamais envoyé en ligne).
// Ce dossier outils/ n'est pas envoyé sur Vercel (voir .vercelignore).
import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { fileURLToPath, pathToFileURL } from "node:url";

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.PORT || 3960);

process.env.JARONA_STOCKAGE_LOCAL ||= path.join(RACINE, ".stockage-local");
process.env.JARONA_CODE ||= "essai-local"; // code d'essai, seulement sur l'ordinateur

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
};

async function fichierExiste(chemin) {
  try {
    return (await fs.stat(chemin)).isFile();
  } catch {
    return false;
  }
}

// Trouve le fichier d'une adresse, comme Vercel avec « cleanUrls »
async function trouver(adresse, dossier) {
  const propre = path.normalize(decodeURIComponent(adresse)).replace(/^([/\\])+/, "");
  const base = path.join(dossier, propre);
  if (!base.startsWith(dossier)) return null;
  for (const essai of [base, base + ".html", path.join(base, "index.html")]) {
    if (await fichierExiste(essai)) return essai;
  }
  return null;
}

async function envoyerFichier(res, fichier, statut = 200) {
  const contenu = await fs.readFile(fichier);
  res.writeHead(statut, { "content-type": TYPES[path.extname(fichier)] || "application/octet-stream" });
  res.end(contenu);
}

async function appelerApi(req, res, nom) {
  const fichier = path.join(RACINE, "api", nom + ".js");
  if (nom.startsWith("_") || !(await fichierExiste(fichier))) {
    res.writeHead(404).end();
    return;
  }
  const module = await import(pathToFileURL(fichier).href);
  const action = module[req.method];
  if (!action) {
    res.writeHead(405).end();
    return;
  }
  const avecCorps = !["GET", "HEAD"].includes(req.method);
  const requete = new Request(`http://localhost:${PORT}${req.url}`, {
    method: req.method,
    headers: req.headers,
    body: avecCorps ? Readable.toWeb(req) : undefined,
    duplex: avecCorps ? "half" : undefined,
  });
  const reponse = await action(requete);
  res.writeHead(reponse.status, Object.fromEntries(reponse.headers));
  res.end(Buffer.from(await reponse.arrayBuffer()));
}

http
  .createServer(async (req, res) => {
    try {
      const { pathname } = new URL(req.url, "http://localhost");
      if (pathname.startsWith("/api/")) return await appelerApi(req, res, pathname.slice(5));
      if (pathname.startsWith("/_stockage/")) {
        const f = await trouver(pathname.slice(10), process.env.JARONA_STOCKAGE_LOCAL);
        return f ? await envoyerFichier(res, f) : res.writeHead(404).end();
      }
      const fichier = await trouver(pathname, RACINE);
      if (fichier) return await envoyerFichier(res, fichier);
      return await envoyerFichier(res, path.join(RACINE, "404.html"), 404);
    } catch (erreur) {
      console.error(erreur);
      res.writeHead(500).end("Erreur");
    }
  })
  .listen(PORT, () => console.log(`Jarona : http://localhost:${PORT}`));
