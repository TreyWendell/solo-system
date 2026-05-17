"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORY_META, DIFFICULTY_META, STAT_META } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toaster";
import { completeQuest, uncompleteQuest } from "@/actions/quests";
import type { DailyQuest, QuestCategory, Difficulty, StatType } from "@prisma/client";

interface QuestCardProps {
  quest: DailyQuest;
  compact?: boolean;
  onComplete?: (xpGained: number, leveledUp: boolean, newLevel: number) => void;
}

export function QuestCard({ quest, compact, onComplete }: QuestCardProps) {
  const router = useRouter();
  const [completing, setCompleting] = useState(false);
  const [uncompleting, setUncompleting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const isCompleted = !!quest.completedAt;

  const catMeta = CATEGORY_META[quest.category as QuestCategory];
  const diffMeta = DIFFICULTY_META[quest.difficulty as Difficulty];
  const statRewards = quest.statRewards as Record<string, number>;

  async function handleComplete() {
    if (isCompleted || completing) return;
    setCompleting(true);

    try {
      const result = await completeQuest(quest.id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      const { xpGained, leveledUp, newLevel } = result.data;

      toast.success(`+${xpGained} XP${quest.streakBonus > 0 ? ` (streak bonus!)` : ""}`, {
        description: quest.title,
      });

      onComplete?.(xpGained, leveledUp, newLevel);
      router.refresh();
    } catch {
      toast.error("Failed to complete quest");
    } finally {
      setCompleting(false);
    }
  }

  async function handleUncomplete() {
    if (!isCompleted || uncompleting) return;
    setUncompleting(true);

    try {
      const result = await uncompleteQuest(quest.id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.info(`-${result.data.xpRemoved} XP`, { description: quest.title });
      router.refresh();
    } catch {
      toast.error("Failed to undo quest");
    } finally {
      setUncompleting(false);
    }
  }

  if (compact) {
    return (
      <motion.div
        layout
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg border transition-all duration-300",
          isCompleted
            ? "bg-[#10b981]/5 border-[#10b981]/20 opacity-60"
            : "bg-[#0a0f1e] border-[#1e2d4a] hover:border-[#1e2d4a]/80"
        )}
      >
        <button
          onClick={isCompleted ? handleUncomplete : handleComplete}
          disabled={completing || uncompleting}
          className="flex-shrink-0 group/check"
          title={isCompleted ? "Mark incomplete" : "Mark complete"}
        >
          {completing || uncompleting ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              className="h-5 w-5 rounded-full border-2 border-[#00d4ff] border-t-transparent"
            />
          ) : isCompleted ? (
            <CheckCircle2 className="h-5 w-5 text-[#10b981] group-hover/check:text-[#64748b] transition-colors" />
          ) : (
            <Circle className="h-5 w-5 text-[#374151] hover:text-[#00d4ff] transition-colors" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-sm font-medium truncate",
              isCompleted ? "line-through text-[#64748b]" : "text-[#e2e8f0]"
            )}
          >
            {quest.title}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs" title={catMeta.label}>{catMeta.icon}</span>
          <span className="text-xs font-mono text-[#00d4ff]">+{quest.xpReward}xp</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl border transition-all duration-300 overflow-hidden",
        isCompleted
          ? "bg-[#10b981]/5 border-[#10b981]/20"
          : "glass border-[#1e2d4a] hover:border-[#1e2d4a]/80 glass-hover"
      )}
    >
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Complete / Uncomplete button */}
          <button
            onClick={isCompleted ? handleUncomplete : handleComplete}
            disabled={completing || uncompleting}
            className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110 group/check"
            title={isCompleted ? "Mark incomplete" : "Mark complete"}
          >
            <AnimatePresence mode="wait">
              {completing || uncompleting ? (
                <motion.div
                  key="loading"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  className="h-6 w-6 rounded-full border-2 border-[#00d4ff] border-t-transparent"
                />
              ) : isCompleted ? (
                <motion.div
                  key="done"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <CheckCircle2 className="h-6 w-6 text-[#10b981] group-hover/check:text-[#64748b] transition-colors" />
                </motion.div>
              ) : (
                <motion.div key="idle">
                  <Circle className="h-6 w-6 text-[#374151] hover:text-[#00d4ff] transition-colors" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {/* Quest info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge variant="outline" className="text-[10px] gap-1">
                <span>{catMeta.icon}</span>
                {catMeta.label}
              </Badge>
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded border"
                style={{
                  color: diffMeta.color,
                  borderColor: `${diffMeta.color}33`,
                  backgroundColor: `${diffMeta.color}11`,
                }}
              >
                {diffMeta.label}
              </span>
            </div>

            <h4
              className={cn(
                "text-base font-semibold",
                isCompleted ? "line-through text-[#64748b]" : "text-[#e2e8f0]"
              )}
            >
              {quest.title}
            </h4>

            {quest.description && (
              <p className="text-sm text-[#64748b] mt-1">{quest.description}</p>
            )}
          </div>

          {/* XP reward */}
          <div className="flex-shrink-0 text-right">
            <div className="flex items-center gap-1 text-[#00d4ff]">
              <Zap className="h-3.5 w-3.5" />
              <span className="text-sm font-bold font-mono">+{quest.xpReward}</span>
            </div>
            <span className="text-[10px] text-[#64748b]">XP</span>
          </div>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="mt-3 flex items-center gap-1 text-xs text-[#64748b] hover:text-[#e2e8f0] transition-colors"
        >
          {showDetails ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
          Stat rewards
        </button>
      </div>

      {/* Expandable stat rewards */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-0 border-t border-[#1e2d4a] mt-0">
              <p className="text-xs text-[#64748b] mb-2 pt-3">Stats affected:</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(statRewards).map(([statKey, xpAmt]) => {
                  const meta = STAT_META[statKey as StatType];
                  if (!meta) return null;
                  return (
                    <span
                      key={statKey}
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded border"
                      style={{
                        color: meta.color,
                        borderColor: `${meta.color}33`,
                        backgroundColor: `${meta.color}11`,
                      }}
                    >
                      {meta.icon} {meta.label} +{xpAmt}
                    </span>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion flash overlay */}
      <AnimatePresence>
        {completing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#10b981]/10 rounded-xl pointer-events-none"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
