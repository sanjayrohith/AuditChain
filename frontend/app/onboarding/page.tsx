"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Scan, Scale, FileText, ShieldCheck } from "lucide-react";
import Link from "next/link";

const industries = [
  "Human Resources",
  "Retail",
  "Healthcare",
  "Finance",
  "Technology",
  "Education",
  "Manufacturing",
  "Other",
];

const companySizes = [
  "1–10 Employees",
  "11–50 Employees",
  "51–200 Employees",
  "200+ Employees",
];

const states = [
  { id: "CA", label: "California" },
  { id: "IL", label: "Illinois" },
  { id: "CO", label: "Colorado" },
  { id: "VA", label: "Virginia" },
  { id: "NY", label: "New York" },
  { id: "UT", label: "Utah" },
];

const nextSteps = [
  {
    icon: Scan,
    label: "Analyze your AI systems",
  },
  {
    icon: Scale,
    label: "Match applicable AI regulations",
  },
  {
    icon: FileText,
    label: "Generate compliance disclosures",
  },
  {
    icon: ShieldCheck,
    label: "Build your audit trail",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [aiDescription, setAiDescription] = useState("");

  useEffect(() => {
    setIsVisible(true);
  }, []);

  function toggleState(id: string) {
    setSelectedStates((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push("/dashboard");
  }

  const isValid =
    companyName.trim() !== "" &&
    industry !== "" &&
    companySize !== "" &&
    selectedStates.length > 0 &&
    aiDescription.trim() !== "";

  return (
    <div className="relative min-h-screen bg-background noise-overlay overflow-x-hidden">
      {/* Subtle grid lines — matches landing page */}
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

      {/* Slim top bar */}
      <header className="relative z-10 px-6 lg:px-12 h-16 flex items-center border-b border-foreground/10">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display text-xl tracking-tight">ComplyTrace</span>
          <span className="text-muted-foreground font-mono text-xs mt-0.5">AI</span>
        </Link>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 py-16 lg:py-24">
        {/* Page heading */}
        <div
          className={`mb-12 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
            <span className="w-8 h-px bg-foreground/30" />
            Getting started
          </span>
          <h1 className="text-4xl lg:text-6xl font-display tracking-tight mb-4">
            Let&apos;s set up your
            <br />
            organization.
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
            Tell us a little about your company so we can determine which AI
            regulations apply to your business.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-[1fr_380px] gap-12 lg:gap-16 items-start">
          {/* LEFT — Form */}
          <form
            onSubmit={handleSubmit}
            className={`transition-all duration-700 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <div className="flex flex-col gap-8">
              {/* Company Name */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-mono text-foreground/70" htmlFor="company-name">
                  Company Name
                </label>
                <input
                  id="company-name"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Corp"
                  className="h-12 px-4 bg-transparent border border-foreground/15 focus:border-foreground/40 outline-none text-foreground placeholder:text-muted-foreground transition-colors duration-200 font-sans text-base"
                />
              </div>

              {/* Industry */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-mono text-foreground/70" htmlFor="industry">
                  Industry
                </label>
                <div className="relative">
                  <select
                    id="industry"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full h-12 px-4 pr-10 bg-transparent border border-foreground/15 focus:border-foreground/40 outline-none text-foreground appearance-none cursor-pointer transition-colors duration-200 font-sans text-base"
                  >
                    <option value="" disabled className="bg-background">
                      Select your industry
                    </option>
                    {industries.map((ind) => (
                      <option key={ind} value={ind} className="bg-background">
                        {ind}
                      </option>
                    ))}
                  </select>
                  {/* Chevron */}
                  <svg
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>

              {/* Company Size */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-mono text-foreground/70" htmlFor="company-size">
                  Company Size
                </label>
                <div className="relative">
                  <select
                    id="company-size"
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                    className="w-full h-12 px-4 pr-10 bg-transparent border border-foreground/15 focus:border-foreground/40 outline-none text-foreground appearance-none cursor-pointer transition-colors duration-200 font-sans text-base"
                  >
                    <option value="" disabled className="bg-background">
                      Select company size
                    </option>
                    {companySizes.map((size) => (
                      <option key={size} value={size} className="bg-background">
                        {size}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>

              {/* States */}
              <div className="flex flex-col gap-3">
                <label className="text-sm font-mono text-foreground/70">
                  States Where Your Company Operates
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {states.map((state) => {
                    const selected = selectedStates.includes(state.id);
                    return (
                      <button
                        key={state.id}
                        type="button"
                        onClick={() => toggleState(state.id)}
                        className={`group relative flex items-center justify-between px-4 py-3 border text-sm font-sans text-left transition-all duration-200 ${
                          selected
                            ? "border-foreground bg-foreground text-background"
                            : "border-foreground/15 text-foreground hover:border-foreground/40"
                        }`}
                      >
                        <span>{state.label}</span>
                        <span
                          className={`shrink-0 ml-2 w-4 h-4 border flex items-center justify-center transition-all duration-200 ${
                            selected
                              ? "border-background bg-background"
                              : "border-foreground/20 group-hover:border-foreground/50"
                          }`}
                        >
                          {selected && (
                            <Check className="w-2.5 h-2.5 text-foreground" />
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AI Description */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-mono text-foreground/70" htmlFor="ai-description">
                  Describe How Your Company Uses AI
                </label>
                <textarea
                  id="ai-description"
                  value={aiDescription}
                  onChange={(e) => setAiDescription(e.target.value)}
                  placeholder="We use AI to rank job applicants before recruiters review them."
                  rows={5}
                  className="px-4 py-3 bg-transparent border border-foreground/15 focus:border-foreground/40 outline-none text-foreground placeholder:text-muted-foreground transition-colors duration-200 font-sans text-base resize-none leading-relaxed"
                />
              </div>

              {/* Submit */}
              <div className="flex flex-col gap-4 pt-2">
                <Button
                  type="submit"
                  size="lg"
                  disabled={!isValid}
                  className="bg-foreground hover:bg-foreground/90 text-background px-8 h-14 text-base rounded-full group w-full sm:w-auto sm:self-start disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Start Compliance Assessment
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>

                {/* Footer note */}
                <p className="text-xs font-mono text-muted-foreground">
                  Your information is used only to generate compliance recommendations.
                </p>
              </div>
            </div>
          </form>

          {/* RIGHT — What happens next */}
          <aside
            className={`transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <div className="border border-foreground/10 p-8 sticky top-24">
              {/* Header */}
              <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
                <span className="w-8 h-px bg-foreground/30" />
                What happens next?
              </span>

              {/* Steps */}
              <ol className="flex flex-col gap-0">
                {nextSteps.map((step, i) => (
                  <li key={step.label} className="flex items-start gap-4">
                    {/* Connector column */}
                    <div className="flex flex-col items-center shrink-0">
                      <div className="w-8 h-8 border border-foreground/15 flex items-center justify-center shrink-0">
                        <step.icon className="w-4 h-4 text-foreground/60" />
                      </div>
                      {i < nextSteps.length - 1 && (
                        <div className="w-px h-8 bg-foreground/10" />
                      )}
                    </div>
                    {/* Label */}
                    <div className="pb-8 last:pb-0">
                      <span className="text-sm font-mono text-muted-foreground block leading-none mb-0.5">
                        0{i + 1}
                      </span>
                      <p className="text-base text-foreground leading-snug">
                        {step.label}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              {/* Divider + trust note */}
              <div className="mt-8 pt-6 border-t border-foreground/10">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-xs font-mono text-muted-foreground leading-relaxed">
                    SOC 2 compliant. Your data is encrypted in transit and at rest.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
