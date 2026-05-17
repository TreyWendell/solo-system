"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";
import { RankBadge } from "@/components/ui/badge";
import type { Rank } from "@/types";

interface LevelUpOverlayProps {
  show: boolean;
  level: number;
  rank?: Rank | null;
  onClose: () => void;
}

export function LevelUpOverlay({ show, level, rank, onClose }: LevelUpOverlayProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-[#050810]/80 backdrop-blur-sm" />

          {/* Content */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative z-10 text-center px-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* System message */}
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-[#00d4ff] text-sm font-semibold tracking-[0.3em] uppercase mb-4 glow-text-cyan"
            >
              [ SYSTEM NOTIFICATION ]
            </motion.p>

            {/* Level display */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="relative mb-6"
            >
              {/* Glow ring */}
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 30px rgba(0,212,255,0.3)",
                    "0 0 80px rgba(0,212,255,0.6)",
                    "0 0 30px rgba(0,212,255,0.3)",
                  ],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-36 h-36 rounded-full border-2 border-[#00d4ff]/50 flex items-center justify-center mx-auto bg-[#0a0f1e]"
              >
                <div>
                  <div className="text-xs text-[#64748b] tracking-[0.2em] uppercase mb-1">
                    Level
                  </div>
                  <motion.div
                    initial={{ opacity: 0, scale: 1.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="text-6xl font-black text-[#00d4ff] glow-text-cyan font-mono"
                  >
                    {level}
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-4xl font-black text-[#e2e8f0] mb-2"
            >
              LEVEL UP!
            </motion.h2>

            {rank && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex items-center justify-center gap-3 mb-4"
              >
                <span className="text-[#64748b] text-sm">New Rank:</span>
                <RankBadge rank={rank} size="lg" />
              </motion.div>
            )}

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 1 }}
              className="text-[#64748b] text-sm"
            >
              Click anywhere to continue
            </motion.p>

            {/* Particle effects */}
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-[#00d4ff]"
                style={{
                  left: "50%",
                  top: "50%",
                }}
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{
                  x: Math.cos((i / 12) * Math.PI * 2) * (80 + Math.random() * 60),
                  y: Math.sin((i / 12) * Math.PI * 2) * (80 + Math.random() * 60),
                  opacity: 0,
                  scale: 0,
                }}
                transition={{ delay: 0.4, duration: 1 + Math.random() * 0.5, ease: "easeOut" }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
