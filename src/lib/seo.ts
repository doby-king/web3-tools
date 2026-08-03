/**
 * SEO helpers: per-page title / meta description / Open Graph / canonical URL.
 * Called from AppLayout on route change (client-side only; prerendered pages get
 * their meta rewritten at build time by scripts/prerender.mjs).
 */

/** Absolute site URL used for canonical / og:url / sitemap; override via VITE_SITE_URL */
export const SITE_URL = (
  import.meta.env.VITE_SITE_URL ?? "https://web3-tools.callmedoby.workers.dev"
).replace(/\/+$/, "");

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(
    `meta[${attr}="${key}"]`,
  );
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(path: string) {
  let el = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  );
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = `${SITE_URL}${path}`;
}

/** Apply page-level SEO meta. `path` must start with "/" (home page: "/") */
export function applyPageMeta(
  title: string,
  description: string,
  path: string,
) {
  document.title = title;
  setMeta("name", "description", description);
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  setMeta("property", "og:url", `${SITE_URL}${path}`);
  setCanonical(path);
}
