"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  trackClassName?: string;
  fillClassName?: string;
  color?: string;
  animated?: boolean;
  showShimmer?: boolean;
  label?: string;
}

export function Progress({
  value,
  max = 100,
  className,
  trackClassName,
  fillClassName,
  color = "#00d4ff",
  animated = true,
  showShimmer = true,
  label,
}: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <div className="flex justify-between text-xs text-[#64748b] mb-1">
          <span>{label}</span>
          <span>{Math.round(pct)}%</span>
        </div>
      )}
      <div
        className={cn(
          "relative h-2 w-full rounded-full bg-[#0d1528] overflow-hidden",
          trackClassName
        )}
      >
        {animated ? (
          <motion.div
            className={cn("h-full rounded-full relative shimmer", fillClassName)}
            style={{ backgroundColor: color }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {showShimmer && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
            )}
          </motion.div>
        ) : (
          <div
            className={cn("h-full rounded-full", fillClassName)}
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        )}
      </div>
    </div>
  );
}

interface XpBarProps {
  xp: number;
  xpToNext: number;
  level: number;
  color?: string;
  size?: "sm" | "md" | "lg";
}

export function XpBar({ xp, xpToNext, level, color = "#00d4ff", size = "md" }: XpBarProps) {
  const progress = Math.min(100, (xp / xpToNext) * 100);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-mono text-[#64748b]">
          LVL <span className="text-[#e2e8f0] font-bold">{level}</span>
        </span>
        <span className="text-xs font-mono text-[#64748b]">
          <span className="text-[#e2e8f0]">{xp.toLocaleString()}</span>
          {" / "}
          {xpToNext.toLocaleString()} XP
        </span>
      </div>
      <div
        className={cn(
          "relative rounded-full bg-[#0d1528] overflow-hidden",
          size === "sm" && "h-1.5",
          size === "md" && "h-2",
          size === "lg" && "h-3"
        )}
      >
        <motion.div
          className="h-full rounded-full relative overflow-hidden"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            style={{ animation: "shimmer 2.5s linear infinite" }}
          />
        </motion.div>
      </div>
    </div>
  );
}
