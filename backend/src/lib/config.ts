import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config = {
  databaseUrl: requireEnv("DATABASE_URL"),
  aiProvider: (process.env.AI_PROVIDER ?? "local") as "local" | "bedrock",
  embeddingDim: parseInt(process.env.EMBEDDING_DIM ?? "1024", 10),
  similarityThreshold: parseFloat(process.env.SIMILARITY_THRESHOLD ?? "0.3"),
  retrievalTopK: parseInt(process.env.RETRIEVAL_TOP_K ?? "5", 10),
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? null,
} as const;
