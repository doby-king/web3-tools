# 项目架构与新工具接入规范

本文件定义 Web3 Tools 的目录结构约定、新工具接入流程与代码规范。AI 助手实现任何新工具或修改架构相关代码时必须遵守。

## 1. 目录结构约定

```
src/
├── components/
│   ├── layout/          # 全局布局（AppLayout / Header / ThemeToggle / LanguageSwitcher）
│   └── ui/              # 通用 UI 组件，经 index.ts 桶导出
├── i18n/                # 多语言：index.ts（i18next 配置）+ locales/*.json（翻译文件）+ i18next.d.ts（key 类型增强）
├── lib/                 # 通用工具库（cn / clipboard / http / queryClient / storage）
├── pages/               # 非工具页面（Home）
├── stores/              # 全局 zustand store（themeStore）
├── styles/              # index.css（主题 token）+ animations.css（全部动画）
└── tools/
    ├── registry.ts      # 工具注册表（唯一注册入口）
    └── <tool-id>/       # 每个工具一个目录
        ├── index.tsx    # 默认导出工具页面组件（必需）
        ├── store.ts     # 工具级 zustand store（需要持久化时）
        ├── crypto.ts    # 加密/派生等核心逻辑（或 logic.ts，纯函数，与 UI 分离）
        └── components/  # 该工具私有的组件（不放入 components/ui）
```

- 工具目录名即 `<tool-id>`，使用 kebab-case（如 `eth-mnemonic`）。
- 工具私有代码（组件、逻辑、store）全部留在工具目录内；只有确认跨工具通用的组件才提升到 `src/components/ui/` 并从 `index.ts` 导出。

## 2. 新工具接入清单（按顺序执行）

1. **创建页面**：新建 `src/tools/<tool-id>/index.tsx`，`export default` 页面组件。
2. **注册工具**：在 `src/tools/registry.ts` 的 `tools` 数组中追加一条 `ToolMeta`：

   ```ts
   {
     id: '<tool-id>',
     nameKey: 'tools.<toolId>.name',              // i18n key，非文案本身
     descriptionKey: 'tools.<toolId>.description', // i18n key，非文案本身
     path: '/tools/<tool-id>',
     component: lazy(() => import('@/tools/<tool-id>')),
   }
   ```

   路由（`src/router.tsx`）与首页工具卡片（`src/pages/Home.tsx`）均由 registry 自动生成，**不要修改 router.tsx**。工具名称/描述文案写在 `src/i18n/locales/*.json` 的 `tools.<toolId>` 节点下（见第 5 节）。

3. **本地持久化**：工具数据用 zustand `persist` 中间件 + `createToolStorage('<tool-id>')`（`src/lib/storage.ts`，底层 localforage/IndexedDB，key 自动带 `tool:<tool-id>:` 前缀隔离）。由于该 storage 是异步的，**必须设置 `skipHydration: true`，并在页面挂载时手动调用 `useXxxStore.persist.rehydrate()`**，避免 SSR/首帧不一致。**工具持久化必须设置 `version` + `migrate`，禁止无版本持久化**——`migrate` 中需对旧数据 / 被篡改数据做字段归一化防御，保证 rehydrate 后的 state 始终合法。
4. **网络请求**：如确需请求，必须走 `src/lib/http.ts` 的 axios 实例 + TanStack Query（全局 `queryClient` 已在 `src/lib/queryClient.ts` 配置）。**纯本地计算类工具禁止发出任何网络请求**。
5. **敏感计算**：涉及私钥、助记词、种子等的计算必须完全在前端本地完成（如用 `ethers`），并在页面显著位置用 `Callout`（`variant="warning"` 或 `info`）提示"所有计算在本地浏览器完成，数据不会上传"。

## 3. 代码规范

- **TypeScript strict**：全项目 strict 模式，禁止 `any` 滥用，公共 API 显式标注类型；组件 Props 导出为 `XxxProps` 接口。
- **组件写法**：一律函数式组件 + hooks，不使用 class 组件。
- **导入路径**：src 内部模块统一用 `@` 别名（`@/components/ui`、`@/lib/storage`），不写多级相对路径。
- **复制功能**：统一用 `src/lib/clipboard.ts` 的 `copyText()`（或直接用封装好的 `CopyButton` 组件），不要自行调用 `navigator.clipboard`。
- **二维码**：统一用 `QRCodeCard` 组件（`@/components/ui`），不要直接使用 `qrcode.react`。
- **className 合并**：统一用 `cn()`（`src/lib/cn.ts`）。
- UI 样式规则见 [ui-theme.md](./ui-theme.md)。

## 4. 隐私红线（不可协商）

- 任何工具**不得将用户输入、助记词、私钥、地址等数据发送到远端**——包括日志上报、错误上报中夹带。
- **不得引入统计/埋点脚本**（Google Analytics 等）收集敏感数据。
- 敏感数据持久化到本地前需评估必要性；私钥/助记词默认不持久化，如用户显式选择保存，必须在 UI 上明确告知风险。
- 新增第三方依赖前需确认其不会在运行时外发数据。

## 5. 多语言（i18n）规范（硬性要求）

项目使用 **i18next + react-i18next**，配置在 `src/i18n/index.ts`，翻译文件为 `src/i18n/locales/<lang>.json`。当前支持语言：**en（默认/回退）、zh、lzh（文言文）、ja、ko**。任何新增/修改 UI 文案时必须遵守：

1. **禁止硬编码 UI 文案**：JSX 文本、`aria-label`、`placeholder`、`alt`、`title`、自定义组件的文案类 prop（如 `label`）一律写 `t('<key>')`。ESLint 规则 `i18next/no-literal-string`（`eslint.config.js`）已强制拦截，**不要通过 eslint-disable 绕过**。
2. **key 设计**：嵌套点分结构，按作用域组织——
   - `common.*`：跨页面/跨工具通用文案（复制、显示/隐藏、主题切换等），优先复用已有 key；
   - `layout.*` / `home.*`：全局布局与首页；
   - `tools.<toolId>.*`：工具私有文案（`<toolId>` 为 camelCase，与工具目录 kebab-case 对应，如 `eth-mnemonic` → `tools.ethMnemonic`）。
3. **en.json 是唯一事实来源**：新增 key 必须**同时**写入全部 5 个语言文件，且 key 结构完全一致；`src/i18n/i18next.d.ts` 以 `typeof en.json` 做编译期类型增强，key 写错/缺失直接 TS 报错。翻译缺失时回退到英文。
4. **key 跳转与查看**：IDE 安装 i18n Ally 类插件后，可从 `t('key')` 直接跳转到 `locales/*.json` 对应文案并内联预览各语言；无插件时依赖 TS 类型校验与自动补全兜底。
5. **工具注册**：`registry.ts` 的 `ToolMeta` 只存 `nameKey` / `descriptionKey`（类型为 `ParseKeys`，受类型校验），不存文案本身；首页卡片用 `t(tool.nameKey)` 渲染。
6. **语言切换**：由 `src/components/layout/LanguageSwitcher.tsx` 提供，选择缓存于 localStorage（key: `web3-tools-language`），切换时自动同步 `<html lang>`。新增支持语言时需同步更新 `src/i18n/index.ts` 的 `supportedLanguages` 与 resources。
7. **例外**：代码注释、console/错误日志（非 UI 展示）、纯技术字符串（存储 key、路由 path、CSS 类名、BIP-39 英文词表等链上数据）不需要 i18n。品牌名 "Web3 Tools" 通过 `common.appName` 管理。
