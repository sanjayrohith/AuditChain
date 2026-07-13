const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`);
  }

  return data as T;
}

// ─── Organizations ───────────────────────────────────────────────────────────

export interface Organization {
  id: string;
  name: string;
  industry: string;
  companySize: string | null;
  states: string[];
  subscriptionTier: string;
  demoApiKey?: string;
  createdAt: string;
}

export function createOrganization(data: {
  name: string;
  industry: string;
  companySize?: string;
  states: string[];
  email: string;
}): Promise<Organization> {
  return request("/api/organizations", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getOrganization(id: string): Promise<Organization> {
  return request(`/api/organizations/${id}`);
}

// ─── AI Systems ──────────────────────────────────────────────────────────────

export interface AiSystem {
  id: string;
  orgId: string;
  name: string;
  description: string;
  category: string | null;
  aiProvider: string | null;
  affectsPeople: boolean;
  status: "ready_for_analysis" | "analyzed";
  matchCount: number;
  createdAt: string;
}

export interface MatchResult {
  id: string;
  lawChunkId: string;
  jurisdictionId: string;
  state: string;
  lawName: string;
  citation: string;
  similarityScore: number;
  aiExplanation: string;
  status: string;
  createdAt: string;
}

export function createAiSystem(data: {
  orgId: string;
  name: string;
  category?: string;
  aiProvider?: string;
  affectsPeople?: boolean;
  description: string;
}): Promise<AiSystem> {
  return request("/api/ai-systems", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getAiSystems(orgId: string): Promise<AiSystem[]> {
  return request(`/api/ai-systems?orgId=${orgId}`);
}

export function updateAiSystem(
  id: string,
  data: Partial<{ name: string; description: string; category: string; aiProvider: string; affectsPeople: boolean }>
): Promise<AiSystem> {
  return request(`/api/ai-systems/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteAiSystem(id: string): Promise<{ deleted: boolean }> {
  return request(`/api/ai-systems/${id}`, { method: "DELETE" });
}

export function analyzeAiSystem(id: string): Promise<{ useCase: { id: string; status: string; matchCount: number }; matches: MatchResult[] }> {
  return request(`/api/ai-systems/${id}/analyze`, { method: "POST" });
}

export function analyzeAllSystems(orgId: string): Promise<{ analyzed: number; systems: { id: string; matchCount: number }[] }> {
  return request("/api/ai-systems/analyze-all", {
    method: "POST",
    body: JSON.stringify({ orgId }),
  });
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardData {
  complianceScore: number;
  applicableRegulations: number;
  aiSystems: number;
  pendingActions: number;
  byState: {
    state: string;
    applicableLaws: number;
    disclosures: number;
    outstanding: number;
    status: "compliant" | "needs_review" | "action_required";
  }[];
  recentActivity: {
    timestamp: string;
    description: string;
    status: string;
  }[];
  auditHealth: {
    cryptographicSignatures: boolean;
    immutableAuditTrail: boolean;
    lastReviewNote: string;
  };
}

export function getDashboard(orgId: string): Promise<DashboardData> {
  return request(`/api/dashboard?orgId=${orgId}`);
}

// ─── Disclosures ─────────────────────────────────────────────────────────────

export interface Disclosure {
  id: string;
  orgId: string;
  jurisdictionId: string;
  useCaseId: string | null;
  disclosureType: string;
  draftText: string;
  source: {
    chunkId: string;
    lawName: string;
    citation: string;
    state: string;
  };
  status: string;
  createdAt: string;
  disclaimer: string;
}

export function createDisclosure(data: {
  orgId: string;
  jurisdictionId: string;
  disclosureType: string;
  useCaseId?: string;
}): Promise<Disclosure> {
  return request("/api/disclosures", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getDisclosures(orgId: string): Promise<Disclosure[]> {
  return request(`/api/disclosures?orgId=${orgId}`);
}

// ─── Audit ───────────────────────────────────────────────────────────────────

export interface AuditEntry {
  id: string;
  orgId: string;
  decisionType: string;
  inputSummary: string;
  outputSummary: string;
  justification: string | null;
  actor: string;
  prevHash: string;
  rowHash: string;
  createdAt: string;
}

export interface AuditData {
  entries: AuditEntry[];
  verification: {
    ok: boolean;
    total: number;
    brokenAtIndex?: number;
  };
}

export function getAudit(orgId: string): Promise<AuditData> {
  return request(`/api/audit?orgId=${orgId}`);
}
