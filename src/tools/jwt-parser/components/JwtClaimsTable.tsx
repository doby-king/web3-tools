import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import type { ParseKeys } from "i18next";
import { Card } from "@/components/ui";
import {
  buildClaimsRows,
  formatClaimTime,
  type ClaimRow,
  type JwtParseResult,
} from "../logic";

export interface JwtClaimsTableProps {
  result: JwtParseResult;
}

export function JwtClaimsTable({ result }: JwtClaimsTableProps) {
  const { t } = useTranslation();

  const rows =
    result.ok && !result.empty && "decoded" in result
      ? buildClaimsRows(result.decoded.header, result.decoded.payload)
      : [];

  return (
    <Card className="flex h-full min-h-0 flex-col p-4">
      <div className="mb-3">
        <h2 className="font-display text-sm font-semibold text-text">
          {t("tools.jwtParser.claimsLabel")}
        </h2>
      </div>

      <div className="min-h-[280px] flex-1 overflow-auto rounded-lg border border-border bg-bg sm:min-h-[360px]">
        {!result.ok ? (
          <div className="flex h-full items-center justify-center p-6 text-center text-sm text-text-muted">
            {t("tools.jwtParser.claimsError")}
          </div>
        ) : result.empty || rows.length === 0 ? (
          <div className="flex h-full items-center justify-center p-6 text-center text-sm text-text-muted">
            {t("tools.jwtParser.claimsEmpty")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] table-fixed text-left">
              <colgroup>
                <col className="w-[22%]" />
                <col className="w-[39%]" />
                <col className="w-[39%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-border bg-surface-hover/60">
                  <th className="px-3 py-2.5 text-xs font-semibold tracking-wider text-text-secondary uppercase">
                    {t("tools.jwtParser.colName")}
                  </th>
                  <th className="px-3 py-2.5 text-xs font-semibold tracking-wider text-text-secondary uppercase">
                    {t("tools.jwtParser.colValue")}
                  </th>
                  <th className="px-3 py-2.5 text-xs font-semibold tracking-wider text-text-secondary uppercase">
                    {t("tools.jwtParser.colDescription")}
                  </th>
                </tr>
              </thead>
              <tbody>
                <ClaimSectionRows
                  label={t("tools.jwtParser.sectionHeader")}
                  rows={rows.filter((r) => r.section === "header")}
                />
                <ClaimSectionRows
                  label={t("tools.jwtParser.sectionPayload")}
                  rows={rows.filter((r) => r.section === "payload")}
                />
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
}

function ClaimSectionRows({
  label,
  rows,
}: {
  label: string;
  rows: ClaimRow[];
}) {
  const { t } = useTranslation();
  if (rows.length === 0) return null;

  return (
    <Fragment>
      <tr className="border-b border-border bg-surface-hover/40">
        <td
          colSpan={3}
          className="px-3 py-2 text-xs font-semibold text-text-secondary"
        >
          {label}
        </td>
      </tr>
      {rows.map((row) => (
        <tr
          key={`${row.section}-${row.name}`}
          className="border-b border-border/60 last:border-b-0"
        >
          <td className="max-w-0 overflow-hidden px-3 py-2.5 align-top font-mono text-xs font-medium break-all text-primary">
            {row.name}
          </td>
          <td className="max-w-0 overflow-hidden px-3 py-2.5 align-top font-mono text-xs break-all text-text">
            <ClaimValue row={row} />
          </td>
          <td className="max-w-0 overflow-hidden px-3 py-2.5 align-top text-xs leading-relaxed break-words text-text-secondary">
            {t(row.descriptionKey as ParseKeys)}
          </td>
        </tr>
      ))}
    </Fragment>
  );
}

function ClaimValue({ row }: { row: ClaimRow }) {
  const { t } = useTranslation();

  if (!row.isTime || row.timestamp == null) {
    return <>{row.value}</>;
  }

  const formatted = formatClaimTime(row.timestamp);
  if (!formatted.valid) {
    return (
      <span>
        {row.value}
        <span className="mt-1 block text-danger">
          {t("tools.jwtParser.timeInvalid")}
        </span>
      </span>
    );
  }

  return (
    <span className="flex flex-col gap-0.5">
      <span className="text-text-muted">{row.value}</span>
      <span>{t("tools.jwtParser.timeLocal", { time: formatted.local })}</span>
      <span>{t("tools.jwtParser.timeUtc", { time: formatted.utc })}</span>
    </span>
  );
}
