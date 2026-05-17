"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00d4ff]/50 disabled:pointer-events-none disabled:opacity-40 select-none cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[#00d4ff] text-[#050810] font-semibold hover:bg-[#00b8d9] glow-cyan-sm hover:glow-cyan active:scale-[0.98]",
        outline:
          "border border-[#1e2d4a] bg-transparent text-[#e2e8f0] hover:border-[#00d4ff]/40 hover:text-[#00d4ff] hover:bg-[#00d4ff]/5",
        ghost:
          "bg-transparent text-[#64748b] hover:text-[#e2e8f0] hover:bg-[#0d1528]",
        destructive:
          "bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20 hover:bg-[#ef4444]/20 hover:border-[#ef4444]/40",
        secondary:
          "bg-[#0d1528] text-[#e2e8f0] border border-[#1e2d4a] hover:border-[#00d4ff]/20 hover:bg-[#0d1a36]",
        gold:
          "bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] text-[#050810] font-semibold hover:from-[#d97706] hover:to-[#f59e0b] glow-gold active:scale-[0.98]",
        purple:
          "bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] text-white font-semibold hover:from-[#6d28d9] hover:to-[#7c3aed] glow-purple active:scale-[0.98]",
        link: "text-[#00d4ff] underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
