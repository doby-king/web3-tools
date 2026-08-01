import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "success" | "warning";
}

const variantClass: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-surface-hover text-text-secondary border-border",
  primary: "bg-primary/10 text-primary border-primary/25",
  success: "bg-success/10 text-success border-success/25",
  warning: "bg-warning/10 text-warning border-warning/25",
};

export function Badge({
  variant = "default",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variantClass[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
