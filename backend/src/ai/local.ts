import { pipeline } from "@xenova/transformers";
import { config } from "@/lib/config";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let embeddingPipeline: any = null;

/**
 * Get or initialize the local embedding model (all-MiniLM-L6-v2).
 * Outputs 384-dim vectors; we zero-pad to 1024 and renormalize.
 */
async function getEmbeddingPipeline() {
  if (!embeddingPipeline) {
    embeddingPipeline = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
  }
  return embeddingPipeline;
}

/**
 * Zero-pad a vector from its native dimension to targetDim,
 * then L2-normalize the result.
 */
function zeroPadAndNormalize(vec: number[], targetDim: number): number[] {
  const padded = new Array(targetDim).fill(0);
  for (let i = 0; i < vec.length; i++) {
    padded[i] = vec[i];
  }
  // L2 normalize
  const norm = Math.sqrt(padded.reduce((sum, v) => sum + v * v, 0));
  if (norm > 0) {
    for (let i = 0; i < padded.length; i++) {
      padded[i] /= norm;
    }
  }
  return padded;
}

/**
 * Generate a 1024-dim embedding for the given text using local model.
 */
export async function embed(text: string): Promise<number[]> {
  const pipe = await getEmbeddingPipeline();
  const output = await pipe(text, { pooling: "mean", normalize: true });
  const raw: number[] = Array.from(output.data as Float32Array);
  // Model outputs 384-dim; pad to configured dimension
  return zeroPadAndNormalize(raw, config.embeddingDim);
}

/**
 * Generate text using Anthropic API if key is available,
 * otherwise return a deterministic template-based fallback.
 */
export async function generateText(prompt: string): Promise<string> {
  if (config.anthropicApiKey) {
    return callAnthropic(prompt);
  }
  return templateFallback(prompt);
}

async function callAnthropic(prompt: string): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.anthropicApiKey!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  return data.content[0]?.text ?? "";
}

/**
 * Deterministic fallback when no API key is configured.
 * Produces structured but generic compliance text.
 */
function templateFallback(prompt: string): string {
  if (prompt.includes("explain") || prompt.includes("why this law")) {
    return (
      "Based on the provided law text, this regulation may apply to the described AI system " +
      "because it involves automated decision-making that could affect individuals. " +
      "The organization should review the specific requirements outlined in the cited section " +
      "and ensure appropriate safeguards, transparency measures, and impact assessments are in place."
    );
  }

  if (prompt.includes("disclosure") || prompt.includes("Draft")) {
    return (
      "DISCLOSURE NOTICE\n\n" +
      "This organization uses artificial intelligence systems in its operations. " +
      "In accordance with applicable law, we provide the following disclosure:\n\n" +
      "1. AI System Purpose: [PLACEHOLDER - describe specific use]\n" +
      "2. Data Used: [PLACEHOLDER - describe data inputs]\n" +
      "3. Human Oversight: [PLACEHOLDER - describe oversight mechanisms]\n" +
      "4. Contact Information: [PLACEHOLDER - provide contact details]\n\n" +
      "This disclosure is provided pursuant to the requirements of the applicable regulation. " +
      "For questions about our AI practices, please contact our compliance team.\n\n" +
      "DRAFT FOR REVIEW BY COUNSEL — NOT LEGAL ADVICE"
    );
  }

  return "Analysis complete. Please review the applicable requirements and take appropriate compliance action.";
}
