"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  ScrollText,
  LayoutDashboard,
  FileText,
  Code2,
  Activity,
  Hash,
  ChevronDown,
  Filter,
  ArrowUpDown,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type EventStatus = "Completed" | "Verified" | "Failed";
type IntegrityStatus = "Verified" | "Pending" | "Failed";

// ─── Data ─────────────────────────────────────────────────────────────────────

const summaryCards = [
  {
    title: "Integrity Status",
    value: "Verified",
    badge: true,
    icon: ShieldCheck,
  },
  {
    title: "Audit Events",
    value: "148",
    badge: false,
    icon: Activity,
  },
  {
    title: "Latest Activity",
    value: "2 min ago",
    badge: false,
    icon: Clock,
  },
  {
    title: "Organization Status",
    value: "Compliant",
    badge: false,
    icon: CheckCircle2,
  },
];

const auditEvents: {
  id: string;
  timestamp: string;
  event: string;
  aiSystem: string;
  user: string;
  status: EventStatus;
  integrity: IntegrityStatus;
  reason: string;
  prevHash: string;
  currHash: string;
}[] = [
  {
    id: "EVT-0148",
    timestamp: "2026-06-28 09:14",
    event: "Disclosure Generated",
    aiSystem: "Resume Screening AI",
    user: "Admin",
    status: "Completed",
    integrity: "Verified",
    reason: "User initiated disclosure generation for Illinois HB3773 from the Disclosure Generator page.",
    prevHash: "a3f8d2c1e94b7056f128e3a9d4c71b0e2f5a8d3c",
    currHash: "b7c2e5a8f13d4096e234f5b8c7a2d1e0f6b9c4a2",
  },
  {
    id: "EVT-0147",
    timestamp: "2026-06-28 08:42",
    event: "Compliance Analysis Completed",
    aiSystem: "Resume Screening AI",
    user: "Admin",
    status: "Completed",
    integrity: "Verified",
    reason: "Law matching engine completed semantic analysis against 47 applicable AI regulations.",
    prevHash: "f2a4b9c7d1e3056a8b2c5d8e1f4a7b0c3d6e9f2",
    currHash: "a3f8d2c1e94b7056f128e3a9d4c71b0e2f5a8d3c",
  },
  {
    id: "EVT-0146",
    timestamp: "2026-06-27 17:20",
    event: "AI System Added",
    aiSystem: "Resume Screening AI",
    user: "Admin",
    status: "Verified",
    integrity: "Verified",
    reason: "New AI use case registered: Resume Screening AI, classified as high-risk employment decision tool.",
    prevHash: "c6d9e2f5a8b1c4d7e0f3a6b9c2d5e8f1a4b7c0d",
    currHash: "f2a4b9c7d1e3056a8b2c5d8e1f4a7b0c3d6e9f2",
  },
  {
    id: "EVT-0145",
    timestamp: "2026-06-27 15:02",
    event: "Organization Created",
    aiSystem: "ABC HR",
    user: "Admin",
    status: "Completed",
    integrity: "Verified",
    reason: "Organization profile created during onboarding. Initial compliance assessment configuration saved.",
    prevHash: "0000000000000000000000000000000000000000",
    currHash: "c6d9e2f5a8b1c4d7e0f3a6b9c2d5e8f1a4b7c0d",
  },
  {
    id: "EVT-0144",
    timestamp: "2026-06-26 11:38",
    event: "Disclosure Downloaded",
    aiSystem: "Customer Service Chatbot",
    user: "Admin",
    status: "Completed",
    integrity: "Verified",
    reason: "PDF disclosure for Colorado SB205 downloaded by Admin user.",
    prevHash: "d8e1f4a7b0c3d6e9f2a5b8c1d4e7f0a3b6c9d2e",
    currHash: "e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1b4c7d0e3f",
  },
  {
    id: "EVT-0143",
    timestamp: "2026-06-26 09:15",
    event: "Compliance Analysis Completed",
    aiSystem: "Customer Service Chatbot",
    user: "Admin",
    status: "Completed",
    integrity: "Verified",
    reason: "Semantic law matching completed. 3 applicable regulations identified across 2 states.",
    prevHash: "b5c8d1e4f7a0b3c6d9e2f5a8b1c4d7e0f3a6b9c",
    currHash: "d8e1f4a7b0c3d6e9f2a5b8c1d4e7f0a3b6c9d2e",
  },
  {
    id: "EVT-0142",
    timestamp: "2026-06-25 16:44",
    event: "AI System Added",
    aiSystem: "Customer Service Chatbot",
    user: "Admin",
    status: "Verified",
    integrity: "Verified",
    reason: "Customer Service Chatbot registered as medium-risk AI system for consumer interaction.",
    prevHash: "9a2b5c8d1e4f7a0b3c6d9e2f5a8b1c4d7e0f3a6",
    currHash: "b5c8d1e4f7a0b3c6d9e2f5a8b1c4d7e0f3a6b9c",
  },
];

