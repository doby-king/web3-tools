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

- 🔒 **Local, offline computation**: mnemonic generation, private key export and
  address derivation all happen in the browser — zero network requests
- 🌍 **Multi-language**: English (default), 中文, 文言文, 日本語, 한국어, switchable
  in the header and persisted across visits
- 🌓 **Light / dark themes**: semantic color tokens + class-based dark mode, one-click toggle
- 💾 **Local persistence**: backed by localforage (IndexedDB), each tool isolated in its own namespace
- 🧩 **Extensible tool registry**: registering a single metadata entry auto-generates the route and home card

## 🛠 Tools

| Tool                   | Description                                                                        | Path                  |
| ---------------------- | ---------------------------------------------------------------------------------- | --------------------- |
| ETH Mnemonic Generator | BIP-39 mnemonic generation, private key export, BIP-44 Ethereum address derivation | `/tools/eth-mnemonic` |
| More tools on the way… | Issues / PRs are welcome                                                           | —                     |

## 🔐 Security Notice

- All computations involving mnemonics, private keys or seeds run **entirely in
  your local browser**. This site never uploads, collects or stores any user data remotely.
- The project contains **no analytics or tracking scripts whatsoever**.
- ⚠️ The mnemonic generator is intended for **learning and testing only**. To
  safeguard real assets, use audited professional solutions such as hardware
  wallets, and always keep your mnemonic offline.

## 🚀 Quick Start

```bash
pnpm install   # Install dependencies
pnpm dev       # Start the local dev server
pnpm build     # Type check + production build
pnpm lint      # Lint the codebase
```

## 🧱 Tech Stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) (strict)
- [Vite 6](https://vite.dev/) + [pnpm](https://pnpm.io/)
- [Tailwind CSS v4](https://tailwindcss.com/) (CSS-first `@theme` semantic tokens)
- [react-router 7](https://reactrouter.com/) · [zustand](https://zustand.docs.pmnd.rs/) + [localforage](https://localforage.github.io/localForage/) · [TanStack Query](https://tanstack.com/query) + [axios](https://axios-http.com/)
- [i18next](https://www.i18next.com/) + [react-i18next](https://react.i18next.com/) (en / zh / lzh / ja / ko, default en)
- [ethers 6](https://docs.ethers.org/v6/) (local on-chain computation)

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
    └── eth-mnemonic/    # ETH mnemonic generator
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

This project is an SPA using history routing; static hosts must rewrite 404s to `index.html`:

- **Vercel / Netlify**: handled automatically by default (or configure rewrite rules per their docs).
- **GitHub Pages**: no rewrite support — use the `404.html` copy trick, or switch to hash routing.
- **Sub-path deployment** (e.g. `https://example.com/web3-tools/`): set `base` in `vite.config.ts`.

## 📄 License

[MIT](./LICENSE) © 2026 web3-tools contributors
