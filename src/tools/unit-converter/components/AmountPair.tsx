import { useState } from "react";
import { CopyButton, Input } from "@/components/ui";
import { fromBaseUnits, toBaseUnits } from "../lib/convert";

export interface AmountPairProps {
  decimals: number;
  /** Label of the top (human-readable) input, e.g. "USDC" */
  topLabel: string;
  /** Label of the bottom (base units) input, e.g. "wei" */
  bottomLabel: string;
}

/**
 * Bidirectional amount converter: editing either side recomputes the other.
 * All math is BigInt-based (see lib/convert.ts) to stay lossless for large values.
 */
export function AmountPair({
  decimals,
  topLabel,
  bottomLabel,
}: AmountPairProps) {
  const [top, setTop] = useState("");
  const [bottom, setBottom] = useState("");

  const handleTopChange = (value: string) => {
    setTop(value);
    setBottom(value === "" ? "" : (toBaseUnits(value, decimals) ?? ""));
  };

  const handleBottomChange = (value: string) => {
    setBottom(value);
    setTop(value === "" ? "" : (fromBaseUnits(value, decimals) ?? ""));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="w-28 shrink-0 truncate text-right font-mono text-sm font-medium text-text-secondary">
          {topLabel}
        </span>
        <Input
          value={top}
          onChange={(e) => handleTopChange(e.target.value)}
          spellCheck={false}
          className="flex-1 font-mono"
        />
        {top !== "" && <CopyButton text={top} className="shrink-0" />}
      </div>
      <div className="flex items-center gap-3">
        <span className="w-28 shrink-0 truncate text-right font-mono text-sm font-medium text-text-secondary">
          {bottomLabel}
        </span>
        <Input
          value={bottom}
          onChange={(e) => handleBottomChange(e.target.value)}
          spellCheck={false}
          className="flex-1 font-mono"
        />
        {bottom !== "" && <CopyButton text={bottom} className="shrink-0" />}
      </div>
    </div>
  );
}
