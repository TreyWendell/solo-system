"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Flame, Trophy, Calendar } from "lucide-react";
import { format } from "date-fns";
import { STAT_META } from "@/lib/constants";
import { getStatQuestHistory } from "@/actions/stats";
import type { StatQuestHistoryResult } from "@/actions/stats";
import type { StatType } from "@/types";

interface StatQuestModalProps {
  statType: StatType;
  statLevel: number;
  onClose: () => void;
}

export function StatQuestModal({ statType, statLevel, onClose }: StatQuestModalProps) {
  const meta = STAT_META[statType];
  const [data, setData] = useState<StatQuestHistoryResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStatQuestHistory(statType).then((result) => {
      setData(result);
      setLoading(false);
    });
  }, [statType]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-[#050810]/80 backdrop-blur-sm" />

        {/* Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 w-full max-w-lg max-h-[80vh] flex flex-col glass rounded-2xl border overflow-hidden"
          style={{ borderColor: `${meta.color}40` }}
        >
          {/* Header */}
          <div
            className="p-5 border-b border-[#1e2d4a] flex items-center gap-3 flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${meta.color}10, transparent)` }}
          >
            <div
              className="h-10 w-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
              style={{ backgroundColor: `${meta.color}18`, border: `1px solid ${meta.color}30` }}
            >
              {meta.icon}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-black text-[#e2e8f0]">{meta.label}</h2>
              <p className="text-xs text-[#64748b]">{meta.description}</p>
            </div>

            {/* Stat level badge */}
            <div
              className="text-center px-3 py-1 rounded-lg border flex-shrink-0"
              style={{ borderColor: `${meta.color}30`, backgroundColor: `${meta.color}10` }}
            >
              <div className="text-xl font-black font-mono" style={{ color: meta.color }}>
                {statLevel}
              </div>
              <div className="text-[10px] text-[#64748b] uppercase tracking-wider">Level</div>
            </div>

            <button
              onClick={onClose}
              className="h-8 w-8 rounded flex items-center justify-center text-[#64748b] hover:text-[#e2e8f0] hover:bg-[#1e2d4a] transition-all flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Summary bar */}
          {!loading && data && (
            <div className="grid grid-cols-3 divide-x divide-[#1e2d4a] border-b border-[#1e2d4a] flex-shrink-0">
              <div className="p-3 text-center">
                <div
                  className="text-xl font-black font-mono flex items-center justify-center gap-1"
                  style={{ color: data.statStreak > 0 ? "#f59e0b" : "#64748b" }}
                >
                  {data.statStreak > 0 && <Flame className="h-4 w-4" />}
                  {data.statStreak}
                </div>
                <div className="text-[10px] text-[#64748b] uppercase tracking-wider mt-0.5">
                  Stat Streak
                </div>
              </div>
              <div className="p-3 text-center">
                <div className="text-xl font-black font-mono" style={{ color: meta.color }}>
                  {data.totalCompletions}
                </div>
                <div className="text-[10px] text-[#64748b] uppercase tracking-wider mt-0.5">
                  Completions
                </div>
              </div>
              <div className="p-3 text-center">
                <div className="text-xl font-black font-mono text-[#e2e8f0]">
                  {data.quests.reduce((s, q) => s + q.xpForStat, 0).toLocaleString()}
                </div>
                <div className="text-[10px] text-[#64748b] uppercase tracking-wider mt-0.5">
                  Stat XP Earned
                </div>
              </div>
            </div>
          )}

          {/* Quest list */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-14 rounded-lg bg-[#0d1528] animate-pulse" />
                ))}
              </div>
            ) : !data || data.quests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <Trophy className="h-10 w-10 text-[#1e2d4a] mb-3" />
                <p className="text-[#64748b] text-sm">No completions yet</p>
                <p className="text-[#374151] text-xs mt-1">
                  Complete quests that improve {meta.label} to see history here.
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {data.quests.map((quest, i) => (
                  <motion.div
                    key={quest.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-[#0a0f1e] border border-[#1e2d4a] hover:border-[#1e2d4a]/80 transition-colors"
                  >
                    {/* Streak indicator */}
                    <div className="flex-shrink-0 w-10 text-center">
                      {quest.questStreak >= 2 ? (
                        <div className="flex flex-col items-center">
                          <Flame className="h-4 w-4 text-[#f59e0b]" />
                          <span className="text-[10px] font-bold text-[#f59e0b]">
                            {quest.questStreak}d
                          </span>
                        </div>
                      ) : (
                        <div
                          className="h-2 w-2 rounded-full mx-auto mt-1"
                          style={{ backgroundColor: meta.color }}
                        />
                      )}
                    </div>

                    {/* Quest info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#e2e8f0] truncate">
                        {quest.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Calendar className="h-3 w-3 text-[#374151]" />
                        <span className="text-xs text-[#64748b]">
                          {format(new Date(quest.completedAt), "MMM d, yyyy")}
                        </span>
                        <span className="text-[#374151]">·</span>
                        <span className="text-xs text-[#64748b]">
                          {format(new Date(quest.completedAt), "h:mm a")}
                        </span>
                      </div>
                    </div>

                    {/* XP earned for this stat */}
                    <div className="flex-shrink-0 text-right">
                      <div
                        className="text-sm font-bold font-mono"
                        style={{ color: meta.color }}
                      >
                        +{quest.xpForStat}
                      </div>
                      <div className="text-[10px] text-[#64748b]">stat xp</div>
                    </div>

                    {/* Streak bonus badge */}
                    {quest.streakBonus > 0 && (
                      <div className="flex-shrink-0 text-[10px] font-semibold text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/20 rounded px-1.5 py-0.5">
                        +{quest.streakBonus} bonus
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
