// /api/dessins : la galerie de dessins de Fakefile
//   GET    : tout le monde peut voir la liste
//   POST   : ajouter un dessin (code secret obligatoire)
//   DELETE : retirer un dessin (code secret obligatoire)
import { json, verifierCode, nouvelId, idValide, nettoyer } from "./_commun.js";
import { mettre, lister, lireJson, effacer } from "./_stockage.js";

const TAILLE_MAX = 4 * 1024 * 1024; // 4 Mo

// Le fichier doit vraiment être une image (on regarde ses premiers octets)
function typeImage(octets) {
  if (octets[0] === 0xff && octets[1] === 0xd8) return { type: "image/jpeg", ext: "jpg" };
  if (octets[0] === 0x89 && octets[1] === 0x50 && octets[2] === 0x4e && octets[3] === 0x47) {
    return { type: "image/png", ext: "png" };
  }
  const riff = String.fromCharCode(...octets.slice(0, 4));
  const webp = String.fromCharCode(...octets.slice(8, 12));
  if (riff === "RIFF" && webp === "WEBP") return { type: "image/webp", ext: "webp" };
  return null;
}

export async function GET() {
  const fichiers = await lister("dessins/");
  const fiches = await Promise.all(
    fichiers.filter((f) => f.chemin.endsWith(".json")).map((f) => lireJson(f).catch(() => null))
  );
  const dessins = fiches.filter(Boolean).sort((a, b) => b.date.localeCompare(a.date));
  return json({ dessins });
}

export async function POST(requete) {
  const refus = await verifierCode(requete);
  if (refus) return refus;

  const longueur = Number(requete.headers.get("content-length") || 0);
  if (longueur > TAILLE_MAX) return json({ erreur: "trop-gros" }, 413);

  const octets = new Uint8Array(await requete.arrayBuffer());
  if (octets.length === 0 || octets.length > TAILLE_MAX) return json({ erreur: "trop-gros" }, 413);

  const image = typeImage(octets);
  if (!image) return json({ erreur: "pas-une-image" }, 415);

  let titre = "";
  try {
    titre = nettoyer(decodeURIComponent(requete.headers.get("x-titre") || ""), 80);
  } catch {
    titre = "";
  }

  const id = nouvelId();
  const url = await mettre(`dessins/${id}.${image.ext}`, octets, image.type);
  const fiche = { id, titre, image: url, date: new Date().toISOString() };
  await mettre(`dessins/${id}.json`, JSON.stringify(fiche), "application/json");

  return json({ dessin: fiche }, 201);
}

export async function DELETE(requete) {
  const refus = await verifierCode(requete);
  if (refus) return refus;

  const id = new URL(requete.url).searchParams.get("id");
  if (!idValide(id)) return json({ erreur: "id-invalide" }, 400);

  const fichiers = (await lister("dessins/")).filter((f) => f.chemin.startsWith(`dessins/${id}.`));
  await effacer(fichiers);
  return json({ ok: true });
}
