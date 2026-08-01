import { useTranslation } from "react-i18next";
import { Card, Input, Select, type SelectOptionGroup } from "@/components/ui";
import { CUSTOM_NETWORK_ID, NETWORKS } from "@/lib/networks";
import { useAaCalculatorStore } from "../store";

export function NetworkSelect() {
  const { t } = useTranslation();
  const networkId = useAaCalculatorStore((s) => s.networkId);
  const customRpc = useAaCalculatorStore((s) => s.customRpc);
  const setNetworkId = useAaCalculatorStore((s) => s.setNetworkId);
  const setCustomRpc = useAaCalculatorStore((s) => s.setCustomRpc);

  const mainnets = NETWORKS.filter((n) => !n.testnet).map((n) => ({
    value: n.id,
    label: n.name,
  }));
  const testnets = NETWORKS.filter((n) => n.testnet).map((n) => ({
    value: n.id,
    label: n.name,
  }));

  const options: SelectOptionGroup[] = [
    { label: t("tools.aaAddressCalculator.mainnets"), options: mainnets },
    { label: t("tools.aaAddressCalculator.testnets"), options: testnets },
    {
      label: t("tools.aaAddressCalculator.customGroup"),
      options: [
        {
          value: CUSTOM_NETWORK_ID,
          label: t("tools.aaAddressCalculator.customRpc"),
        },
      ],
    },
  ];

  return (
    <Card>
      <h2 className="mb-4 text-sm font-semibold text-text">
        {t("tools.aaAddressCalculator.network")}
      </h2>

      <div className="space-y-3">
        <Select
          options={options}
          value={networkId}
          onChange={setNetworkId}
          searchable
        />

        {networkId === CUSTOM_NETWORK_ID && (
          <Input
            value={customRpc}
            onChange={(e) => setCustomRpc(e.target.value)}
            placeholder={t("tools.aaAddressCalculator.rpcPlaceholder")}
            className="font-mono text-xs"
          />
        )}
      </div>
    </Card>
  );
}
