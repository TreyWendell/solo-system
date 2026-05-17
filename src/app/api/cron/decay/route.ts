import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DECAY_CONFIG } from "@/lib/constants";

// Called by Vercel Cron or external scheduler
// Configure in vercel.json: { "crons": [{ "path": "/api/cron/decay", "schedule": "0 3 * * *" }] }

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const graceCutoff = new Date(now);
  graceCutoff.setDate(graceCutoff.getDate() - DECAY_CONFIG.gracePeriodDays);

  // Find users inactive beyond grace period
  const inactiveUsers = await db.user.findMany({
    where: {
      OR: [
        { lastActiveDate: { lt: graceCutoff } },
        { lastActiveDate: null },
      ],
    },
    select: { id: true, currentStreak: true, lastActiveDate: true },
    take: 500,
  });

  let decayedCount = 0;

  for (const user of inactiveUsers) {
    const daysSinceActive = user.lastActiveDate
      ? Math.floor((now.getTime() - user.lastActiveDate.getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    const daysOverGrace = Math.max(0, daysSinceActive - DECAY_CONFIG.gracePeriodDays);
    if (daysOverGrace === 0) continue;

    const decayFactor = Math.min(
      DECAY_CONFIG.maxDecayPercent,
      daysOverGrace * DECAY_CONFIG.decayPercentPerDay
    );

    // Decay DISCIPLINE and other stats based on inactivity
    const stats = await db.userStat.findMany({ where: { userId: user.id } });

    for (const stat of stats) {
      if (stat.xp === 0) continue;
      const decayAmount = Math.floor(stat.xp * decayFactor);
      if (decayAmount < 1) continue;

      await db.userStat.update({
        where: { id: stat.id },
        data: { xp: { decrement: decayAmount } },
      });

      await db.statHistory.create({
        data: {
          userStatId: stat.id,
          xpDelta: -decayAmount,
          reason: "Inactivity decay",
        },
      });
    }

    // Break streak
    if (user.currentStreak > 0) {
      await db.user.update({
        where: { id: user.id },
        data: { currentStreak: 0 },
      });
    }

    // Decay warning notification
    await db.notification.create({
      data: {
        userId: user.id,
        type: "DECAY_WARNING",
        title: "Stat Decay Active",
        body: `Your stats are decaying due to inactivity. Complete quests to stop the decay!`,
      },
    });

    decayedCount++;
  }

  return NextResponse.json({
    success: true,
    processed: inactiveUsers.length,
    decayed: decayedCount,
    timestamp: now.toISOString(),
  });
}
