"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { completeQuestSchema } from "@/lib/validations";
import {
  xpForLevel,
  levelFromXp,
  rankFromLevel,
  streakBonus,
  STAT_META,
} from "@/lib/constants";
import { startOfDay, endOfDay, isSameDay } from "@/lib/utils";
import type { ActionResult } from "@/types";
import type { StatType } from "@prisma/client";

export async function completeQuest(
  questId: string,
  notes?: string
): Promise<ActionResult<{ xpGained: number; leveledUp: boolean; newLevel: number }>> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const parsed = completeQuestSchema.safeParse({ questId, notes });
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const userId = session.user.id;

  const quest = await db.dailyQuest.findFirst({
    where: { id: questId, userId, completedAt: null },
  });

  if (!quest) return { success: false, error: "Quest not found or already completed" };

  // Streak calculation
  const user = await db.user.findUniqueOrThrow({
    where: { id: userId },
    select: { currentStreak: true, longestStreak: true, lastActiveDate: true, totalXp: true, level: true, rank: true },
  });

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let newStreak = 1;
  if (user.lastActiveDate) {
    if (isSameDay(user.lastActiveDate, today)) {
      newStreak = user.currentStreak;
    } else if (isSameDay(user.lastActiveDate, yesterday)) {
      newStreak = user.currentStreak + 1;
    }
  }

  const bonus = streakBonus(newStreak);
  const streakXpBonus = Math.floor(quest.xpReward * bonus);
  const totalXpGained = quest.xpReward + streakXpBonus;

  // Update quest as completed
  await db.dailyQuest.update({
    where: { id: questId },
    data: { completedAt: new Date(), streakBonus: streakXpBonus, notes },
  });

  // Update user XP and streak
  const newTotalXp = user.totalXp + totalXpGained;
  const newLevel = levelFromXp(newTotalXp);
  const leveledUp = newLevel > user.level;
  const newRank = rankFromLevel(newLevel);
  const rankedUp = newRank !== user.rank;

  await db.user.update({
    where: { id: userId },
    data: {
      totalXp: { increment: totalXpGained },
      level: newLevel,
      rank: newRank,
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, user.longestStreak),
      lastActiveDate: today,
    },
  });

  // Update stat XP
  const statRewards = quest.statRewards as Record<string, number>;
  for (const [statKey, xpAmount] of Object.entries(statRewards)) {
    const stat = await db.userStat.findUnique({
      where: { userId_stat: { userId, stat: statKey as StatType } },
    });

    if (stat) {
      const newStatXp = stat.xp + xpAmount;
      const newStatLevel = levelFromXp(newStatXp);
      const nextLevelXp = xpForLevel(newStatLevel + 1);

      await db.userStat.update({
        where: { userId_stat: { userId, stat: statKey as StatType } },
        data: {
          xp: newStatXp,
          level: newStatLevel,
          xpToNext: nextLevelXp,
        },
      });

      await db.statHistory.create({
        data: {
          userStatId: stat.id,
          xpDelta: xpAmount,
          reason: `Quest: ${quest.title}`,
        },
      });
    }
  }

  // Log XP history
  await db.xpHistory.create({
    data: {
      userId,
      delta: totalXpGained,
      source: "QUEST_COMPLETE",
      metadata: { questId, title: quest.title, streakBonus: streakXpBonus },
    },
  });

  // Log activity
  await db.activityLog.create({
    data: {
      userId,
      type: "QUEST_COMPLETED",
      title: `completed "${quest.title}"`,
      metadata: { questId, xpGained: totalXpGained },
    },
  });

  if (leveledUp) {
    await db.activityLog.create({
      data: { userId, type: "LEVEL_UP", title: `reached Level ${newLevel}`, metadata: { level: newLevel } },
    });
    await db.notification.create({
      data: {
        userId,
        type: "LEVEL_UP",
        title: "Level Up!",
        body: `You've reached Level ${newLevel}!`,
        data: { level: newLevel },
      },
    });
  }

  if (rankedUp) {
    await db.activityLog.create({
      data: { userId, type: "RANK_UP", title: `achieved ${newRank} Rank`, metadata: { rank: newRank } },
    });
    await db.notification.create({
      data: {
        userId,
        type: "ACHIEVEMENT",
        title: "Rank Up!",
        body: `You've ascended to ${newRank} Rank!`,
        data: { rank: newRank },
      },
    });
  }

  // Streak milestone notifications
  if ([7, 14, 30, 60, 100].includes(newStreak)) {
    await db.notification.create({
      data: {
        userId,
        type: "STREAK_MILESTONE",
        title: `${newStreak}-Day Streak!`,
        body: `Impressive dedication, Hunter. Keep it up!`,
        data: { streak: newStreak },
      },
    });
  }

  // Check achievements
  await checkAchievements(userId, newStreak, newTotalXp);

  revalidatePath("/dashboard");
  revalidatePath("/quests");

  return {
    success: true,
    data: { xpGained: totalXpGained, leveledUp, newLevel },
  };
}

