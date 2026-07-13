"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ShieldCheck,
  Plus,
  FileText,
  ScrollText,
  Code2,
  Scan,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Activity,
  Loader2,
} from "lucide-react";
import { getDashboard, type DashboardData } from "@/lib/api";

// ─── Helpers ─────────────────────────────────────────────────────────────────

type ComplianceStatus = "compliant" | "needs_review" | "action_required";
type ActivityStatus = "Completed" | "Attention Required";

function StatusBadge({ status }: { status: string }) {
  const displayMap: Record<string, string> = {
    compliant: "Compliant",
    needs_review: "Needs Review",
    action_required: "Action Required",
    Completed: "Completed",
    "Attention Required": "Attention Required",
  };

  const styleMap: Record<string, string> = {
    compliant: "border-foreground/15 text-foreground bg-foreground/5",
    needs_review: "border-foreground/20 text-foreground bg-foreground/8",
    action_required: "border-foreground/25 text-foreground bg-foreground/10",
    Completed: "border-foreground/15 text-foreground bg-foreground/5",
    "Attention Required": "border-foreground/25 text-foreground bg-foreground/10",
  };

  const dotMap: Record<string, string> = {
    compliant: "bg-foreground/60",
    needs_review: "bg-foreground/40",
    action_required: "bg-foreground",
    Completed: "bg-foreground/50",
    "Attention Required": "bg-foreground",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 border text-xs font-mono ${styleMap[status] ?? styleMap["Completed"]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotMap[status] ?? dotMap["Completed"]}`} />
      {displayMap[status] ?? status}
    </span>
  );
}

const quickActions = [
  {
    label: "Analyze New AI System",
    description: "Discover applicable regulations for a new use case",
    icon: Scan,
    href: "/use-cases",
  },
  {
    label: "Generate Disclosure",
    description: "Auto-generate a compliance disclosure document",
    icon: FileText,
    href: "/disclosures",
  },
  {
    label: "View Audit Log",
    description: "Browse your tamper-evident compliance history",
    icon: ScrollText,
    href: "/audit",
  },
  {
    label: "API Documentation",
    description: "Integrate ComplyTrace into your existing systems",
    icon: Code2,
    href: "/developers",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsVisible(true);
    const orgId = localStorage.getItem("orgId");
    if (!orgId) {
      setLoading(false);
      setError("No organization found. Please complete onboarding first.");
      return;
    }

    getDashboard(orgId)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-sm font-mono text-muted-foreground">{error}</p>
        <Button asChild className="rounded-full">
          <Link href="/onboarding">Go to Onboarding</Link>
        </Button>
      </div>
    );
  }

  const summaryCards = [
    {
      title: "Compliance Score",
      value: `${data!.complianceScore}%`,
      description: "Overall compliance readiness",
      icon: TrendingUp,
      progress: data!.complianceScore,
      showProgress: true,
    },
    {
      title: "Applicable Regulations",
      value: String(data!.applicableRegulations),
      description: "Matched AI laws",
      icon: ScrollText,
      showProgress: false,
    },
    {
      title: "AI Systems",
      value: String(data!.aiSystems),
      description: "Registered AI use cases",
      icon: Scan,
      showProgress: false,
    },
    {
      title: "Pending Actions",
      value: String(data!.pendingActions),
      description: "Items requiring attention",
      icon: AlertTriangle,
      showProgress: false,
    },
  ];

  return (
    <div className="relative min-h-screen bg-background noise-overlay overflow-x-hidden">
      {/* Grid lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        {[...Array(8)].map((_, i) => (
          <div key={`h-${i}`} className="absolute h-px bg-foreground/10" style={{ top: `${12.5 * (i + 1)}%`, left: 0, right: 0 }} />
        ))}
        {[...Array(12)].map((_, i) => (
          <div key={`v-${i}`} className="absolute w-px bg-foreground/10" style={{ left: `${8.33 * (i + 1)}%`, top: 0, bottom: 0 }} />
        ))}
      </div>

      {/* Top bar */}
      <header className="relative z-10 px-6 lg:px-12 h-16 flex items-center justify-between border-b border-foreground/10">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display text-xl tracking-tight">ComplyTrace</span>
          <span className="text-muted-foreground font-mono text-xs mt-0.5">AI</span>
        </Link>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-mono text-muted-foreground hidden sm:inline">SOC 2 Compliant</span>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 py-12 lg:py-16">
        {/* Page Header */}
        <div className={`flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-12 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div>
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-4">
              <span className="w-8 h-px bg-foreground/30" />
              Overview
            </span>
            <h1 className="text-4xl lg:text-5xl font-display tracking-tight mb-3">Compliance Dashboard</h1>
            <p className="text-base text-muted-foreground max-w-xl leading-relaxed">
              Monitor your organization&apos;s AI compliance status across all supported jurisdictions.
            </p>
          </div>
          <Button size="lg" className="bg-foreground hover:bg-foreground/90 text-background px-6 h-12 text-sm rounded-full group shrink-0" asChild>
            <Link href="/use-cases">
              <Plus className="w-4 h-4 mr-2" />
              Add AI Use Case
            </Link>
          </Button>
        </div>

        {/* Summary Cards */}
        <section aria-label="Summary" className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px border border-foreground/10 mb-12 transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          {summaryCards.map((card) => (
            <div key={card.title} className="bg-background p-6 flex flex-col gap-4 border-r border-foreground/10 last:border-r-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">{card.title}</span>
                <card.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <span className="text-5xl font-display tracking-tight">{card.value}</span>
              </div>
              {card.showProgress && (
                <div className="h-px bg-foreground/10 relative overflow-hidden">
                  <div className="absolute left-0 top-0 h-full bg-foreground transition-all duration-1000" style={{ width: isVisible ? `${card.progress}%` : "0%" }} />
                </div>
              )}
              <p className="text-xs font-mono text-muted-foreground">{card.description}</p>
            </div>
          ))}
        </section>

        {/* Two-column body */}
        <div className="grid lg:grid-cols-[1fr_360px] gap-8 mb-12">
          {/* LEFT column */}
          <div className="flex flex-col gap-8">
            {/* Compliance by State */}
            <section className={`transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <div className="flex items-center gap-3 mb-5">
                <span className="w-8 h-px bg-foreground/30" />
                <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest">Compliance by State</h2>
              </div>

              {data!.byState.length === 0 ? (
                <div className="border border-foreground/10 p-8 text-center">
                  <p className="text-sm font-mono text-muted-foreground">No regulation matches yet. Analyze your AI systems to see state coverage.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-px border border-foreground/10">
                  {data!.byState.map((item) => (
                    <div key={item.state} className="bg-background p-6 border-r border-b border-foreground/10 last:border-r-0">
                      <div className="flex items-start justify-between mb-5">
                        <h3 className="text-base font-sans font-medium">{item.state}</h3>
                        <StatusBadge status={item.status} />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-2xl font-display tracking-tight">{item.applicableLaws}</p>
                          <p className="text-xs font-mono text-muted-foreground mt-1">Applicable Laws</p>
                        </div>
                        <div>
                          <p className="text-2xl font-display tracking-tight">{item.disclosures}</p>
                          <p className="text-xs font-mono text-muted-foreground mt-1">Disclosures</p>
                        </div>
                        <div>
                          <p className="text-2xl font-display tracking-tight">{item.outstanding}</p>
                          <p className="text-xs font-mono text-muted-foreground mt-1">Outstanding</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Recent Activity */}
            <section className={`transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <div className="flex items-center gap-3 mb-5">
                <span className="w-8 h-px bg-foreground/30" />
                <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest">Recent Compliance Activity</h2>
              </div>

              <div className="border border-foreground/10">
                <div className="grid grid-cols-[120px_1fr_160px] border-b border-foreground/10 px-6 py-3">
                  <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Time</span>
                  <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Activity</span>
                  <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest text-right">Status</span>
                </div>
                {data!.recentActivity.length === 0 ? (
                  <div className="px-6 py-8 text-center">
                    <p className="text-xs font-mono text-muted-foreground">No recent activity. Analyze AI systems to get started.</p>
                  </div>
                ) : (
                  data!.recentActivity.map((row, i) => (
                    <div key={i} className="grid grid-cols-[120px_1fr_160px] items-center px-6 py-4 border-b border-foreground/10 last:border-b-0 hover:bg-foreground/[0.02] transition-colors duration-150">
                      <span className="text-xs font-mono text-muted-foreground">
                        {new Date(row.timestamp).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-2 pr-4">
                        {row.status === "Completed" ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-foreground shrink-0" />
                        )}
                        <span className="text-sm text-foreground leading-snug">{row.description}</span>
                      </div>
                      <div className="flex justify-end">
                        <StatusBadge status={row.status} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* RIGHT column — Quick Actions */}
          <aside className={`transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="flex items-center gap-3 mb-5">
              <span className="w-8 h-px bg-foreground/30" />
              <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest">Quick Actions</h2>
            </div>

            <div className="border border-foreground/10 flex flex-col">
              {quickActions.map((action, i) => (
                <Link key={action.href} href={action.href} className={`group flex items-start gap-4 px-6 py-5 hover:bg-foreground/[0.03] transition-colors duration-150 ${i < quickActions.length - 1 ? "border-b border-foreground/10" : ""}`}>
                  <div className="w-8 h-8 border border-foreground/15 flex items-center justify-center shrink-0 mt-0.5 group-hover:border-foreground/40 transition-colors duration-150">
                    <action.icon className="w-4 h-4 text-foreground/60 group-hover:text-foreground transition-colors duration-150" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-sans font-medium text-foreground mb-1">{action.label}</p>
                    <p className="text-xs font-mono text-muted-foreground leading-relaxed">{action.description}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              ))}
            </div>

            {/* Audit summary card */}
            <div className="mt-6 border border-foreground/10 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Audit Health</span>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Cryptographic signatures", ok: data!.auditHealth.cryptographicSignatures },
                  { label: "Immutable audit trail", ok: data!.auditHealth.immutableAuditTrail },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    {item.ok ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-foreground/60 shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-foreground shrink-0" />
                    )}
                    <span className="text-xs font-mono text-muted-foreground">{item.label}</span>
                  </div>
                ))}
                <div className="flex items-center gap-3">
                  <Clock className="w-3.5 h-3.5 text-foreground/60 shrink-0" />
                  <span className="text-xs font-mono text-muted-foreground">{data!.auditHealth.lastReviewNote}</span>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-foreground/10">
                <Link href="/audit" className="inline-flex items-center gap-2 text-xs font-mono text-foreground hover:text-muted-foreground transition-colors duration-150 group">
                  View full audit log
                  <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </aside>
        </div>

        {/* Footer note */}
        <div className={`flex items-center gap-3 pt-8 border-t border-foreground/10 transition-all duration-700 delay-400 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <ShieldCheck className="w-4 h-4 text-muted-foreground shrink-0" />
          <p className="text-xs font-mono text-muted-foreground">
            All compliance data is encrypted at rest and in transit. Audit logs are cryptographically signed and tamper-evident.
          </p>
        </div>
      </main>
    </div>
  );
}
