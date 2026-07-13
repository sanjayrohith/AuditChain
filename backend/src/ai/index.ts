/**
 * AI Provider Seam — factory that switches between local and Bedrock
 * based on the AI_PROVIDER environment variable.
 */
import { config } from "@/lib/config";
import * as local from "./local";
import * as bedrock from "./bedrock";

export interface AiProvider {
  embed(text: string): Promise<number[]>;
  generateText(prompt: string): Promise<string>;
}

function getProvider(): AiProvider {
  switch (config.aiProvider) {
    case "local":
      return local;
    case "bedrock":
      return bedrock;
    default:
      throw new Error(`Unknown AI_PROVIDER: ${config.aiProvider}`);
  }
}

const provider = getProvider();

/**
 * Generate a vector embedding for the given text.
 * Returns a number[] of length EMBEDDING_DIM (default 1024).
 */
export async function embed(text: string): Promise<number[]> {
  return provider.embed(text);
}

/**
 * Generate text from a prompt using the configured AI provider.
 */
export async function generateText(prompt: string): Promise<string> {
  return provider.generateText(prompt);
}

// Re-export prompts for convenience
export { explainApplicabilityPrompt, draftDisclosurePrompt } from "./prompts";
