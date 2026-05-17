import { Bot } from "lucide-react";
import { getProgressCoaching } from "@/actions/ai";

interface AiCoachCardProps {
  userId: string;
}

export async function AiCoachCard({ userId }: AiCoachCardProps) {
  const coaching = await getProgressCoaching(userId);

  return (
    <div className="glass rounded-xl p-5 border border-[#8b5cf6]/30 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/5 via-transparent to-[#00d4ff]/5 pointer-events-none" />

      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-7 w-7 rounded-lg bg-[#8b5cf6]/15 border border-[#8b5cf6]/30 flex items-center justify-center flex-shrink-0">
            <Bot className="h-3.5 w-3.5 text-[#a78bfa]" />
          </div>
          <div>
            <p className="text-xs font-bold tracking-[0.15em] uppercase text-[#a78bfa]">ARIA</p>
            <p className="text-[10px] text-[#64748b] tracking-wider">AI Progress Coach</p>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-pulse" />
            <span className="text-[10px] text-[#10b981] tracking-wider">ONLINE</span>
          </div>
        </div>

        <p className="text-sm text-[#94a3b8] leading-relaxed">{coaching}</p>
      </div>
    </div>
  );
}

export function AiCoachSkeleton() {
  return (
    <div className="glass rounded-xl p-5 border border-[#8b5cf6]/30 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/5 via-transparent to-[#00d4ff]/5 pointer-events-none" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-7 w-7 rounded-lg bg-[#8b5cf6]/15 border border-[#8b5cf6]/30 flex items-center justify-center flex-shrink-0">
            <Bot className="h-3.5 w-3.5 text-[#a78bfa]" />
          </div>
          <div>
            <p className="text-xs font-bold tracking-[0.15em] uppercase text-[#a78bfa]">ARIA</p>
            <p className="text-[10px] text-[#64748b] tracking-wider">AI Progress Coach</p>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#f59e0b] animate-pulse" />
            <span className="text-[10px] text-[#f59e0b] tracking-wider">ANALYZING</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 rounded bg-[#1e2d4a] animate-pulse w-full" />
          <div className="h-3 rounded bg-[#1e2d4a] animate-pulse w-5/6" />
          <div className="h-3 rounded bg-[#1e2d4a] animate-pulse w-4/6" />
        </div>
      </div>
    </div>
  );
}
