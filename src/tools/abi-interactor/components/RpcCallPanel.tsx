import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, CopyButton, Input, SpinnerIcon } from "@/components/ui";
import { ChevronDownIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { RPC_METHODS } from "../lib/rpcMethods";
import { RpcMethodSection } from "./RpcMethodSection";

interface RpcCallPanelProps {
  rpcUrl: string | null;
}

type CallStatus =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "success"; result: string }
  | { state: "error"; message: string };

/** Custom RPC call section — allows arbitrary method + params */
function CustomRpcSection({ rpcUrl }: { rpcUrl: string }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState("");
  const [paramsJson, setParamsJson] = useState("[]");
  const [status, setStatus] = useState<CallStatus>({ state: "idle" });

  const canCall = method.trim().length > 0 && status.state !== "loading";

  const handleCall = async () => {
    setStatus({ state: "loading" });

    try {
      let params: unknown[];
      try {
        params = JSON.parse(paramsJson || "[]");
        if (!Array.isArray(params)) {
          params = [params];
        }
      } catch {
        setStatus({
          state: "error",
          message: t("tools.abiInteractor.rpc.custom.invalidParams"),
        });
        return;
      }

      const response = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: method.trim(),
          params,
        }),
      });

      const json = await response.json();

      if (json.error) {
        setStatus({
          state: "error",
          message: JSON.stringify(json.error, null, 2),
        });
      } else {
        setStatus({
          state: "success",
          result: JSON.stringify(json.result, null, 2),
        });
      }
    } catch (error) {
      setStatus({
        state: "error",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  };

  return (
    <div className="rounded-lg border border-border bg-surface transition-colors">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <span className="font-mono text-sm font-medium text-text">
          {t("tools.abiInteractor.rpc.custom.title")}
        </span>
        <ChevronDownIcon
          size={16}
          className={cn(
            "shrink-0 text-text-muted transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="space-y-3 border-t border-border px-4 py-4">
          <div className="space-y-1">
            <label className="text-xs text-text-secondary">
              {t("tools.abiInteractor.rpc.custom.methodLabel")}
            </label>
            <Input
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              placeholder={t("tools.abiInteractor.rpc.custom.methodPlaceholder")}
              className="font-mono text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-text-secondary">
              {t("tools.abiInteractor.rpc.custom.paramsLabel")}
            </label>
            <Input
              value={paramsJson}
              onChange={(e) => setParamsJson(e.target.value)}
              placeholder={t("tools.abiInteractor.rpc.custom.paramsPlaceholder")}
              className="font-mono text-xs"
            />
          </div>

          <Button size="sm" onClick={handleCall} disabled={!canCall}>
            {status.state === "loading" ? (
              <>
                <SpinnerIcon size={14} />
                {t("tools.abiInteractor.rpc.calling")}
              </>
            ) : (
              t("tools.abiInteractor.rpc.call")
            )}
          </Button>

          {status.state === "success" && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-text-secondary">
                  {t("tools.abiInteractor.rpc.result")}
                </span>
                <CopyButton text={status.result} />
              </div>
              <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-surface-hover p-3 font-mono text-xs text-success">
                {status.result}
              </pre>
            </div>
          )}

          {status.state === "error" && (
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-text-secondary">
                {t("tools.abiInteractor.rpc.error")}
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

export function RpcCallPanel({ rpcUrl }: RpcCallPanelProps) {
  const { t } = useTranslation();

  if (!rpcUrl) {
    return (
      <div className="flex h-full min-h-[300px] items-center justify-center rounded-xl border border-dashed border-border">
        <p className="max-w-xs text-center text-sm text-text-muted">
          {t("tools.abiInteractor.rpc.noRpc")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {RPC_METHODS.map((def) => (
        <RpcMethodSection key={def.method} def={def} rpcUrl={rpcUrl} />
      ))}
      <CustomRpcSection rpcUrl={rpcUrl} />
    </div>
  );
}
