import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  real,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ─── Custom pgvector column type ─────────────────────────────────────────────

import { customType } from "drizzle-orm/pg-core";

const vector = (name: string, dimensions: number) =>
  customType<{ data: number[]; driverParam: string }>({
    dataType() {
      return `vector(${dimensions})`;
    },
    toDriver(value: number[]): string {
      return `[${value.join(",")}]`;
    },
    fromDriver(value: unknown): number[] {
      // Postgres returns vectors as "[1,2,3]"
      const str = value as string;
      return str
        .slice(1, -1)
        .split(",")
        .map(Number);
    },
  })(name);

// ─── Organizations ───────────────────────────────────────────────────────────

export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  industry: text("industry").notNull(),
  companySize: text("company_size"),
  states: text("states").array().notNull().default(sql`'{}'::text[]`),
  subscriptionTier: text("subscription_tier").notNull().default("free"),
  demoApiKey: text("demo_api_key"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Users ───────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id")
    .references(() => organizations.id)
    .notNull(),
  email: text("email").unique().notNull(),
  role: text("role").notNull().default("admin"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Jurisdictions ───────────────────────────────────────────────────────────

export const jurisdictions = pgTable("jurisdictions", {
  id: uuid("id").defaultRandom().primaryKey(),
  state: text("state").notNull(),
  lawName: text("law_name").notNull(),
  citation: text("citation"),
  effectiveDate: text("effective_date"),
  summary: text("summary"),
  appliesToIndustries: text("applies_to_industries")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Law Chunks ──────────────────────────────────────────────────────────────

export const lawChunks = pgTable(
  "law_chunks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    jurisdictionId: uuid("jurisdiction_id")
      .references(() => jurisdictions.id)
      .notNull(),
    chunkText: text("chunk_text").notNull(),
    chunkIndex: integer("chunk_index").notNull(),
    embedding: vector("embedding", 1024).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("law_chunks_jurisdiction_idx").on(table.jurisdictionId),
  ]
);

// ─── Business AI Use Cases ───────────────────────────────────────────────────

export const businessAiUseCases = pgTable(
  "business_ai_use_cases",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orgId: uuid("org_id")
      .references(() => organizations.id)
      .notNull(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    category: text("category"),
    aiProvider: text("ai_provider"),
    affectsPeople: boolean("affects_people").default(false),
    embedding: vector("embedding", 1024),
    status: text("status").notNull().default("ready_for_analysis"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("business_ai_use_cases_org_idx").on(table.orgId),
  ]
);

// ─── Matched Rules ───────────────────────────────────────────────────────────

export const matchedRules = pgTable(
  "matched_rules",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    useCaseId: uuid("use_case_id")
      .references(() => businessAiUseCases.id)
      .notNull(),
    lawChunkId: uuid("law_chunk_id")
      .references(() => lawChunks.id)
      .notNull(),
    jurisdictionId: uuid("jurisdiction_id")
      .references(() => jurisdictions.id)
      .notNull(),
    similarityScore: real("similarity_score"),
    aiExplanation: text("ai_explanation"),
    status: text("status").notNull().default("flagged"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("matched_rules_use_case_idx").on(table.useCaseId),
  ]
);

// ─── Disclosures ─────────────────────────────────────────────────────────────

export const disclosures = pgTable(
  "disclosures",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orgId: uuid("org_id")
      .references(() => organizations.id)
      .notNull(),
    jurisdictionId: uuid("jurisdiction_id")
      .references(() => jurisdictions.id)
      .notNull(),
    useCaseId: uuid("use_case_id").references(() => businessAiUseCases.id),
    disclosureType: text("disclosure_type").notNull(),
    draftText: text("draft_text").notNull(),
    sourceChunkId: uuid("source_chunk_id").references(() => lawChunks.id),
    status: text("status").notNull().default("draft"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("disclosures_org_idx").on(table.orgId),
  ]
);

// ─── AI Decision Log (append-only audit chain) ──────────────────────────────

export const aiDecisionLog = pgTable(
  "ai_decision_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orgId: uuid("org_id")
      .references(() => organizations.id)
      .notNull(),
    decisionType: text("decision_type").notNull(),
    inputSummary: text("input_summary").notNull(),
    outputSummary: text("output_summary").notNull(),
    justification: text("justification"),
    actor: text("actor").notNull(),
    prevHash: text("prev_hash").notNull(),
    rowHash: text("row_hash").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("ai_decision_log_org_idx").on(table.orgId),
  ]
);
