import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { FriendsList } from "@/components/social/friends-list";
import { AddFriendForm } from "@/components/social/add-friend-form";
import { PendingRequests } from "@/components/social/pending-requests";

export const metadata: Metadata = { title: "Social" };

export default async function SocialPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [friendships, pendingReceived] = await Promise.all([
    db.friendship.findMany({
      where: {
        OR: [{ initiatorId: userId }, { receiverId: userId }],
        status: "ACCEPTED",
      },
      include: {
        initiator: {
          select: {
            id: true, username: true, displayName: true, avatarUrl: true,
            level: true, totalXp: true, rank: true, currentStreak: true,
            longestStreak: true, createdAt: true, bio: true, isPublic: true,
          },
        },
        receiver: {
          select: {
            id: true, username: true, displayName: true, avatarUrl: true,
            level: true, totalXp: true, rank: true, currentStreak: true,
            longestStreak: true, createdAt: true, bio: true, isPublic: true,
          },
        },
      },
    }),
    db.friendship.findMany({
      where: { receiverId: userId, status: "PENDING" },
      include: {
        initiator: {
          select: {
            id: true, username: true, displayName: true, avatarUrl: true,
            level: true, totalXp: true, rank: true, currentStreak: true,
            longestStreak: true, createdAt: true, bio: true, isPublic: true,
          },
        },
      },
    }),
  ]);

  const friends = friendships.map((f: { initiatorId: string; initiator: typeof friendships[0]["initiator"]; receiver: typeof friendships[0]["receiver"] }) =>
    f.initiatorId === userId ? f.receiver : f.initiator
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-[#e2e8f0]">Social</h1>
        <p className="text-sm text-[#64748b] mt-1">
          Connect with other hunters on their journey.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {pendingReceived.length > 0 && (
            <PendingRequests requests={pendingReceived as never} />
          )}
          <FriendsList friends={friends as never} currentUserId={userId} />
        </div>

        <div>
          <AddFriendForm />
        </div>
      </div>
    </div>
  );
}
