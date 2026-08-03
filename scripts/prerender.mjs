/**
 * Build-time prerendering for SEO (runs as part of `pnpm build`).
 *
 * The runtime app stays a client-side SPA; this script renders every route to a
 * static HTML snapshot at build time so crawlers can read full content without
 * executing JavaScript. Also emits sitemap.xml / robots.txt and injects per-page
 * SEO meta + JSON-LD. No headless browser required (Cloudflare Pages friendly).
 *
 * Output:
 *   dist/index.html            (home)
 *   dist/tools/<id>/index.html (one per tool route)
 *   dist/sitemap.xml, dist/robots.txt
 */
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "vite";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const SITE_URL = (
  process.env.VITE_SITE_URL ?? "https://web3-tools.callmedoby.workers.dev"
).replace(/\/+$/, "");
const LASTMOD = new Date().toISOString().slice(0, 10);

/** Escape for safe injection into HTML attribute values / text */
function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function resolveKey(obj, key) {
  const value = key.split(".").reduce((acc, part) => acc?.[part], obj);
  if (typeof value !== "string") {
    throw new Error(`Cannot resolve i18n key "${key}" in en.json`);
  }
  return value;
}

function absoluteUrl(routePath) {
  return `${SITE_URL}${routePath === "/" ? "/" : routePath}`;
}

/** JSON-LD for the home page: an ItemList of all tools */
function homeJsonLd(toolEntries) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Web3 Tools",
    itemListElement: toolEntries.map((tool, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: tool.name,
      url: absoluteUrl(tool.path),
    })),
  };
}

/** JSON-LD for tool pages */
function toolJsonLd({ name, description }, routePath) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description,
    url: absoluteUrl(routePath),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
}

// 1. SSR build of the server entry (reuses vite.config.ts for alias/plugins)
await build({
  root: ROOT,
  logLevel: "warn",
  build: {
    ssr: path.join(ROOT, "src/entry-server.tsx"),
    outDir: path.join(DIST, "server"),
    emptyOutDir: true,
  },
});

const serverEntry = await import(
  pathToFileURL(path.join(DIST, "server", "entry-server.js")).href
);
await serverEntry.ready;
const { render, routePaths, routeMeta } = serverEntry;

const en = JSON.parse(
  await readFile(path.join(ROOT, "src/i18n/locales/en.json"), "utf8"),
);

// Tool entries (id / path / resolved English copy) reused by JSON-LD + sitemap
const toolEntries = routePaths
  .filter((routePath) => routePath !== "/")
  .map((routePath) => {
    const meta = routeMeta[routePath];
    return {
      path: routePath,
      name: resolveKey(en, meta.titleKey),
      description: resolveKey(en, meta.descriptionKey),
    };
  });

// 2. Prerender every route from the client build's index.html template
const template = await readFile(path.join(DIST, "index.html"), "utf8");

for (const routePath of routePaths) {
  const meta = routeMeta[routePath];
  const title = resolveKey(en, meta.titleKey);
  const description = resolveKey(en, meta.descriptionKey);
  const url = absoluteUrl(routePath);
  const jsonLd =
    routePath === "/"
      ? homeJsonLd(toolEntries)
      : toolJsonLd(
          toolEntries.find((entry) => entry.path === routePath),
          routePath,
        );

  let html = template;
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${escapeHtml(title)}</title>`,
  );
  html = html.replace(
    /(<meta\s+name="description"\s+content=")[^"]*(")/,
    `$1${escapeHtml(description)}$2`,
  );
  html = html.replace(
    /(<meta\s+property="og:title"\s+content=")[^"]*(")/,
    `$1${escapeHtml(title)}$2`,
  );
  html = html.replace(
    /(<meta\s+property="og:description"\s+content=")[^"]*(")/,
    `$1${escapeHtml(description)}$2`,
  );
  html = html.replace(
    /(<meta\s+property="og:url"\s+content=")[^"]*(")/,
    `$1${escapeHtml(url)}$2`,
  );
  html = html.replace(
    /(<link\s+rel="canonical"\s+href=")[^"]*(")/,
    `$1${escapeHtml(url)}$2`,
  );
  html = html.replace(
    "</head>",
    `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script></head>`,
  );
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root">${render(routePath)}</div>`,
  );

  const outFile =
    routePath === "/"
      ? path.join(DIST, "index.html")
      : path.join(DIST, routePath.slice(1), "index.html");
  await mkdir(path.dirname(outFile), { recursive: true });
  await writeFile(outFile, html, "utf8");
  console.log(`[prerender] ${routePath} -> ${path.relative(ROOT, outFile)}`);
}

// 3. sitemap.xml + robots.txt
const sitemapUrls = routePaths
  .map(
    (routePath) =>
      `  <url>\n    <loc>${absoluteUrl(routePath)}</loc>\n    <lastmod>${LASTMOD}</lastmod>\n  </url>`,
  )
  .join("\n");
await writeFile(
  path.join(DIST, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls}\n</urlset>\n`,
  "utf8",
);
await writeFile(
  path.join(DIST, "robots.txt"),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
  "utf8",
);
console.log("[prerender] sitemap.xml + robots.txt written");

// 4. Drop the SSR bundle — it was only needed to generate the snapshots
await rm(path.join(DIST, "server"), { recursive: true, force: true });
