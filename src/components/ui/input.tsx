import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-none border border-white/15 bg-black/40 px-4 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-giallo focus:outline-none focus:ring-1 focus:ring-giallo disabled:cursor-not-allowed disabled:opacity-50 transition-all font-mono",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
