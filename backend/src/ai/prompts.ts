/**
 * Prompt templates for AI-powered compliance analysis.
 * Both require grounding context (retrieved law text) to produce accurate output.
 */

export function explainApplicabilityPrompt(params: {
  useCaseDescription: string;
  lawName: string;
  lawCitation: string;
  chunkText: string;
}): string {
  return `You are a compliance analyst specializing in AI regulation.

Given the following AI use case and a relevant section of law, explain why this law may apply to this AI system. Be specific about which obligations or requirements the law imposes.

## AI Use Case
${params.useCaseDescription}

## Applicable Law: ${params.lawName}
Citation: ${params.lawCitation}

### Relevant Section
${params.chunkText}

## Instructions
- Explain in 2-3 sentences why this law section is relevant to the AI use case.
- Identify the specific obligation or requirement imposed.
- Note any actions the organization should take to comply.
- Be factual and grounded only in the provided law text. Do not speculate.`;
}

export function draftDisclosurePrompt(params: {
  organizationName: string;
  useCaseDescription: string;
  lawName: string;
  lawCitation: string;
  chunkText: string;
  disclosureType: string;
}): string {
  return `You are a compliance document drafter specializing in AI regulation disclosures.

Draft a ${params.disclosureType} disclosure document for the following organization and AI system, based on the requirements in the provided law text.

## Organization
${params.organizationName}

## AI System Description
${params.useCaseDescription}

## Law: ${params.lawName}
Citation: ${params.lawCitation}

### Relevant Requirements
${params.chunkText}

## Instructions
- Draft a clear, professional disclosure that meets the requirements specified in the law text.
- Use plain language accessible to a general audience.
- Include all elements required by the cited law section.
- Mark any sections that need organization-specific details with [PLACEHOLDER].
- Do not add requirements not found in the provided law text.
- This is a draft for review by legal counsel — not final legal advice.`;
}
