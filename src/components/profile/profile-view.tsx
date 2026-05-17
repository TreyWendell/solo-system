"use client";

import { motion } from "framer-motion";
import { Calendar, Users, Flame, Trophy } from "lucide-react";
import { format } from "date-fns";
import { Avatar } from "@/components/ui/avatar";
import { RankBadge } from "@/components/ui/badge";
import { XpBar } from "@/components/ui/progress";
import { StatCardGrid } from "@/components/dashboard/stat-card";
import { AchievementGrid } from "@/components/achievements/achievement-grid";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { xpForLevel, STAT_META } from "@/lib/constants";
import type { UserStat, UserAchievement, Achievement, ActivityLog } from "@prisma/client";
import type { PublicUser } from "@/types";

interface ProfileViewProps {
  user: PublicUser & { _count?: { friendsInitiated?: number } };
  stats: UserStat[];
  achievements: Array<UserAchievement & { achievement: Achievement }>;
  activityLog: ActivityLog[];
  friendCount: number;
  isOwner?: boolean;
}

export function ProfileView({
  user,
  stats,
  achievements,
  activityLog,
  friendCount,
  isOwner,
}: ProfileViewProps) {
  const xpCurrentLevel = xpForLevel(user.level);
  const xpNextLevel = xpForLevel(user.level + 1);
  const xpInLevel = user.totalXp - xpCurrentLevel;
  const xpToNext = xpNextLevel - xpCurrentLevel;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Profile header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-6 border border-[#1e2d4a] relative overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at top left, #00d4ff 0%, transparent 60%)`,
          }}
        />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <Avatar
            src={user.avatarUrl}
            alt={user.displayName ?? user.username}
            fallback={user.username}
            size="xl"
            glow
          />

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-3xl font-black text-[#e2e8f0]">
                {user.displayName ?? user.username}
              </h1>
              <RankBadge rank={user.rank} size="md" />
            </div>
            <p className="text-sm text-[#64748b] mb-3">@{user.username}</p>

            {user.bio && (
              <p className="text-sm text-[#94a3b8] mb-4 max-w-lg">{user.bio}</p>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-[#64748b]">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Joined {format(new Date(user.createdAt), "MMMM yyyy")}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {friendCount} friends
              </span>
              <span className="flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-[#f59e0b]" />
                {user.currentStreak} day streak
              </span>
              <span className="flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-[#f59e0b]" />
                {achievements.length} achievements
              </span>
            </div>
          </div>

          {/* Level display */}
          <div className="text-center sm:text-right flex-shrink-0">
            <div className="text-5xl font-black font-mono text-[#00d4ff] glow-text-cyan">
              {user.level}
            </div>
            <div className="text-xs text-[#64748b] tracking-wider uppercase">Level</div>
            <div className="text-xs text-[#64748b] mt-1">
              {user.totalXp.toLocaleString()} XP
            </div>
          </div>
        </div>

        {/* XP bar */}
        <div className="mt-6 pt-4 border-t border-[#1e2d4a]">
          <XpBar xp={xpInLevel} xpToNext={xpToNext} level={user.level} size="md" />
        </div>
      </motion.div>

      {/* Stats + Achievements + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#64748b] mb-3">
              Core Stats
            </h2>
            <StatCardGrid stats={stats} />
          </div>

          {achievements.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#64748b] mb-3">
                Achievements
              </h2>
              <AchievementGrid achievements={achievements} />
            </div>
          )}
        </div>

        <div>
          <ActivityFeed
            items={activityLog.map((a) => ({ ...a, user }))}
            showUser={false}
            title="Activity"
          />
        </div>
      </div>
    </div>
  );
}
