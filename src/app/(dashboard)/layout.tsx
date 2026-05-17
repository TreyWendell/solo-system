import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Sidebar } from "@/components/layout/sidebar";
import type { PublicUser } from "@/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      level: true,
      totalXp: true,
      rank: true,
      currentStreak: true,
      longestStreak: true,
      createdAt: true,
      bio: true,
      isPublic: true,
      _count: { select: { notifications: { where: { read: false } } } },
    },
  });

  if (!user) redirect("/login");

  const { _count, ...publicUser } = user;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar user={publicUser as PublicUser} unreadCount={_count.notifications} />
      <main className="flex-1 ml-64 overflow-y-auto">
        <div className="min-h-screen p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
