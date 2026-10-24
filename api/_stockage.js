// Où sont gardés les dessins et les idées.
// En ligne : Vercel Blob. Sur l'ordinateur (essais) : un dossier local, si JARONA_STOCKAGE_LOCAL est défini.
// Les fichiers qui commencent par « _ » dans api/ ne sont pas des adresses du site.
import { put, list, del } from "@vercel/blob";

const DOSSIER_LOCAL = process.env.JARONA_STOCKAGE_LOCAL;

async function outilsLocaux() {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  return { fs, path };
}

// Range un fichier et renvoie son adresse publique
export async function mettre(chemin, contenu, type) {
  if (DOSSIER_LOCAL) {
    const { fs, path } = await outilsLocaux();
    const fichier = path.join(DOSSIER_LOCAL, chemin);
    await fs.mkdir(path.dirname(fichier), { recursive: true });
    await fs.writeFile(fichier, Buffer.from(contenu));
    return "/_stockage/" + chemin;
  }
  const blob = await put(chemin, contenu, {
    access: "public",
    contentType: type,
    addRandomSuffix: false,
  });
  return blob.url;
}

// Liste les fichiers d'un dossier : [{ chemin, url }]
export async function lister(prefixe) {
  if (DOSSIER_LOCAL) {
    const { fs, path } = await outilsLocaux();
    const dossier = path.join(DOSSIER_LOCAL, prefixe);
    const noms = await fs.readdir(dossier).catch(() => []);
    return noms.map((nom) => ({ chemin: prefixe + nom, url: "/_stockage/" + prefixe + nom }));
  }
  const fichiers = [];
  let curseur;
  do {
    const page = await list({ prefix: prefixe, cursor: curseur });
    for (const b of page.blobs) fichiers.push({ chemin: b.pathname, url: b.url });
    curseur = page.hasMore ? page.cursor : undefined;
  } while (curseur);
  return fichiers;
}

// Lit un fichier JSON rangé
export async function lireJson(fichier) {
  if (DOSSIER_LOCAL) {
    const { fs, path } = await outilsLocaux();
    const texte = await fs.readFile(path.join(DOSSIER_LOCAL, fichier.chemin), "utf8");
    return JSON.parse(texte);
  }
  const reponse = await fetch(fichier.url, { cache: "no-store" });
  if (!reponse.ok) throw new Error("Lecture impossible : " + fichier.chemin);
  return reponse.json();
}

// Efface des fichiers
export async function effacer(fichiers) {
  if (fichiers.length === 0) return;
  if (DOSSIER_LOCAL) {
    const { fs, path } = await outilsLocaux();
    for (const f of fichiers) await fs.rm(path.join(DOSSIER_LOCAL, f.chemin), { force: true });
    return;
  }
  await del(fichiers.map((f) => f.url));
}
