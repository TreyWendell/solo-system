import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NotificationList } from "@/components/notifications/notification-list";
import { markNotificationsRead } from "@/actions/notifications";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const notifications = await db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Mark all as read
  await markNotificationsRead(userId);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#e2e8f0]">Notifications</h1>
        <p className="text-sm text-[#64748b] mt-1">System alerts and updates.</p>
      </div>
      <NotificationList notifications={notifications} />
    </div>
  );
}
