import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { startOfDay, endOfDay } from "@/lib/utils";
import { assignTodayQuests } from "@/actions/quests";
import { XpOverview } from "@/components/dashboard/xp-overview";
import { StatCardGrid } from "@/components/dashboard/stat-card";
import { WeeklyChart } from "@/components/dashboard/weekly-chart";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { QuestList } from "@/components/quests/quest-list";
import { AchievementGrid } from "@/components/achievements/achievement-grid";
import { subDays, startOfDay as dfnsStartOfDay } from "date-fns";
import type { PublicUser } from "@/types";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  // Ensure today's quests are assigned
  await assignTodayQuests(userId);

  const today = startOfDay();
  const todayEnd = endOfDay();

  const [user, stats, todayQuests, recentActivity, recentAchievements] = await Promise.all([
    db.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true, username: true, displayName: true, avatarUrl: true,
        level: true, totalXp: true, rank: true, currentStreak: true,
        longestStreak: true, createdAt: true, bio: true, isPublic: true,
      },
    }),
    db.userStat.findMany({ where: { userId }, orderBy: { stat: "asc" } }),
    db.dailyQuest.findMany({
      where: { userId, questDate: { gte: today, lte: todayEnd } },
      orderBy: [{ completedAt: "asc" }, { difficulty: "desc" }],
    }),
    db.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    db.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { unlockedAt: "desc" },
      take: 4,
    }),
  ]);

  // Weekly XP data (last 7 days) — derived from completed quests, not XpHistory,
  // so unchecking a quest immediately removes it from the total.
  const weeklyXp = await Promise.all(
    Array.from({ length: 7 }, async (_, i) => {
      const day = subDays(new Date(), 6 - i);
      const dayStart = dfnsStartOfDay(day);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const result = await db.dailyQuest.aggregate({
        where: {
          userId,
          completedAt: { gte: dayStart, lte: dayEnd },
        },
        _sum: { xpReward: true, streakBonus: true },
      });
      return (result._sum.xpReward ?? 0) + (result._sum.streakBonus ?? 0);
    })
  );

  // Friends activity feed
  const friendships = await db.friendship.findMany({
    where: {
      OR: [{ initiatorId: userId }, { receiverId: userId }],
      status: "ACCEPTED",
    },
    select: { initiatorId: true, receiverId: true },
  });
  const friendIds = friendships.map((f: { initiatorId: string; receiverId: string }) =>
    f.initiatorId === userId ? f.receiverId : f.initiatorId
  );

  const friendsActivity = friendIds.length
    ? await db.activityLog.findMany({
        where: { userId: { in: friendIds } },
        include: {
          user: {
            select: {
              id: true, username: true, displayName: true, avatarUrl: true,
              level: true, totalXp: true, rank: true, currentStreak: true,
              longestStreak: true, createdAt: true, bio: true, isPublic: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 8,
      })
    : [];

  const completedToday = todayQuests.filter((q) => q.completedAt !== null).length;
  const totalToday = todayQuests.length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#e2e8f0] tracking-tight">
            Mission Control
          </h1>
          <p className="text-sm text-[#64748b] mt-1">
            {completedToday}/{totalToday} quests completed today
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-[#64748b] tracking-wider uppercase">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* XP Overview */}
      <XpOverview user={user as PublicUser} />

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left column — quests + stats */}
        <div className="xl:col-span-2 space-y-6">
          {/* Today's Quests */}
          <div className="glass rounded-xl p-5 border border-[#1e2d4a]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#64748b]">
                Daily Quests
              </h3>
              <span className="text-xs font-mono text-[#00d4ff]">
                {completedToday}/{totalToday}
              </span>
            </div>
            <QuestList quests={todayQuests} compact />
          </div>

          {/* Stats grid */}
          <div>
            <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#64748b] mb-3">
              Core Stats
            </h3>
            <StatCardGrid stats={stats} />
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Weekly chart */}
          <WeeklyChart data={weeklyXp} />

          {/* Recent achievements */}
          {recentAchievements.length > 0 && (
            <AchievementGrid achievements={recentAchievements} compact />
          )}

          {/* Personal activity */}
          <ActivityFeed
            items={recentActivity.map((a: import("@prisma/client").ActivityLog) => ({ ...a, user: user as PublicUser }))}
            showUser={false}
            title="Recent Activity"
          />

          {/* Friends activity */}
          {friendsActivity.length > 0 && (
            <ActivityFeed items={friendsActivity as never} showUser title="Friends Activity" />
          )}
        </div>
      </div>
    </div>
  );
}
