"use client";

import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { RarityBadge } from "@/components/ui/badge";
import type { Achievement, UserAchievement } from "@prisma/client";

type UserAchievementWithDetails = UserAchievement & { achievement: Achievement };

interface AchievementGridProps {
  achievements: UserAchievementWithDetails[];
  compact?: boolean;
}

export function AchievementGrid({ achievements, compact }: AchievementGridProps) {
  if (!achievements.length) {
    return (
      <div className="glass rounded-xl p-5 border border-[#1e2d4a]">
        <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#64748b] mb-4">
          Achievements
        </h3>
        <div className="flex flex-col items-center py-6 text-center">
          <Trophy className="h-8 w-8 text-[#1e2d4a] mb-2" />
          <p className="text-sm text-[#64748b]">No achievements yet</p>
          <p className="text-xs text-[#374151] mt-1">Complete quests to unlock achievements</p>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="glass rounded-xl p-5 border border-[#1e2d4a]">
        <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#64748b] mb-3">
          Recent Achievements
        </h3>
        <div className="space-y-2">
          {achievements.slice(0, 3).map((ua, i) => (
            <motion.div
              key={ua.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3"
            >
              <div className="h-8 w-8 rounded bg-[#f59e0b]/10 border border-[#f59e0b]/20 flex items-center justify-center flex-shrink-0">
                <Trophy className="h-4 w-4 text-[#f59e0b]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#e2e8f0] truncate">
                  {ua.achievement.title}
                </p>
                <p className="text-[10px] text-[#64748b]">{formatDate(ua.unlockedAt)}</p>
              </div>
              <RarityBadge rarity={ua.achievement.rarity} />
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {achievements.map((ua, i) => (
        <motion.div
          key={ua.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.04 }}
          className="glass rounded-xl p-4 border border-[#1e2d4a] hover:border-[#f59e0b]/20 transition-all duration-300"
        >
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/20 flex items-center justify-center flex-shrink-0">
              <Trophy className="h-5 w-5 text-[#f59e0b]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-sm font-semibold text-[#e2e8f0] truncate">
                  {ua.achievement.title}
                </p>
                <RarityBadge rarity={ua.achievement.rarity} />
              </div>
              <p className="text-xs text-[#64748b]">{ua.achievement.description}</p>
              <p className="text-[10px] text-[#374151] mt-2">
                Unlocked {formatDate(ua.unlockedAt)}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
