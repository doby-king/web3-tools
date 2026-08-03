import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Callout, SegmentedControl } from "@/components/ui";
import { PresetPanel } from "./components/PresetPanel";
import { TokenLookupPanel } from "./components/TokenLookupPanel";
import { CustomPanel } from "./components/CustomPanel";
import { useUnitConverterStore, type ConverterTab } from "./store";

export default function UnitConverterTool() {
  const { t } = useTranslation();
  const activeTab = useUnitConverterStore((s) => s.activeTab);
  const setActiveTab = useUnitConverterStore((s) => s.setActiveTab);
  const setHasHydrated = useUnitConverterStore((s) => s.setHasHydrated);

  // skipHydration: true — trigger rehydrate manually on mount
  useEffect(() => {
    useUnitConverterStore.persist.rehydrate()?.catch(() => {
      setHasHydrated(true);
    });
  }, [setHasHydrated]);

  const tabOptions = useMemo(
    () => [
      { label: t("tools.unitConverter.tabPreset"), value: "preset" },
      { label: t("tools.unitConverter.tabLookup"), value: "lookup" },
      { label: t("tools.unitConverter.tabCustom"), value: "custom" },
    ],
    [t],
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {/* Page header */}
      <header className="animate-fade-in-up">
        <h1 className="font-display text-2xl font-bold text-text">
          {t("tools.unitConverter.name")}
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          {t("tools.unitConverter.subtitle")}
        </p>
        <div className="mt-4">
          <Callout variant="info">
            {t("tools.unitConverter.noticeLocal")}
          </Callout>
        </div>
      </header>

      {/* Tab switch */}
      <section className="animate-fade-in-up mt-6">
        <SegmentedControl
          options={tabOptions}
          value={activeTab}
          onChange={(v) => setActiveTab(v as ConverterTab)}
        />
      </section>

      {/* Active panel */}
      <main className="animate-fade-in-up mt-5">
        {activeTab === "preset" && <PresetPanel />}
        {activeTab === "lookup" && <TokenLookupPanel />}
        {activeTab === "custom" && <CustomPanel />}
      </main>
    </div>
  );
}
