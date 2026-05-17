import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProfileView } from "@/components/profile/profile-view";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${username}` };
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  const session = await auth();

  const user = await db.user.findUnique({
    where: { username },
    select: {
      id: true, username: true, displayName: true, avatarUrl: true,
      level: true, totalXp: true, rank: true, currentStreak: true,
      longestStreak: true, createdAt: true, bio: true, isPublic: true,
      _count: { select: { friendsInitiated: { where: { status: "ACCEPTED" } } } },
    },
  });

  if (!user) notFound();
  if (!user.isPublic && user.id !== session?.user?.id) notFound();

  const isOwner = session?.user?.id === user.id;

  const [stats, achievements, activityLog] = await Promise.all([
    db.userStat.findMany({ where: { userId: user.id } }),
    db.userAchievement.findMany({
      where: { userId: user.id },
      include: { achievement: true },
      orderBy: { unlockedAt: "desc" },
    }),
    db.activityLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
  ]);

  return (
    <ProfileView
      user={user as never}
      stats={stats}
      achievements={achievements}
      activityLog={activityLog}
      friendCount={user._count.friendsInitiated}
      isOwner={isOwner}
    />
  );
}
