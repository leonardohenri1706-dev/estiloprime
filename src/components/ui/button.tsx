import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "giallo" | "outline" | "glass" | "exhaust" | "ghost";
  size?: "sm" | "md" | "lg" | "xl";
  isHexagonal?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "giallo",
      size = "md",
      isHexagonal = true,
      children,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "h-9 px-4 text-xs font-semibold tracking-wider",
      md: "h-11 px-6 text-sm font-bold tracking-wider",
      lg: "h-14 px-8 text-base font-extrabold tracking-widest",
      xl: "h-16 px-10 text-lg font-black tracking-widest",
    }[size];

    const variantClasses = {
      giallo:
        "bg-giallo text-black hover:bg-giallo-hover shadow-giallo-glow active:scale-[0.98] border-none font-bold uppercase",
      outline:
        "border border-giallo/60 text-giallo hover:bg-giallo/10 hover:border-giallo shadow-sm active:scale-[0.98] uppercase",
      glass:
        "glass-panel text-white hover:bg-white/10 hover:border-white/30 active:scale-[0.98] uppercase",
      exhaust:
        "bg-gradient-to-r from-exhaust-start to-exhaust-end text-black shadow-exhaust-glow hover:brightness-110 active:scale-[0.98] uppercase",
      ghost:
        "bg-transparent text-white/80 hover:text-white hover:bg-white/5 uppercase",
    }[variant];

    return (
      <button
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer group",
          isHexagonal && "clip-hex-btn",
          sizeClasses,
          variantClasses,
          className
        )}
        {...props}
      >
        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>
        {variant === "giallo" && (
          <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out pointer-events-none" />
        )}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
