/**
 * SSR entry used ONLY by the build-time prerender script (scripts/prerender.mjs)
 * to emit static HTML snapshots for crawlers. The browser bundle keeps using
 * main.tsx; runtime behavior is unchanged (entry-server is never imported by the
 * client graph — it is only fed to a separate `vite build --ssr` invocation).
 *
 * Notes:
 * - Tool components are imported eagerly here (no code splitting needed for prerender)
 * - i18n uses an isolated i18next instance via I18nextProvider; the global instance
 *   initialized by "@/i18n" (pulled in via LanguageSwitcher) is left untouched
 */
import type { ComponentType } from "react";
import { renderToString } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Routes, StaticRouter } from "react-router";
import { I18nextProvider } from "react-i18next";
import i18next from "i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import Home from "@/pages/Home";
import { tools } from "@/tools/registry";
import en from "@/i18n/locales/en.json";
import AaAddressCalculator from "@/tools/aa-address-calculator";
import AbiInteractor from "@/tools/abi-interactor";
import ChainList from "@/tools/chain-list";
import Codec from "@/tools/codec";
import EthMnemonic from "@/tools/eth-mnemonic";
import FaucetHub from "@/tools/faucet-hub";
import JsonParser from "@/tools/json-parser";
import JwtParser from "@/tools/jwt-parser";
import MarkdownPreview from "@/tools/markdown-preview";
import UnitConverter from "@/tools/unit-converter";

/** Fixed-English isolated instance — await before calling render() */
const ssrI18n = i18next.createInstance();
export const ready = ssrI18n.init({
  resources: { en: { translation: en } },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

/** Eager component for each tool route (registry keeps lazy components for the browser) */
const eagerComponents: Record<string, ComponentType> = {
  "/tools/eth-mnemonic": EthMnemonic,
  "/tools/abi-interactor": AbiInteractor,
  "/tools/aa-address-calculator": AaAddressCalculator,
  "/tools/faucet-hub": FaucetHub,
  "/tools/chain-list": ChainList,
  "/tools/unit-converter": UnitConverter,
  "/tools/json-parser": JsonParser,
  "/tools/jwt-parser": JwtParser,
  "/tools/codec": Codec,
  "/tools/markdown-preview": MarkdownPreview,
};

const toolRoutes = tools.map((tool) => ({
  path: tool.path,
  Component: eagerComponents[tool.path],
}));

/** SEO meta keys per route, resolved against en.json by the prerender script */
export const routeMeta: Record<
  string,
  { titleKey: string; descriptionKey: string }
> = {
  "/": { titleKey: "seo.homeTitle", descriptionKey: "seo.homeDescription" },
  ...Object.fromEntries(
    tools.map((tool) => [
      tool.path,
      { titleKey: tool.seoTitleKey, descriptionKey: tool.descriptionKey },
    ]),
  ),
};

export const routePaths = ["/", ...tools.map((tool) => tool.path)];

/** Render the given route to an HTML string */
export function render(url: string): string {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return renderToString(
    <I18nextProvider i18n={ssrI18n}>
      <QueryClientProvider client={queryClient}>
        <StaticRouter location={url}>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Home />} />
              {toolRoutes.map(({ path, Component }) => (
                <Route
                  key={path}
                  path={path.slice(1)}
                  element={<Component />}
                />
              ))}
            </Route>
          </Routes>
        </StaticRouter>
      </QueryClientProvider>
    </I18nextProvider>,
  );
}
