// /api/code : vérifie seulement si le code secret est le bon
import { json, verifierCode } from "./_commun.js";

export async function POST(requete) {
  const refus = await verifierCode(requete);
  if (refus) return refus;
  return json({ ok: true });
}
