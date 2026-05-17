import { Rank, StatType, QuestCategory, Difficulty } from "@prisma/client";

// ─── XP / Level Formulas ──────────────────────────────────────────────────────

export const XP_PER_LEVEL = 100;

export function xpForLevel(level: number): number {
  return Math.floor(XP_PER_LEVEL * Math.pow(Math.max(0, level - 1), 1.5));
}

export function levelFromXp(xp: number): number {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level++;
  return level;
}

export function xpToNextLevel(xp: number): number {
  const level = levelFromXp(xp);
  const current = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return next - (xp - current);
}

export function levelProgress(xp: number): number {
  const level = levelFromXp(xp);
  const current = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return ((xp - current) / (next - current)) * 100;
}

// ─── Rank Thresholds (global level) ──────────────────────────────────────────

export const RANK_THRESHOLDS: Record<Rank, number> = {
  E: 0,
  D: 10,
  C: 25,
  B: 50,
  A: 100,
  S: 200,
};

export function rankFromLevel(level: number): Rank {
  if (level >= RANK_THRESHOLDS.S) return "S";
  if (level >= RANK_THRESHOLDS.A) return "A";
  if (level >= RANK_THRESHOLDS.B) return "B";
  if (level >= RANK_THRESHOLDS.C) return "C";
  if (level >= RANK_THRESHOLDS.D) return "D";
  return "E";
}

export const RANK_COLORS: Record<Rank, string> = {
  E: "#9ca3af",
  D: "#60a5fa",
  C: "#34d399",
  B: "#a78bfa",
  A: "#f59e0b",
  S: "#f43f5e",
};

export const RANK_LABELS: Record<Rank, string> = {
  E: "E Rank",
  D: "D Rank",
  C: "C Rank",
  B: "B Rank",
  A: "A Rank",
  S: "S Rank",
};

// ─── Stat Metadata ────────────────────────────────────────────────────────────

export const STAT_META: Record<
  StatType,
  { label: string; icon: string; color: string; description: string }
> = {
  STRENGTH: {
    label: "Strength",
    icon: "💪",
    color: "#ef4444",
    description: "Physical power and endurance",
  },
  INTELLIGENCE: {
    label: "Intelligence",
    icon: "🧠",
    color: "#3b82f6",
    description: "Cognitive ability and learning",
  },
  STAMINA: {
    label: "Stamina",
    icon: "⚡",
    color: "#f59e0b",
    description: "Cardiovascular fitness and energy",
  },
  DISCIPLINE: {
    label: "Discipline",
    icon: "🎯",
    color: "#8b5cf6",
    description: "Consistency and habit adherence",
  },
  AGILITY: {
    label: "Agility",
    icon: "🏃",
    color: "#10b981",
    description: "Speed, flexibility, and coordination",
  },
  CHARISMA: {
    label: "Charisma",
    icon: "✨",
    color: "#ec4899",
    description: "Social skills and communication",
  },
  CREATIVITY: {
    label: "Creativity",
    icon: "🎨",
    color: "#f97316",
    description: "Creative expression and innovation",
  },
};

// ─── Quest Metadata ───────────────────────────────────────────────────────────

export const CATEGORY_META: Record<
  QuestCategory,
  { label: string; icon: string; color: string }
> = {
  FITNESS: { label: "Fitness", icon: "🏋️", color: "#ef4444" },
  MIND: { label: "Mind", icon: "🧘", color: "#3b82f6" },
  HEALTH: { label: "Health", icon: "❤️", color: "#10b981" },
  SOCIAL: { label: "Social", icon: "🤝", color: "#ec4899" },
  CREATIVITY: { label: "Creativity", icon: "🎨", color: "#f97316" },
  DISCIPLINE: { label: "Discipline", icon: "⚔️", color: "#8b5cf6" },
  LEARNING: { label: "Learning", icon: "📚", color: "#06b6d4" },
};

export const DIFFICULTY_META: Record<
  Difficulty,
  { label: string; xpMultiplier: number; color: string }
> = {
  EASY: { label: "Easy", xpMultiplier: 0.75, color: "#10b981" },
  NORMAL: { label: "Normal", xpMultiplier: 1, color: "#60a5fa" },
  HARD: { label: "Hard", xpMultiplier: 1.5, color: "#f59e0b" },
  EPIC: { label: "Epic", xpMultiplier: 2.5, color: "#f43f5e" },
};

// ─── Decay Config ─────────────────────────────────────────────────────────────

export const DECAY_CONFIG = {
  gracePeriodDays: 2,
  decayPercentPerDay: 0.02,
  maxDecayPercent: 0.15,
  disciplineDecayTriggerDays: 1,
};

// ─── Streak Bonuses ───────────────────────────────────────────────────────────

export function streakBonus(streak: number): number {
  if (streak >= 30) return 0.5;
  if (streak >= 14) return 0.3;
  if (streak >= 7) return 0.2;
  if (streak >= 3) return 0.1;
  return 0;
}

// ─── Motivational Messages ────────────────────────────────────────────────────

export const SYSTEM_MESSAGES = [
  "Your potential is limitless, Hunter.",
  "The gap between who you are and who you want to be is closed by your daily actions.",
  "Every quest completed brings you closer to your true power.",
  "The System acknowledges your dedication.",
  "Weakness is not failure. Stopping is failure.",
  "Even S-Rank hunters started at E-Rank.",
  "The path to greatness is paved with consistent effort.",
  "Your future self is watching. Don't disappoint them.",
  "Level up or fall behind. The choice is yours.",
  "Discipline is the bridge between goals and accomplishment.",
];
