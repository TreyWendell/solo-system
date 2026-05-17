"use client";

import { motion } from "framer-motion";
import { formatRelative } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import type { ActivityType } from "@prisma/client";
import type { PublicUser } from "@/types";

const ACTIVITY_ICONS: Record<ActivityType, string> = {
  QUEST_COMPLETED: "⚔️",
  LEVEL_UP: "⬆️",
  ACHIEVEMENT_UNLOCKED: "🏆",
  STREAK_MILESTONE: "🔥",
  FRIEND_ADDED: "🤝",
  RANK_UP: "💠",
  STAT_LEVEL_UP: "📈",
};

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  createdAt: Date;
  user: PublicUser;
}

interface ActivityFeedProps {
  items: ActivityItem[];
  showUser?: boolean;
  title?: string;
}

export function ActivityFeed({ items, showUser = true, title = "Activity Feed" }: ActivityFeedProps) {
  if (!items.length) {
    return (
      <div className="glass rounded-xl p-5 border border-[#1e2d4a]">
        <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#64748b] mb-4">
          {title}
        </h3>
        <p className="text-sm text-[#64748b] text-center py-6">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-5 border border-[#1e2d4a]">
      <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#64748b] mb-4">
        {title}
      </h3>
      <div className="space-y-3">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-3"
          >
            {showUser ? (
              <Avatar
                src={item.user.avatarUrl}
                alt={item.user.displayName ?? item.user.username}
                fallback={item.user.username}
                size="xs"
              />
            ) : (
              <span className="text-sm mt-0.5">{ACTIVITY_ICONS[item.type]}</span>
            )}
            <div className="flex-1 min-w-0">
              {showUser && (
                <span className="text-xs font-semibold text-[#00d4ff]">
                  {item.user.displayName ?? item.user.username}{" "}
                </span>
              )}
              <span className="text-xs text-[#64748b]">{item.title}</span>
            </div>
            <span className="text-xs text-[#374151] flex-shrink-0">
              {formatRelative(item.createdAt)}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
