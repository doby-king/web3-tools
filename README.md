# Web3 Tools

> A privacy-first, local-only Web3 toolbox — every sensitive computation runs
> entirely in your browser. No data ever leaves it.

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)

<!-- screenshot -->

## ✨ Features

- 🔒 **Privacy-first**: mnemonics, private keys, JWT secrets, and codec inputs are handled locally — no analytics or tracking scripts
- 🌍 **Multi-language**: English (default), 中文, 文言文, 日本語, 한국어, switchable in the header and persisted across visits
- 🌓 **Light / dark themes**: semantic color tokens + class-based dark mode, one-click toggle
- 💾 **Local persistence**: backed by localforage (IndexedDB), each tool isolated in its own namespace
- 🧩 **Extensible tool registry**: registering a single metadata entry auto-generates the route and home card
- 🔍 **SEO-friendly builds**: Vite build + prerender snapshots for crawlers (`scripts/prerender.mjs`)

## 🛠 Tools

### Web3

| Tool                     | Description                                                                                          | Path                          |
| ------------------------ | ---------------------------------------------------------------------------------------------------- | ----------------------------- |
| ETH Mnemonic Generator   | BIP-39 mnemonic generation, private key export, BIP-44 Ethereum address derivation                   | `/tools/eth-mnemonic`         |
| ABI Interactor           | Call contract read/write methods via ABI; built-in networks, custom RPC, and wallet writes           | `/tools/abi-interactor`       |
| Smart Account Calculator | ERC-4337 CREATE2 address calculation (SimpleAccount, Safe, Coinbase, Alchemy, Kernel, Biconomy, …) | `/tools/aa-address-calculator` |
| Faucet Hub               | Curated testnet faucets across EVM chains — search and filter by network or asset                    | `/tools/faucet-hub`           |
| Chain List               | Embedded ChainList.org view for chain IDs, RPCs, and explorers (theme-synced)                        | `/tools/chain-list`           |
| Unit Converter           | Convert token amounts between display and base units — presets, ERC-20 lookup, or custom decimals    | `/tools/unit-converter`       |

### General

| Tool        | Description                                                                                | Path                 |
| ----------- | ------------------------------------------------------------------------------------------ | -------------------- |
| JSON Parser | Parse, format, escape, and minify JSON locally — foldable preview and error location hints | `/tools/json-parser` |
| JWT Parser  | Decode JWTs locally, inspect claims, optionally verify with a public key or HMAC secret    | `/tools/jwt-parser`  |
| Codec       | Encode/decode text with Base64, Base58, Hex, URL, and other common formats                 | `/tools/codec`       |

More tools are welcome — open an issue or PR.

## 🔐 Security Notice

- Computations involving mnemonics, private keys, seeds, JWT secrets, or codec inputs run **in your local browser**. This site never uploads, collects, or stores user secrets remotely.
- Tools that truly need the network (e.g. public RPC reads, faucet links, ChainList embed) talk **directly** to the endpoint you choose or a documented third party — no intermediary analytics backend.
- The project contains **no analytics or tracking scripts whatsoever**.
- ⚠️ The mnemonic generator is intended for **learning and testing only**. To safeguard real assets, use audited professional solutions such as hardware wallets, and always keep your mnemonic offline.

## 🚀 Quick Start

```bash
pnpm install   # Install dependencies
pnpm dev       # Start the local dev server
pnpm build     # Type check + production build (+ prerender)
pnpm lint      # Lint the codebase
pnpm preview   # Preview the production build
```

## 🧱 Tech Stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) (strict)
- [Vite 6](https://vite.dev/) + [pnpm](https://pnpm.io/)
- [Tailwind CSS v4](https://tailwindcss.com/) (CSS-first `@theme` semantic tokens)
- [react-router 7](https://reactrouter.com/) · [zustand](https://zustand.docs.pmnd.rs/) + [localforage](https://localforage.github.io/localForage/) · [TanStack Query](https://tanstack.com/query) + [axios](https://axios-http.com/)
- [i18next](https://www.i18next.com/) + [react-i18next](https://react.i18next.com/) (en / zh / lzh / ja / ko, default en)
- [ethers 6](https://docs.ethers.org/v6/) (local on-chain computation)
- [jose](https://github.com/panva/jose) (JWT) · [@scure/base](https://github.com/paulmillr/scure-base) (codec)

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/          # AppLayout / Header / ThemeToggle / LanguageSwitcher
│   └── ui/              # Shared component library (Button/Card/CopyButton/QRCodeCard/SecretText…)
├── i18n/                # i18n setup + locale JSON files (en/zh/lzh/ja/ko)
├── lib/                 # cn / clipboard / http / queryClient / storage
├── pages/               # Home page
├── stores/              # Global state (theme)
├── styles/              # Theme tokens + animations
└── tools/
    ├── registry.ts      # Tool registry (register and it just works)
    ├── eth-mnemonic/
    ├── abi-interactor/
    ├── aa-address-calculator/
    ├── faucet-hub/
    ├── chain-list/
    ├── unit-converter/
    ├── json-parser/
    ├── jwt-parser/
    └── codec/
scripts/
└── prerender.mjs        # Build-time SEO prerender + sitemap
worker/
└── index.ts             # Cloudflare Worker (ChainList theme-aware embed proxy)
wrangler.jsonc           # Cloudflare Workers static assets + SPA fallback
```

## 🧩 Adding a New Tool

1. **Create the page**: add `src/tools/<tool-id>/index.tsx` with a default-exported
   page component; keep private components and pure logic (`crypto.ts` / `logic.ts`) inside the tool directory.
2. **Register the tool**: append a `ToolMeta` entry to the `tools` array in
   `src/tools/registry.ts` — the route and home card are generated automatically;
   never touch `router.tsx`. Use `nameKey` / `descriptionKey` pointing at i18n keys.
3. **When persistence is needed**: follow [project-conventions.md](.qoder/rules/project-conventions.md)
   to configure zustand `persist` + `createToolStorage('<tool-id>')` with `version` +
   `migrate` (versionless persistence is forbidden), plus `skipHydration: true` and a
   manual `rehydrate()` on mount.
4. **When handling sensitive data**: respect the privacy red lines (data never leaves
   the browser, no tracking, no reporting) and surface a prominent `Callout` stating
   that all computation happens locally.
5. **i18n**: add every new string to all five `src/i18n/locales/*.json` files and
   reference them via `t('key')` — hardcoded UI copy fails the lint.

The full checklist (directory conventions, persistence, privacy red lines, i18n)
lives in [.qoder/rules/project-conventions.md](.qoder/rules/project-conventions.md);
UI rules in [.qoder/rules/ui-theme.md](.qoder/rules/ui-theme.md).

## 🚢 Deployment

Build with `pnpm build` (output in `dist/`). This is an SPA with history routing plus prerendered HTML snapshots.

- **Cloudflare Workers**: configured via `wrangler.jsonc` (`assets.not_found_handling = "single-page-application"`). Do **not** use a catch-all `_redirects` rule like `/* /index.html 200` — on Workers it can rewrite JS/CSS to HTML and break the app.
- **Vercel / Netlify**: handled automatically by default (or configure rewrite rules per their docs).
- **GitHub Pages**: no rewrite support — use the `404.html` copy trick, or switch to hash routing.
- **Sub-path deployment** (e.g. `https://example.com/web3-tools/`): set `base` in `vite.config.ts`.

## 📄 License

[MIT](./LICENSE) © 2026 web3-tools contributors
