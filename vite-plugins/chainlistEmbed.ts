import type { Plugin, Connect } from "vite";
import {
  EMBED_PREFIX,
  injectThemeIntoHtml,
  parseTheme,
  toUpstreamUrl,
} from "../worker/chainlistEmbed";

async function handleEmbed(
  req: Connect.IncomingMessage,
  res: import("http").ServerResponse,
  next: Connect.NextFunction,
): Promise<void> {
  const rawUrl = req.url ?? "";
  if (!rawUrl.startsWith(EMBED_PREFIX)) {
    next();
    return;
  }

  try {
    const url = new URL(rawUrl, "http://localhost");
    const theme = parseTheme(
      url.searchParams,
      typeof req.headers.cookie === "string" ? req.headers.cookie : null,
    );
    const upstreamUrl = toUpstreamUrl(url.pathname, url.search);
    const upstream = await fetch(upstreamUrl, {
      headers: {
        Accept: req.headers.accept ?? "*/*",
        "User-Agent": req.headers["user-agent"] ?? "web3-tools-embed-dev",
      },
    });

    const contentType = upstream.headers.get("content-type") ?? "";
    res.statusCode = upstream.status;

    if (contentType.includes("text/html")) {
      const html = injectThemeIntoHtml(await upstream.text(), theme);
      res.setHeader("content-type", "text/html; charset=utf-8");
      res.end(html);
      return;
    }

    for (const [key, value] of upstream.headers) {
      if (
        key === "content-encoding" ||
        key === "content-length" ||
        key === "transfer-encoding"
      ) {
        continue;
      }
      res.setHeader(key, value);
    }
    res.end(Buffer.from(await upstream.arrayBuffer()));
  } catch (error) {
    res.statusCode = 502;
    res.setHeader("content-type", "text/plain; charset=utf-8");
    res.end(
      `ChainList embed proxy failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Dev/preview middleware mirroring the Cloudflare Worker ChainList embed proxy,
 * so theme sync works the same way as production.
 */
export function chainlistEmbedPlugin(): Plugin {
  return {
    name: "chainlist-embed",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        void handleEmbed(req, res, next);
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        void handleEmbed(req, res, next);
      });
    },
  };
}
