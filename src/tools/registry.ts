import {
  createElement,
  lazy,
  type LazyExoticComponent,
  type ComponentType,
  type ReactNode,
} from "react";
import type { ParseKeys } from "i18next";
import {
  BracesIcon,
  CodecIcon,
  CodeIcon,
  DropletIcon,
  GlobeIcon,
  JwtIcon,
  KeyIcon,
  MarkdownIcon,
  SwapIcon,
  WalletIcon,
} from "@/components/ui/icons";

export type ToolCategoryId = "web3" | "general";

export interface ToolCategory {
  id: ToolCategoryId;
  nameKey: ParseKeys;
}

export interface ToolMeta {
  id: string;
  /** i18n key for the tool name; translations live in src/i18n/locales/*.json (en.json is the source of truth) */
  nameKey: ParseKeys;
  /** i18n key for the tool's one-line description; also used as the SEO meta description */
  descriptionKey: ParseKeys;
  /** i18n key for the SEO page title (long-tail keyword style, e.g. "Wei / GWei Converter — Web3 Tools") */
  seoTitleKey: ParseKeys;
  category: ToolCategoryId;
  icon?: ReactNode;
  path: string;
  component: LazyExoticComponent<ComponentType>;
}

/** Shared route prefix for all tools; paths are always built from this to avoid hardcoding */
const TOOL_BASE_PATH = "/tools";

export const toolCategories: ToolCategory[] = [
  { id: "web3", nameKey: "categories.web3" },
  { id: "general", nameKey: "categories.general" },
];

export const tools: ToolMeta[] = [
  {
    id: "eth-mnemonic",
    nameKey: "tools.ethMnemonic.name",
    descriptionKey: "tools.ethMnemonic.description",
    seoTitleKey: "tools.ethMnemonic.seoTitle",
    category: "web3",
    icon: createElement(KeyIcon, {
      size: 18,
      className: "text-primary shrink-0",
    }),
    path: `${TOOL_BASE_PATH}/eth-mnemonic`,
    component: lazy(() => import("@/tools/eth-mnemonic")),
  },
  {
    id: "abi-interactor",
    nameKey: "tools.abiInteractor.name",
    descriptionKey: "tools.abiInteractor.description",
    seoTitleKey: "tools.abiInteractor.seoTitle",
    category: "web3",
    icon: createElement(CodeIcon, {
      size: 18,
      className: "text-primary shrink-0",
    }),
    path: `${TOOL_BASE_PATH}/abi-interactor`,
    component: lazy(() => import("@/tools/abi-interactor")),
  },
  {
    id: "aa-address-calculator",
    nameKey: "tools.aaAddressCalculator.name",
    descriptionKey: "tools.aaAddressCalculator.description",
    seoTitleKey: "tools.aaAddressCalculator.seoTitle",
    category: "web3",
    icon: createElement(WalletIcon, {
      size: 18,
      className: "text-primary shrink-0",
    }),
    path: `${TOOL_BASE_PATH}/aa-address-calculator`,
    component: lazy(() => import("@/tools/aa-address-calculator")),
  },
  {
    id: "faucet-hub",
    nameKey: "tools.faucetHub.name",
    descriptionKey: "tools.faucetHub.description",
    seoTitleKey: "tools.faucetHub.seoTitle",
    category: "web3",
    icon: createElement(DropletIcon, {
      size: 18,
      className: "text-primary shrink-0",
    }),
    path: `${TOOL_BASE_PATH}/faucet-hub`,
    component: lazy(() => import("@/tools/faucet-hub")),
  },
  {
    id: "chain-list",
    nameKey: "tools.chainList.name",
    descriptionKey: "tools.chainList.description",
    seoTitleKey: "tools.chainList.seoTitle",
    category: "web3",
    icon: createElement(GlobeIcon, {
      size: 18,
      className: "text-primary shrink-0",
    }),
    path: `${TOOL_BASE_PATH}/chain-list`,
    component: lazy(() => import("@/tools/chain-list")),
  },
  {
    id: "unit-converter",
    nameKey: "tools.unitConverter.name",
    descriptionKey: "tools.unitConverter.description",
    seoTitleKey: "tools.unitConverter.seoTitle",
    category: "web3",
    icon: createElement(SwapIcon, {
      size: 18,
      className: "text-primary shrink-0",
    }),
    path: `${TOOL_BASE_PATH}/unit-converter`,
    component: lazy(() => import("@/tools/unit-converter")),
  },
  {
    id: "json-parser",
    nameKey: "tools.jsonParser.name",
    descriptionKey: "tools.jsonParser.description",
    seoTitleKey: "tools.jsonParser.seoTitle",
    category: "general",
    icon: createElement(BracesIcon, {
      size: 18,
      className: "text-primary shrink-0",
    }),
    path: `${TOOL_BASE_PATH}/json-parser`,
    component: lazy(() => import("@/tools/json-parser")),
  },
  {
    id: "jwt-parser",
    nameKey: "tools.jwtParser.name",
    descriptionKey: "tools.jwtParser.description",
    seoTitleKey: "tools.jwtParser.seoTitle",
    category: "general",
    icon: createElement(JwtIcon, {
      size: 18,
      className: "text-primary shrink-0",
    }),
    path: `${TOOL_BASE_PATH}/jwt-parser`,
    component: lazy(() => import("@/tools/jwt-parser")),
  },
  {
    id: "codec",
    nameKey: "tools.codec.name",
    descriptionKey: "tools.codec.description",
    seoTitleKey: "tools.codec.seoTitle",
    category: "general",
    icon: createElement(CodecIcon, {
      size: 18,
      className: "text-primary shrink-0",
    }),
    path: `${TOOL_BASE_PATH}/codec`,
    component: lazy(() => import("@/tools/codec")),
  },
  {
    id: "markdown-preview",
    nameKey: "tools.markdownPreview.name",
    descriptionKey: "tools.markdownPreview.description",
    seoTitleKey: "tools.markdownPreview.seoTitle",
    category: "general",
    icon: createElement(MarkdownIcon, {
      size: 18,
      className: "text-primary shrink-0",
    }),
    path: `${TOOL_BASE_PATH}/markdown-preview`,
    component: lazy(() => import("@/tools/markdown-preview")),
  },
];

export function getToolsByCategory(categoryId: ToolCategoryId): ToolMeta[] {
  return tools.filter((tool) => tool.category === categoryId);
}
