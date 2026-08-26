import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "giallo" | "storm" | "exhaust" | "outline" | "active";
}

export function Badge({
  className,
  variant = "giallo",
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    giallo: "bg-giallo/15 text-giallo border-giallo/40",
    storm: "bg-cyan-500/15 text-cyan-300 border-cyan-500/40",
    exhaust: "bg-orange-500/15 text-orange-400 border-orange-500/40",
    outline: "bg-white/5 text-neutral-300 border-white/20",
    active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50",
  }[variant];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold uppercase tracking-wider border clip-tag",
        variantStyles,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
