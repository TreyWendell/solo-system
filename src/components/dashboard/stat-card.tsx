"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { XpBar } from "@/components/ui/progress";
import { STAT_META, xpForLevel } from "@/lib/constants";
import { StatQuestModal } from "@/components/stats/stat-quest-modal";
import type { UserStat } from "@prisma/client";
import type { StatType } from "@/types";

interface StatCardProps {
  stat: UserStat;
  index?: number;
}

export function StatCard({ stat, index = 0 }: StatCardProps) {
  const meta = STAT_META[stat.stat as StatType];
  const xpToNextLevel = xpForLevel(stat.level + 1) - xpForLevel(stat.level);
  const xpInCurrentLevel = stat.xp - xpForLevel(stat.level);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        whileHover={{ y: -2, scale: 1.01 }}
        onClick={() => setModalOpen(true)}
        className="glass rounded-xl p-5 border border-[#1e2d4a] hover:border-[#1e2d4a]/80 glass-hover transition-all duration-300 group cursor-pointer"
        style={{
          boxShadow: `0 0 0px ${meta.color}00`,
        }}
        whileInView={{
          boxShadow: `0 0 20px ${meta.color}18, 0 0 40px ${meta.color}08`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl" role="img" aria-label={meta.label}>
              {meta.icon}
            </span>
            <div>
              <p className="text-xs font-semibold tracking-[0.1em] uppercase text-[#64748b]">
                {meta.label}
              </p>
              <p className="text-xs text-[#64748b]/70 mt-0.5">{meta.description}</p>
            </div>
          </div>
          <div className="text-right">
            <motion.span
              key={stat.level}
              initial={{ scale: 1.3, color: meta.color }}
              animate={{ scale: 1, color: "#e2e8f0" }}
              transition={{ duration: 0.4 }}
              className="text-2xl font-black text-[#e2e8f0] font-mono"
            >
              {stat.level}
            </motion.span>
          </div>
        </div>

        {/* XP Bar */}
        <XpBar
          xp={xpInCurrentLevel}
          xpToNext={xpToNextLevel}
          level={stat.level}
          color={meta.color}
          size="sm"
        />

        {/* Total XP + hint */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-[#64748b]">Total XP</span>
          <div className="flex items-center gap-2">
            <motion.span
              key={stat.xp}
              initial={{ color: meta.color }}
              animate={{ color: "#64748b" }}
              transition={{ duration: 0.6 }}
              className="text-xs font-mono text-[#64748b]"
            >
              {stat.xp.toLocaleString()}
            </motion.span>
            <span className="text-[10px] text-[#374151] opacity-0 group-hover:opacity-100 transition-opacity">
              View history →
            </span>
          </div>
        </div>
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

export function StatCardGrid({ stats }: { stats: UserStat[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <StatCard key={stat.id} stat={stat} index={i} />
      ))}
    </div>
  );
}