export async function uncompleteQuest(questId: string): Promise<ActionResult<{ xpRemoved: number }>> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const userId = session.user.id;

  const quest = await db.dailyQuest.findFirst({
    where: { id: questId, userId, completedAt: { not: null } },
  });

  if (!quest) return { success: false, error: "Quest not found or not completed" };

  const xpToRemove = quest.xpReward + quest.streakBonus;

  // Revert quest to incomplete
  await db.dailyQuest.update({
    where: { id: questId },
    data: { completedAt: null, streakBonus: 0, notes: null },
  });

  // Deduct XP from user
  const user = await db.user.findUniqueOrThrow({
    where: { id: userId },
    select: { totalXp: true },
  });

  const newTotalXp = Math.max(0, user.totalXp - xpToRemove);
  const newLevel = levelFromXp(newTotalXp);
  const newRank = rankFromLevel(newLevel);

  await db.user.update({
    where: { id: userId },
    data: { totalXp: newTotalXp, level: newLevel, rank: newRank },
  });

  // Revert stat XP
  const statRewards = quest.statRewards as Record<string, number>;
  for (const [statKey, xpAmount] of Object.entries(statRewards)) {
    const stat = await db.userStat.findUnique({
      where: { userId_stat: { userId, stat: statKey as StatType } },
    });
    if (!stat) continue;

    const newStatXp = Math.max(0, stat.xp - xpAmount);
    const newStatLevel = levelFromXp(newStatXp);

    await db.userStat.update({
      where: { userId_stat: { userId, stat: statKey as StatType } },
      data: { xp: newStatXp, level: newStatLevel, xpToNext: xpForLevel(newStatLevel + 1) },
    });

    await db.statHistory.create({
      data: {
        userStatId: stat.id,
        xpDelta: -xpAmount,
        reason: `Undid quest: ${quest.title}`,
      },
    });
  }

  // Remove the completion activity entry
  await db.activityLog.deleteMany({
    where: {
      userId,
      type: "QUEST_COMPLETED",
      metadata: { path: ["questId"], equals: questId },
    },
  });

  // Log the reversal
  await db.xpHistory.create({
    data: {
      userId,
      delta: -xpToRemove,
      source: "QUEST_COMPLETE",
      metadata: { questId, title: quest.title, reason: "quest_uncompleted" },
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/quests");

  return { success: true, data: { xpRemoved: xpToRemove } };
}

export async function assignTodayQuests(userId: string) {
  const today = startOfDay();

  const existing = await db.dailyQuest.count({
    where: { userId, questDate: { gte: today, lte: endOfDay() } },
  });

  if (existing > 0) return;

  const templates = await db.questTemplate.findMany({
    where: { isSystem: true, isActive: true },
    take: 8,
  });

  if (!templates.length) return;

  await db.dailyQuest.createMany({
    data: templates.map((t: { id: string; title: string; description: string | null; category: import("@prisma/client").QuestCategory; difficulty: import("@prisma/client").Difficulty; xpReward: number; statRewards: import("@prisma/client").Prisma.JsonValue }) => ({
      userId,
      templateId: t.id,
      title: t.title,
      description: t.description,
      category: t.category,
      difficulty: t.difficulty,
      xpReward: t.xpReward,
      statRewards: t.statRewards as import("@prisma/client").Prisma.InputJsonValue,
      questDate: today,
    })),
  });

  revalidatePath("/quests");
  revalidatePath("/dashboard");
}

async function checkAchievements(userId: string, streak: number, totalXp: number) {
  const achievements = await db.achievement.findMany();
  const existing = await db.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true },
  });
  const unlockedIds = new Set(existing.map((a: { achievementId: string }) => a.achievementId));

  const toUnlock: string[] = [];

  for (const ach of achievements) {
    if (unlockedIds.has(ach.id)) continue;

    const unlock =
      (ach.key === "first_quest" && totalXp >= 50) ||
      (ach.key === "streak_7" && streak >= 7) ||
      (ach.key === "streak_30" && streak >= 30) ||
      (ach.key === "xp_1000" && totalXp >= 1000) ||
      (ach.key === "xp_10000" && totalXp >= 10000);

    if (unlock) toUnlock.push(ach.id);
  }

  for (const achievementId of toUnlock) {
    await db.userAchievement.create({ data: { userId, achievementId } });
    await db.activityLog.create({
      data: { userId, type: "ACHIEVEMENT_UNLOCKED", title: "unlocked an achievement", metadata: { achievementId } },
    });
  }
}
