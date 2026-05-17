"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Swords,
  BarChart3,
  Users,
  User,
  Bell,
  LogOut,
  Zap,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { RankBadge } from "@/components/ui/badge";
import { logoutUser } from "@/actions/auth";
import type { PublicUser } from "@/types";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/quests", label: "Daily Quests", icon: Swords },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/social", label: "Social", icon: Users },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/notifications", label: "Alerts", icon: Bell },
  { href: "/admin", label: "Admin", icon: Settings2 },
];

interface SidebarProps {
  user: PublicUser;
  unreadCount?: number;
}

export function Sidebar({ user, unreadCount = 0 }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col glass border-r border-[#1e2d4a] z-40">
      {/* Logo */}
      <div className="p-6 border-b border-[#1e2d4a]">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded bg-[#00d4ff]/10 border border-[#00d4ff]/30 flex items-center justify-center group-hover:glow-cyan-sm transition-all">
            <Zap className="h-4 w-4 text-[#00d4ff]" />
          </div>
          <span className="text-lg font-black tracking-[0.2em] text-[#e2e8f0] glow-text-cyan">
            HOME
          </span>
        </Link>
      </div>

      {/* User mini profile */}
      <div className="p-4 border-b border-[#1e2d4a]">
        <Link href="/profile" className="flex items-center gap-3 group">
          <Avatar
            src={user.avatarUrl}
            alt={user.displayName ?? user.username}
            fallback={user.username}
            size="md"
            glow
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#e2e8f0] truncate group-hover:text-[#00d4ff] transition-colors">
              {user.displayName ?? user.username}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <RankBadge rank={user.rank} size="sm" />
              <span className="text-xs text-[#64748b]">Lv.{user.level}</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href}>
              <motion.div
                whileHover={{ x: 4 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-all duration-200 relative",
                  active
                    ? "bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20"
                    : "text-[#64748b] hover:text-[#e2e8f0] hover:bg-[#0d1528]"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#00d4ff] rounded-r"
                  />
                )}
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium">{label}</span>
                {href === "/notifications" && unreadCount > 0 && (
                  <span className="ml-auto text-xs bg-[#ef4444] text-white rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-[#1e2d4a]">
        <form action={logoutUser}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm text-[#64748b] hover:text-[#ef4444] hover:bg-[#ef4444]/5 transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
