"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ShieldCheck,
  Copy,
  Check,
  Code2,
  LayoutDashboard,
  ScrollText,
  FileText,
  Zap,
  Terminal,
  Globe,
  Webhook,
  Key,
  BookOpen,
  ChevronRight,
  RotateCcw,
  Activity,
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const endpoints = [
  {
    method: "POST",
    path: "/api/v1/audit-events",
    description: "Create a new audit event in the tamper-evident log.",
  },
  {
    method: "GET",
    path: "/api/v1/compliance-score",
    description: "Retrieve the current compliance score for your organization.",
  },
  {
    method: "GET",
    path: "/api/v1/regulations",
    description: "Retrieve all applicable regulations matched to your AI systems.",
  },
  {
    method: "POST",
    path: "/api/v1/disclosures",
    description: "Generate a compliance disclosure document for a given AI system.",
  },
];

const sdks = [
  {
    icon: Terminal,
    name: "Node.js SDK",
    description: "Official SDK for Node.js and TypeScript applications.",
    status: "Available",
  },
  {
    icon: Code2,
    name: "Python SDK",
    description: "Official SDK for Python 3.8+ applications and data pipelines.",
    status: "Available",
  },
  {
    icon: Globe,
    name: "Java SDK",
    description: "Official SDK for Java 11+ enterprise applications.",
    status: "Available",
  },
  {
    icon: Activity,
    name: "REST API",
    description: "Full REST API access — use any language or HTTP client.",
    status: "Available",
  },
  {
    icon: Webhook,
    name: "Webhook Support",
    description: "Receive real-time events pushed to your endpoint.",
    status: "Available",
  },
];

const webhookEvents = [
  {
    event: "compliance.analysis.completed",
    description: "Fired when the law matching engine finishes an analysis run.",
  },
  {
    event: "audit.event.created",
    description: "Fired when a new entry is written to the audit log.",
  },
  {
    event: "disclosure.generated",
    description: "Fired when a compliance disclosure document is generated.",
  },
  {
    event: "compliance.score.updated",
    description: "Fired when the organization's compliance score changes.",
  },
];

const sidebarLinks = [
  { label: "Authentication", icon: Key },
  { label: "Rate Limits", icon: Zap },
  { label: "Error Codes", icon: Activity },
  { label: "Best Practices", icon: BookOpen },
  { label: "SDK Downloads", icon: Terminal },
];

const quickActions = [
  {
    label: "Dashboard",
    description: "Return to your compliance overview and state coverage.",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "Audit Log",
    description: "Browse tamper-evident compliance history.",
    icon: ScrollText,
    href: "/audit",
  },
  {
    label: "Compliance Documents",
    description: "Generate and download disclosure documents.",
    icon: FileText,
    href: "/disclosures",
  },
  {
    label: "API Playground",
    description: "Try API calls interactively in your browser.",
    icon: Zap,
    href: "/playground",
  },
];

const quickStartCode = `POST /api/v1/audit-events
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "aiSystem": "Resume Screening AI",
  "event": "Disclosure Generated",
  "status": "completed"
}`;

