/** Shared helpers for the ChainList.org theme-aware embed proxy. */

export const CHAINLIST_ORIGIN = "https://chainlist.org";
export const EMBED_PREFIX = "/chainlist-embed";

export type EmbedTheme = "light" | "dark";

/** Map an embed path to the upstream ChainList URL. */
export function toUpstreamUrl(embedPathname: string, search = ""): string {
  let path = embedPathname;
  if (path === EMBED_PREFIX || path === `${EMBED_PREFIX}/`) {
    path = "/";
  } else if (path.startsWith(`${EMBED_PREFIX}/`)) {
    path = path.slice(EMBED_PREFIX.length);
  }
  if (!path.startsWith("/")) path = `/${path}`;

  const url = new URL(path, CHAINLIST_ORIGIN);
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  params.delete("theme");
  url.search = params.toString();
  return url.toString();
}

/**
 * Rewrite root-absolute URLs in the proxied HTML:
 * - static assets → load directly from chainlist.org
 * - page links → stay under our embed prefix (so theme injection still applies)
 */
export function rewriteAttrUrl(value: string): string {
  if (!value.startsWith("/") || value.startsWith("//")) return value;

  const isAsset =
    value.startsWith("/_next/") ||
    value.startsWith("/favicon") ||
    value.startsWith("/icons/") ||
    /\.(json|ico|png|jpe?g|gif|svg|webp|woff2?|ttf|css|js|map)(\?|$)/i.test(
      value,
    );

  if (isAsset) return `${CHAINLIST_ORIGIN}${value}`;
  if (value.startsWith(EMBED_PREFIX)) return value;
  return `${EMBED_PREFIX}${value}`;
}

/** Inline boot script: persist theme + keep client-side navigations under the embed prefix. */
export function themeBootScript(theme: EmbedTheme): string {
  return `<script>(function(){try{localStorage.setItem("theme",${JSON.stringify(theme)});}catch(e){}var P=${JSON.stringify(EMBED_PREFIX)};function fix(u){if(!u||typeof u!=="string")return u;try{var x=new URL(u,location.origin);if(x.origin!==location.origin)return u;if(x.pathname.indexOf(P)===0)return u;x.pathname=P+(x.pathname.charAt(0)==="/"?"":"/")+x.pathname;return x.pathname+x.search+x.hash;}catch(e){return u;}}var ps=history.pushState.bind(history),rs=history.replaceState.bind(history);history.pushState=function(s,t,u){return ps(s,t,fix(u));};history.replaceState=function(s,t,u){return rs(s,t,fix(u));};})();</script>`;
}

/** Inject theme class / boot script into ChainList HTML. */
export function injectThemeIntoHtml(html: string, theme: EmbedTheme): string {
  const boot = themeBootScript(theme);

  let out = html.replace(/<head([^>]*)>/i, `<head$1>${boot}`);

  if (theme === "dark") {
    out = out.replace(/<body([^>]*)>/i, (_match, attrs: string) => {
      if (/\bclass\s*=/.test(attrs)) {
        return `<body${attrs.replace(/class\s*=\s*(["'])([^"']*)\1/i, (_m, q, cls) => {
          const next = cls.split(/\s+/).filter(Boolean);
          if (!next.includes("dark")) next.push("dark");
          return `class=${q}${next.join(" ")}${q}`;
        })}>`;
      }
      return `<body${attrs} class="dark">`;
    });
  } else {
    out = out.replace(/<body([^>]*)>/i, (_match, attrs: string) => {
      if (!/\bclass\s*=/.test(attrs)) return `<body${attrs}>`;
      return `<body${attrs.replace(/class\s*=\s*(["'])([^"']*)\1/i, (_m, q, cls) => {
        const next = cls.split(/\s+/).filter((c: string) => c && c !== "dark");
        return next.length ? `class=${q}${next.join(" ")}${q}` : "";
      })}>`;
    });
  }

  // Absolutize root-relative asset / navigation URLs in common tags
  out = out.replace(
    /\s(href|src)=(["'])(\/[^"']*)\2/gi,
    (_m, attr, quote, path) => ` ${attr}=${quote}${rewriteAttrUrl(path)}${quote}`,
  );

  return out;
}

export function parseTheme(
  searchParams: URLSearchParams,
  cookieHeader: string | null,
): EmbedTheme {
  const fromQuery = searchParams.get("theme");
  if (fromQuery === "dark" || fromQuery === "light") return fromQuery;

  if (cookieHeader) {
    const match = /(?:^|;\s*)cl-embed-theme=(dark|light)(?:;|$)/.exec(cookieHeader);
    if (match?.[1] === "dark" || match?.[1] === "light") return match[1];
  }

  return "light";
}
