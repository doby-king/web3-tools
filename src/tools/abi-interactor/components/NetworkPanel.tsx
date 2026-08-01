import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { JsonRpcProvider } from "ethers";
import {
  Button,
  Card,
  Input,
  Select,
  SpinnerIcon,
  CheckIcon,
  type SelectOptionGroup,
} from "@/components/ui";
import { WarningIcon } from "@/components/ui/icons";
import { CUSTOM_NETWORK_ID, NETWORKS, getNetworkById } from "../networks";
import { useAbiInteractorStore } from "../store";

type VerifyStatus =
  | { state: "idle" }
  | { state: "verifying" }
  | { state: "ok"; chainId: number }
  | { state: "error" };

export function NetworkPanel() {
  const { t } = useTranslation();
  const networkId = useAbiInteractorStore((s) => s.networkId);
  const customRpc = useAbiInteractorStore((s) => s.customRpc);
  const setNetworkId = useAbiInteractorStore((s) => s.setNetworkId);
  const setCustomRpc = useAbiInteractorStore((s) => s.setCustomRpc);
  const [verify, setVerify] = useState<VerifyStatus>({ state: "idle" });

  const isCustom = networkId === CUSTOM_NETWORK_ID;
  const selectedNetwork = getNetworkById(networkId);

  const handleVerify = async () => {
    if (!customRpc.trim()) return;
    setVerify({ state: "verifying" });
    try {
      const provider = new JsonRpcProvider(customRpc.trim(), undefined, {
        staticNetwork: false,
      });
      const network = await provider.getNetwork();
      setVerify({ state: "ok", chainId: Number(network.chainId) });
    } catch {
      setVerify({ state: "error" });
    }
  };

  const mainnets = NETWORKS.filter((n) => !n.testnet);
  const testnets = NETWORKS.filter((n) => n.testnet);

  const handleRpcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomRpc(e.target.value);
    setVerify({ state: "idle" });
  };

  const networkOptions: SelectOptionGroup[] = useMemo(
    () => [
      {
        label: t("tools.abiInteractor.network.mainnets"),
        options: mainnets.map((n) => ({
          value: n.id,
          label: `${n.name} (${n.symbol})`,
        })),
      },
      {
        label: t("tools.abiInteractor.network.testnets"),
        options: testnets.map((n) => ({
          value: n.id,
          label: `${n.name} (${n.symbol})`,
        })),
      },
      {
        label: t("tools.abiInteractor.network.customGroup"),
        options: [
          {
            value: CUSTOM_NETWORK_ID,
            label: t("tools.abiInteractor.network.custom"),
          },
        ],
      },
    ],
    [t, mainnets, testnets],
  );

  const handleNetworkChange = (value: string) => {
    setNetworkId(value);
    setVerify({ state: "idle" });
  };

  return (
    <Card>
      <h2 className="font-display text-sm font-semibold text-text">
        {t("tools.abiInteractor.network.title")}
      </h2>

      <div className="mt-3 space-y-3">
        <Select
          searchable
          options={networkOptions}
          value={networkId}
          onChange={handleNetworkChange}
        />

        {/* Built-in network info */}
        {!isCustom && selectedNetwork && (
          <div className="flex items-center gap-2 rounded-lg bg-surface-hover px-3 py-2 text-xs text-text-secondary">
            <span className="font-mono">
              {t("tools.abiInteractor.network.chainIdLabel")}{" "}
              {selectedNetwork.chainId}
            </span>
            <span className="text-text-muted">·</span>
            <span className="truncate font-mono">{selectedNetwork.rpcUrl}</span>
          </div>
        )}

        {/* Custom RPC input + verify */}
        {isCustom && (
          <div className="space-y-2">
            <Input
              value={customRpc}
              onChange={handleRpcChange}
              placeholder={t("tools.abiInteractor.network.rpcPlaceholder")}
              className="font-mono text-xs"
            />
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleVerify}
                disabled={!customRpc.trim() || verify.state === "verifying"}
              >
                {verify.state === "verifying" ? (
                  <>
                    <SpinnerIcon size={14} />
                    {t("tools.abiInteractor.network.verifying")}
                  </>
                ) : (
                  t("tools.abiInteractor.network.verify")
                )}
              </Button>
              {verify.state === "ok" && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                  <CheckIcon size={14} />
                  {t("tools.abiInteractor.network.chainIdLabel")}{" "}
                  <span className="font-mono">{verify.chainId}</span>
                </span>
              )}
              {verify.state === "error" && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-danger">
                  <WarningIcon size={14} />
                  {t("tools.abiInteractor.network.verifyFailed")}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
