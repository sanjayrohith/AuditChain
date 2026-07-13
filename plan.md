# ComplyTrace Backend — Build Plan

Source material: `ARCHITECTURE.md`, `ComplyTrace_Build_Plan.md`, and 4 frontend screenshots
(landing page, onboarding form, compliance dashboard, AI use cases page).

## Assumption stated up front

Your frontend (from the screenshots) is a separately built app that will call the backend
over HTTP — not a co-located Next.js app using Server Actions directly. So this plan builds
a **REST API** (Next.js Route Handlers), not Server Actions. If your frontend actually lives
in the same Next.js project as this backend, Phase 5 onward can be swapped to Server Actions
with almost no schema/logic changes — I'll note where that swap would happen.

## Gap check: reference schema vs. what your frontend screenshots need

| Frontend needs (from screenshots) | In reference `ARCHITECTURE.md` schema? | Action |
|---|---|---|
| `companySize` on onboarding form | No | Add column to `organizations` |
| Single combined onboarding + first AI-use description | Partially (two separate flows) | Merge into one endpoint, keep both tables |
| `aiProvider` per AI system (OpenAI, AWS Bedrock, etc.) | No | Add column to `business_ai_use_cases` |
| `affectsPeople` boolean per AI system | No | Add column to `business_ai_use_cases` |
| `category` per AI system (Hiring, Customer Support, etc.) | Yes (`category` exists) | Keep as-is |
| "Ready for Analysis" state — matching is a manual "Analyze" click | No — reference auto-matches on save | Split `addUseCase` into `create` + separate `analyze` endpoint |
| Dashboard: `complianceScore` % | No | New aggregation query |
| Dashboard: `applicableRegulations`, `aiSystems`, `pendingActions` counts | Partial | New aggregation query |
| Dashboard: per-state Compliant / Needs Review / Action Required | Yes (red/yellow/green logic exists) | Reuse logic, relabel |
| Dashboard: recent activity feed | No | New table or derived from existing tables + audit log |
| Dashboard: "Audit health" panel | No | Derived from `verifyChain()` result |

Everything else (RAG matching, disclosures, hash-chained audit log, two-seam AI/DB
abstraction) can be taken close to as-is from the reference documents.

---

## Phase 0 — Project Scaffold & Environment

**Goal:** an empty, runnable Next.js API project with local Postgres+pgvector, no business
logic yet.

- [ ] `npx create-next-app@latest complytrace-backend --typescript --app --no-tailwind`
- [ ] Install: `drizzle-orm pg dotenv zod`, dev: `drizzle-kit tsx @types/pg`
- [ ] `docker-compose.yml` with `pgvector/pgvector:pg16`, port 5432, named volume
- [ ] `.env.local` with `DATABASE_URL`, `AI_PROVIDER=local`, `EMBEDDING_DIM=1024`,
      `SIMILARITY_THRESHOLD=0.3`, `RETRIEVAL_TOP_K=5`
