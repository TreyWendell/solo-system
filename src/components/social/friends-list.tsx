"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Users } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { RankBadge } from "@/components/ui/badge";
import type { PublicUser } from "@/types";

interface FriendsListProps {
  friends: PublicUser[];
  currentUserId: string;
}

export function FriendsList({ friends }: FriendsListProps) {
  return (
    <div className="glass rounded-xl p-5 border border-[#1e2d4a]">
      <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#64748b] mb-4">
        Friends ({friends.length})
      </h3>

      {friends.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-center">
          <Users className="h-10 w-10 text-[#1e2d4a] mb-3" />
          <p className="text-sm text-[#64748b]">No friends yet</p>
          <p className="text-xs text-[#374151] mt-1">Add hunters by username to connect</p>
        </div>
      ) : (
        <div className="space-y-3">
          {friends.map((friend, i) => (
            <motion.div
              key={friend.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link href={`/profile/${friend.username}`}>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-[#1e2d4a] hover:border-[#00d4ff]/20 hover:bg-[#0d1528] transition-all duration-200 group">
                  <Avatar
                    src={friend.avatarUrl}
                    alt={friend.displayName ?? friend.username}
                    fallback={friend.username}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#e2e8f0] group-hover:text-[#00d4ff] transition-colors truncate">
                      {friend.displayName ?? friend.username}
                    </p>
                    <p className="text-xs text-[#64748b]">@{friend.username}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <RankBadge rank={friend.rank} size="sm" />
                    <span className="text-xs text-[#64748b]">Lv.{friend.level}</span>
                  </div>
                  {friend.currentStreak > 0 && (
                    <div className="text-xs text-[#f59e0b] flex-shrink-0">
                      🔥 {friend.currentStreak}
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
