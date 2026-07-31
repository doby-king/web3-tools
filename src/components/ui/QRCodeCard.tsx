import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/cn";
import { Card } from "./Card";

export interface QRCodeCardProps {
  value: string;
  size?: number;
  title?: string;
  className?: string;
}

export function QRCodeCard({
  value,
  size = 160,
  title,
  className,
}: QRCodeCardProps) {
  return (
    <Card className={cn("inline-flex flex-col items-center gap-3", className)}>
      {title && (
        <div className="text-sm font-medium text-text-secondary">{title}</div>
      )}
      {/* White background + padding ensures the QR code stays scannable in dark theme */}
      <div className="rounded-lg bg-white p-3">
        <QRCodeSVG value={value} size={size} marginSize={0} />
      </div>
    </Card>
  );
}