const responseExample = `{
  "success": true,
  "eventId": "evt_01HZX92",
  "status": "verified",
  "timestamp": "2026-06-30T12:45:00Z"
}`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function MethodBadge({ method }: { method: string }) {
  const map: Record<string, string> = {
    GET: "border-foreground/15 text-foreground bg-foreground/5",
    POST: "border-foreground/20 text-foreground bg-foreground/[0.08]",
    PUT: "border-foreground/20 text-foreground bg-foreground/[0.08]",
    DELETE: "border-foreground/25 text-foreground bg-foreground/10",
    PATCH: "border-foreground/20 text-foreground bg-foreground/[0.08]",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 border text-xs font-mono tracking-wider shrink-0 ${map[method] ?? map["GET"]}`}>
      {method}
    </span>
  );
}

function StatusBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-foreground/15 text-xs font-mono text-foreground bg-foreground/5">
      <span className="w-1.5 h-1.5 rounded-full bg-foreground/50" />
      {label}
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="Copy to clipboard"
      className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors duration-150"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5" />
          Copied
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          Copy
        </>
      )}
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DevelopersPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [keyRegenerated, setKeyRegenerated] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  function handleRegenerate() {
    setKeyRegenerated(true);
    setTimeout(() => setKeyRegenerated(false), 2500);
  }

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
            href="/audit"
            className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors duration-150"
          >
            &larr; Audit Log
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
              Developer API
            </span>
            <div className="flex items-center gap-4 mb-3">
              <h1 className="text-4xl lg:text-5xl font-display tracking-tight">
                Developer API
              </h1>
              <span className="inline-flex items-center gap-2 px-3 py-1 border border-foreground/15 text-xs font-mono text-muted-foreground bg-foreground/[0.03] self-start mt-2">
                <span className="text-muted-foreground">API Version</span>
                <span className="text-foreground font-medium">v1</span>
              </span>
            </div>
            <p className="text-base text-muted-foreground max-w-xl leading-relaxed">
              Integrate ComplyTrace with your existing applications to automate AI compliance monitoring and audit logging.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button
              size="sm"
              variant="outline"
              className="h-10 px-5 text-xs font-mono border-foreground/15 hover:bg-foreground/5 rounded-none gap-2"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Full Docs
            </Button>
            <Button
              size="sm"
              className="h-10 px-5 text-xs font-mono bg-foreground hover:bg-foreground/90 text-background rounded-none gap-2"
            >
              <Key className="w-3.5 h-3.5" />
              Manage Keys
            </Button>
          </div>
        </div>

        {/* ── Two-column layout ── */}
        <div className={`grid lg:grid-cols-[1fr_340px] gap-8 transition-all duration-700 delay-100 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}>

          {/* ── LEFT COLUMN ── */}
          <div className="flex flex-col gap-10">

            {/* API Keys */}
            <section aria-label="API keys">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-8 h-px bg-foreground/30" />
                <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest">API Keys</h2>
              </div>

              <div className="border border-foreground/10 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-5 border-b border-foreground/10">
                  <div>
                    <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">Production Key</p>
                    <div className="flex items-center gap-3">
                      <code className="text-sm font-mono text-foreground tracking-wider">
                        {keyRegenerated ? "•••••••••••••••••••••••••R4K" : "•••••••••••••••••••••••••X9D"}
                      </code>
                      <StatusBadge label="Active" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                      <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-4 text-xs font-mono border-foreground/15 hover:bg-foreground/5 rounded-none gap-1.5"
                      onClick={() => {
                        // The production secret key was removed from the repository.
                        // Do NOT hardcode secret keys in frontend code. To copy a key,
                        // fetch it from a secure server endpoint or copy a masked value.
                        navigator.clipboard.writeText("REDACTED - server secret removed")
                      }}
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-4 text-xs font-mono border-foreground/15 hover:bg-foreground/5 rounded-none gap-1.5"
                      onClick={handleRegenerate}
                    >
                      <RotateCcw className={`w-3 h-3 transition-transform duration-500 ${keyRegenerated ? "rotate-180" : ""}`} />
                      Regenerate
                    </Button>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-xs font-mono text-muted-foreground leading-relaxed">
                    Keep your API keys secure. Never expose them in client-side applications.
                  </p>
                </div>
              </div>
            </section>

            {/* Quick Start */}
            <section aria-label="Quick start">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-8 h-px bg-foreground/30" />
                <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest">Quick Start</h2>
              </div>

              <div className="border border-foreground/10">
                <div className="flex items-center justify-between px-5 py-3 border-b border-foreground/10 bg-foreground/[0.02]">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border border-foreground/15" />
                    <div className="w-3 h-3 rounded-full border border-foreground/15" />
                    <div className="w-3 h-3 rounded-full border border-foreground/15" />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">Example Request</span>
                  <CopyButton text={quickStartCode} />
                </div>
                <pre className="px-5 py-5 text-sm font-mono text-foreground leading-relaxed overflow-x-auto">
                  <code>{`POST /api/v1/audit-events\n`}<span className="text-muted-foreground">Content-Type: application/json</span>{`\n`}<span className="text-muted-foreground">Authorization: Bearer YOUR_API_KEY</span>{`\n\n{
  "aiSystem": "Resume Screening AI",
  "event": "Disclosure Generated",
  "status": "completed"
}`}</code>
                </pre>
              </div>
            </section>

            {/* API Endpoints */}
            <section aria-label="API endpoints">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-8 h-px bg-foreground/30" />
                <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest">API Endpoints</h2>
              </div>

              <div className="border border-foreground/10 flex flex-col">
                {endpoints.map((ep, i) => (
                  <div
                    key={ep.path}
                    className={`flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-5 hover:bg-foreground/[0.02] transition-colors duration-150 ${
                      i < endpoints.length - 1 ? "border-b border-foreground/10" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 sm:w-[220px] shrink-0">
                      <MethodBadge method={ep.method} />
                      <code className="text-xs font-mono text-foreground truncate">{ep.path}</code>
                    </div>
                    <p className="flex-1 text-xs font-mono text-muted-foreground leading-relaxed">
                      {ep.description}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-4 text-xs font-mono border-foreground/15 hover:bg-foreground/5 rounded-none gap-1.5 shrink-0"
                    >
                      View Documentation
                      <ChevronRight className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </section>

            {/* Example Response */}
            <section aria-label="Example response">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-8 h-px bg-foreground/30" />
                <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest">Example Response</h2>
              </div>

              <div className="border border-foreground/10">
                <div className="flex items-center justify-between px-5 py-3 border-b border-foreground/10 bg-foreground/[0.02]">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-foreground/15 text-xs font-mono text-foreground bg-foreground/5">
                      <span className="w-1.5 h-1.5 rounded-full bg-foreground/50" />
                      200 OK
                    </span>
                  </div>
                  <CopyButton text={responseExample} />
                </div>
                <pre className="px-5 py-5 text-sm font-mono text-foreground leading-relaxed overflow-x-auto">
                  <code>{`{
  `}<span className="text-muted-foreground">"success"</span>{`: true,
  `}<span className="text-muted-foreground">"eventId"</span>{`: `}<span className="text-foreground">"evt_01HZX92"</span>{`,
  `}<span className="text-muted-foreground">"status"</span>{`: `}<span className="text-foreground">"verified"</span>{`,
  `}<span className="text-muted-foreground">"timestamp"</span>{`: `}<span className="text-foreground">"2026-06-30T12:45:00Z"</span>{`
}`}</code>
                </pre>
              </div>
            </section>

            {/* SDKs & Integrations */}
            <section aria-label="SDKs and integrations">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-8 h-px bg-foreground/30" />
                <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest">SDK &amp; Integrations</h2>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px border border-foreground/10">
                {sdks.map((sdk) => (
                  <div
                    key={sdk.name}
                    className="bg-background p-5 flex flex-col gap-4 border-r border-b border-foreground/10 hover:bg-foreground/[0.02] transition-colors duration-150 cursor-pointer group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-8 h-8 border border-foreground/15 flex items-center justify-center shrink-0 group-hover:border-foreground/40 transition-colors duration-150">
                        <sdk.icon className="w-4 h-4 text-foreground/60 group-hover:text-foreground transition-colors duration-150" />
                      </div>
                      <StatusBadge label={sdk.status} />
                    </div>
                    <div>
                      <p className="text-sm font-sans font-medium text-foreground mb-1">{sdk.name}</p>
                      <p className="text-xs font-mono text-muted-foreground leading-relaxed">{sdk.description}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground group-hover:text-foreground transition-colors duration-150 mt-auto">
                      View SDK
                      <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Webhook Events */}
            <section aria-label="Webhook events">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-8 h-px bg-foreground/30" />
                <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest">Supported Webhooks</h2>
              </div>

              <div className="border border-foreground/10 flex flex-col">
                {webhookEvents.map((wh, i) => (
                  <div
                    key={wh.event}
                    className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 px-5 py-4 hover:bg-foreground/[0.02] transition-colors duration-150 ${
                      i < webhookEvents.length - 1 ? "border-b border-foreground/10" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:w-[300px] shrink-0">
                      <Webhook className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <code className="text-xs font-mono text-foreground">{wh.event}</code>
                    </div>
                    <p className="text-xs font-mono text-muted-foreground leading-relaxed">{wh.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Next Actions */}
            <section aria-label="Next actions">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-8 h-px bg-foreground/30" />
                <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest">Quick Actions</h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-px border border-foreground/10">
                {quickActions.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="group bg-background flex items-start gap-4 px-5 py-5 hover:bg-foreground/[0.03] transition-colors duration-150 border-r border-b border-foreground/10"
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

          {/* ── RIGHT SIDEBAR ── */}
          <aside className="flex flex-col gap-6">

            {/* Need Help? */}
            <div className="border border-foreground/10 p-6">
              <div className="flex items-center gap-3 mb-5">
                <BookOpen className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Need Help?</span>
              </div>
              <div className="flex flex-col">
                {sidebarLinks.map((link, i) => (
                  <a
                    key={link.label}
                    href="#"
                    className={`group flex items-center justify-between py-3 transition-colors duration-150 hover:text-foreground text-muted-foreground ${
                      i < sidebarLinks.length - 1 ? "border-b border-foreground/10" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <link.icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-xs font-mono">{link.label}</span>
                    </div>
                    <ChevronRight className="w-3 h-3 transition-transform duration-150 group-hover:translate-x-0.5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Base URL */}
            <div className="border border-foreground/10 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Base URL</span>
              </div>
              <code className="text-xs font-mono text-foreground block mb-3 leading-relaxed break-all">
                https://api.complytrace.ai
              </code>
              <p className="text-xs font-mono text-muted-foreground leading-relaxed">
                All requests must be made over HTTPS. HTTP requests will be rejected.
              </p>
            </div>

            {/* Rate Limits */}
            <div className="border border-foreground/10 p-6">
              <div className="flex items-center gap-3 mb-5">
                <Zap className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Rate Limits</span>
              </div>
              <div className="flex flex-col gap-4">
                {[
                  { plan: "Free", limit: "100 req / hour" },
                  { plan: "Pro", limit: "10,000 req / hour" },
                  { plan: "Enterprise", limit: "Unlimited" },
                ].map((item) => (
                  <div key={item.plan} className="flex items-center justify-between">
                    <span className="text-xs font-mono text-muted-foreground">{item.plan}</span>
                    <span className="text-xs font-mono text-foreground">{item.limit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Auth note */}
            <div className="border border-foreground/10 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Key className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Authentication</span>
              </div>
              <p className="text-xs font-mono text-muted-foreground leading-relaxed mb-4">
                Authenticate by passing your API key in the{" "}
                <code className="text-foreground">Authorization</code> header as a Bearer token.
              </p>
              <div className="border border-foreground/10 px-4 py-3 bg-foreground/[0.02]">
                <code className="text-xs font-mono text-foreground">
                  Authorization: Bearer sk_live_...
                </code>
              </div>
            </div>

            {/* Compliance note */}
            <div className="border border-foreground/10 p-6 flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-xs font-mono text-muted-foreground leading-relaxed">
                All API activity is logged to your tamper-evident audit trail automatically.
              </p>
            </div>

          </aside>
        </div>

        {/* ── Footer note ── */}
        <div
          className={`flex items-center gap-3 pt-8 mt-10 border-t border-foreground/10 transition-all duration-700 delay-400 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-muted-foreground shrink-0" />
          <p className="text-xs font-mono text-muted-foreground">
            All API traffic is encrypted in transit. Every request is logged to your organization&apos;s tamper-evident audit trail.
          </p>
        </div>

      </main>
    </div>
  );
}
