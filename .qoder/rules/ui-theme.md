# UI 与主题规范

本项目使用 Tailwind CSS v4 的 CSS-first 配置（`@theme`，无 tailwind.config 文件），所有主题定义集中在 `src/styles/index.css`。AI 助手在新增/修改任何 UI 时必须遵守本文件的全部规则。

## 1. 颜色：只用语义 token

所有颜色必须通过语义 token 工具类使用。当前可用 token（定义于 `src/styles/index.css` 的 `:root` / `.dark`，经 `@theme inline` 映射为 Tailwind 类）：

| Token | 常用工具类 | 用途 |
| --- | --- | --- |
| `bg` | `bg-bg` | 页面背景 |
| `surface` | `bg-surface` | 卡片/输入框/Header 表面 |
| `surface-hover` | `bg-surface-hover`、`hover:bg-surface-hover` | 表面 hover 态 |
| `text` | `text-text` | 主文本 |
| `text-secondary` | `text-text-secondary` | 次要文本 |
| `text-muted` | `text-text-muted` | 弱化文本/占位符 |
| `primary` | `bg-primary`、`text-primary`、`outline-primary` | 品牌紫（主按钮、焦点环） |
| `primary-hover` | `hover:bg-primary-hover` | 主按钮 hover |
| `accent` | `text-accent`、`border-accent/30` | 青色点缀（info 类） |
| `success` / `warning` / `danger` | `text-success`、`bg-warning/10`、`bg-danger` 等 | 状态色 |
| `border` | `border-border` | 常规边框（低对比） |
| `border-strong` | `border-border-strong` | 高对比边框（输入框、secondary 按钮） |

硬性规则：

- **禁止硬编码色值**：TSX 中不得出现十六进制色（`#6c3ef5`）、`rgb()/rgba()`、任意值色类（如 `bg-[#12141f]`）。
  - 例外：现有代码中仅 `bg-white` 用于二维码白底（`QRCodeCard`）和 Switch 滑块这类"任何主题下都必须是白色"的场景，新增此类场景需注释说明原因。
- **禁止 Tailwind 调色板原色**：不得使用 `bg-blue-500`、`text-purple-400`、`border-gray-200` 等原色类。
- **新增颜色的唯一途径**：先在 `src/styles/index.css` 中同时为 `:root`（亮色）和 `.dark`（暗色）定义 CSS 变量，再在 `@theme inline` 块中映射为 `--color-*`，然后才能以工具类形式使用。
- 半透明变体请用 token 的透明度修饰符（如 `bg-primary/10`、`border-success/25`、`ring-primary/25`），这是现有 Badge/Callout/Input 的既有写法。

## 2. 字体

三个字体族均在 `@theme` 中定义，按用途严格区分：

- `font-display`（Space Grotesk）：标题、品牌 Logo（见 Header 的 "Web3 Tools"）、页面大标题。
- `font-sans`（Inter）：正文默认字体（已在 `body` 上生效，通常无需显式声明）。
- `font-mono`（JetBrains Mono）：**所有链上数据必须使用**——助记词、私钥、地址、哈希、十六进制字符串等（参考 `SecretText` 的用法）。

## 3. 暗色模式

- 采用 **class 策略**：`@custom-variant dark (&:where(.dark, .dark *))`，由 `src/stores/themeStore.ts` 在 `document.documentElement` 上切换 `.dark` 类。
- 语义 token 已自动适配双主题，**正确使用 token 的样式无需写 `dark:` 前缀**。
- **禁止绕过 token 单独写 `dark:` 硬编码色**（如 `dark:bg-[#12141f]`、`dark:text-gray-300`）。若某效果确实需要亮/暗差异化（如发光强度），在 CSS 文件中用 `.dark` 选择器实现（参考 `animations.css` 中的 `.dark .glow-hover:hover`、`.dark .hero-bg`）。
- 任何新样式提交前必须在亮色与暗色两套 token 下检查对比度与可读性。

## 4. 组件复用

必须优先复用 `src/components/ui`（统一从 `@/components/ui` 导入，经 `index.ts` 桶导出）：

| 组件 | 用途 |
| --- | --- |
| `Button` | 按钮，`variant: primary/secondary/ghost/danger`，`size: sm/md`，支持 `loading` |
| `Card` | 卡片容器，`glow` prop 开启 hover 发光描边 |
| `Input` | 文本输入框（原生 input 全部属性透传） |
| `SegmentedControl` | 分段选择器（泛型 options/value/onChange） |
| `Switch` | 开关（checked/onChange） |
| `Tooltip` | 纯 CSS hover/focus 提示 |
| `CopyButton` | 复制按钮，内置"已复制/复制失败"状态反馈 |
| `QRCodeCard` | 二维码卡片（白底保证暗色下可扫） |
| `SecretText` | 敏感文本掩码显示 + 眼睛切换（私钥/助记词展示必用） |
| `Badge` | 徽标，`variant: default/primary/success/warning` |
| `Callout` | 提示块，`variant: info/warning/success`（安全提示必用） |
| `icons.tsx` | 内置 SVG 图标（Copy/Check/Eye/EyeOff/Sun/Moon/Info/Warning/Spinner），`size` prop 控制尺寸 |

硬性规则：

- **禁止引入 antd、MUI、Chakra 等重型组件库**；图标优先扩展 `icons.tsx`（currentColor 描边风格，viewBox 24），不引入图标库。
- 新的通用组件放在 `src/components/ui/`，并从 `index.ts` 导出（同时导出 Props 类型）。
- Props 风格遵循现有约定：导出 `XxxProps` 接口、接受 `className` 并用 `cn()`（`src/lib/cn.ts`）合并、可透传原生属性时 extends 对应 HTMLAttributes。

## 5. 布局与动画

- 布局一律使用 Tailwind 工具类，仅在动态值场景（如运行时计算的尺寸）使用 `style` property。
- **动画/keyframes 一律定义在 `src/styles/animations.css`，禁止在 TSX 内写 keyframes 或内联动画定义**。现有可复用动画类：
  - `animate-fade-in-up`：入场淡入上移
  - `glow-hover`：卡片 hover 渐变描边发光（Card 的 `glow` prop 已封装）
  - `gradient-text`：primary→accent 流动渐变文字（品牌标题用）
  - `hero-bg`：首页网格 + 径向光晕背景

## 6. Web3 风格基调（新工具页面需延续）

- 卡片：`rounded-xl` 圆角 + `border-border` 细边框 + `bg-surface`，重要卡片加 `glow` 发光 hover（紫色系光晕）。
- Header：玻璃拟态——`bg-surface/70 backdrop-blur-md` + sticky 吸顶。
- 品牌视觉：紫（primary）→ 青（accent）渐变，标题可用 `gradient-text` + `font-display`。
- 控件圆角：按钮/输入框 `rounded-lg`，小元素 `rounded-md`，徽标 `rounded-full`。
- 焦点态统一：`focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`。
- 主题切换与背景色过渡已有全局 transition，新增表面元素加 `transition-colors` 保持一致。
