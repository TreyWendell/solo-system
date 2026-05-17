import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { startOfDay, endOfDay } from "@/lib/utils";
import { assignTodayQuests } from "@/actions/quests";
import { QuestList } from "@/components/quests/quest-list";
import { CATEGORY_META } from "@/lib/constants";
import type { DailyQuest, QuestCategory } from "@prisma/client";

export const metadata: Metadata = { title: "Daily Quests" };

export default async function QuestsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  await assignTodayQuests(userId);

  const today = startOfDay();
  const quests: DailyQuest[] = await db.dailyQuest.findMany({
    where: { userId, questDate: { gte: today, lte: endOfDay() } },
    orderBy: [{ completedAt: "asc" }, { difficulty: "desc" }],
  });

  const completedCount = quests.filter((q) => q.completedAt !== null).length;
  const totalXpAvailable = quests.reduce((sum, q) => sum + q.xpReward, 0);
  const earnedXp = quests
    .filter((q) => q.completedAt !== null)
    .reduce((sum, q) => sum + q.xpReward + q.streakBonus, 0);

  const byCategory = quests.reduce<Record<string, DailyQuest[]>>((acc, q) => {
    const cat = q.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(q);
    return acc;
  }, {});

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#e2e8f0]">Daily Quests</h1>
        <p className="text-sm text-[#64748b] mt-1">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long", month: "long", day: "numeric",
          })}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Completed", value: `${completedCount}/${quests.length}`, color: "#10b981" },
          { label: "XP Earned", value: `${earnedXp.toLocaleString()}`, color: "#00d4ff" },
          { label: "XP Available", value: `${totalXpAvailable.toLocaleString()}`, color: "#f59e0b" },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass rounded-xl p-4 border border-[#1e2d4a] text-center">
            <div className="text-2xl font-black font-mono" style={{ color }}>{value}</div>
            <div className="text-xs text-[#64748b] mt-1 tracking-wider uppercase">{label}</div>
          </div>
        ))}
      </div>

      {Object.entries(byCategory).map(([cat, catQuests]) => {
        const meta = CATEGORY_META[cat as QuestCategory];
        return (
          <div key={cat}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">{meta.icon}</span>
              <h3 className="text-sm font-semibold tracking-[0.1em] uppercase" style={{ color: meta.color }}>
                {meta.label}
              </h3>
              <span className="text-xs text-[#64748b]">
                {catQuests.filter((q) => q.completedAt !== null).length}/{catQuests.length}
              </span>
            </div>
            <QuestList quests={catQuests} />
          </div>
        );
      })}
    </div>
  );
}
