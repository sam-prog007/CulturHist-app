// Renders the logo and the historical companions to the image files the app
// ships: favicon, app icons, Open Graph image, and each companion in the moods
// that push notifications use as icons.
// The SVG components in src/ are the source; run this after changing them:
//
//   npm i -D playwright   (once; or with Playwright installed globally, NODE_PATH=$(npm root -g))
//   node scripts/render-brand.mjs
import { build } from "esbuild";
import { createRequire } from "node:module";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pub = (p) => join(root, "public", p);
const CREAM = "#fcfaf6";

// 1. The components as static SVG markup.
const entry = `
  import { createElement as h } from "react";
  import { renderToStaticMarkup } from "react-dom/server";
  import { LogoMark } from "@/components/brand/Logo";
  import Companion from "@/components/companions/Companion";
  import { COMPANION_IDS } from "@/components/companions/ids";
  const moods = ["happy", "sad", "think", "wave"];
  export const mark = renderToStaticMarkup(h(LogoMark, { title: "CulturHist" }));
  export const companions = COMPANION_IDS.flatMap((id) =>
    moods.map((mood) => [\`\${id}-\${mood}\`, renderToStaticMarkup(h(Companion, { id, mood, animated: false, framing: "head" }))])
  );
`;
const out = await build({
  stdin: { contents: entry, resolveDir: root, loader: "tsx" },
  bundle: true,
  format: "esm",
  platform: "node",
  write: false,
  jsx: "automatic",
  alias: { "@": join(root, "src") },
  external: ["react", "react/*", "react-dom", "react-dom/*"],
  logLevel: "warning",
});
const tmp = join(root, "node_modules", ".render-brand.mjs");
writeFileSync(tmp, out.outputFiles[0].text);
const { mark, companions } = await import(tmp);
rmSync(tmp);
const sized = (svg, size) => svg.replace("<svg ", `<svg width="${size}" height="${size}" `);

writeFileSync(pub("logo.svg"), mark.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" '));

// 2. Pictures, drawn by a headless browser.
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  console.error("Playwright is needed: npm i -D playwright (or set NODE_PATH to a global install).");
  process.exit(1);
}
const browser = await chromium.launch();
const page = await browser.newPage();
const shoot = async (html, width, height, file, transparent = false) => {
  await page.setViewportSize({ width, height });
  await page.setContent(
    `<html><head><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@800&family=Outfit:wght@500&display=swap" rel="stylesheet">
     <style>html,body{margin:0;width:${width}px;height:${height}px;background:${transparent ? "transparent" : CREAM}}
     .c{display:flex;align-items:center;justify-content:center;width:100%;height:100%}</style></head>
     <body><div class="c">${html}</div></body></html>`,
    { waitUntil: "networkidle" }
  );
  await page.screenshot({ path: file, omitBackground: transparent });
  console.log("wrote", file.replace(root + "/", ""));
};

// App icons: the medallion on cream; the maskable one keeps it inside the safe zone.
await shoot(sized(mark, 60), 64, 64, pub("favicon.png"), true);
await shoot(sized(mark, 156), 180, 180, pub("apple-touch-icon.png"));
await shoot(sized(mark, 172), 192, 192, pub("icon-192.png"));
await shoot(sized(mark, 460), 512, 512, pub("icon-512.png"));
await shoot(sized(mark, 330), 512, 512, pub("icon-maskable-512.png"));

// Open Graph: medallion, name and tagline.
await shoot(
  `<div style="display:flex;align-items:center;gap:48px">${sized(mark, 300)}
     <div><div style="font:800 96px 'Playfair Display',serif;color:#5c3620;letter-spacing:-1px">Cultur<span style="color:#b98314">Hist</span></div>
     <div style="font:500 36px Outfit,sans-serif;color:#7a5a3c;margin-top:8px">Votre dose quotidienne d'histoire</div></div></div>`,
  1200, 630, pub("og-image.png")
);

// The companions' faces, for notification icons: a round portrait on cream.
mkdirSync(pub("companions"), { recursive: true });
for (const [name, svg] of companions) {
  await shoot(
    `<div style="width:192px;height:192px;border-radius:50%;background:#f3e7d3;overflow:hidden">${sized(svg, 192)}</div>`,
    192, 192, pub(`companions/${name}.png`), true
  );
}
await browser.close();
