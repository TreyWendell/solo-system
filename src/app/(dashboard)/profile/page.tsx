import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProfileView } from "@/components/profile/profile-view";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [user, stats, achievements, activityLog] = await Promise.all([
    db.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true, username: true, displayName: true, avatarUrl: true,
        level: true, totalXp: true, rank: true, currentStreak: true,
        longestStreak: true, createdAt: true, bio: true, isPublic: true,
        _count: { select: { friendsInitiated: { where: { status: "ACCEPTED" } } } },
      },
    }),
    db.userStat.findMany({ where: { userId } }),
    db.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { unlockedAt: "desc" },
    }),
    db.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const friendCount = user._count.friendsInitiated;

  return (
    <ProfileView
      user={user as never}
      stats={stats}
      achievements={achievements}
      activityLog={activityLog}
      friendCount={friendCount}
      isOwner
    />
  );
}
