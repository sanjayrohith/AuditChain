/**
 * AWS Bedrock AI provider — stub for Phase 10.
 *
 * Will implement:
 * - embed() via Amazon Titan Embed V2
 * - generateText() via Claude on Bedrock (InvokeModelCommand)
 */

export async function embed(_text: string): Promise<number[]> {
  throw new Error(
    "Bedrock provider not implemented. Set AI_PROVIDER=local or implement Phase 10."
  );
}

export async function generateText(_prompt: string): Promise<string> {
  throw new Error(
    "Bedrock provider not implemented. Set AI_PROVIDER=local or implement Phase 10."
  );
}
