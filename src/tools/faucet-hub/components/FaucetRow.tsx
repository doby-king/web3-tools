import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge, Button } from "@/components/ui";
import { ChevronDownIcon, ExternalLinkIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import type { FaucetEntry, FaucetSourceKind } from "../faucets";

export interface FaucetRowProps {
  faucet: FaucetEntry;
}

const NETWORK_VISIBLE_COUNT = 5;

const sourceKindVariant: Record<
  FaucetSourceKind,
  "success" | "primary" | "default"
> = {
  official: "success",
  provider: "primary",
  community: "default",
};

const sourceKindKey = {
  official: "tools.faucetHub.sourceOfficial" as const,
  provider: "tools.faucetHub.sourceProvider" as const,
  community: "tools.faucetHub.sourceCommunity" as const,
};

export function FaucetRow({ faucet }: FaucetRowProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const handleVisit = () => {
    window.open(faucet.url, "_blank", "noopener,noreferrer");
  };

  const networks = faucet.networks;
  const needsTruncate = networks.length > NETWORK_VISIBLE_COUNT;
  const visibleNetworks =
    needsTruncate && !expanded
      ? networks.slice(0, NETWORK_VISIBLE_COUNT)
      : networks;
  const hiddenCount = networks.length - NETWORK_VISIBLE_COUNT;

  return (
    <tr className="border-b border-border last:border-b-0 hover:bg-surface-hover/50 transition-colors">
      {/* Column 1: Name + Provider + Description */}
      <td className="px-4 py-3.5 align-top">
        <div className="flex items-start gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-text truncate">
                {faucet.name}
              </span>
              <Badge
                variant={sourceKindVariant[faucet.sourceKind]}
                className="shrink-0 text-[10px] px-1.5 py-0"
              >
                {t(sourceKindKey[faucet.sourceKind])}
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-text-muted">{faucet.provider}</p>
            <p className="mt-1.5 text-xs text-text-secondary leading-relaxed">
              {t(faucet.descriptionKey)}
            </p>
          </div>
        </div>
      </td>

      {/* Column 2: Networks (expandable) */}
      <td className="px-4 py-3.5 align-top">
        <div className="flex flex-wrap gap-1">
          {visibleNetworks.map((network) => (
            <Badge key={network} variant="default" className="text-[11px]">
              {network}
            </Badge>
          ))}
        </div>
        {needsTruncate && (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="mt-1.5 inline-flex items-center gap-0.5 text-[11px] text-primary hover:text-primary-hover transition-colors cursor-pointer"
          >
            {expanded
              ? t("tools.faucetHub.showLess")
              : t("tools.faucetHub.showMore", { count: hiddenCount })}
            <ChevronDownIcon
              size={12}
              className={cn("transition-transform", expanded && "rotate-180")}
            />
          </button>
        )}
      </td>

      {/* Column 3: Assets */}
      <td className="px-4 py-3.5 align-top">
        <div className="flex flex-wrap gap-1">
          {faucet.assets.map((asset) => (
            <Badge
              key={asset}
              variant="primary"
              className="font-mono text-[11px]"
            >
              {asset}
            </Badge>
          ))}
        </div>
      </td>

      {/* Column 4: Requirements */}
      <td className="px-4 py-3.5 align-top">
        <p className="text-xs text-text-secondary leading-relaxed">
          {t(faucet.requirementsKey)}
        </p>
      </td>

      {/* Column 5: Visit button (no header) */}
      <td className="px-4 py-3.5 align-top text-right">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleVisit}
          aria-label={faucet.name}
        >
          <ExternalLinkIcon size={14} />
        </Button>
      </td>
    </tr>
  );
}
