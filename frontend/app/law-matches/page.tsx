"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ShieldCheck,
  FileText,
  ScrollText,
  Scan,
  LayoutDashboard,
  CheckCircle2,
  AlertTriangle,
  Info,
  TrendingUp,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type RegulationStatus = "Action Required" | "Needs Review" | "Compliant";
type ConfidenceLevel = "High" | "Medium" | "Low";

type Regulation = {
  id: string;
  lawName: string;
  state: string;
  similarityScore: number;
  confidence: ConfidenceLevel;
  whyItApplies: string;
  requiredActions: string[];
  effectiveDate: string;
  status: RegulationStatus;
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const aiSystem = {
  name: "Resume Screening AI",
  description:
    "We use AI to automatically rank job applicants before recruiters review them.",
  overallRisk: "Medium",
  applicableRegulations: 4,
  confidence: "94%",
  status: "Review Required" as const,
};

const regulations: Regulation[] = [
  {
    id: "1",
    lawName: "Illinois HB3773",
    state: "Illinois",
    similarityScore: 94,
    confidence: "High",
    whyItApplies:
      "This regulation applies because your AI system assists in employment-related decision making, specifically ranking job applicants — a use case directly addressed by Illinois HB3773.",
    requiredActions: [
      "Notify applicants about AI usage",
      "Maintain audit records of AI decisions",
      "Allow human review upon request",
      "Provide applicant rights disclosure",
    ],
    effectiveDate: "January 1, 2024",
    status: "Action Required",
  },
  {
    id: "2",
    lawName: "Colorado SB205",
    state: "Colorado",
    similarityScore: 87,
    confidence: "High",
    whyItApplies:
      "Colorado SB205 governs high-risk AI systems used in consequential decisions including employment. Your resume screening system qualifies as high-risk under this definition.",
    requiredActions: [
      "Conduct an impact assessment",
      "Disclose AI use to applicants",
      "Establish a bias audit process",
    ],
    effectiveDate: "February 1, 2026",
    status: "Needs Review",
  },
  {
    id: "3",
    lawName: "California AB2602",
    state: "California",
    similarityScore: 79,
    confidence: "Medium",
    whyItApplies:
      "California AB2602 addresses the use of automated decision tools in employment contexts. Because your AI system makes preliminary ranking decisions, it may fall within the scope of this law.",
    requiredActions: [
      "Post a public notice of AI use in hiring",
      "Provide opt-out mechanism for applicants",
    ],
    effectiveDate: "January 1, 2025",
    status: "Needs Review",
  },
  {
    id: "4",
    lawName: "New York City Local Law 144",
    state: "New York",
    similarityScore: 72,
    confidence: "Medium",
    whyItApplies:
      "NYC Local Law 144 requires employers using automated employment decision tools to conduct annual bias audits and notify candidates. Applicability depends on whether your workforce includes NYC-based candidates.",
    requiredActions: [
      "Commission an annual bias audit",
      "Publish audit results publicly",
      "Notify candidates in job postings",
    ],
    effectiveDate: "July 5, 2023",
    status: "Compliant",
  },
];

const nextSteps = [
  {
    label: "Generate Disclosure",
    description: "Auto-generate a compliance disclosure for this AI system.",
    icon: FileText,
    href: "/disclosures",
  },
  {
    label: "View Audit Requirements",
    description: "Browse the tamper-evident audit log and requirements.",
    icon: ScrollText,
    href: "/audit",
  },
  {
    label: "Register Another AI System",
    description: "Add and analyze another AI use case in your organization.",
    icon: Scan,
    href: "/use-cases",
  },
  {
    label: "Back to Dashboard",
    description: "Return to your compliance overview and state coverage.",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: RegulationStatus | "Review Required" }) {
  const map: Record<string, string> = {
    "Action Required": "border-foreground/25 text-foreground bg-foreground/10",
    "Needs Review": "border-foreground/20 text-foreground bg-foreground/[0.06]",
    "Compliant": "border-foreground/15 text-foreground bg-foreground/5",
    "Review Required": "border-foreground/20 text-foreground bg-foreground/[0.06]",
  };

  const dot: Record<string, string> = {
    "Action Required": "bg-foreground",
    "Needs Review": "bg-foreground/50",
    "Compliant": "bg-foreground/40",
    "Review Required": "bg-foreground/50",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 border text-xs font-mono shrink-0 ${map[status]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot[status]}`} />
      {status}
    </span>
  );
}

function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
  const map: Record<ConfidenceLevel, string> = {
    High: "border-foreground/20 text-foreground",
    Medium: "border-foreground/15 text-muted-foreground",
    Low: "border-foreground/10 text-muted-foreground",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 border text-xs font-mono ${map[level]}`}>
      {level}
    </span>
  );
}

function SimilarityBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className="flex-1 h-px bg-foreground/10 relative overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-foreground transition-all duration-700"
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-sm font-mono text-foreground shrink-0 w-10 text-right">{score}%</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LawMatchesPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const hasRegulations = regulations.length > 0;

  return (
    <div className="relative min-h-screen bg-background noise-overlay overflow-x-hidden">
      {/* Grid lines */}
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
            href="/use-cases"
            className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors duration-150"
          >
            &larr; AI Use Cases
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
              Law Matching
            </span>
            <h1 className="text-4xl lg:text-5xl font-display tracking-tight mb-3">
              Compliance Analysis Results
            </h1>
            <p className="text-base text-muted-foreground max-w-xl leading-relaxed">
              The following regulations were identified as relevant to your AI system based on semantic analysis.
            </p>
          </div>
          <Button
            size="lg"
            className="bg-foreground hover:bg-foreground/90 text-background px-6 h-12 text-sm rounded-full group shrink-0"
            asChild
          >
            <Link href="/disclosures">
              Generate Compliance Documents
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        {/* ── Summary Cards ── */}
        <section
          aria-label="Analysis summary"
          className={`grid grid-cols-2 lg:grid-cols-4 gap-px border border-foreground/10 mb-12 transition-all duration-700 delay-100 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {[
            {
              label: "AI System",
              value: aiSystem.name,
              sub: null,
              isLarge: false,
              icon: Scan,
            },
            {
              label: "Overall Risk",
              value: aiSystem.overallRisk,
              sub: null,
              isLarge: true,
              icon: AlertTriangle,
            },
            {
              label: "Applicable Regulations",
              value: String(aiSystem.applicableRegulations),
              sub: null,
              isLarge: true,
              icon: ScrollText,
            },
            {
              label: "Confidence",
              value: aiSystem.confidence,
              sub: null,
              isLarge: true,
              icon: TrendingUp,
            },
          ].map((card, i) => (
            <div
              key={card.label}
              className="bg-background p-6 flex flex-col gap-4 border-r border-foreground/10 last:border-r-0"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                  {card.label}
                </span>
                <card.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                {card.isLarge ? (
                  <span className="text-4xl lg:text-5xl font-display tracking-tight">{card.value}</span>
                ) : (
                  <span className="text-base font-sans font-medium text-foreground leading-snug">{card.value}</span>
                )}
              </div>
              {i === 3 && (
                <div className="h-px bg-foreground/10 relative overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full bg-foreground transition-all duration-1000"
                    style={{ width: isVisible ? "94%" : "0%" }}
                  />
                </div>
              )}
              <p className="text-xs font-mono text-muted-foreground">
                {i === 0 ? "Analyzed system" : i === 1 ? "Risk classification" : i === 2 ? "Matched AI laws" : "Semantic match score"}
              </p>
            </div>
          ))}
        </section>

        {/* ── Status Banner ── */}
        <div
          className={`flex items-center gap-4 px-6 py-4 border border-foreground/10 mb-12 transition-all duration-700 delay-150 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-foreground shrink-0" />
          <p className="text-sm font-mono text-foreground">
            Status:&nbsp;
            <span className="text-foreground font-medium">{aiSystem.status}</span>
            &nbsp;&mdash;&nbsp;
            <span className="text-muted-foreground">
              Action is required for {regulations.filter((r) => r.status === "Action Required").length} regulation{regulations.filter((r) => r.status === "Action Required").length !== 1 ? "s" : ""}. Review all applicable laws and generate disclosures to reach full compliance.
            </span>
          </p>
        </div>

        {/* ── Two-column body ── */}
        <div className="grid lg:grid-cols-[1fr_340px] gap-8">

          {/* LEFT — Regulations + Next Steps */}
          <div className="flex flex-col gap-12">

            {/* ── Applicable Regulations ── */}
            <section
              aria-label="Applicable regulations"
              className={`transition-all duration-700 delay-200 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <div className="flex items-center gap-3 mb-5">
                <span className="w-8 h-px bg-foreground/30" />
                <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest">
                  Applicable Regulations
                </h2>
                <span className="inline-flex items-center px-2 py-0.5 border border-foreground/15 text-xs font-mono text-muted-foreground">
                  {regulations.length}
                </span>
              </div>

              {hasRegulations ? (
                <div className="flex flex-col gap-4">
                  {regulations.map((reg) => (
                    <RegulationCard key={reg.id} reg={reg} isVisible={isVisible} />
                  ))}
                </div>
              ) : (
                <EmptyState />
              )}
            </section>

            {/* ── Recommended Next Steps ── */}
            <section
              aria-label="Recommended next steps"
              className={`transition-all duration-700 delay-300 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <div className="flex items-center gap-3 mb-5">
                <span className="w-8 h-px bg-foreground/30" />
                <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest">
                  Recommended Next Steps
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-px border border-foreground/10">
                {nextSteps.map((step, i) => (
                  <Link
                    key={step.href}
                    href={step.href}
                    className="group bg-background flex items-start gap-4 px-6 py-5 hover:bg-foreground/[0.03] transition-colors duration-150 border-r border-b border-foreground/10 last:border-r-0"
                  >
                    <div className="w-8 h-8 border border-foreground/15 flex items-center justify-center shrink-0 mt-0.5 group-hover:border-foreground/40 transition-colors duration-150">
                      <step.icon className="w-4 h-4 text-foreground/60 group-hover:text-foreground transition-colors duration-150" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-sans font-medium text-foreground mb-1">{step.label}</p>
                      <p className="text-xs font-mono text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT — Sidebar */}
          <aside
            className={`flex flex-col gap-6 transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            {/* How was this match determined? */}
            <div className="border border-foreground/10 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Info className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                  How was this match determined?
                </span>
              </div>
              <p className="text-sm font-sans text-muted-foreground leading-relaxed">
                ComplyTrace compares your AI system description against a curated database of AI regulations using semantic search. Similar regulations are retrieved and analyzed to determine their relevance.
              </p>
              <div className="mt-5 pt-4 border-t border-foreground/10 flex flex-col gap-3">
                {[
                  { step: "01", label: "Embed system description" },
                  { step: "02", label: "Vector search regulation database" },
                  { step: "03", label: "Score semantic similarity" },
                  { step: "04", label: "Rank and filter by confidence" },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-3">
                    <span className="text-xs font-mono text-muted-foreground w-6 shrink-0">{item.step}</span>
                    <div className="w-px h-3 bg-foreground/15 shrink-0" />
                    <span className="text-xs font-mono text-muted-foreground">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Regulation breakdown */}
            <div className="border border-foreground/10 p-6">
              <div className="flex items-center gap-3 mb-5">
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                  Regulation Breakdown
                </span>
              </div>
              <div className="flex flex-col gap-4">
                {(["Action Required", "Needs Review", "Compliant"] as RegulationStatus[]).map((s) => {
                  const count = regulations.filter((r) => r.status === s).length;
                  return (
                    <div key={s} className="flex items-center justify-between">
                      <StatusBadge status={s} />
                      <span className="text-2xl font-display tracking-tight">{count}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 pt-4 border-t border-foreground/10">
                <Button
                  size="sm"
                  className="w-full bg-foreground hover:bg-foreground/90 text-background h-10 text-xs rounded-full group"
                  asChild
                >
                  <Link href="/disclosures">
                    Generate All Disclosures
                    <ArrowRight className="w-3 h-3 ml-1.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Analyzed system recap */}
            <div className="border border-foreground/10 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Scan className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                  Analyzed System
                </span>
              </div>
              <p className="text-sm font-sans font-medium text-foreground mb-2">
                {aiSystem.name}
              </p>
              <p className="text-xs font-mono text-muted-foreground leading-relaxed">
                {aiSystem.description}
              </p>
              <div className="mt-4 pt-4 border-t border-foreground/10">
                <Link
                  href="/use-cases"
                  className="inline-flex items-center gap-2 text-xs font-mono text-foreground hover:text-muted-foreground transition-colors duration-150 group"
                >
                  Analyze a different system
                  <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </aside>
        </div>

        {/* ── Footer note ── */}
        <div
          className={`flex items-center gap-3 pt-8 mt-12 border-t border-foreground/10 transition-all duration-700 delay-400 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-muted-foreground shrink-0" />
          <p className="text-xs font-mono text-muted-foreground">
            All compliance data is encrypted at rest and in transit. Audit logs are cryptographically signed and tamper-evident.
          </p>
        </div>
      </main>
    </div>
  );
}

// ─── Regulation Card ─────────────────────────────────────────────────────────

function RegulationCard({
  reg,
  isVisible,
}: {
  reg: Regulation;
  isVisible: boolean;
}) {
  return (
    <div className="border border-foreground/10 bg-background">
      {/* Card header */}
      <div className="px-6 pt-6 pb-5 border-b border-foreground/10">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-display tracking-tight text-foreground mb-1">
              {reg.lawName}
            </h3>
            <span className="text-xs font-mono text-muted-foreground">{reg.state}</span>
          </div>
          <StatusBadge status={reg.status} />
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex flex-col gap-1 min-w-[140px]">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
              Similarity Score
            </span>
            <SimilarityBar score={reg.similarityScore} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
              Confidence
            </span>
            <ConfidenceBadge level={reg.confidence} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
              Effective Date
            </span>
            <span className="text-xs font-mono text-foreground">{reg.effectiveDate}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-5 grid sm:grid-cols-2 gap-6 border-b border-foreground/10">
        {/* Why it applies */}
        <div>
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest block mb-3">
            Why This Law Applies
          </span>
          <p className="text-sm font-sans text-muted-foreground leading-relaxed">
            {reg.whyItApplies}
          </p>
        </div>

        {/* Required actions */}
        <div>
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest block mb-3">
            Required Actions
          </span>
          <ul className="flex flex-col gap-2">
            {reg.requiredActions.map((action) => (
              <li key={action} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-foreground/50 shrink-0 mt-0.5" />
                <span className="text-sm font-mono text-muted-foreground leading-snug">
                  {action}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Card footer */}
      <div className="px-6 py-4 flex items-center gap-3">
        <Button
          size="sm"
          className="bg-foreground hover:bg-foreground/90 text-background px-4 h-9 text-xs rounded-full group"
          asChild
        >
          <Link href="/disclosures">
            Generate Disclosure
            <ArrowRight className="w-3 h-3 ml-1.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Button>
        <Link
          href="/audit"
          className="inline-flex items-center gap-1.5 h-9 px-3 border border-foreground/15 text-xs font-mono text-foreground hover:border-foreground/40 transition-colors duration-150"
        >
          <ScrollText className="w-3 h-3" />
          Audit Requirements
        </Link>
      </div>
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="border border-foreground/10 flex flex-col items-center justify-center py-20 px-8 text-center">
      <div className="w-12 h-12 border border-foreground/15 flex items-center justify-center mb-6">
        <ScrollText className="w-5 h-5 text-muted-foreground" />
      </div>
      <p className="text-base font-sans text-foreground mb-2">
        No applicable regulations were found for this AI system.
      </p>
      <p className="text-sm font-mono text-muted-foreground mb-8 max-w-sm leading-relaxed">
        Try refining your AI system description or registering a different use case to find matching regulations.
      </p>
      <Button
        size="lg"
        className="bg-foreground hover:bg-foreground/90 text-background px-6 h-12 text-sm rounded-full group"
        asChild
      >
        <Link href="/use-cases">
          Analyze Another AI System
          <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
        </Link>
      </Button>
    </div>
  );
}
