"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";
import { sendFriendRequest } from "@/actions/social";

export function AddFriendForm() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);

    const result = await sendFriendRequest(username.trim());
    if (result.success) {
      toast.success(`Friend request sent to @${username}`);
      setUsername("");
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  }

  return (
    <div className="glass rounded-xl p-5 border border-[#1e2d4a]">
      <div className="flex items-center gap-2 mb-4">
        <UserPlus className="h-4 w-4 text-[#00d4ff]" />
        <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#64748b]">
          Add Hunter
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="username"
          label="Username"
        />
        <Button
          type="submit"
          variant="outline"
          size="sm"
          className="w-full"
          isLoading={loading}
          disabled={!username.trim()}
        >
          Send Request
        </Button>
      </form>
    </div>
  );
}