- [ ] `src/lib/config.ts` — single module reading `process.env` once, exporting typed
      constants (mirrors the reference doc's Section 14 config flow)
- [ ] Confirm `docker compose up -d` + a raw `SELECT 1` from a throwaway script works

**Acceptance:** `npm run dev` boots, a one-off script can connect to Postgres.

---

## Phase 1 — Database Schema (Drizzle)

**Goal:** every table your frontend screenshots require, with the extra columns identified
in the gap check.

`src/db/schema.ts`:

```
organizations
  id, name, industry, company_size, states text[], subscription_tier default 'free',
  demo_api_key, created_at

users
  id, org_id FK, email UNIQUE, role default 'admin', created_at

jurisdictions
  id, state, law_name, citation, effective_date, summary,
  applies_to_industries text[], created_at

law_chunks
  id, jurisdiction_id FK, chunk_text, chunk_index, embedding vector(1024) NOT NULL,
  created_at
  -- HNSW index on embedding (vector_cosine_ops)

business_ai_use_cases
  id, org_id FK, name, description, category, ai_provider, affects_people boolean,
  embedding vector(1024) NULL,   -- NULL until "Analyze" is run
  status text default 'ready_for_analysis',  -- 'ready_for_analysis' | 'analyzed'
  created_at

matched_rules
  id, use_case_id FK, law_chunk_id FK, jurisdiction_id FK,
  similarity_score float, ai_explanation text, status default 'flagged', created_at

disclosures
  id, org_id FK, jurisdiction_id FK, use_case_id FK NULL, disclosure_type,
  draft_text, source_chunk_id FK NULL, status default 'draft', created_at

ai_decision_log
  id, org_id FK, decision_type, input_summary, output_summary, justification NULL,
  actor, prev_hash, row_hash, created_at
  -- append-only by convention; REVOKE UPDATE, DELETE at DB level (Phase 8)
```

Notes on the two deliberate deviations from the reference schema:
- `embedding` on `business_ai_use_cases` is nullable and `status` defaults to
  `ready_for_analysis`, because your frontend shows a system sitting in that state
  *before* analysis — the reference schema embeds immediately on save.
- `company_size` and `ai_provider` are plain text columns; keep them as free text now,
  can become enums later once you know the fixed option list from your `<select>` inputs.

- [ ] Write schema in Drizzle syntax
- [ ] `drizzle-kit push` against local Docker Postgres
- [ ] Enable `CREATE EXTENSION vector; CREATE EXTENSION pgcrypto;` manually first
- [ ] Add HNSW index migration for `law_chunks.embedding`

**Acceptance:** all tables exist; `\d+ business_ai_use_cases` in psql shows nullable
embedding and the new columns.

---

## Phase 2 — AI Provider Seam

**Goal:** one `embed()` + `generateText()` interface, swappable between local and Bedrock,
exactly as described in the reference doc's Section 9 (AI Layer).

- [ ] `src/ai/index.ts` — factory switching on `AI_PROVIDER`
- [ ] `src/ai/local.ts` — `@xenova/transformers` `all-MiniLM-L6-v2`, zero-pad 384→1024,
      renormalize; `generateText()` calls Anthropic directly if `ANTHROPIC_API_KEY` is set,
      else a deterministic template fallback
- [ ] `src/ai/bedrock.ts` — stub only in this phase (implement in Phase 10 if you go AWS)
- [ ] `src/ai/prompts.ts` — two prompt templates: "explain applicability" and "draft
      disclosure," both requiring the retrieved law text as grounding context

**Acceptance:** a throwaway script can call `embed("we use AI to rank job applicants")`
and get back a 1024-length number array; `generateText()` returns non-empty text.

---

## Phase 3 — Law Corpus & Ingestion

**Goal:** a real, queryable law corpus so RAG matching has something to retrieve.

- [ ] `data/laws/*.json` — hand-curate 6–10 entries (CA CPPA ADMT, IL HB 3773, CO AI Act,
      VA AI decisions law, at minimum — these are the ones your onboarding form's state
      checkboxes already reference: CA, IL, CO, VA, NY, UT)
- [ ] Each file: `state`, `law_name`, `citation`, `effective_date`, `summary`,
      `applies_to_industries[]`, `chunks[]` (1–3 representative text passages)
- [ ] `src/scripts/ingest.ts` — truncate + reload `jurisdictions` and `law_chunks`,
      embedding each chunk via the Phase 2 seam
- [ ] `npm run ingest` script entry in `package.json`

**Acceptance:** `SELECT count(*) FROM law_chunks;` returns > 0; each row has a non-null
1024-dim embedding.

---

## Phase 4 — Organization Onboarding API

**Goal:** back the exact form in Image 2 — company name, industry, company size, states,
and the "Describe how your company uses AI" textarea — as a single request.

**Design decision:** the onboarding form submits both org data *and* one AI use-case
description in one screen. Two clean ways to handle this — pick one:

- **Option A (recommended):** `POST /api/organizations` creates the org only. The
  "Describe how your company uses AI" text is submitted as the org's *first* AI system via
  the Phase 5 endpoint, immediately after org creation, from the frontend (two calls,
  sequential). Keeps each endpoint single-purpose.
- **Option B:** `POST /api/organizations` accepts an optional `initialAiUseCase` field
  and creates both rows server-side in one request. Simpler frontend, more coupled backend.

This plan builds Option A.

- [ ] `POST /api/organizations`
      Body: `{ name, industry, companySize, states[] }`
      → generates `demo_api_key` (`ct_demo_` + UUID no dashes), inserts org + admin user
      → returns `{ id, name, demoApiKey, ... }`
- [ ] `GET /api/organizations` — list (for an org switcher, if you need one)
- [ ] `GET /api/organizations/:id` — single org detail

**Acceptance:** `curl -X POST` with the Image-2 form fields returns a 201 with an org id
and API key; row appears in `organizations` and `users`.

---

## Phase 5 — AI Use Cases (AI Systems) + Manual RAG Analysis

**Goal:** back Image 4 exactly — add a system in "Ready for Analysis" state, then a
separate "Analyze" click runs the RAG pipeline.

- [ ] `POST /api/ai-systems`
      Body: `{ orgId, name, category, aiProvider, affectsPeople, description }`
      → INSERT with `status='ready_for_analysis'`, `embedding=NULL`
      → **does not** call the AI layer yet (matches "Ready for Analysis" badge in the
        screenshot — analysis is not automatic)
- [ ] `GET /api/ai-systems?orgId=` — list, includes `status` and any existing matches
- [ ] `PATCH /api/ai-systems/:id` — edit (the "Edit" button in the screenshot)
- [ ] `DELETE /api/ai-systems/:id` — the "Delete" button
- [ ] `POST /api/ai-systems/:id/analyze` — the "Analyze" button:
      1. `embed(description)` → store on the row, flip `status='analyzed'`
      2. DELETE prior `matched_rules` for this use case (idempotent re-analysis)
      3. pgvector cosine-similarity query against `law_chunks`, filtered to the org's
         `states`, top-K by `RETRIEVAL_TOP_K`
      4. for matches above `SIMILARITY_THRESHOLD`, call `generateText()` with the
         "explain applicability" prompt, grounded in the retrieved chunk
      5. INSERT `matched_rules` rows
      6. return `{ useCase, matches[] }`
- [ ] `POST /api/ai-systems/analyze-all` — the "Analyze All Systems" button visible at the
      top of the AI Systems page in your screenshot; loops the above over every
      `ready_for_analysis` system for the org

**Note on latency:** the reference doc flags that sequential AI calls in a loop are slow
(~2s × K). Use `Promise.all` for the per-match explanation calls in step 4, not a
sequential loop.

**Acceptance:** POST creates a system in `ready_for_analysis`; hitting `/analyze` moves it
to `analyzed` and produces at least one `matched_rules` row for a use case worded like
"we use AI to rank job applicants."

---

## Phase 6 — Compliance Dashboard Aggregation

**Goal:** back every number and card in Image 3. This is the phase with no direct
reference-doc equivalent — you're building new aggregation queries.

- [ ] `GET /api/dashboard?orgId=` returns:
  ```
  {
    complianceScore: number,        // see formula below
    applicableRegulations: number,  // distinct jurisdictions matched across all use cases
    aiSystems: number,              // count of business_ai_use_cases for org
    pendingActions: number,         // see definition below
    byState: [
      { state, applicableLaws, disclosures, outstanding, status }
      // status: 'compliant' | 'needs_review' | 'action_required'
    ],
    recentActivity: [
      { timestamp, description, status }
    ],
    auditHealth: {
      cryptographicSignatures: boolean,
      immutableAuditTrail: boolean,
      lastReviewNote: string
    }
  }
  ```
- [ ] **Compliance score formula (define explicitly, don't guess at render time):**
      `disclosures generated / applicable laws matched`, averaged across states with at
      least one applicable law. Document this formula in the API response or a README —
      it's a business decision, not a technical one, and judges/users will ask about it.
- [ ] **Per-state status logic** — reuse the reference doc's existing red/yellow/green
      rule directly:
      - `action_required` (red) if `applicable > 0 && disclosed === 0`
      - `compliant` (green) if `disclosed >= applicable`
      - `needs_review` (yellow) otherwise
- [ ] **Pending actions** — define as count of: (states in `action_required`) + (AI systems
      still in `ready_for_analysis`). State this definition in code comments since it's
      not specified anywhere in the source docs.
- [ ] **Recent activity** — derive from a UNION of the three most recent rows across
      `business_ai_use_cases`, `disclosures`, and `matched_rules` (created/updated),
      ordered by `created_at desc`, limited to 5–10. No new table needed initially.
- [ ] **Audit health** — call `verifyChain(orgId)` (Phase 8) and surface its boolean result
      plus a static list of the properties it enforces (matches "Cryptographic signatures /
      Immutable audit trail" bullets in your screenshot).

**Acceptance:** dashboard endpoint returns real, non-zero numbers for a seeded org with at
least one analyzed use case and one disclosure.

---

## Phase 7 — Disclosure Generator

**Goal:** the "Generate Disclosure" quick action referenced on the dashboard.

- [ ] `POST /api/disclosures`
      Body: `{ orgId, jurisdictionId, disclosureType, useCaseId? }`
      → find the closest `law_chunks` row for that jurisdiction (reuse retrieval logic)
      → `generateText()` with the "draft disclosure" prompt, grounded in that chunk
      → INSERT `disclosures` with `source_chunk_id` set (provenance)
      → returns the disclosure including a visible "source: [citation]" field
- [ ] `GET /api/disclosures?orgId=` — list for the disclosure library view
- [ ] Every disclosure response must include a `"Draft for review by counsel — not legal
      advice"` disclaimer field — bake this into the API response, not just the frontend,
      so it can't be dropped by mistake.

**Acceptance:** generating a disclosure for a matched jurisdiction returns grounded text
citing the actual law passage, not a generic template.

---

## Phase 8 — Tamper-Evident Audit Log

**Goal:** the hash-chained log and the public `/api/log-decision` endpoint, as specified in
the reference doc's Section 10 (Audit Chain Mechanism).

- [ ] `src/lib/hash.ts` — canonical JSON serialization + `sha256(prevHash + payload)`
- [ ] `logDecision({ orgId, decisionType, inputSummary, outputSummary, justification?, actor })`
      → fetch last row's `row_hash` (or `GENESIS_HASH = "0".repeat(64)` if none)
      → compute new hash, INSERT
- [ ] `verifyChain(orgId)` — refetch entire chain, recompute every hash in order, return
      `{ ok, total, brokenAtIndex? }`
- [ ] `POST /api/log-decision` — the public-facing endpoint:
      - extract `x-api-key` header
      - look up org by `demo_api_key`; 401 if missing/invalid
      - Zod-validate body (`decision_type`, `input_summary`, `output_summary`,
        `justification?`, `actor` — all required except justification)
      - call `logDecision()`, return `{ id, row_hash }` as 201
- [ ] `GET /api/audit?orgId=` — full chain + `verifyChain()` result for the audit viewer
- [ ] **Production hardening, do this now not later:** run
      `REVOKE UPDATE, DELETE ON ai_decision_log FROM <app_db_role>;` so the append-only
      guarantee is enforced by Postgres, not just application convention. The reference
      doc explicitly flags that without this, a direct DB UPDATE can silently break the
      chain (their own `tamper-demo.ts` proves it).

**Acceptance:** a `curl` to `/api/log-decision` with a valid key returns 201 with a
`row_hash`; manually altering a row's `output_summary` and calling `verifyChain` again
correctly reports `brokenAtIndex`.

---

## Phase 9 — Frontend Integration Pass

**Goal:** wire the four screens you showed me to the endpoints above, end to end.

- [ ] CORS: if the frontend is on a different origin, add CORS headers to every route
      handler (or a `middleware.ts`) — this is easy to forget until the browser blocks it
- [ ] Landing page (Image 1): static, no backend calls needed
- [ ] Onboarding (Image 2): `POST /api/organizations` → on success, `POST /api/ai-systems`
      with the "Describe how your company uses AI" text → redirect to dashboard with the
      new `orgId`
- [ ] Dashboard (Image 3): `GET /api/dashboard?orgId=`; wire "Add AI Use Case" and
      "Generate Disclosure" quick-action buttons to the respective pages/endpoints
- [ ] AI Systems (Image 4): `GET /api/ai-systems?orgId=` on load; `POST`, `PATCH`,
      `DELETE`, and `POST /:id/analyze` wired to the form and card actions
- [ ] Error states: every endpoint above should return a consistent `{ error: string }`
      shape on failure so the frontend can render one error-handling pattern everywhere
- [ ] Loading states: `/analyze` and `/disclosures` involve AI calls (1–3s each) — make
      sure the frontend shows a pending state, since these are not instant

**Acceptance:** you can walk through Image 2 → Image 4 → Image 3 in the actual running
frontend, with every number and card populated by real backend data, no mocked JSON.

---

## Phase 10 — Auth, then AWS (only if you need them)

Both of these are genuinely optional and can be skipped for a demo. Do them only if you
have a concrete requirement.

**Auth (if this needs to be more than a demo):**
- [ ] Add session-based auth (Auth.js) — the `users` table already has `org_id`, `email`,
      `role`, so no schema change needed
- [ ] Replace `?orgId=` trust with session-derived org scoping on every endpoint — right
      now, as designed above, anyone who knows an org's UUID can read/write its data. This
      is fine for a hackathon demo, not fine for anything with real user data.
- [ ] Hash `demo_api_key` values at rest (bcrypt), compare on lookup instead of storing
      plaintext

**AWS path (if you need Aurora + Bedrock instead of local Docker + local embeddings):**
- [ ] Implement `src/ai/bedrock.ts` fully (Titan Embed V2 + Claude via
      `InvokeModelCommand`)
- [ ] Swap DB access to RDS Data API (`drizzle-orm/aws-data-api/pg`) — required because
      Vercel serverless functions can't hold persistent Postgres connections
- [ ] Two env var flips (`DB_DRIVER=data-api`, `AI_PROVIDER=bedrock`) — no other code
      changes if Phases 0–8 were built against the seam interfaces as specified

---

## Suggested order of execution

Phases 0 → 1 → 2 → 3 are pure infrastructure — build and verify each in isolation.
Phases 4 → 5 → 7 → 8 are the four independent write paths — order among them doesn't
matter much, but Phase 5 needs Phase 3's law corpus to produce real matches, and Phase 7
needs Phase 5's matches to know which jurisdiction to draft against.
Phase 6 needs 4, 5, and 7 to have real data to aggregate — build it last among the
backend phases, or you'll be staring at an empty dashboard.
Phase 9 is where you'll actually see the frontend come alive — do it incrementally,
screen by screen, rather than all at once at the end.
