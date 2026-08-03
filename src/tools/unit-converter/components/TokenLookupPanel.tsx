import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Contract, getAddress, JsonRpcProvider } from "ethers";
import { Button, Callout, CopyButton, Input, Select } from "@/components/ui";
import { SpinnerIcon } from "@/components/ui/icons";
import { NETWORKS } from "@/lib/networks";
import { useUnitConverterStore, resolveNetworkId } from "../store";
import { AmountPair } from "./AmountPair";

/** Minimal ERC-20 metadata ABI (name/symbol may be missing on some tokens) */
const ERC20_META_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
];

interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
}

type LookupError = "invalidAddress" | "notToken" | "rpcFailed";
type LookupStatus =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "success"; token: TokenInfo }
  | { state: "error"; error: LookupError };

const errorKey = {
  invalidAddress: "tools.unitConverter.errInvalidAddress" as const,
  notToken: "tools.unitConverter.errNotToken" as const,
  rpcFailed: "tools.unitConverter.errRpcFailed" as const,
};

export function TokenLookupPanel() {
  const { t } = useTranslation();
  const networkId = useUnitConverterStore((s) => resolveNetworkId(s.networkId));
  const setNetworkId = useUnitConverterStore((s) => s.setNetworkId);

  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<LookupStatus>({ state: "idle" });

  const networkOptions = useMemo(
    () => [
      {
        label: t("tools.unitConverter.networkGroupMainnet"),
        options: NETWORKS.filter((n) => !n.testnet).map((n) => ({
          value: n.id,
          label: n.name,
        })),
      },
      {
        label: t("tools.unitConverter.networkGroupTestnet"),
        options: NETWORKS.filter((n) => n.testnet).map((n) => ({
          value: n.id,
          label: n.name,
        })),
      },
    ],
    [t],
  );

  const handleQuery = async () => {
    // Reset any previous result first
    let checksummed: string;
    try {
      checksummed = getAddress(address.trim());
    } catch {
      setStatus({ state: "error", error: "invalidAddress" });
      return;
    }

    setStatus({ state: "loading" });
    const network = NETWORKS.find((n) => n.id === networkId);
    if (!network) {
      setStatus({ state: "error", error: "rpcFailed" });
      return;
    }

    try {
      const provider = new JsonRpcProvider(network.rpcUrl);
      const contract = new Contract(checksummed, ERC20_META_ABI, provider);
      // decimals() is mandatory — its absence means this is not a standard ERC-20;
      // name()/symbol() are optional (some tokens omit them or return bytes32)
      const decimals = (await contract.decimals()) as bigint;
      const [nameResult, symbolResult] = await Promise.allSettled([
        contract.name() as Promise<string>,
        contract.symbol() as Promise<string>,
      ]);
      setStatus({
        state: "success",
        token: {
          address: checksummed,
          name:
            nameResult.status === "fulfilled"
              ? nameResult.value
              : t("tools.unitConverter.unknownField"),
          symbol:
            symbolResult.status === "fulfilled"
              ? symbolResult.value
              : t("tools.unitConverter.unknownField"),
          decimals: Number(decimals),
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      // CALL_EXCEPTION on an EOA / non-token contract means the method reverted
      const isNotToken =
        message.includes("CALL_EXCEPTION") ||
        message.includes("could not decode result data");
      setStatus({
        state: "error",
        error: isNotToken ? "notToken" : "rpcFailed",
      });
    }
  };

  const handleNetworkChange = (value: string) => {
    setNetworkId(value);
    setStatus({ state: "idle" });
  };

  return (
    <div className="space-y-4">
      <Callout variant="warning">
        {t("tools.unitConverter.lookupRpcWarning")}
      </Callout>

      {/* Query form */}
      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="grid gap-3 sm:grid-cols-[220px_1fr_auto]">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              {t("tools.unitConverter.networkLabel")}
            </label>
            <Select
              options={networkOptions}
              value={networkId}
              onChange={handleNetworkChange}
              searchable
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              {t("tools.unitConverter.tokenAddressLabel")}
            </label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t("tools.unitConverter.tokenAddressPlaceholder")}
              spellCheck={false}
              className="font-mono"
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleQuery}
              disabled={status.state === "loading" || address.trim() === ""}
              className="w-full sm:w-auto"
            >
              {status.state === "loading" ? (
                <>
                  <SpinnerIcon size={14} />
                  {t("tools.unitConverter.querying")}
                </>
              ) : (
                t("tools.unitConverter.queryButton")
              )}
            </Button>
          </div>
        </div>

        {/* Error display */}
        {status.state === "error" && (
          <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-danger/30 bg-danger/8 px-3.5 py-3 text-sm leading-relaxed text-text-secondary [&_svg]:text-danger">
            <div className="min-w-0">{t(errorKey[status.error])}</div>
          </div>
        )}
      </div>

      {/* Result */}
      {status.state === "success" && (
        <div className="animate-fade-in-up space-y-4">
          <div className="rounded-xl border border-border bg-surface p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-xs font-medium text-text-muted">
                  {t("tools.unitConverter.resultName")}
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-text">
                  {status.token.name}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-text-muted">
                  {t("tools.unitConverter.resultSymbol")}
                </p>
                <p className="mt-1 font-mono text-sm font-semibold text-text">
                  {status.token.symbol}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-text-muted">
                  {t("tools.unitConverter.resultDecimals")}
                </p>
                <p className="mt-1 font-mono text-sm font-semibold text-text">
                  {status.token.decimals}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
              <p className="min-w-0 flex-1 truncate font-mono text-xs text-text-secondary">
                {status.token.address}
              </p>
              <CopyButton text={status.token.address} className="shrink-0" />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4">
            <AmountPair
              decimals={status.token.decimals}
              topLabel={status.token.symbol}
              bottomLabel={t("tools.unitConverter.baseUnitRaw")}
            />
          </div>
        </div>
      )}
    </div>
  );
}
