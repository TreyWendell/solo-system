"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { startOfDay } from "@/lib/utils";

export interface QuestHistoryItem {
  id: string;
  title: string;
  completedAt: Date;
  questDate: Date;
  xpReward: number;
  streakBonus: number;
  xpForStat: number;
  questStreak: number;
}

export interface StatQuestHistoryResult {
  quests: QuestHistoryItem[];
  statStreak: number;
  totalCompletions: number;
}

export async function getStatQuestHistory(
  statType: string
): Promise<StatQuestHistoryResult | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;

  // Fetch all completed quests for this user
  const allCompleted = await db.dailyQuest.findMany({
    where: { userId, completedAt: { not: null } },
    orderBy: { completedAt: "desc" },
    take: 300,
  });

  // Filter to quests that award XP to this specific stat
  const statQuests = allCompleted.filter((q) => {
    const rewards = q.statRewards as Record<string, number>;
    return typeof rewards[statType] === "number" && rewards[statType] > 0;
  });

  // ── Stat-level streak ──────────────────────────────────────────────────────
  // Unique days on which at least one quest for this stat was completed
  const daySet = new Set(
    statQuests.map((q) => startOfDay(q.completedAt!).getTime())
  );
  const sortedDays = Array.from(daySet).sort((a, b) => b - a);

  let statStreak = 0;
  const todayTs = startOfDay().getTime();
  for (let i = 0; i < sortedDays.length; i++) {
    const expected = todayTs - i * 86_400_000;
    if (sortedDays[i] === expected) {
      statStreak++;
    } else {
      break;
    }
  }

  // ── Per-quest-title streak ─────────────────────────────────────────────────
  // For each unique title, compute how many consecutive days it was completed
  const byTitle = new Map<string, number[]>();
  for (const q of statQuests) {
    const ts = startOfDay(q.completedAt!).getTime();
    if (!byTitle.has(q.title)) byTitle.set(q.title, []);
    byTitle.get(q.title)!.push(ts);
  }

  const questStreakMap = new Map<string, number>();
  for (const [title, days] of byTitle) {
    const sorted = [...new Set(days)].sort((a, b) => b - a);
    let streak = 0;
    for (let i = 0; i < sorted.length; i++) {
      const expected = todayTs - i * 86_400_000;
      if (sorted[i] === expected) streak++;
      else break;
    }
    questStreakMap.set(title, streak);
  }

  const quests: QuestHistoryItem[] = statQuests.map((q) => ({
    id: q.id,
    title: q.title,
    completedAt: q.completedAt!,
    questDate: q.questDate,
    xpReward: q.xpReward,
    streakBonus: q.streakBonus,
    xpForStat: (q.statRewards as Record<string, number>)[statType],
    questStreak: questStreakMap.get(q.title) ?? 0,
  }));

  return { quests, statStreak, totalCompletions: quests.length };
}
