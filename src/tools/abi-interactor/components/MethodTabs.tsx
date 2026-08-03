import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { FunctionFragment } from "ethers";
import { Input, SegmentedControl } from "@/components/ui";
import { SearchIcon } from "@/components/ui/icons";
import type { ParsedAbi } from "../lib/abi";
import type { WalletState } from "../lib/wallet";
import { MethodSection } from "./MethodSection";

interface MethodTabsProps {
  parsed: ParsedAbi;
  rpcUrl: string | null;
  contractAddress: string;
  explorerUrl: string | null;
  wallet: WalletState | null;
}

/** Match by name, 4-byte selector, or calldata that starts with the selector. */
function matchesFragment(fragment: FunctionFragment, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (fragment.name.toLowerCase().includes(q)) return true;

  const selector = fragment.selector.toLowerCase();
  if (selector.includes(q) || q.startsWith(selector)) return true;

  const qHex = q.startsWith("0x") ? q.slice(2) : q;
  const selHex = selector.slice(2);
  return selHex.includes(qHex) || qHex.startsWith(selHex);
}

export function MethodTabs({
  parsed,
  rpcUrl,
  contractAddress,
  explorerUrl,
  wallet,
}: MethodTabsProps) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<"read" | "write">("read");
  const [query, setQuery] = useState("");

  const tabOptions: Array<{ label: string; value: "read" | "write" }> = [
    {
      label: `${t("tools.abiInteractor.methods.readTab")} (${parsed.readFunctions.length})`,
      value: "read",
    },
    {
      label: `${t("tools.abiInteractor.methods.writeTab")} (${parsed.writeFunctions.length})`,
      value: "write",
    },
  ];

  const functions = useMemo(() => {
    const list =
      tab === "read" ? parsed.readFunctions : parsed.writeFunctions;
    return list.filter((fragment) => matchesFragment(fragment, query));
  }, [tab, parsed.readFunctions, parsed.writeFunctions, query]);

  return (
    <div className="space-y-3">
      <SegmentedControl options={tabOptions} value={tab} onChange={setTab} />

      <div className="relative">
        <SearchIcon
          size={14}
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-muted"
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("tools.abiInteractor.methods.searchPlaceholder")}
          className="pl-9 font-mono text-xs"
        />
      </div>

      {functions.length === 0 ? (
        <p className="py-8 text-center text-sm text-text-muted">
          {query.trim()
            ? t("tools.abiInteractor.methods.searchEmpty")
            : t("tools.abiInteractor.methods.empty")}
        </p>
      ) : (
        <div className="space-y-2">
          {functions.map((fragment: FunctionFragment) => (
            <MethodSection
              key={fragment.selector}
              fragment={fragment}
              mode={tab}
              rpcUrl={rpcUrl}
              contractAddress={contractAddress}
              explorerUrl={explorerUrl}
              wallet={wallet}
            />
          ))}
        </div>
      )}
    </div>
  );
}
