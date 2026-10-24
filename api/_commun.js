// Outils partagés par les adresses /api/...
import { timingSafeEqual, randomBytes } from "node:crypto";

// Réponse JSON jamais gardée en cache
export function json(donnees, statut = 200) {
  return new Response(JSON.stringify(donnees), {
    status: statut,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

// Vérifie le code secret de Fakefile (variable JARONA_CODE dans Vercel).
// Renvoie null si c'est bon, sinon la réponse d'erreur à envoyer.
export async function verifierCode(requete) {
  const attendu = process.env.JARONA_CODE;
  if (!attendu) return json({ erreur: "code-pas-configure" }, 503);

  const donne = requete.headers.get("x-code") || "";
  const a = Buffer.from(donne);
  const b = Buffer.from(attendu);
  const bon = a.length === b.length && timingSafeEqual(a, b);
  if (bon) return null;

  // Un mauvais code fait attendre un peu : deviner le code devient très long
  await new Promise((r) => setTimeout(r, 1000));
  return json({ erreur: "mauvais-code" }, 401);
}

// Identifiant unique : la date en chiffres + un petit bout au hasard
export function nouvelId() {
  return Date.now().toString(36) + "-" + randomBytes(4).toString("hex");
}

// Un identifiant reçu doit avoir exactement cette forme
export function idValide(id) {
  return typeof id === "string" && /^[a-z0-9]+-[a-f0-9]{8}$/.test(id);
}

// Nettoie un petit texte : enlève les espaces en trop et coupe à la longueur permise
export function nettoyer(texte, longueurMax) {
  return String(texte || "").replace(/\r\n/g, "\n").trim().slice(0, longueurMax);
}
