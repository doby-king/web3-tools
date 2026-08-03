import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Callout, Input, SegmentedControl, Select } from "@/components/ui";
import { SearchIcon } from "@/components/ui/icons";
import {
  FAUCETS,
  FAUCET_CHECKED_AT,
  filterFaucets,
  type FaucetAssetFilter,
  type FaucetNetworkFilter,
} from "./faucets";
import { FaucetRow } from "./components/FaucetRow";

type SourceFilter = "all" | "official" | "provider" | "community";

export default function FaucetHubTool() {
  const { t } = useTranslation();

  const [query, setQuery] = useState("");
  const [network, setNetwork] = useState<FaucetNetworkFilter>("all");
  const [asset, setAsset] = useState<FaucetAssetFilter>("all");
  const [source, setSource] = useState<SourceFilter>("all");

  /* ---- i18n-aware filter options ---- */
  const networkOptions = useMemo(
    () => [
      { value: "all", label: t("tools.faucetHub.networkOptions.all") },
      { value: "multi", label: t("tools.faucetHub.networkOptions.multi") },
      { value: "cronos", label: t("tools.faucetHub.networkOptions.cronos") },
      {
        value: "ethereum",
        label: t("tools.faucetHub.networkOptions.ethereum"),
      },
      {
        value: "arbitrum",
        label: t("tools.faucetHub.networkOptions.arbitrum"),
      },
      { value: "base", label: t("tools.faucetHub.networkOptions.base") },
      {
        value: "optimism",
        label: t("tools.faucetHub.networkOptions.optimism"),
      },
      { value: "polygon", label: t("tools.faucetHub.networkOptions.polygon") },
      { value: "bnb", label: t("tools.faucetHub.networkOptions.bnb") },
      {
        value: "avalanche",
        label: t("tools.faucetHub.networkOptions.avalanche"),
      },
      { value: "zksync", label: t("tools.faucetHub.networkOptions.zksync") },
      { value: "mantle", label: t("tools.faucetHub.networkOptions.mantle") },
    ],
    [t],
  );

  const assetOptions = useMemo(
    () => [
      { value: "all", label: t("tools.faucetHub.assetOptions.all") },
      { value: "native", label: t("tools.faucetHub.assetOptions.native") },
      {
        value: "stablecoin",
        label: t("tools.faucetHub.assetOptions.stablecoin"),
      },
      { value: "link", label: t("tools.faucetHub.assetOptions.link") },
    ],
    [t],
  );

  const sourceOptions = useMemo(
    () => [
      { label: t("tools.faucetHub.sourceAll"), value: "all" },
      { label: t("tools.faucetHub.sourceOfficial"), value: "official" },
      { label: t("tools.faucetHub.sourceProvider"), value: "provider" },
      { label: t("tools.faucetHub.sourceCommunity"), value: "community" },
    ],
    [t],
  );

  /* ---- filtering ---- */
  const filtered = useMemo(() => {
    let result = filterFaucets(FAUCETS, { query, network, asset });
    if (source !== "all") {
      result = result.filter((f) => f.sourceKind === source);
    }
    return result;
  }, [query, network, asset, source]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Page header */}
      <header className="animate-fade-in-up">
        <h1 className="font-display text-2xl font-bold text-text">
          {t("tools.faucetHub.name")}
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          {t("tools.faucetHub.subtitle")}
        </p>

        <div className="mt-4 space-y-2.5">
          <Callout variant="info">{t("tools.faucetHub.testnetNotice")}</Callout>
          <Callout variant="warning">
            {t("tools.faucetHub.securityWarning")}
          </Callout>
        </div>
      </header>

      {/* Filters */}
      <section className="animate-fade-in-up mt-6 space-y-3">
        {/* Search */}
        <div className="relative">
          <SearchIcon
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("tools.faucetHub.searchPlaceholder")}
            className="pl-9"
          />
        </div>

        {/* Dropdowns + source segmented */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-[160px] flex-1">
            <Select
              options={networkOptions}
              value={network}
              onChange={(v) => setNetwork(v as FaucetNetworkFilter)}
              searchable
            />
          </div>
          <div className="min-w-[160px] flex-1">
            <Select
              options={assetOptions}
              value={asset}
              onChange={(v) => setAsset(v as FaucetAssetFilter)}
            />
          </div>
          <SegmentedControl
            options={sourceOptions}
            value={source}
            onChange={(v) => setSource(v as SourceFilter)}
          />
        </div>

        {/* Result count + checked date */}
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span>
            {t("tools.faucetHub.totalFaucets", { count: filtered.length })}
          </span>
          <span>
            {t("tools.faucetHub.checkedAt", { date: FAUCET_CHECKED_AT })}
          </span>
        </div>
      </section>

      {/* Faucet table */}
      <main className="mt-6">
        {filtered.length === 0 ? (
          <div className="animate-fade-in-up rounded-xl border border-border bg-surface py-16 text-center">
            <p className="text-sm text-text-muted">
              {t("tools.faucetHub.noResults")}
            </p>
          </div>
        ) : (
          <div className="animate-fade-in-up overflow-x-auto rounded-xl border border-border bg-surface">
            <table className="w-full min-w-[800px] text-left">
              <thead>
                <tr className="border-b border-border bg-surface-hover/60">
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    {t("tools.faucetHub.colName")}
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    {t("tools.faucetHub.colNetworks")}
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    {t("tools.faucetHub.colAssets")}
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    {t("tools.faucetHub.colRequirements")}
                  </th>
                  <th className="px-4 py-3 w-24" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((faucet) => (
                  <FaucetRow key={faucet.id} faucet={faucet} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
