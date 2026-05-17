import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { XpGrantForm } from "@/components/admin/xp-grant-form";
import { TemplateManager } from "@/components/admin/template-manager";
import { UserAdminManager } from "@/components/admin/user-admin-manager";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const currentUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  });

  if (!currentUser?.isAdmin) redirect("/dashboard");

  const [templates, stats, users] = await Promise.all([
    db.questTemplate.findMany({ orderBy: [{ category: "asc" }, { title: "asc" }] }),
    db.userStat.findMany({ where: { userId: session.user.id }, orderBy: { stat: "asc" } }),
    db.user.findMany({
      select: { id: true, username: true, displayName: true, isAdmin: true },
      orderBy: { username: "asc" },
    }),
  ]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-[#e2e8f0] tracking-tight">Admin Panel</h1>
        <p className="text-sm text-[#64748b] mt-1">Manage quest templates, stats, and users</p>
      </div>

      <XpGrantForm stats={stats} />
      <TemplateManager templates={templates} />
      <UserAdminManager users={users} currentUserId={session.user.id} />
    </div>
  );
}
