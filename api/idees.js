// /api/idees : le blogue de Fakefile
//   GET    : tout le monde peut lire
//   POST   : écrire une idée (code secret obligatoire)
//   DELETE : retirer une idée (code secret obligatoire)
import { json, verifierCode, nouvelId, idValide, nettoyer } from "./_commun.js";
import { mettre, lister, lireJson, effacer } from "./_stockage.js";

export async function GET() {
  const fichiers = await lister("idees/");
  const fiches = await Promise.all(
    fichiers.filter((f) => f.chemin.endsWith(".json")).map((f) => lireJson(f).catch(() => null))
  );
  const idees = fiches.filter(Boolean).sort((a, b) => b.date.localeCompare(a.date));
  return json({ idees });
}

export async function POST(requete) {
  const refus = await verifierCode(requete);
  if (refus) return refus;

  let donnees;
  try {
    donnees = await requete.json();
  } catch {
    return json({ erreur: "format" }, 400);
  }

  const titre = nettoyer(donnees.titre, 100);
  const texte = nettoyer(donnees.texte, 5000);
  if (!titre || !texte) return json({ erreur: "vide" }, 400);

  const id = nouvelId();
  const fiche = { id, titre, texte, date: new Date().toISOString() };
  await mettre(`idees/${id}.json`, JSON.stringify(fiche), "application/json");

  return json({ idee: fiche }, 201);
}

export async function DELETE(requete) {
  const refus = await verifierCode(requete);
  if (refus) return refus;

  const id = new URL(requete.url).searchParams.get("id");
  if (!idValide(id)) return json({ erreur: "id-invalide" }, 400);

  const fichiers = (await lister("idees/")).filter((f) => f.chemin === `idees/${id}.json`);
  await effacer(fichiers);
  return json({ ok: true });
}
