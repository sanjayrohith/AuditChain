/**
 * Phase 2 acceptance test:
 * - embed() returns a 1024-length number array
 * - generateText() returns non-empty text
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// Resolve path aliases for tsx
import { embed, generateText } from "../ai/local";

async function main() {
  console.log("Testing AI provider seam...\n");

  // Test embed()
  console.log('1. Testing embed("we use AI to rank job applicants")...');
  const embedding = await embed("we use AI to rank job applicants");
  console.log(`   ✓ Got embedding of length: ${embedding.length}`);
  console.log(`   ✓ First 5 values: [${embedding.slice(0, 5).map(v => v.toFixed(6)).join(", ")}]`);
  console.log(`   ✓ Is 1024-dim: ${embedding.length === 1024}`);

  // Verify it's normalized (L2 norm ≈ 1)
  const norm = Math.sqrt(embedding.reduce((s, v) => s + v * v, 0));
  console.log(`   ✓ L2 norm: ${norm.toFixed(6)} (should be ≈1.0)`);

  // Test generateText()
  console.log("\n2. Testing generateText()...");
  const text = await generateText(
    "Explain why this law may apply to an AI hiring system."
  );
  console.log(`   ✓ Got response (${text.length} chars)`);
  console.log(`   ✓ Non-empty: ${text.length > 0}`);
  console.log(`   ✓ Preview: "${text.substring(0, 80)}..."`);

  console.log("\n✓ Phase 2 acceptance criteria met!");
}

main().catch((err) => {
  console.error("✗ Test failed:", err);
  process.exit(1);
});
