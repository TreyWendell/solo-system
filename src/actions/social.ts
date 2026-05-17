"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendFriendRequestSchema, respondFriendRequestSchema } from "@/lib/validations";
import type { ActionResult } from "@/types";

export async function sendFriendRequest(username: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const parsed = sendFriendRequestSchema.safeParse({ username });
  if (!parsed.success) return { success: false, error: "Invalid username" };

  const userId = session.user.id;
  const target = await db.user.findUnique({ where: { username } });

  if (!target) return { success: false, error: "User not found" };
  if (target.id === userId) return { success: false, error: "Cannot add yourself" };

  const existing = await db.friendship.findFirst({
    where: {
      OR: [
        { initiatorId: userId, receiverId: target.id },
        { initiatorId: target.id, receiverId: userId },
      ],
    },
  });

  if (existing) {
    if (existing.status === "ACCEPTED") return { success: false, error: "Already friends" };
    if (existing.status === "PENDING") return { success: false, error: "Request already sent" };
    if (existing.status === "BLOCKED") return { success: false, error: "Cannot send request" };
  }

  await db.friendship.create({
    data: { initiatorId: userId, receiverId: target.id, status: "PENDING" },
  });

  await db.notification.create({
    data: {
      userId: target.id,
      type: "FRIEND_REQUEST",
      title: "Friend Request",
      body: `${session.user.name ?? "Someone"} wants to add you as a friend`,
      data: { fromUserId: userId },
    },
  });

  revalidatePath("/social");
  return { success: true, data: undefined };
}

export async function respondToFriendRequest(
  friendshipId: string,
  action: "accept" | "reject"
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const parsed = respondFriendRequestSchema.safeParse({ friendshipId, action });
  if (!parsed.success) return { success: false, error: "Invalid request" };

  const userId = session.user.id;
  const friendship = await db.friendship.findFirst({
    where: { id: friendshipId, receiverId: userId, status: "PENDING" },
  });

  if (!friendship) return { success: false, error: "Friend request not found" };

  if (action === "accept") {
    await db.friendship.update({
      where: { id: friendshipId },
      data: { status: "ACCEPTED" },
    });

    await db.activityLog.createMany({
      data: [
        { userId, type: "FRIEND_ADDED", title: "added a friend" },
        { userId: friendship.initiatorId, type: "FRIEND_ADDED", title: "friend request accepted" },
      ],
    });

    await db.notification.create({
      data: {
        userId: friendship.initiatorId,
        type: "FRIEND_ACCEPTED",
        title: "Friend Request Accepted",
        body: `Your friend request was accepted!`,
        data: { friendId: userId },
      },
    });
  } else {
    await db.friendship.delete({ where: { id: friendshipId } });
  }

  revalidatePath("/social");
  revalidatePath("/notifications");
  return { success: true, data: undefined };
}

export async function removeFriend(friendId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const userId = session.user.id;
  await db.friendship.deleteMany({
    where: {
      OR: [
        { initiatorId: userId, receiverId: friendId },
        { initiatorId: friendId, receiverId: userId },
      ],
      status: "ACCEPTED",
    },
  });

  revalidatePath("/social");
  return { success: true, data: undefined };
}
