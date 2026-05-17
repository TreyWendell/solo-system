import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { STAT_META, xpForLevel } from "@/lib/constants";
import { StatDetailCard } from "@/components/stats/stat-detail-card";
import { RadarChart } from "@/components/stats/radar-chart";
import type { StatType } from "@/types";

export const metadata: Metadata = { title: "Stats" };

export default async function StatsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const stats = await db.userStat.findMany({
    where: { userId },
    include: {
      history: {
        orderBy: { recordedAt: "desc" },
        take: 20,
      },
    },
    orderBy: { stat: "asc" },
  });

  const radarData = stats.map((s: import("@prisma/client").UserStat) => ({
    subject: STAT_META[s.stat as StatType].label,
    value: s.level,
    fullMark: 50,
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-[#e2e8f0]">Core Stats</h1>
        <p className="text-sm text-[#64748b] mt-1">
          Your attributes, shaped by daily action.
        </p>
      </div>

      {/* Radar overview */}
      <div className="glass rounded-xl p-6 border border-[#1e2d4a]">
        <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#64748b] mb-4">
          Attribute Overview
        </h3>
        <RadarChart data={radarData} />
      </div>

      {/* Individual stat cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {stats.map((stat: import("@prisma/client").UserStat & { history: import("@prisma/client").StatHistory[] }) => {
          const xpInLevel = stat.xp - xpForLevel(stat.level);
          const xpToNextLevel = xpForLevel(stat.level + 1) - xpForLevel(stat.level);
          return (
            <StatDetailCard
              key={stat.id}
              stat={stat}
              xpInLevel={xpInLevel}
              xpToNextLevel={xpToNextLevel}
            />
          );
        })}
      </div>
    </div>
  );
}
