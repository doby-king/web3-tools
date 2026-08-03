import {
  CHAINLIST_ORIGIN,
  EMBED_PREFIX,
  injectThemeIntoHtml,
  parseTheme,
  toUpstreamUrl,
  type EmbedTheme,
} from "./chainlistEmbed";

export interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

function isEmbedPath(pathname: string): boolean {
  return (
    pathname === EMBED_PREFIX ||
    pathname === `${EMBED_PREFIX}/` ||
    pathname.startsWith(`${EMBED_PREFIX}/`)
  );
}

async function proxyChainlist(
  request: Request,
  theme: EmbedTheme,
): Promise<Response> {
  const url = new URL(request.url);
  const upstreamUrl = toUpstreamUrl(url.pathname, url.search);

  const upstream = await fetch(upstreamUrl, {
    method: request.method,
    headers: {
      Accept: request.headers.get("Accept") ?? "*/*",
      "User-Agent": request.headers.get("User-Agent") ?? "web3-tools-embed",
      "Accept-Language": request.headers.get("Accept-Language") ?? "en",
    },
    redirect: "follow",
  });

  const contentType = upstream.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) {
    // Pass through non-HTML (should be rare — assets are rewritten to origin)
    const headers = new Headers(upstream.headers);
    headers.delete("content-security-policy");
    headers.delete("x-frame-options");
    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers,
    });
  }

  const html = injectThemeIntoHtml(await upstream.text(), theme);
  return new Response(html, {
    status: upstream.status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=60",
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (isEmbedPath(url.pathname)) {
      const theme = parseTheme(
        url.searchParams,
        request.headers.get("cookie"),
      );
      return proxyChainlist(request, theme);
    }

    return env.ASSETS.fetch(request);
  },
};

// Re-export for tests / clarity
export { CHAINLIST_ORIGIN, EMBED_PREFIX };
