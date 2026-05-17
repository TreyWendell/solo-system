"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { STAT_META, CATEGORY_META, DIFFICULTY_META } from "@/lib/constants";
import { toast } from "@/components/ui/toaster";
import { createQuestTemplate, updateQuestTemplate, deleteQuestTemplate } from "@/actions/admin";
import type { QuestTemplate, QuestCategory, Difficulty } from "@prisma/client";
import type { StatType } from "@/types";
import type { TemplateFormData } from "@/actions/admin";

interface TemplateManagerProps {
  templates: QuestTemplate[];
}

const STAT_KEYS = Object.keys(STAT_META) as StatType[];
const CATEGORY_KEYS = Object.keys(CATEGORY_META) as QuestCategory[];
const DIFFICULTY_KEYS: Difficulty[] = ["EASY", "NORMAL", "HARD", "EPIC"];

const EMPTY_FORM: TemplateFormData = {
  title: "",
  description: "",
  category: "FITNESS",
  difficulty: "NORMAL",
  xpReward: 50,
  statRewards: {},
  isSystem: true,
  isActive: true,
};

export function TemplateManager({ templates }: TemplateManagerProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<QuestTemplate | null>(null);
  const [form, setForm] = useState<TemplateFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(t: QuestTemplate) {
    setEditing(t);
    setForm({
      title: t.title,
      description: t.description ?? "",
      category: t.category,
      difficulty: t.difficulty,
      xpReward: t.xpReward,
      statRewards: (t.statRewards as Record<string, number>) ?? {},
      isSystem: t.isSystem,
      isActive: t.isActive,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const result = editing
        ? await updateQuestTemplate(editing.id, form)
        : await createQuestTemplate(form);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(editing ? "Template updated" : "Template created");
      setModalOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to save template");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? Active daily quests from it won't be affected.`)) return;
    setDeleting(id);
    try {
      const result = await deleteQuestTemplate(id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Template deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(null);
    }
  }

  const filtered = templates.filter(
    (t) =>
      !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="glass rounded-xl border border-[#1e2d4a]">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-[#1e2d4a]">
        <div>
          <h2 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#64748b]">
            Quest Templates
          </h2>
          <p className="text-xs text-[#374151] mt-0.5">{templates.length} total</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter..."
            className="bg-[#0d1528] border border-[#1e2d4a] rounded-lg px-3 py-1.5 text-xs text-[#e2e8f0] focus:outline-none focus:border-[#00d4ff]/50 placeholder-[#374151] w-32"
          />
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00d4ff]/10 border border-[#00d4ff]/30 hover:bg-[#00d4ff]/20 text-[#00d4ff] rounded-lg text-xs font-semibold transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            New
          </button>
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-[#1e2d4a]">
        {filtered.map((t) => {
          const catMeta = CATEGORY_META[t.category];
          const diffMeta = DIFFICULTY_META[t.difficulty];
          const rewards = t.statRewards as Record<string, number>;
          const statKeys = Object.keys(rewards).filter((k) => rewards[k] > 0);
          return (
            <div
              key={t.id}
              className={`flex items-center gap-4 px-5 py-3 transition-colors ${
                !t.isActive ? "opacity-40" : ""
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-[#e2e8f0]">{t.title}</span>
                  {!t.isActive && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded border border-[#374151] text-[#374151]">
                      inactive
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-xs text-[#64748b]">
                    {catMeta.icon} {catMeta.label}
                  </span>
                  <span className="text-xs" style={{ color: diffMeta.color }}>
                    {diffMeta.label}
                  </span>
                  <span className="text-xs font-mono text-[#00d4ff]">+{t.xpReward}xp</span>
                  {statKeys.map((k) => (
                    <span
                      key={k}
                      className="text-[10px] font-mono"
                      style={{ color: STAT_META[k as StatType]?.color }}
                    >
                      {STAT_META[k as StatType]?.icon}+{rewards[k]}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => openEdit(t)}
                  title="Edit"
                  className="h-7 w-7 flex items-center justify-center rounded text-[#64748b] hover:text-[#00d4ff] hover:bg-[#0d1528] transition-all"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(t.id, t.title)}
                  disabled={deleting === t.id}
                  title="Delete"
                  className="h-7 w-7 flex items-center justify-center rounded text-[#64748b] hover:text-[#ef4444] hover:bg-[#ef4444]/5 transition-all disabled:opacity-40"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center text-sm text-[#64748b] py-8">No templates found</p>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setModalOpen(false)}
          >
            <div className="absolute inset-0 bg-[#050810]/80 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col glass rounded-2xl border border-[#1e2d4a] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-[#1e2d4a] flex-shrink-0">
                <h3 className="font-bold text-[#e2e8f0]">
                  {editing ? "Edit Template" : "New Template"}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="h-8 w-8 rounded flex items-center justify-center text-[#64748b] hover:text-[#e2e8f0] hover:bg-[#1e2d4a] transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Title */}
                <div>
                  <label className="text-xs text-[#64748b] mb-1.5 block">Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Morning Run"
                    className="w-full bg-[#0d1528] border border-[#1e2d4a] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] focus:outline-none focus:border-[#00d4ff]/50"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs text-[#64748b] mb-1.5 block">Description</label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Optional"
                    className="w-full bg-[#0d1528] border border-[#1e2d4a] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] focus:outline-none focus:border-[#00d4ff]/50"
                  />
                </div>

                {/* Category + Difficulty */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#64748b] mb-1.5 block">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, category: e.target.value as QuestCategory }))
                      }
                      className="w-full bg-[#0d1528] border border-[#1e2d4a] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] focus:outline-none focus:border-[#00d4ff]/50"
                    >
                      {CATEGORY_KEYS.map((c) => (
                        <option key={c} value={c}>
                          {CATEGORY_META[c].icon} {CATEGORY_META[c].label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-[#64748b] mb-1.5 block">Difficulty</label>
                    <select
                      value={form.difficulty}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, difficulty: e.target.value as Difficulty }))
                      }
                      className="w-full bg-[#0d1528] border border-[#1e2d4a] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] focus:outline-none focus:border-[#00d4ff]/50"
                    >
                      {DIFFICULTY_KEYS.map((d) => (
                        <option key={d} value={d}>
                          {DIFFICULTY_META[d].label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* XP Reward */}
                <div>
                  <label className="text-xs text-[#64748b] mb-1.5 block">XP Reward</label>
                  <input
                    type="number"
                    value={form.xpReward}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, xpReward: parseInt(e.target.value) || 0 }))
                    }
                    min={0}
                    className="w-full bg-[#0d1528] border border-[#1e2d4a] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] focus:outline-none focus:border-[#00d4ff]/50"
                  />
                </div>

                {/* Stat rewards */}
                <div>
                  <label className="text-xs text-[#64748b] mb-2 block">
                    Stat Rewards (leave 0 for no reward)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {STAT_KEYS.map((s) => {
                      const meta = STAT_META[s];
                      const val = form.statRewards[s] ?? 0;
                      return (
                        <div
                          key={s}
                          className="flex items-center gap-2 bg-[#0d1528] border border-[#1e2d4a] rounded-lg px-3 py-2"
                        >
                          <span className="text-base flex-shrink-0">{meta.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-[#64748b]">{meta.label}</p>
                            <input
                              type="number"
                              value={val}
                              onChange={(e) => {
                                const n = parseInt(e.target.value) || 0;
                                setForm((f) => ({
                                  ...f,
                                  statRewards:
                                    n > 0
                                      ? { ...f.statRewards, [s]: n }
                                      : Object.fromEntries(
                                          Object.entries(f.statRewards).filter(([k]) => k !== s)
                                        ),
                                }));
                              }}
                              min={0}
                              style={{ color: val > 0 ? meta.color : "#64748b" }}
                              className="w-full bg-transparent text-sm font-mono focus:outline-none"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex gap-6">
                  {(
                    [
                      { label: "System quest", key: "isSystem" as const },
                      { label: "Active", key: "isActive" as const },
                    ] as const
                  ).map(({ label, key }) => (
                    <div key={key} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, [key]: !f[key] }))}
                        className={`h-5 w-9 rounded-full transition-colors relative flex-shrink-0 ${
                          form[key] ? "bg-[#00d4ff]" : "bg-[#1e2d4a]"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all duration-200 ${
                            form[key] ? "left-[18px]" : "left-0.5"
                          }`}
                        />
                      </button>
                      <span className="text-xs text-[#64748b]">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-[#1e2d4a] flex items-center justify-end gap-3 flex-shrink-0">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm text-[#64748b] hover:text-[#e2e8f0] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !form.title.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#00d4ff]/10 border border-[#00d4ff]/30 hover:bg-[#00d4ff]/20 text-[#00d4ff] rounded-lg text-sm font-semibold transition-all disabled:opacity-40"
                >
                  <Check className="h-3.5 w-3.5" />
                  {saving ? "Saving..." : editing ? "Save Changes" : "Create"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
