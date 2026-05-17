"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getAiClient } from "@/lib/ai";
import { startOfDay } from "@/lib/utils";
import type { ActionResult } from "@/types";
import type { QuestCategory, Difficulty } from "@prisma/client";

const QUEST_SYSTEM_PROMPT = `You are the ASCEND System AI, powering an RPG habit tracker inspired by Solo Leveling. Generate a single personalized daily quest for a Hunter based on their current stats.

Return ONLY valid JSON with no markdown fences or explanation:
{
  "title": "Quest title (imperative verb, under 55 characters)",
  "description": "Specific actionable description (1-2 sentences, under 150 characters)",
  "category": "FITNESS|MIND|HEALTH|SOCIAL|CREATIVITY|DISCIPLINE|LEARNING",
  "difficulty": "EASY|NORMAL|HARD|EPIC",
  "xpReward": 25,
  "statRewards": { "STRENGTH": 20 }
}

Rules:
- xpReward: EASY=25, NORMAL=50, HARD=75, EPIC=125
- statRewards: include 1-3 stats with values between 5 and 40
- Valid stats: STRENGTH, INTELLIGENCE, STAMINA, DISCIPLINE, AGILITY, CHARISMA, CREATIVITY
- Focus on the Hunter's weaker stats to create balanced growth
- Make quests specific and completable within one day`;

const COACH_SYSTEM_PROMPT = `You are ARIA (Ascend Ranking Intelligence Assistant), the AI analysis core for a Solo Leveling-inspired RPG habit tracker. You assess Hunter progress and deliver sharp, personalized coaching.

Write exactly 2-3 sentences. Use confident, slightly dramatic RPG language. Reference their actual stat levels and streak. Never give generic advice — make it specific to this Hunter's situation. End with a direct call to action.`;

const QuestOutputSchema = z.object({
  title: z.string().max(100),
  description: z.string().max(300).optional(),
  category: z.enum(["FITNESS", "MIND", "HEALTH", "SOCIAL", "CREATIVITY", "DISCIPLINE", "LEARNING"]),
  difficulty: z.enum(["EASY", "NORMAL", "HARD", "EPIC"]),
  xpReward: z.number().int().min(10).max(200),
  statRewards: z.record(z.string(), z.number().int().min(1).max(100)),
});

export async function generateAiQuest(): Promise<
  ActionResult<{ id: string; title: string }>
> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };
  if (!process.env.ANTHROPIC_API_KEY) return { success: false, error: "AI features not configured" };

  const userId = session.user.id;

  const [user, stats] = await Promise.all([
    db.user.findUniqueOrThrow({
      where: { id: userId },
      select: { level: true, rank: true, currentStreak: true },
    }),
    db.userStat.findMany({ where: { userId }, orderBy: { xp: "asc" } }),
  ]);

  const statsContext = stats.map((s) => `${s.stat}: Lv.${s.level} (${s.xp} XP)`).join(", ");

  const client = getAiClient();
  const response = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 300,
    system: [
      {
        type: "text",
        text: QUEST_SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: `Generate a personalized quest for this Hunter:
Rank: ${user.rank} | Level: ${user.level} | Streak: ${user.currentStreak} days
Stats (weakest first): ${statsContext}

Target the weakest stats. Return only the JSON object.`,
      },
    ],
  });

  const raw = response.content[0].type === "text" ? response.content[0].text : "";

  let parsed;
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");
    parsed = QuestOutputSchema.parse(JSON.parse(jsonMatch[0]));
  } catch {
    return { success: false, error: "AI returned an unexpected format — try again" };
  }

  const quest = await db.dailyQuest.create({
    data: {
      userId,
      title: parsed.title,
      description: parsed.description ?? null,
      category: parsed.category as QuestCategory,
      difficulty: parsed.difficulty as Difficulty,
      xpReward: parsed.xpReward,
      statRewards: parsed.statRewards,
      questDate: startOfDay(),
    },
  });

  revalidatePath("/quests");
  revalidatePath("/dashboard");

  return { success: true, data: { id: quest.id, title: quest.title } };
}

export async function getProgressCoaching(userId: string): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return "ARIA is offline. Add ANTHROPIC_API_KEY to enable AI coaching.";
  }

  const [user, stats] = await Promise.all([
    db.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        displayName: true, username: true,
        level: true, rank: true,
        currentStreak: true, longestStreak: true, totalXp: true,
      },
    }),
    db.userStat.findMany({ where: { userId }, orderBy: { xp: "asc" } }),
  ]);

  const weakest = stats[0];
  const strongest = stats[stats.length - 1];
  const statsLine = stats.map((s) => `${s.stat} Lv.${s.level}`).join(" | ");

  const client = getAiClient();

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 200,
      system: [
        {
          type: "text",
          text: COACH_SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: `Hunter: ${user.displayName ?? user.username}
Rank ${user.rank} | Level ${user.level} | ${user.totalXp.toLocaleString()} total XP
Streak: ${user.currentStreak} days (personal best: ${user.longestStreak} days)
Stats: ${statsLine}
Weakest: ${weakest?.stat} Lv.${weakest?.level} | Strongest: ${strongest?.stat} Lv.${strongest?.level}

Deliver your analysis.`,
        },
      ],
    });

    return response.content[0].type === "text"
      ? response.content[0].text
      : "Analysis unavailable.";
  } catch {
    return "ARIA is temporarily offline. Check back soon, Hunter.";
  }
}
