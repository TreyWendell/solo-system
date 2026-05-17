"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Swords } from "lucide-react";
import { QuestCard } from "@/components/quests/quest-card";
import { LevelUpOverlay } from "@/components/dashboard/level-up-overlay";
import { rankFromLevel } from "@/lib/constants";
import type { DailyQuest } from "@prisma/client";

interface QuestListProps {
  quests: DailyQuest[];
  compact?: boolean;
}

export function QuestList({ quests, compact }: QuestListProps) {
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState({ level: 1, rank: undefined as ReturnType<typeof rankFromLevel> | undefined });

  const handleComplete = useCallback((_xp: number, leveledUp: boolean, newLevel: number) => {
    if (leveledUp) {
      setLevelUpData({ level: newLevel, rank: rankFromLevel(newLevel) });
      setShowLevelUp(true);
    }
  }, []);

  if (!quests.length) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <Swords className="h-10 w-10 text-[#1e2d4a] mb-3" />
        <p className="text-sm text-[#64748b]">No quests assigned yet</p>
        {!compact && (
          <p className="text-xs text-[#374151] mt-1">
            Quests reset daily at midnight
          </p>
        )}
      </div>
    );
  }

  const pending = quests.filter((q) => !q.completedAt);
  const completed = quests.filter((q) => !!q.completedAt);

  if (compact) {
    return (
      <>
        <LevelUpOverlay
          show={showLevelUp}
          level={levelUpData.level}
          rank={levelUpData.rank}
          onClose={() => setShowLevelUp(false)}
        />
        <div className="space-y-2">
          {[...pending, ...completed].slice(0, 5).map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              compact
              onComplete={handleComplete}
            />
          ))}
          {quests.length > 5 && (
            <Link
              href="/quests"
              className="block text-center text-xs text-[#00d4ff] hover:underline pt-2"
            >
              View all {quests.length} quests →
            </Link>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <LevelUpOverlay
        show={showLevelUp}
        level={levelUpData.level}
        rank={levelUpData.rank}
        onClose={() => setShowLevelUp(false)}
      />

      <div className="space-y-6">
        {pending.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#64748b]">
                Pending ({pending.length})
              </h4>
            </div>
            <motion.div className="space-y-3">
              {pending.map((quest, i) => (
                <motion.div
                  key={quest.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <QuestCard quest={quest} onComplete={handleComplete} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

        {completed.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#64748b] mb-3">
              Completed ({completed.length})
            </h4>
            <div className="space-y-3">
              {completed.map((quest) => (
                <QuestCard key={quest.id} quest={quest} onComplete={handleComplete} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
