// Les 21 écrans PM : node outils/ecrans.mjs <url-de-base> <dossier-captures>  (ex. https://jarona.ca ou http://localhost:3960)
// Utilise playwright-core installé dans vrm-industries-platform et le Chrome du laptop. Pas envoyé en ligne.
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const require = createRequire("C:/Users/pmLareau/Documents/claude code/vrm-industries-platform/package.json");
const { chromium } = require("playwright-core");

const [base, sortie] = process.argv.slice(2);
await mkdir(sortie, { recursive: true });

// [nom, largeur, hauteur, tactile]
const ECRANS = [
  ["iphone", 390, 844, true], ["se", 375, 667, true], ["mini", 375, 812, true], ["android", 360, 800, true],
  ["grand-android", 412, 823, true], ["tres-petit", 320, 568, true],
  ["tablette-768", 768, 1024, true], ["tablette-820", 820, 1180, true],
  ["ipad-couche", 1180, 750, true], ["android-couche", 1280, 720, true], ["vieux-ipad", 1024, 690, true],
  ["portable-1366", 1366, 657, false], ["portable-1440", 1440, 789, false], ["portable-1536", 1536, 730, false],
  ["pm-1707", 1707, 842, false], ["ordi-1920", 1920, 947, false], ["ordi-2048", 2048, 1050, false],
  ["ordi-2560", 2560, 1300, false], ["ordi-2560-1440", 2560, 1440, false], ["ultra-3440", 3440, 1340, false],
  ["4k-3840", 3840, 1960, false],
];
const PAGES = ["/", "/en", "/jeux", "/jeux/petales", "/jeux/chevalier", "/dessins", "/idees", "/en/games", "/en/games/petals", "/en/games/knight"];

const nav = await chromium.launch({ channel: "chrome", headless: true });
const problemes = [];
let essais = 0;

for (const [nom, w, h, tactile] of ECRANS) {
  const ctx = await nav.newContext({
    viewport: { width: w, height: h },
    isMobile: tactile && w < 700,
    hasTouch: tactile,
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  for (const p of PAGES) {
    essais++;
    await page.goto(base + p, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(200);
    const m = await page.evaluate(() => {
      const H = window.innerHeight;
      const r = (s) => document.querySelector(s)?.getBoundingClientRect();
      const entete = r("header.haut");
      return {
        H,
        debord: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        pageH: document.documentElement.scrollHeight,
        entete: entete ? entete.height : 0,
        accueil: r(".accueil")?.height ?? null,
        radio: r("#radio")?.height ?? null,
        arene: r(".arene, .arene-labyrinthe") ? r(".arene, .arene-labyrinthe").bottom + window.scrollY : null,
        manette: r(".manette") && r(".manette").height ? r(".manette").bottom + window.scrollY : null,
        h1: r("h1") ? r("h1").right - document.documentElement.clientWidth : 0,
        police: getComputedStyle(document.documentElement).fontSize,
      };
    });
    const pb = [];
    if (m.debord > 0) pb.push(`déborde de ${m.debord}px`);
    if (m.h1 > 1) pb.push(`titre dépasse de ${Math.round(m.h1)}px`);
    if (m.accueil !== null && m.accueil + m.entete > m.H + 2) {
      pb.push(`accueil ${Math.round(m.accueil + m.entete)} > ${m.H}`);
    }
    if (m.radio !== null && m.radio > m.H + 1) pb.push(`radio ${Math.round(m.radio)} > ${m.H}`);
    if (["/jeux", "/en/games", "/jeux/petales", "/en/games/petals", "/jeux/chevalier", "/en/games/knight"].includes(p) && m.pageH > m.H + 1) {
      pb.push(`page ${m.pageH} > ${m.H}`);
    }
    if (m.arene !== null && m.arene > m.H + 1) pb.push(`jeu coupé (${Math.round(m.arene)} > ${m.H})`);
    if (m.manette !== null && m.manette > m.H + 1) pb.push(`flèches coupées (${Math.round(m.manette)} > ${m.H})`);
    if (pb.length) problemes.push(`${nom} ${w}x${h} ${p} : ${pb.join(", ")}`);

    if (p === "/") {
      await page.screenshot({ path: path.join(sortie, `${String(w).padStart(4, "0")}x${h}-${nom}-accueil.png`) });
      console.log(`${nom.padEnd(15)} ${w}x${h}  police ${m.police}`);
    }
    if ((p === "/jeux/petales" || p === "/jeux/chevalier") && (w === 390 || w === 375 || w === 1707)) {
      await page.screenshot({ path: path.join(sortie, `${String(w).padStart(4, "0")}x${h}-${nom}-${p.split("/").pop()}.png`) });
    }
  }
  await ctx.close();
}
await nav.close();

console.log(`\n${essais} essais (${ECRANS.length} écrans × ${PAGES.length} pages)`);
console.log(problemes.length ? `PROBLÈMES (${problemes.length}) :\n` + problemes.join("\n") : "AUCUN PROBLÈME");
