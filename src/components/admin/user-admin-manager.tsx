"use client";

import { useState, useTransition } from "react";
import { Shield, ShieldOff } from "lucide-react";
import { setUserAdmin } from "@/actions/admin";

interface UserRow {
  id: string;
  username: string;
  displayName: string | null;
  isAdmin: boolean;
}

interface UserAdminManagerProps {
  users: UserRow[];
  currentUserId: string;
}

export function UserAdminManager({ users, currentUserId }: UserAdminManagerProps) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  function toggle(username: string, grantAdmin: boolean) {
    setMessage(null);
    startTransition(async () => {
      const result = await setUserAdmin(username, grantAdmin);
      setMessage(
        result.success
          ? { text: `${username} is now ${grantAdmin ? "an admin" : "a regular user"}.`, ok: true }
          : { text: result.error, ok: false }
      );
    });
  }

  return (
    <div className="glass rounded-xl p-5 border border-[#1e2d4a] space-y-4">
      <h2 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#64748b]">
        User Management
      </h2>

      {message && (
        <p className={`text-xs px-3 py-2 rounded border ${message.ok ? "text-[#10b981] border-[#10b981]/30 bg-[#10b981]/5" : "text-[#ef4444] border-[#ef4444]/30 bg-[#ef4444]/5"}`}>
          {message.text}
        </p>
      )}

      <div className="divide-y divide-[#1e2d4a]">
        {users.map((user) => {
          const isSelf = user.id === currentUserId;
          return (
            <div key={user.id} className="flex items-center justify-between py-3">
              <div>
                <span className="text-sm font-medium text-[#e2e8f0]">
                  {user.displayName ?? user.username}
                </span>
                <span className="text-xs text-[#64748b] ml-2">@{user.username}</span>
                {isSelf && (
                  <span className="text-xs text-[#00d4ff] ml-2">(you)</span>
                )}
              </div>
              <button
                onClick={() => toggle(user.username, !user.isAdmin)}
                disabled={pending || isSelf}
                title={isSelf ? "Cannot change your own admin status" : undefined}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
                  user.isAdmin
                    ? "text-[#ef4444] border-[#ef4444]/30 hover:bg-[#ef4444]/10"
                    : "text-[#10b981] border-[#10b981]/30 hover:bg-[#10b981]/10"
                }`}
              >
                {user.isAdmin ? (
                  <><ShieldOff className="h-3 w-3" /> Revoke Admin</>
                ) : (
                  <><Shield className="h-3 w-3" /> Grant Admin</>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
