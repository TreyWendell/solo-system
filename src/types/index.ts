import type {
  User,
  UserStat,
  DailyQuest,
  Achievement,
  UserAchievement,
  Friendship,
  ActivityLog,
  Notification,
  Rank,
  StatType,
  QuestCategory,
  Difficulty,
  FriendshipStatus,
} from "@prisma/client";

// ─── Re-exports ───────────────────────────────────────────────────────────────

export type {
  Rank,
  StatType,
  QuestCategory,
  Difficulty,
  FriendshipStatus,
};

// ─── Enriched Types ───────────────────────────────────────────────────────────

export type PublicUser = Pick<
  User,
  | "id"
  | "username"
  | "displayName"
  | "avatarUrl"
  | "level"
  | "totalXp"
  | "rank"
  | "currentStreak"
  | "longestStreak"
  | "createdAt"
  | "bio"
  | "isPublic"
>;

export type UserWithStats = PublicUser & {
  stats: UserStat[];
};

export type DailyQuestWithTemplate = DailyQuest & {
  completed: boolean;
};

export type UserAchievementWithDetails = UserAchievement & {
  achievement: Achievement;
};

export type FriendshipWithUser = Friendship & {
  initiator: PublicUser;
  receiver: PublicUser;
};

// ─── Dashboard Types ──────────────────────────────────────────────────────────

export interface DashboardData {
  user: PublicUser;
  stats: UserStat[];
  todayQuests: DailyQuest[];
  recentActivity: ActivityLog[];
  unreadNotifications: number;
  weeklyXp: number[];
  friendsActivity: Array<ActivityLog & { user: PublicUser }>;
}

// ─── Server Action Results ────────────────────────────────────────────────────

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
