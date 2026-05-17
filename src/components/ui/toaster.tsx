"use client";

import { Toaster as SonnerToaster, toast } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: "#0a0f1e",
          border: "1px solid #1e2d4a",
          color: "#e2e8f0",
          fontFamily: "inherit",
        },
        classNames: {
          success: "!border-[#10b981]/30",
          error: "!border-[#ef4444]/30",
          warning: "!border-[#f59e0b]/30",
          info: "!border-[#00d4ff]/30",
        },
      }}
      expand
      richColors
    />
  );
}

export { toast };
