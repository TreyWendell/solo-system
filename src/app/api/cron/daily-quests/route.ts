import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { startOfDay } from "@/lib/utils";

// Runs daily at midnight to assign quests to all active users
// Configure in vercel.json: { "crons": [{ "path": "/api/cron/daily-quests", "schedule": "0 0 * * *" }] }

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = startOfDay();
  const templates = await db.questTemplate.findMany({
    where: { isSystem: true, isActive: true },
  });

  if (!templates.length) {
    return NextResponse.json({ success: true, message: "No templates found" });
  }

  // Get all users who have been active in the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const activeUsers = await db.user.findMany({
    where: {
      OR: [
        { lastActiveDate: { gte: thirtyDaysAgo } },
        { createdAt: { gte: thirtyDaysAgo } },
      ],
    },
    select: { id: true },
  });

  let assigned = 0;

  for (const user of activeUsers) {
    const existing = await db.dailyQuest.count({
      where: { userId: user.id, questDate: today },
    });

    if (existing > 0) continue;

    await db.dailyQuest.createMany({
      data: templates.map((t: { id: string; title: string; description: string | null; category: import("@prisma/client").QuestCategory; difficulty: import("@prisma/client").Difficulty; xpReward: number; statRewards: import("@prisma/client").Prisma.JsonValue }) => ({
        userId: user.id,
        templateId: t.id,
        title: t.title,
        description: t.description,
        category: t.category,
        difficulty: t.difficulty,
        xpReward: t.xpReward,
        statRewards: t.statRewards as import("@prisma/client").Prisma.InputJsonValue,
        questDate: today,
      })),
      skipDuplicates: true,
    });

    assigned++;
  }

  return NextResponse.json({
    success: true,
    usersAssigned: assigned,
    questsPerUser: templates.length,
    timestamp: new Date().toISOString(),
  });
}