const timelineEvents = [
  { label: "Organization Created", sub: "2026-06-27 · Admin" },
  { label: "AI System Added", sub: "Resume Screening AI" },
  { label: "Compliance Analysis Completed", sub: "47 regulations scanned" },
  { label: "Disclosure Generated", sub: "Illinois HB3773" },
  { label: "Audit Verified", sub: "Integrity confirmed" },
];

const quickActions = [
  {
    label: "Dashboard",
    description: "Return to your compliance overview and state coverage.",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "AI Systems",
    description: "Add or manage registered AI use cases.",
    icon: ScrollText,
    href: "/use-cases",
  },
  {
    label: "Compliance Documents",
    description: "Generate and download disclosure documents.",
    icon: FileText,
    href: "/disclosures",
  },
  {
    label: "Developer API",
    description: "Integrate ComplyTrace into your existing systems.",
    icon: Code2,
    href: "/developers",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function EventStatusBadge({ status }: { status: EventStatus }) {
  const map: Record<EventStatus, string> = {
    Completed: "border-foreground/15 text-foreground bg-foreground/5",
    Verified: "border-foreground/20 text-foreground bg-foreground/[0.08]",
    Failed: "border-foreground/30 text-foreground bg-foreground/10",
  };
  const dot: Record<EventStatus, string> = {
    Completed: "bg-foreground/50",
    Verified: "bg-foreground/70",
    Failed: "bg-foreground",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 border text-xs font-mono shrink-0 ${map[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot[status]}`} />
      {status}
    </span>
  );
}

function IntegrityBadge({ status }: { status: IntegrityStatus }) {
  const map: Record<IntegrityStatus, string> = {
    Verified: "border-foreground/15 text-foreground bg-foreground/5",
    Pending: "border-foreground/15 text-muted-foreground bg-transparent",
    Failed: "border-foreground/30 text-foreground bg-foreground/10",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 border text-xs font-mono shrink-0 ${map[status]}`}>
      <ShieldCheck className="w-3 h-3" />
      {status}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AuditPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<typeof auditEvents[0] | null>(auditEvents[0]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const filtered = auditEvents.filter((e) => {
    const matchSearch =
      search === "" ||
      e.event.toLowerCase().includes(search.toLowerCase()) ||
      e.aiSystem.toLowerCase().includes(search.toLowerCase()) ||
      e.user.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

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
            href="/disclosures"
            className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors duration-150"
          >
            &larr; Disclosures
          </Link>
          <ShieldCheck className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-mono text-muted-foreground hidden sm:inline">SOC 2 Compliant</span>
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
              Compliance Audit
            </span>
            <h1 className="text-4xl lg:text-5xl font-display tracking-tight mb-3">
              Audit Log
            </h1>
            <p className="text-base text-muted-foreground max-w-xl leading-relaxed">
              Review every compliance activity and verify the integrity of your organization&apos;s AI compliance history.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <Button
              size="sm"
              variant="outline"
              className="h-10 px-5 text-xs font-mono border-foreground/15 hover:bg-foreground/5 rounded-none gap-2"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Verify Integrity
            </Button>
            <Button
              size="sm"
              className="h-10 px-5 text-xs font-mono bg-foreground hover:bg-foreground/90 text-background rounded-none gap-2"
            >
              Export Audit Report
            </Button>
          </div>
        </div>

        {/* ── Summary Cards ── */}
        <section
          aria-label="Audit summary"
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px border border-foreground/10 mb-12 transition-all duration-700 delay-100 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {summaryCards.map((card) => (
            <div
              key={card.title}
              className="bg-background p-6 flex flex-col gap-4 border-r border-foreground/10 last:border-r-0"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                  {card.title}
                </span>
                <card.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              {card.badge ? (
                <div className="flex items-center gap-2">
                  <span className="text-4xl font-display tracking-tight">{card.value}</span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-foreground/15 text-xs font-mono text-foreground bg-foreground/5">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground/60" />
                    OK
                  </span>
                </div>
              ) : (
                <span className="text-4xl font-display tracking-tight">{card.value}</span>
              )}
            </div>
          ))}
        </section>

        {/* ── Search & Filters ── */}
        <section
          aria-label="Search and filters"
          className={`flex flex-wrap items-center gap-3 mb-6 transition-all duration-700 delay-150 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events, systems, users..."
              className="w-full pl-9 pr-4 h-10 bg-background border border-foreground/15 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/40 transition-colors duration-150"
            />
          </div>

          {/* Date Range */}
          <div className="relative">
            <button
              type="button"
              className="h-10 px-4 border border-foreground/15 text-xs font-mono text-muted-foreground hover:bg-foreground/[0.03] transition-colors duration-150 flex items-center gap-2"
            >
              <Filter className="w-3.5 h-3.5" />
              Date Range
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Status filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 pl-4 pr-8 bg-background border border-foreground/15 text-xs font-mono text-muted-foreground focus:outline-none focus:border-foreground/40 transition-colors duration-150 appearance-none cursor-pointer"
            >
              {["All", "Completed", "Verified", "Failed"].map((s) => (
                <option key={s} value={s}>{s === "All" ? "All Statuses" : s}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          </div>

          {/* AI System filter */}
          <div className="relative">
            <select
              className="h-10 pl-4 pr-8 bg-background border border-foreground/15 text-xs font-mono text-muted-foreground focus:outline-none focus:border-foreground/40 transition-colors duration-150 appearance-none cursor-pointer"
              defaultValue="All"
            >
              {["All", "Resume Screening AI", "Customer Service Chatbot"].map((s) => (
                <option key={s} value={s}>{s === "All" ? "All AI Systems" : s}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          </div>

          {/* Sort */}
          <div className="relative ml-auto">
            <button
              type="button"
              className="h-10 px-4 border border-foreground/15 text-xs font-mono text-muted-foreground hover:bg-foreground/[0.03] transition-colors duration-150 flex items-center gap-2"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              Newest First
            </button>
          </div>
        </section>

        {/* ── Main content: Table + Details ── */}
        <div className={`grid lg:grid-cols-[1fr_360px] gap-8 mb-12 transition-all duration-700 delay-200 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}>

          {/* LEFT: Table */}
          <div className="flex flex-col gap-8">
            <section aria-label="Audit events table">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-8 h-px bg-foreground/30" />
                <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest">
                  Audit Events
                </h2>
                <span className="inline-flex items-center px-2 py-0.5 border border-foreground/15 text-xs font-mono text-muted-foreground">
                  {filtered.length}
                </span>
              </div>

              {filtered.length === 0 ? (
                /* Empty state */
                <div className="border border-foreground/10 flex flex-col items-center justify-center py-20 gap-5">
                  <div className="w-12 h-12 border border-foreground/15 flex items-center justify-center">
                    <ScrollText className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-sans text-foreground mb-2">No audit events have been recorded yet.</p>
                    <p className="text-xs font-mono text-muted-foreground">Events will appear here once compliance activity begins.</p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-foreground hover:bg-foreground/90 text-background px-5 h-10 text-xs rounded-full"
                    asChild
                  >
                    <Link href="/dashboard">Return to Dashboard</Link>
                  </Button>
                </div>
              ) : (
                <div className="border border-foreground/10">
                  {/* Table header */}
                  <div className="hidden lg:grid grid-cols-[160px_1fr_160px_80px_110px_100px] border-b border-foreground/10 px-5 py-3 bg-foreground/[0.02]">
                    {["Timestamp", "Event", "AI System", "User", "Status", "Integrity"].map((col) => (
                      <span key={col} className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                        {col}
                      </span>
                    ))}
                  </div>
                  {/* Rows */}
                  {filtered.map((row, i) => {
                    const isSelected = selectedEvent?.id === row.id;
                    return (
                      <button
                        key={row.id}
                        type="button"
                        onClick={() => setSelectedEvent(row)}
                        className={`w-full text-left flex flex-col lg:grid lg:grid-cols-[160px_1fr_160px_80px_110px_100px] items-start lg:items-center gap-2 lg:gap-0 px-5 py-4 border-b border-foreground/10 last:border-b-0 transition-colors duration-150 ${
                          isSelected
                            ? "bg-foreground/[0.05]"
                            : "hover:bg-foreground/[0.02]"
                        }`}
                        aria-pressed={isSelected}
                      >
                        <span className="text-xs font-mono text-muted-foreground">{row.timestamp}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-sans text-foreground">{row.event}</span>
                        </div>
                        <span className="text-xs font-mono text-muted-foreground">{row.aiSystem}</span>
                        <span className="text-xs font-mono text-muted-foreground">{row.user}</span>
                        <EventStatusBadge status={row.status} />
                        <IntegrityBadge status={row.integrity} />
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* ── Activity Timeline ── */}
            <section
              aria-label="Recent activity timeline"
              className={`transition-all duration-700 delay-300 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <div className="flex items-center gap-3 mb-5">
                <span className="w-8 h-px bg-foreground/30" />
                <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest">
                  Recent Activity Timeline
                </h2>
              </div>

              <div className="border border-foreground/10 p-6">
                <div className="flex flex-col gap-0">
                  {timelineEvents.map((item, i) => (
                    <div key={item.label} className="flex items-stretch gap-5">
                      {/* Connector column */}
                      <div className="flex flex-col items-center shrink-0" style={{ width: 20 }}>
                        <div className="w-2.5 h-2.5 rounded-full border-2 border-foreground/50 bg-background shrink-0 mt-1" />
                        {i < timelineEvents.length - 1 && (
                          <div className="w-px flex-1 bg-foreground/15 my-1" />
                        )}
                      </div>
                      {/* Content */}
                      <div className={`flex flex-col gap-0.5 ${i < timelineEvents.length - 1 ? "pb-6" : "pb-0"}`}>
                        <span className="text-sm font-sans font-medium text-foreground">{item.label}</span>
                        <span className="text-xs font-mono text-muted-foreground">{item.sub}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── Quick Actions ── */}
            <section
              aria-label="Quick actions"
              className={`transition-all duration-700 delay-350 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <div className="flex items-center gap-3 mb-5">
                <span className="w-8 h-px bg-foreground/30" />
                <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest">
                  Quick Actions
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-px border border-foreground/10">
                {quickActions.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="group bg-background flex items-start gap-4 px-6 py-5 hover:bg-foreground/[0.03] transition-colors duration-150 border-b border-r border-foreground/10 last:border-r-0 last:border-b-0"
                  >
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
            </section>
          </div>

          {/* RIGHT: Details Panel + Integrity Card */}
          <aside className="flex flex-col gap-6">

            {/* ── Event Details Panel ── */}
            <section aria-label="Event details">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-8 h-px bg-foreground/30" />
                <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest">
                  Event Details
                </h2>
              </div>

              {selectedEvent ? (
                <div className="border border-foreground/10">
                  {/* Detail rows */}
                  {[
                    { label: "Event ID", value: selectedEvent.id },
                    { label: "Timestamp", value: selectedEvent.timestamp },
                    { label: "Performed By", value: selectedEvent.user },
                    { label: "AI System", value: selectedEvent.aiSystem },
                    { label: "Action", value: selectedEvent.event },
                  ].map((item, i) => (
                    <div
                      key={item.label}
                      className={`flex flex-col gap-1 px-5 py-4 ${i < 4 ? "border-b border-foreground/10" : ""}`}
                    >
                      <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                        {item.label}
                      </span>
                      <span className="text-sm font-sans text-foreground">{item.value}</span>
                    </div>
                  ))}

                  {/* Reason */}
                  <div className="flex flex-col gap-1 px-5 py-4 border-b border-foreground/10">
                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Reason</span>
                    <p className="text-xs font-mono text-muted-foreground leading-relaxed">{selectedEvent.reason}</p>
                  </div>

                  {/* Hash values */}
                  <div className="flex flex-col gap-1 px-5 py-4 border-b border-foreground/10">
                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">
                      Previous Hash
                    </span>
                    <div className="bg-foreground/[0.03] border border-foreground/10 px-3 py-2.5 flex items-start gap-2">
                      <Hash className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
                      <code className="text-[10px] font-mono text-muted-foreground break-all leading-relaxed">
                        {selectedEvent.prevHash}
                      </code>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 px-5 py-4 border-b border-foreground/10">
                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">
                      Current Hash
                    </span>
                    <div className="bg-foreground/[0.03] border border-foreground/10 px-3 py-2.5 flex items-start gap-2">
                      <Hash className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
                      <code className="text-[10px] font-mono text-foreground break-all leading-relaxed">
                        {selectedEvent.currHash}
                      </code>
                    </div>
                  </div>

                  {/* Integrity status */}
                  <div className="flex items-center justify-between px-5 py-4">
                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                      Integrity Status
                    </span>
                    <IntegrityBadge status={selectedEvent.integrity} />
                  </div>
                </div>
              ) : (
                <div className="border border-foreground/10 flex items-center justify-center py-12">
                  <p className="text-xs font-mono text-muted-foreground">Select an event to view details</p>
                </div>
              )}
            </section>

            {/* ── Integrity Information Card ── */}
            <section
              aria-label="How integrity verification works"
              className={`transition-all duration-700 delay-250 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <div className="border border-foreground/10 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <ShieldCheck className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                    How Integrity Verification Works
                  </span>
                </div>
                <p className="text-xs font-mono text-muted-foreground leading-relaxed">
                  Every audit event is linked to the previous event using cryptographic hashes. This creates a tamper-evident audit trail. If any historical record is modified, the integrity verification process detects the change.
                </p>

                {/* Visual chain diagram */}
                <div className="mt-5 flex flex-col gap-1">
                  {["Event A", "Event B", "Event C"].map((e, i) => (
                    <div key={e} className="flex flex-col items-start">
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-8 h-8 border border-foreground/15 flex items-center justify-center shrink-0">
                          <Hash className="w-3 h-3 text-muted-foreground" />
                        </div>
                        <code className="text-[10px] font-mono text-muted-foreground flex-1 truncate">
                          hash({e.toLowerCase().replace(" ", "_")}) → {["a3f8d2c1", "b7c2e5a8", "c6d9e2f5"][i]}…
                        </code>
                      </div>
                      {i < 2 && (
                        <div className="w-px h-3 bg-foreground/20 ml-4" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>

          </aside>
        </div>

        {/* ── Footer note ── */}
        <div
          className={`flex items-center gap-3 pt-8 border-t border-foreground/10 transition-all duration-700 delay-400 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-muted-foreground shrink-0" />
          <p className="text-xs font-mono text-muted-foreground">
            All audit events are cryptographically signed and stored in a tamper-evident ledger. Any modification to historical records will break the integrity chain.
          </p>
        </div>
      </main>
    </div>
  );
}
