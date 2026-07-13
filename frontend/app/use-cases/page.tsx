"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ShieldCheck,
  Plus,
  Pencil,
  Trash2,
  Scan,
} from "lucide-react";

import {
  getAiSystems,
  createAiSystem,
  updateAiSystem,
  deleteAiSystem as deleteAiSystemApi,
  analyzeAiSystem,
  analyzeAllSystems,
  type AiSystem as AiSystemType,
} from "@/lib/api";

// ─── Types ───────────────────────────────────────────────────────────────────

type AISystem = {
  id: string;
  name: string;
  category: string;
  provider: string;
  description: string;
  affectsPeople: boolean;
  status: string;
  matchCount: number;
};

// ─── Static options ───────────────────────────────────────────────────────────

const categories = [
  "Hiring",
  "Customer Support",
  "Marketing",
  "Finance",
  "Pricing",
  "Healthcare",
  "Operations",
  "Other",
];

const providers = [
  "OpenAI",
  "Anthropic",
  "AWS Bedrock",
  "Google Gemini",
  "Azure OpenAI",
  "Custom Model",
  "Other",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Chevron() {
  return (
    <svg
      className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 border border-foreground/15 text-xs font-mono text-muted-foreground">
      {category}
    </span>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="border border-foreground/10 flex flex-col items-center justify-center py-20 px-8 text-center">
      <div className="w-12 h-12 border border-foreground/15 flex items-center justify-center mb-6">
        <Scan className="w-5 h-5 text-muted-foreground" />
      </div>
      <p className="text-base font-sans text-foreground mb-2">
        No AI systems have been added yet.
      </p>
      <p className="text-sm font-mono text-muted-foreground mb-8 max-w-sm leading-relaxed">
        Register every AI system your organization uses so ComplyTrace can identify the regulations that apply.
      </p>
      <Button
        size="lg"
        onClick={onAdd}
        className="bg-foreground hover:bg-foreground/90 text-background px-6 h-12 text-sm rounded-full group"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Your First AI System
      </Button>
    </div>
  );
}

// ─── System Card ─────────────────────────────────────────────────────────────

function SystemCard({
  system,
  onEdit,
  onDelete,
  onAnalyze,
  analyzing,
}: {
  system: AISystem;
  onEdit: (s: AISystem) => void;
  onDelete: (id: string) => void;
  onAnalyze: (id: string) => void;
  analyzing: boolean;
}) {
  return (
    <div className="border border-foreground/10 bg-background flex flex-col">
      {/* Card header */}
      <div className="px-6 pt-6 pb-4 border-b border-foreground/10">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="text-base font-sans font-medium text-foreground leading-snug">
            {system.name}
          </h3>
          <span className={`inline-flex items-center px-2 py-0.5 border text-xs font-mono shrink-0 ${
            system.status === "analyzed"
              ? "border-foreground/25 text-foreground bg-foreground/10"
              : "border-foreground/15 text-muted-foreground"
          }`}>
            {system.status === "analyzed" ? `Analyzed (${system.matchCount} matches)` : "Ready for Analysis"}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Category</span>
            <CategoryBadge category={system.category} />
          </div>
          <div className="w-px h-3 bg-foreground/15" />
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Provider</span>
            <span className="text-xs font-mono text-foreground">{system.provider}</span>
          </div>
          <div className="w-px h-3 bg-foreground/15" />
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Affects People</span>
            <span className="text-xs font-mono text-foreground">{system.affectsPeople ? "Yes" : "No"}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="px-6 py-4 flex-1">
        <p className="text-sm font-sans text-muted-foreground leading-relaxed line-clamp-3">{system.description}</p>
      </div>

      {/* Actions */}
      <div className="px-6 py-4 border-t border-foreground/10 flex items-center gap-3">
        <Button
          size="sm"
          onClick={() => onAnalyze(system.id)}
          disabled={analyzing}
          className="bg-foreground hover:bg-foreground/90 text-background px-4 h-9 text-xs rounded-full group disabled:opacity-50"
        >
          {analyzing ? "Analyzing..." : "Analyze"}
          {!analyzing && <ArrowRight className="w-3 h-3 ml-1.5 transition-transform group-hover:translate-x-0.5" />}
        </Button>
        <button
          onClick={() => onEdit(system)}
          className="inline-flex items-center gap-1.5 h-9 px-3 border border-foreground/15 text-xs font-mono text-foreground hover:border-foreground/40 transition-colors duration-150"
        >
          <Pencil className="w-3 h-3" />
          Edit
        </button>
        <button
          onClick={() => onDelete(system.id)}
          className="inline-flex items-center gap-1.5 h-9 px-3 border border-foreground/15 text-xs font-mono text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors duration-150 ml-auto"
        >
          <Trash2 className="w-3 h-3" />
          Delete
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UseCasesPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [systems, setSystems] = useState<AISystem[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [analyzingAll, setAnalyzingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [provider, setProvider] = useState("");
  const [description, setDescription] = useState("");
  const [affectsPeople, setAffectsPeople] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    loadSystems();
  }, []);

  async function loadSystems() {
    const orgId = localStorage.getItem("orgId");
    if (!orgId) {
      setLoading(false);
      return;
    }
    try {
      const result = await getAiSystems(orgId);
      setSystems(
        result.map((s) => ({
          id: s.id,
          name: s.name,
          category: s.category || "Other",
          provider: s.aiProvider || "Other",
          description: s.description,
          affectsPeople: s.affectsPeople,
          status: s.status,
          matchCount: s.matchCount,
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load systems");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setEditingId(null);
    setName("");
    setCategory("");
    setProvider("");
    setDescription("");
    setAffectsPeople(false);
  }

  function scrollToForm() {
    document.getElementById("add-system-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleEdit(system: AISystem) {
    setEditingId(system.id);
    setName(system.name);
    setCategory(system.category);
    setProvider(system.provider);
    setDescription(system.description);
    setAffectsPeople(system.affectsPeople);
    scrollToForm();
  }

  async function handleDelete(id: string) {
    try {
      await deleteAiSystemApi(id);
      setSystems((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  async function handleAnalyze(id: string) {
    setAnalyzingId(id);
    try {
      await analyzeAiSystem(id);
      await loadSystems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setAnalyzingId(null);
    }
  }

  async function handleAnalyzeAll() {
    const orgId = localStorage.getItem("orgId");
    if (!orgId) return;
    setAnalyzingAll(true);
    try {
      await analyzeAllSystems(orgId);
      await loadSystems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setAnalyzingAll(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid || submitting) return;

    const orgId = localStorage.getItem("orgId");
    if (!orgId) return;

    setSubmitting(true);
    setError(null);

    try {
      if (editingId) {
        await updateAiSystem(editingId, {
          name,
          description,
          category,
          aiProvider: provider,
          affectsPeople,
        });
      } else {
        await createAiSystem({
          orgId,
          name,
          description,
          category,
          aiProvider: provider,
          affectsPeople,
        });
      }
      resetForm();
      await loadSystems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  }

  const isFormValid =
    name.trim() !== "" &&
    category !== "" &&
    provider !== "" &&
    description.trim() !== "";

  return (
    <div className="relative min-h-screen bg-background noise-overlay overflow-x-hidden">
      {/* Grid lines — identical pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        {[...Array(8)].map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute h-px bg-foreground/10"
            style={{ top: `${12.5 * (i + 1)}%`, left: 0, right: 0 }}
          />
        ))}
        {[...Array(12)].map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute w-px bg-foreground/10"
            style={{ left: `${8.33 * (i + 1)}%`, top: 0, bottom: 0 }}
          />
        ))}
      </div>

      {/* Top bar */}
      <header className="relative z-10 px-6 lg:px-12 h-16 flex items-center justify-between border-b border-foreground/10">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display text-xl tracking-tight">ComplyTrace</span>
          <span className="text-muted-foreground font-mono text-xs mt-0.5">AI</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors duration-150"
          >
            &larr; Dashboard
          </Link>
          <ShieldCheck className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-mono text-muted-foreground hidden sm:inline">
            SOC 2 Compliant
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 py-12 lg:py-16">

        {/* ── Page Header ── */}
        <div
          className={`flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-12 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div>
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-4">
              <span className="w-8 h-px bg-foreground/30" />
              AI Systems
            </span>
            <h1 className="text-4xl lg:text-5xl font-display tracking-tight mb-3">
              AI Use Cases
            </h1>
            <p className="text-base text-muted-foreground max-w-xl leading-relaxed">
              Register every AI system your organization uses so ComplyTrace can identify the regulations that apply.
            </p>
          </div>
          <Button
            size="lg"
            className="bg-foreground hover:bg-foreground/90 text-background px-6 h-12 text-sm rounded-full group shrink-0"
            onClick={handleAnalyzeAll}
            disabled={analyzingAll}
          >
            {analyzingAll ? "Analyzing..." : "Analyze All Systems"}
            {!analyzingAll && <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />}
          </Button>
        </div>

        {/* ── Add / Edit Form ── */}
        <section
          id="add-system-form"
          aria-label="Add AI system"
          className={`mb-16 transition-all duration-700 delay-100 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="flex items-center gap-3 mb-5">
            <span className="w-8 h-px bg-foreground/30" />
            <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest">
              {editingId ? "Edit AI System" : "Add New AI System"}
            </h2>
          </div>

          <div className="border border-foreground/10 p-6 lg:p-8">
            <form onSubmit={handleSubmit}>
              <div className="grid lg:grid-cols-2 gap-6 mb-6">
                {/* AI System Name */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="system-name"
                    className="text-sm font-mono text-foreground/70"
                  >
                    AI System Name
                  </label>
                  <input
                    id="system-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Resume Screening AI"
                    className="h-12 px-4 bg-transparent border border-foreground/15 focus:border-foreground/40 outline-none text-foreground placeholder:text-muted-foreground transition-colors duration-200 font-sans text-base"
                  />
                </div>

                {/* Category */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="system-category"
                    className="text-sm font-mono text-foreground/70"
                  >
                    Category
                  </label>
                  <div className="relative">
                    <select
                      id="system-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-12 px-4 pr-10 bg-transparent border border-foreground/15 focus:border-foreground/40 outline-none text-foreground appearance-none cursor-pointer transition-colors duration-200 font-sans text-base"
                    >
                      <option value="" disabled className="bg-background">
                        Select a category
                      </option>
                      {categories.map((c) => (
                        <option key={c} value={c} className="bg-background">
                          {c}
                        </option>
                      ))}
                    </select>
                    <Chevron />
                  </div>
                </div>

                {/* AI Provider */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="system-provider"
                    className="text-sm font-mono text-foreground/70"
                  >
                    AI Provider
                  </label>
                  <div className="relative">
                    <select
                      id="system-provider"
                      value={provider}
                      onChange={(e) => setProvider(e.target.value)}
                      className="w-full h-12 px-4 pr-10 bg-transparent border border-foreground/15 focus:border-foreground/40 outline-none text-foreground appearance-none cursor-pointer transition-colors duration-200 font-sans text-base"
                    >
                      <option value="" disabled className="bg-background">
                        Select a provider
                      </option>
                      {providers.map((p) => (
                        <option key={p} value={p} className="bg-background">
                          {p}
                        </option>
                      ))}
                    </select>
                    <Chevron />
                  </div>
                </div>

                {/* Affects People toggle — spans full width on desktop */}
                <div className="flex flex-col gap-2 justify-end">
                  <span className="text-sm font-mono text-foreground/70">
                    Does this AI make decisions that affect people?
                  </span>
                  <div className="flex items-center gap-4 h-12">
                    {(["Yes", "No"] as const).map((opt) => {
                      const val = opt === "Yes";
                      const active = affectsPeople === val;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setAffectsPeople(val)}
                          className={`h-9 px-5 border text-sm font-mono transition-all duration-200 ${
                            active
                              ? "border-foreground bg-foreground text-background"
                              : "border-foreground/15 text-foreground hover:border-foreground/40"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Description — full width */}
              <div className="flex flex-col gap-2 mb-8">
                <label
                  htmlFor="system-description"
                  className="text-sm font-mono text-foreground/70"
                >
                  Description
                </label>
                <textarea
                  id="system-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="We use AI to automatically rank job applicants before a recruiter performs the final review."
                  rows={4}
                  className="px-4 py-3 bg-transparent border border-foreground/15 focus:border-foreground/40 outline-none text-foreground placeholder:text-muted-foreground transition-colors duration-200 font-sans text-base resize-none leading-relaxed"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4">
                {error && <p className="text-sm text-red-500 font-mono">{error}</p>}
                <Button
                  type="submit"
                  size="lg"
                  disabled={!isFormValid || submitting}
                  className="bg-foreground hover:bg-foreground/90 text-background px-8 h-12 text-sm rounded-full group disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {submitting ? "Saving..." : editingId ? "Save Changes" : "Add AI System"}
                </Button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="h-12 px-6 border border-foreground/15 text-sm font-mono text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors duration-150"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </section>

        {/* ── Registered AI Systems ── */}
        <section
          aria-label="Registered AI systems"
          className={`transition-all duration-700 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <span className="w-8 h-px bg-foreground/30" />
              <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest">
                Registered AI Systems
              </h2>
              {systems.length > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 border border-foreground/15 text-xs font-mono text-muted-foreground">
                  {systems.length}
                </span>
              )}
            </div>
          </div>

          {systems.length === 0 ? (
            <EmptyState onAdd={scrollToForm} />
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-px border border-foreground/10">
              {systems.map((system) => (
                <SystemCard
                  key={system.id}
                  system={system}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onAnalyze={handleAnalyze}
                  analyzing={analyzingId === system.id}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── Footer note ── */}
        <div
          className={`flex items-center gap-3 pt-8 mt-12 border-t border-foreground/10 transition-all duration-700 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-muted-foreground shrink-0" />
          <p className="text-xs font-mono text-muted-foreground">
            All AI system data is encrypted at rest and in transit. Audit logs are cryptographically signed and tamper-evident.
          </p>
        </div>
      </main>
    </div>
  );
}
