import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { Rank, Rarity } from "@prisma/client";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold tracking-wide transition-all",
  {
    variants: {
      variant: {
        default: "bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20",
        outline: "border border-[#1e2d4a] text-[#64748b]",
        success: "bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20",
        warning: "bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20",
        danger: "bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20",
        purple: "bg-[#8b5cf6]/10 text-[#8b5cf6] border border-[#8b5cf6]/20",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

const RANK_BADGE_CLASSES: Record<Rank, string> = {
  E: "rank-e text-white/80 border border-white/10",
  D: "rank-d text-white border border-blue-500/20",
  C: "rank-c text-white border border-green-500/20",
  B: "rank-b text-white border border-purple-500/20",
  A: "rank-a text-white border border-amber-500/20",
  S: "rank-s text-white border border-red-500/20 glow-red",
};

export function RankBadge({ rank, size = "md" }: { rank: Rank; size?: "sm" | "md" | "lg" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center font-black tracking-widest rounded",
        RANK_BADGE_CLASSES[rank],
        size === "sm" && "text-xs px-2 py-0.5",
        size === "md" && "text-sm px-3 py-1",
        size === "lg" && "text-2xl px-5 py-2"
      )}
    >
      {rank}
    </span>
  );
}

const RARITY_COLORS: Record<Rarity, string> = {
  COMMON: "#9ca3af",
  UNCOMMON: "#10b981",
  RARE: "#3b82f6",
  EPIC: "#8b5cf6",
  LEGENDARY: "#f59e0b",
};

export function RarityBadge({ rarity }: { rarity: Rarity }) {
  const color = RARITY_COLORS[rarity];
  return (
    <span
      className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold border"
      style={{
        color,
        borderColor: `${color}33`,
        backgroundColor: `${color}11`,
      }}
    >
      {rarity.charAt(0) + rarity.slice(1).toLowerCase()}
    </span>
  );
}
