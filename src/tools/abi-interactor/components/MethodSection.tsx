import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Contract, JsonRpcProvider, type FunctionFragment } from "ethers";
import { Button, CopyButton, Input, SpinnerIcon } from "@/components/ui";
import {
  ChevronDownIcon,
  ExternalLinkIcon,
  WarningIcon,
} from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { formatCallError, formatResult } from "../lib/decode";
import { toBrowserProvider, type WalletState } from "../lib/wallet";

interface MethodSectionProps {
  fragment: FunctionFragment;
  mode: "read" | "write";
  rpcUrl: string | null;
  contractAddress: string;
  explorerUrl: string | null;
  wallet: WalletState | null;
}

type CallStatus =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "success"; result: string }
  | { state: "error"; message: string };

export function MethodSection({
  fragment,
  mode,
  rpcUrl,
  contractAddress,
  explorerUrl,
  wallet,
}: MethodSectionProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [params, setParams] = useState<string[]>(() =>
    fragment.inputs.map(() => ""),
  );
  const [value, setValue] = useState("");
  const [gasLimit, setGasLimit] = useState("");
  const [status, setStatus] = useState<CallStatus>({ state: "idle" });
  const [txHash, setTxHash] = useState<string | null>(null);

  const isPayable = fragment.stateMutability === "payable";
  const isWrite = mode === "write";
  const needsWallet = isWrite && !wallet;
  const canCall =
    !needsWallet &&
    rpcUrl !== null &&
    contractAddress.length > 0 &&
    status.state !== "loading";

  const handleCall = async () => {
    if (!rpcUrl || !contractAddress) return;
    setStatus({ state: "loading" });
    setTxHash(null);

    try {
      // Parse args: empty strings for value types are passed as-is (ethers will throw with a clear message)
      const args = params.map((p) => p.trim());

      if (isWrite) {
        if (!wallet) return;
        const browserProvider = toBrowserProvider(wallet.provider);
        const signer = await browserProvider.getSigner();
        const contract = new Contract(contractAddress, [fragment], signer);
        const overrides: Record<string, unknown> = {};
        if (isPayable && value.trim()) {
          overrides.value = value.trim();
        }
        if (gasLimit.trim()) {
          overrides.gasLimit = gasLimit.trim();
        }
        const tx = await contract[fragment.name](...args, overrides);
        setTxHash(tx.hash as string);
        setStatus({ state: "success", result: tx.hash as string });
      } else {
        const provider = new JsonRpcProvider(rpcUrl);
        const contract = new Contract(contractAddress, [fragment], provider);
        const result = await contract[fragment.name](...args);
        setStatus({ state: "success", result: formatResult(result) });
      }
    } catch (error) {
      setStatus({ state: "error", message: formatCallError(error) });
    }
  };

  return (
    <div className="rounded-lg border border-border bg-surface transition-colors">
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <span className="font-mono text-sm font-medium text-text">
          {fragment.name}
          <span className="text-text-muted">
            ({fragment.inputs.map((i) => i.type).join(", ")})
          </span>
        </span>
        <div className="flex items-center gap-2">
          {isPayable && (
            <span className="rounded bg-warning/10 px-1.5 py-0.5 text-[10px] font-semibold text-warning">
              {t("tools.abiInteractor.methods.payableBadge")}
            </span>
          )}
          <ChevronDownIcon
            size={16}
            className={cn(
              "shrink-0 text-text-muted transition-transform",
              open && "rotate-180",
            )}
          />
        </div>
      </button>

      {/* Expanded body */}
      {open && (
        <div className="space-y-3 border-t border-border px-4 py-4">
          {/* Parameter inputs */}
          {fragment.inputs.length === 0 ? (
            <p className="text-xs text-text-muted">
              {t("tools.abiInteractor.methods.noParams")}
            </p>
          ) : (
            <div className="space-y-2">
              {fragment.inputs.map((input, i) => (
                <div key={i} className="space-y-1">
                  <label className="text-xs text-text-secondary">
                    <span className="font-mono">{input.name || `arg${i}`}</span>
                    <span className="ml-1.5 text-text-muted">{input.type}</span>
                  </label>
                  <Input
                    value={params[i]}
                    onChange={(e) => {
                      const next = [...params];
                      next[i] = e.target.value;
                      setParams(next);
                    }}
                    placeholder={input.type}
                    className="font-mono text-xs"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Payable value input */}
          {isWrite && isPayable && (
            <div className="space-y-1">
              <label className="text-xs text-text-secondary">
                {t("tools.abiInteractor.methods.valueLabel")}
              </label>
              <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="0.0"
                className="font-mono text-xs"
              />
            </div>
          )}

          {/* Gas limit override (write only) */}
          {isWrite && (
            <div className="space-y-1">
              <label className="text-xs text-text-secondary">
                {t("tools.abiInteractor.methods.gasLimitLabel")}
              </label>
              <Input
                value={gasLimit}
                onChange={(e) => setGasLimit(e.target.value)}
                placeholder={t(
                  "tools.abiInteractor.methods.gasLimitPlaceholder",
                )}
                className="font-mono text-xs"
              />
            </div>
          )}

          {/* Wallet required hint */}
          {needsWallet && (
            <p className="flex items-center gap-1.5 text-xs text-warning">
              <WarningIcon size={13} />
              {t("tools.abiInteractor.methods.connectToWrite")}
            </p>
          )}

          {/* Call button */}
          <Button
            size="sm"
            onClick={handleCall}
            disabled={!canCall}
            variant={isWrite ? "secondary" : "primary"}
          >
            {status.state === "loading" ? (
              <>
                <SpinnerIcon size={14} />
                {t("tools.abiInteractor.methods.calling")}
              </>
            ) : isWrite ? (
              t("tools.abiInteractor.methods.send")
            ) : (
              t("tools.abiInteractor.methods.call")
            )}
          </Button>

          {/* Result */}
          {status.state === "success" && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-text-secondary">
                  {isWrite
                    ? t("tools.abiInteractor.methods.txHash")
                    : t("tools.abiInteractor.methods.result")}
                </span>
                <CopyButton text={status.result} />
              </div>
              <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-surface-hover p-3 font-mono text-xs text-success">
                {status.result}
              </pre>
              {isWrite && txHash && explorerUrl && (
                <a
                  href={`${explorerUrl}/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary-hover"
                >
                  <ExternalLinkIcon size={12} />
                  {t("tools.abiInteractor.methods.viewOnExplorer")}
                </a>
              )}
            </div>
          )}

          {/* Error */}
          {status.state === "error" && (
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-text-secondary">
                {t("tools.abiInteractor.methods.error")}
              </span>
              <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-danger/5 p-3 font-mono text-xs text-danger">
                {status.message}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
