"use client";

import { motion } from "framer-motion";
import { Bell } from "lucide-react";
import { formatRelative } from "@/lib/utils";
import type { Notification, NotificationType } from "@prisma/client";

const TYPE_ICONS: Record<NotificationType, string> = {
  LEVEL_UP: "⬆️",
  ACHIEVEMENT: "🏆",
  FRIEND_REQUEST: "🤝",
  FRIEND_ACCEPTED: "✅",
  STREAK_MILESTONE: "🔥",
  DECAY_WARNING: "⚠️",
  QUEST_REMINDER: "⚔️",
  SYSTEM: "💠",
};

const TYPE_COLORS: Record<NotificationType, string> = {
  LEVEL_UP: "#00d4ff",
  ACHIEVEMENT: "#f59e0b",
  FRIEND_REQUEST: "#ec4899",
  FRIEND_ACCEPTED: "#10b981",
  STREAK_MILESTONE: "#f59e0b",
  DECAY_WARNING: "#ef4444",
  QUEST_REMINDER: "#8b5cf6",
  SYSTEM: "#00d4ff",
};

export function NotificationList({ notifications }: { notifications: Notification[] }) {
  if (!notifications.length) {
    return (
      <div className="glass rounded-xl p-10 border border-[#1e2d4a] flex flex-col items-center text-center">
        <Bell className="h-10 w-10 text-[#1e2d4a] mb-3" />
        <p className="text-[#64748b]">No notifications yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {notifications.map((n, i) => {
        const color = TYPE_COLORS[n.type];
        return (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="glass rounded-xl p-4 border border-[#1e2d4a] flex items-start gap-3 transition-all"
            style={
              !n.read
                ? { borderLeftColor: color, borderLeftWidth: "2px" }
                : undefined
            }
          >
            <span className="text-xl flex-shrink-0 mt-0.5">{TYPE_ICONS[n.type]}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-[#e2e8f0]">{n.title}</p>
                <span className="text-xs text-[#374151] flex-shrink-0">
                  {formatRelative(n.createdAt)}
                </span>
              </div>
              {n.body && <p className="text-xs text-[#64748b] mt-0.5">{n.body}</p>}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
