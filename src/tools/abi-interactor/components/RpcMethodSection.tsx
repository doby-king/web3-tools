import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, CopyButton, Input, SpinnerIcon } from "@/components/ui";
import { ChevronDownIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import type { RpcMethodDef } from "../lib/rpcMethods";

interface RpcMethodSectionProps {
  def: RpcMethodDef;
  rpcUrl: string;
}

type CallStatus =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "success"; result: string }
  | { state: "error"; message: string };

export function RpcMethodSection({ def, rpcUrl }: RpcMethodSectionProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [params, setParams] = useState<string[]>(() =>
    def.params.map((p) => p.defaultValue ?? ""),
  );
  const [status, setStatus] = useState<CallStatus>({ state: "idle" });

  const canCall = status.state !== "loading";

  const handleCall = async () => {
    setStatus({ state: "loading" });

    try {
      // Build params array: convert "true"/"false" to boolean for JSON-RPC
      const rpcParams = params
        .map((p) => p.trim())
        .filter((p) => p.length > 0)
        .map((p) => {
          if (p === "true") return true;
          if (p === "false") return false;
          return p;
        });

      const response = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: def.method,
          params: rpcParams,
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
        message:
          error instanceof Error ? error.message : String(error),
      });
    }
  };

  return (
    <div className="rounded-lg border border-border bg-surface transition-colors">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <div className="min-w-0">
          <span className="font-mono text-sm font-medium text-text">
            {def.method}
          </span>
          <p className="mt-0.5 truncate text-xs text-text-muted">
            {t(def.descriptionKey as never)}
          </p>
        </div>
        <ChevronDownIcon
          size={16}
          className={cn(
            "shrink-0 text-text-muted transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {/* Expanded body */}
      {open && (
        <div className="space-y-3 border-t border-border px-4 py-4">
          {/* Parameter inputs */}
          {def.params.length === 0 ? (
            <p className="text-xs text-text-muted">
              {t("tools.abiInteractor.rpc.noParams")}
            </p>
          ) : (
            <div className="space-y-2">
              {def.params.map((param, i) => (
                <div key={i} className="space-y-1">
                  <label className="text-xs text-text-secondary">
                    <span className="font-mono">{param.name}</span>
                  </label>
                  <Input
                    value={params[i]}
                    onChange={(e) => {
                      const next = [...params];
                      next[i] = e.target.value;
                      setParams(next);
                    }}
                    placeholder={param.placeholder}
                    className="font-mono text-xs"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Call button */}
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

          {/* Result */}
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

          {/* Error */}
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
