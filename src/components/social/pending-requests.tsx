"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";
import { respondToFriendRequest } from "@/actions/social";
import type { PublicUser } from "@/types";

interface PendingRequest {
  id: string;
  initiator: PublicUser;
}

export function PendingRequests({ requests }: { requests: PendingRequest[] }) {
  const [processing, setProcessing] = useState<string | null>(null);

  async function handle(id: string, action: "accept" | "reject") {
    setProcessing(id);
    const result = await respondToFriendRequest(id, action);
    if (result.success) {
      toast.success(action === "accept" ? "Friend request accepted!" : "Request declined.");
    } else {
      toast.error(result.error);
    }
    setProcessing(null);
  }

  return (
    <div className="glass rounded-xl p-5 border border-[#f59e0b]/20">
      <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#f59e0b] mb-3">
        Pending Requests ({requests.length})
      </h3>
      <div className="space-y-3">
        {requests.map((req, i) => (
          <motion.div
            key={req.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center gap-3"
          >
            <Avatar
              src={req.initiator.avatarUrl}
              alt={req.initiator.displayName ?? req.initiator.username}
              fallback={req.initiator.username}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#e2e8f0] truncate">
                {req.initiator.displayName ?? req.initiator.username}
              </p>
              <p className="text-xs text-[#64748b]">@{req.initiator.username}</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => handle(req.id, "accept")}
                disabled={processing === req.id}
                className="text-[#10b981] hover:text-[#10b981] hover:bg-[#10b981]/10"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => handle(req.id, "reject")}
                disabled={processing === req.id}
                className="text-[#ef4444] hover:text-[#ef4444] hover:bg-[#ef4444]/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
