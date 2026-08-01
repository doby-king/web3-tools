import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { FunctionFragment } from "ethers";
import { SegmentedControl } from "@/components/ui";
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

export function MethodTabs({
  parsed,
  rpcUrl,
  contractAddress,
  explorerUrl,
  wallet,
}: MethodTabsProps) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<"read" | "write">("read");

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

  const functions = tab === "read" ? parsed.readFunctions : parsed.writeFunctions;

  return (
    <div className="space-y-3">
      <SegmentedControl
        options={tabOptions}
        value={tab}
        onChange={setTab}
      />

      {functions.length === 0 ? (
        <p className="py-8 text-center text-sm text-text-muted">
          {t("tools.abiInteractor.methods.empty")}
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
