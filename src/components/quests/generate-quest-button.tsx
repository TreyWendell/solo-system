"use client";

import { useTransition } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { generateAiQuest } from "@/actions/ai";

export function GenerateQuestButton() {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await generateAiQuest();
      if (result.success) {
        toast.success(`Quest unlocked: "${result.data.title}"`, {
          description: "ARIA has added a new quest to your roster.",
        });
      } else {
        toast.error(result.error ?? "Failed to generate quest");
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 text-[#a78bfa] hover:bg-[#8b5cf6]/20 hover:border-[#8b5cf6]/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4" />
      )}
      {isPending ? "Generating…" : "AI Quest"}
    </button>
  );
}
