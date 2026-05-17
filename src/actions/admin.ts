"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { levelFromXp, xpForLevel } from "@/lib/constants";
import type { QuestCategory, Difficulty, StatType, Prisma } from "@prisma/client";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  });
  if (!user?.isAdmin) return null;
  return session.user.id;
}

export interface TemplateFormData {
  title: string;
  description: string;
  category: QuestCategory;
  difficulty: Difficulty;
  xpReward: number;
  statRewards: Record<string, number>;
  isSystem: boolean;
  isActive: boolean;
}

export async function createQuestTemplate(data: TemplateFormData) {
  const userId = await requireAdmin();
  if (!userId) return { success: false as const, error: "Unauthorized" };

  await db.questTemplate.create({
    data: {
      title: data.title,
      description: data.description || null,
      category: data.category,
      difficulty: data.difficulty,
      xpReward: data.xpReward,
      statRewards: data.statRewards as Prisma.InputJsonValue,
      isSystem: data.isSystem,
      isActive: data.isActive,
      creatorId: userId,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/quests");
  return { success: true as const };
}

export async function updateQuestTemplate(id: string, data: TemplateFormData) {
  const userId = await requireAdmin();
  if (!userId) return { success: false as const, error: "Unauthorized" };

  await db.questTemplate.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description || null,
      category: data.category,
      difficulty: data.difficulty,
      xpReward: data.xpReward,
      statRewards: data.statRewards as Prisma.InputJsonValue,
      isSystem: data.isSystem,
      isActive: data.isActive,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/quests");
  return { success: true as const };
}

export async function deleteQuestTemplate(id: string) {
  const userId = await requireAdmin();
  if (!userId) return { success: false as const, error: "Unauthorized" };

  await db.questTemplate.delete({ where: { id } });

  revalidatePath("/admin");
  revalidatePath("/quests");
  return { success: true as const };
}

export async function grantStatXp(statType: StatType, amount: number, reason: string) {
  const userId = await requireAdmin();
  if (!userId) return { success: false as const, error: "Unauthorized" };

  const stat = await db.userStat.findUnique({
    where: { userId_stat: { userId, stat: statType } },
  });
  if (!stat) return { success: false as const, error: "Stat not found" };

  const newXp = Math.max(0, stat.xp + amount);
  const newLevel = levelFromXp(newXp);

  await db.userStat.update({
    where: { userId_stat: { userId, stat: statType } },
    data: { xp: newXp, level: newLevel, xpToNext: xpForLevel(newLevel + 1) },
  });

  await db.statHistory.create({
    data: {
      userStatId: stat.id,
      xpDelta: amount,
      reason: reason || "Manual grant",
    },
  });

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/stats");
  return { success: true as const };
}

export async function setUserAdmin(username: string, isAdmin: boolean) {
  const adminId = await requireAdmin();
  if (!adminId) return { success: false as const, error: "Unauthorized" };

  const target = await db.user.findUnique({
    where: { username },
    select: { id: true },
  });
  if (!target) return { success: false as const, error: "User not found" };

  await db.user.update({ where: { username }, data: { isAdmin } });

  revalidatePath("/admin");
  return { success: true as const };
}
