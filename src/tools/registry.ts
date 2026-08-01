import {
  createElement,
  lazy,
  type LazyExoticComponent,
  type ComponentType,
  type ReactNode,
} from "react";
import type { ParseKeys } from "i18next";
import { CodeIcon, KeyIcon, WalletIcon } from "@/components/ui/icons";

export interface ToolMeta {
  id: string;
  /** i18n key for the tool name; translations live in src/i18n/locales/*.json (en.json is the source of truth) */
  nameKey: ParseKeys;
  /** i18n key for the tool's one-line description */
  descriptionKey: ParseKeys;
  icon?: ReactNode;
  path: string;
  component: LazyExoticComponent<ComponentType>;
}

/** Shared route prefix for all tools; paths are always built from this to avoid hardcoding */
const TOOL_BASE_PATH = "/tools";

export const tools: ToolMeta[] = [
  {
    id: "eth-mnemonic",
    nameKey: "tools.ethMnemonic.name",
    descriptionKey: "tools.ethMnemonic.description",
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
    icon: createElement(WalletIcon, {
      size: 18,
      className: "text-primary shrink-0",
    }),
    path: `${TOOL_BASE_PATH}/aa-address-calculator`,
    component: lazy(() => import("@/tools/aa-address-calculator")),
  },
];
