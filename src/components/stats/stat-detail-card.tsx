"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { STAT_META } from "@/lib/constants";
import { XpBar } from "@/components/ui/progress";
import { formatRelative } from "@/lib/utils";
import { StatQuestModal } from "@/components/stats/stat-quest-modal";
import { type UserStat, type StatHistory } from "@prisma/client";
import type { StatType } from "@/types";

interface StatDetailCardProps {
  stat: UserStat & { history: StatHistory[] };
  xpInLevel: number;
  xpToNextLevel: number;
}

export function StatDetailCard({ stat, xpInLevel, xpToNextLevel }: StatDetailCardProps) {
  const meta = STAT_META[stat.stat as StatType];
  const recentGain = stat.history.slice(0, 5).reduce((sum: number, h: StatHistory) => sum + h.xpDelta, 0);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => setModalOpen(true)}
      className="glass rounded-xl p-5 border border-[#1e2d4a] hover:border-[#1e2d4a]/80 transition-all duration-300 cursor-pointer group"
      style={{ "--stat-color": meta.color } as React.CSSProperties}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-lg flex items-center justify-center text-xl"
            style={{ backgroundColor: `${meta.color}15`, border: `1px solid ${meta.color}30` }}
          >
            {meta.icon}
          </div>
          <div>
            <h3 className="font-bold text-[#e2e8f0]">{meta.label}</h3>
            <p className="text-xs text-[#64748b]">{meta.description}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black font-mono" style={{ color: meta.color }}>
            {stat.level}
          </div>
          <div className="text-xs text-[#64748b]">Level</div>
        </div>
      </div>

      {/* XP Bar */}
      <XpBar
        xp={xpInLevel}
        xpToNext={xpToNextLevel}
        level={stat.level}
        color={meta.color}
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-[#0d1528] rounded-lg p-3 border border-[#1e2d4a]">
          <div className="text-lg font-bold font-mono text-[#e2e8f0]">
            {stat.xp.toLocaleString()}
          </div>
          <div className="text-xs text-[#64748b]">Total XP</div>
        </div>
        <div className="bg-[#0d1528] rounded-lg p-3 border border-[#1e2d4a]">
          <div
            className="text-lg font-bold font-mono"
            style={{ color: recentGain > 0 ? "#10b981" : "#64748b" }}
          >
            +{recentGain}
          </div>
          <div className="text-xs text-[#64748b]">Recent XP</div>
        </div>
      </div>

      {/* Recent history */}
      {stat.history.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-[#64748b] mb-2 tracking-wider uppercase">Recent</p>
          <div className="space-y-1.5">
            {stat.history.slice(0, 4).map((h: StatHistory) => (
              <div key={h.id} className="flex items-center justify-between text-xs">
                <span className="text-[#64748b] truncate">{h.reason ?? "Activity"}</span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className="font-mono font-semibold"
                    style={{ color: h.xpDelta > 0 ? "#10b981" : "#ef4444" }}
                  >
                    {h.xpDelta > 0 ? "+" : ""}{h.xpDelta}
                  </span>
                  <span className="text-[#374151]">{formatRelative(h.recordedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Click hint */}
      <p className="text-[10px] text-[#374151] opacity-0 group-hover:opacity-100 transition-opacity mt-3 text-right">
        Click to view quest history →
      </p>
    </motion.div>

    {modalOpen && (
      <StatQuestModal
        statType={stat.stat as StatType}
        statLevel={stat.level}
        onClose={() => setModalOpen(false)}
      />
    )}
    </>
  );
}
