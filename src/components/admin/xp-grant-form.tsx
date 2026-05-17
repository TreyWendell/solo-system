"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { STAT_META } from "@/lib/constants";
import { toast } from "@/components/ui/toaster";
import { grantStatXp } from "@/actions/admin";
import type { UserStat } from "@prisma/client";
import type { StatType } from "@/types";

interface XpGrantFormProps {
  stats: UserStat[];
}

const STAT_KEYS = Object.keys(STAT_META) as StatType[];

export function XpGrantForm({ stats }: XpGrantFormProps) {
  const router = useRouter();
  const [stat, setStat] = useState<StatType>("STRENGTH");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseInt(amount, 10);
    if (isNaN(parsed) || parsed === 0) return;
    setSaving(true);
    try {
      const result = await grantStatXp(stat, parsed, reason);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(`${parsed > 0 ? "+" : ""}${parsed} XP → ${STAT_META[stat].label}`);
      setAmount("");
      setReason("");
      router.refresh();
    } catch {
      toast.error("Failed to grant XP");
    } finally {
      setSaving(false);
    }
  }

  const currentStat = stats.find((s) => s.stat === stat);

  return (
    <div className="glass rounded-xl p-5 border border-[#1e2d4a]">
      <h2 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#64748b] mb-4">
        Manual XP Grant
      </h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
        <div>
          <label className="text-xs text-[#64748b] mb-1.5 block">Stat</label>
          <select
            value={stat}
            onChange={(e) => setStat(e.target.value as StatType)}
            className="w-full bg-[#0d1528] border border-[#1e2d4a] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] focus:outline-none focus:border-[#00d4ff]/50"
          >
            {STAT_KEYS.map((s) => (
              <option key={s} value={s}>
                {STAT_META[s].icon} {STAT_META[s].label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-[#64748b] mb-1.5 block">Amount (negative to remove)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 500"
            className="w-full bg-[#0d1528] border border-[#1e2d4a] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] focus:outline-none focus:border-[#00d4ff]/50 placeholder-[#374151]"
          />
        </div>

        <div>
          <label className="text-xs text-[#64748b] mb-1.5 block">Reason</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Manual correction"
            className="w-full bg-[#0d1528] border border-[#1e2d4a] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] focus:outline-none focus:border-[#00d4ff]/50 placeholder-[#374151]"
          />
        </div>

        <button
          type="submit"
          disabled={saving || !amount}
          className="px-4 py-2 bg-[#00d4ff]/10 border border-[#00d4ff]/30 hover:bg-[#00d4ff]/20 text-[#00d4ff] rounded-lg text-sm font-semibold transition-all disabled:opacity-40"
        >
          {saving ? "Saving..." : "Grant XP"}
        </button>
      </form>

      {currentStat && (
        <p className="text-xs text-[#374151] mt-2">
          Current:{" "}
          <span className="text-[#64748b]">
            Lv.{currentStat.level} — {currentStat.xp.toLocaleString()} XP
          </span>
        </p>
      )}
    </div>
  );
}
