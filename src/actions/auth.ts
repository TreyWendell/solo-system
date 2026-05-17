"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import { registerSchema, loginSchema } from "@/lib/validations";
import type { ActionResult } from "@/types";
import { StatType } from "@prisma/client";

export async function registerUser(formData: FormData): Promise<ActionResult<{ username: string }>> {
  const raw = {
    email: formData.get("email"),
    username: formData.get("username"),
    password: formData.get("password"),
    displayName: formData.get("displayName") || undefined,
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { email, username, password, displayName } = parsed.data;

  const existing = await db.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing) {
    return {
      success: false,
      error: existing.email === email ? "Email already in use" : "Username already taken",
    };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await db.user.create({
    data: {
      email,
      username,
      passwordHash,
      displayName: displayName || username,
    },
  });

  // Initialize all stats
  await db.userStat.createMany({
    data: Object.values(StatType).map((stat) => ({
      userId: user.id,
      stat,
      level: 1,
      xp: 0,
      xpToNext: 100,
    })),
  });

  // Assign today's quests from system templates
  await assignDailyQuests(user.id);

  return { success: true, data: { username: user.username } };
}

export async function loginUser(formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Invalid email or password" };
  }
}

export async function logoutUser() {
  await signOut({ redirect: false });
  redirect("/login");
}

async function assignDailyQuests(userId: string) {
  const templates = await db.questTemplate.findMany({
    where: { isSystem: true, isActive: true },
    take: 6,
    orderBy: { createdAt: "asc" },
  });

  if (!templates.length) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

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
}
