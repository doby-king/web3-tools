import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Gradient border glow effect on hover */
  glow?: boolean;
}

export function Card({
  glow = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface p-5 transition-colors",
        glow && "glow-hover",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
