import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, icon, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold tracking-wider uppercase text-[#64748b] mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]">
              {icon}
            </div>
          )}
          <input
            type={type}
            id={inputId}
            className={cn(
              "w-full rounded border border-[#1e2d4a] bg-[#0a0f1e] px-3 py-2.5 text-sm text-[#e2e8f0]",
              "placeholder:text-[#374151] transition-all duration-200",
              "focus:outline-none focus:border-[#00d4ff]/50 focus:ring-1 focus:ring-[#00d4ff]/20",
              "hover:border-[#1e2d4a]/80",
              error && "border-[#ef4444]/50 focus:border-[#ef4444]/70 focus:ring-[#ef4444]/20",
              icon && "pl-10",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-[#ef4444]">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
