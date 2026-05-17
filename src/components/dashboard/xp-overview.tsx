"use client";

import { motion } from "framer-motion";
import { XpBar } from "@/components/ui/progress";
import { RankBadge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { RANK_LABELS, xpForLevel, levelProgress, SYSTEM_MESSAGES } from "@/lib/constants";
import { randomFrom } from "@/lib/utils";
import type { PublicUser } from "@/types";
import { useMemo } from "react";

interface XpOverviewProps {
  user: PublicUser;
}

export function XpOverview({ user }: XpOverviewProps) {
  const systemMessage = useMemo(() => randomFrom(SYSTEM_MESSAGES), []);
  const xpCurrentLevel = xpForLevel(user.level);
  const xpNextLevel = xpForLevel(user.level + 1);
  const xpInLevel = user.totalXp - xpCurrentLevel;
  const xpToNext = xpNextLevel - xpCurrentLevel;
  const progress = levelProgress(user.totalXp);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6 border border-[#1e2d4a] glow-cyan relative overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#00d4ff]/5 via-transparent to-[#8b5cf6]/5 pointer-events-none" />

      <div className="relative flex flex-col lg:flex-row lg:items-center gap-6">
        {/* Avatar + rank */}
        <div className="flex items-center gap-4">
          <Avatar
            src={user.avatarUrl}
            alt={user.displayName ?? user.username}
            fallback={user.username}
            size="xl"
            glow
          />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <RankBadge rank={user.rank} size="md" />
              <span className="text-xs text-[#64748b] tracking-wider uppercase">
                {RANK_LABELS[user.rank]}
              </span>
            </div>
            <h2 className="text-2xl font-black text-[#e2e8f0]">
              {user.displayName ?? user.username}
            </h2>
            <p className="text-sm text-[#64748b]">@{user.username}</p>
          </div>
        </div>

        {/* XP Info */}
        <div className="flex-1 lg:pl-6 lg:border-l lg:border-[#1e2d4a]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold tracking-[0.15em] uppercase text-[#64748b]">
                Global Level
              </span>
              <motion.span
                key={user.level}
                initial={{ scale: 1.4, color: "#00d4ff" }}
                animate={{ scale: 1, color: "#e2e8f0" }}
                className="text-3xl font-black font-mono text-[#e2e8f0]"
              >
                {user.level}
              </motion.span>
            </div>
            <div className="text-right">
              <span className="text-xs text-[#64748b]">
                {user.totalXp.toLocaleString()} total XP
              </span>
            </div>
          </div>

          <XpBar
            xp={xpInLevel}
            xpToNext={xpToNext}
            level={user.level}
            color="#00d4ff"
            size="lg"
          />

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-4 text-xs text-[#64748b]">
              <span>
                🔥 <strong className="text-[#f59e0b]">{user.currentStreak}</strong> day streak
              </span>
              <span>
                🏆 Best: <strong className="text-[#e2e8f0]">{user.longestStreak}</strong> days
              </span>
            </div>
            <span className="text-xs font-mono text-[#00d4ff]/60">{Math.round(progress)}%</span>
          </div>
        </div>
      </div>

      {/* System message ticker */}
      <div className="mt-5 pt-4 border-t border-[#1e2d4a] flex items-center gap-2">
        <span className="text-xs font-semibold tracking-[0.15em] text-[#00d4ff] flex-shrink-0">
          SYSTEM:
        </span>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xs text-[#64748b] italic"
        >
          {systemMessage}
        </motion.p>
      </div>
    </motion.div>
  );
}
