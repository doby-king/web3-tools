# AGENTS.md

面向 AI 编码助手的仓库指南。修改本仓库代码前请先阅读本文件及其指向的规则文档。

## 项目简介

**Web3 Tools**：隐私优先的开源 Web3 工具集合站——所有敏感计算（助记词/私钥/地址派生等）在浏览器本地完成，数据不出浏览器。

## 技术栈

- 构建：Vite 6 + TypeScript（strict）+ pnpm
- UI：React 19 + Tailwind CSS v4（CSS-first `@theme`，无 tailwind.config）
- 路由：react-router 7（`createBrowserRouter`）
- 状态：zustand 5（persist + localforage）
- 请求：axios + TanStack Query 5（仅限确需网络的工具）
- 多语言：i18next + react-i18next（en/zh/lzh/ja/ko，默认 en）
- 链上计算：ethers 6（纯本地）

## 常用命令

```bash
pnpm install    # 安装依赖
pnpm dev        # 本地开发（Vite）
pnpm build      # tsc -b && vite build
pnpm lint       # eslint .
pnpm preview    # 预览构建产物
```

## 目录速览

```
src/
├── components/layout/   # AppLayout / Header / ThemeToggle / LanguageSwitcher
├── components/ui/       # 通用组件库（Button/Card/Input/CopyButton/QRCodeCard/SecretText 等）
├── i18n/                # 多语言：index.ts 配置 + locales/{en,zh,lzh,ja,ko}.json + i18next.d.ts 类型增强
├── lib/                 # cn / clipboard / http / queryClient / storage
├── pages/Home.tsx       # 首页（工具卡片由 registry 自动生成）
├── stores/themeStore.ts # 亮/暗主题（class 策略）
├── styles/              # index.css（语义 token + @theme）、animations.css（全部动画）
└── tools/
    ├── registry.ts      # 工具注册表：注册即自动生成路由与首页卡片
    └── eth-mnemonic/    # 首个工具：ETH 助记词生成器
```

## 必须遵守的规则文档

完整规则见以下两个文件，**其中所有规则均为硬性要求**：

- [.qoder/rules/ui-theme.md](.qoder/rules/ui-theme.md) —— 主题 token、字体、暗色模式、组件复用、动画规范
- [.qoder/rules/project-conventions.md](.qoder/rules/project-conventions.md) —— 目录约定、新工具接入清单、代码规范、隐私红线

最关键的硬性规则摘要：

1. **颜色只用语义 token 工具类**（`bg-bg`/`bg-surface`/`text-text`/`text-text-secondary`/`text-primary`/`border-border` 等）；禁止硬编码十六进制色、禁止 Tailwind 调色板原色（如 `bg-blue-500`）；新颜色必须先在 `src/styles/index.css` 的 `:root`/`.dark` + `@theme` 中定义。
2. **暗色模式为 class 策略**，token 已双主题适配，禁止绕过 token 写 `dark:` 硬编码色；新样式必须在亮/暗两套下检查。
3. **助记词/私钥/地址/哈希等链上数据一律 `font-mono`**；标题用 `font-display`。
4. **优先复用 `src/components/ui` 现有组件**；禁止引入 antd/MUI 等重型组件库；动画只写在 `src/styles/animations.css`，禁止 TSX 内写 keyframes。
5. **新工具只需两步**：创建 `src/tools/<tool-id>/index.tsx`（默认导出）+ 在 `src/tools/registry.ts` 注册——路由与首页卡片自动生成，**不要改 `router.tsx`**。
6. **工具持久化**用 zustand persist + `createToolStorage('<tool-id>')`，必须 `skipHydration: true` 并在挂载时手动 `rehydrate()`。
7. **隐私红线**：敏感计算必须纯前端本地完成并在页面显著提示；任何工具不得将用户输入/密钥类数据发送到远端，不得引入统计脚本；纯本地工具禁止发网络请求（确需请求走 `lib/http.ts` + TanStack Query）。
8. **多语言（i18n）红线**：所有 UI 文案一律走 `t('<key>')`，文案集中在 `src/i18n/locales/{en,zh,lzh,ja,ko}.json`（默认/回退 en）；**禁止在 TSX 中硬编码任何展示文案**（ESLint `i18next/no-literal-string` 强制拦截）；新增 key 必须同时写入全部 5 个语言文件，key 结构以 `en.json` 为唯一事实来源（`i18next.d.ts` 做编译期类型校验）；工具注册表只存 `nameKey`/`descriptionKey`。
9. **代码风格**：TS strict、函数式组件 + hooks、`@` 别名导入、复制用 `lib/clipboard.ts`、二维码用 `QRCodeCard`、className 合并用 `lib/cn.ts`。
