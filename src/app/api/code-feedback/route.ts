import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { withErrorHandling } from "@/lib/api-utils";
import { allSteps } from "@/lib/tutorial-steps";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// POST /api/code-feedback
// { code, output, error, tutorialSlug, stepIndex }
export const POST = withErrorHandling("POST /api/code-feedback", async (req: NextRequest) => {
  const { code, output, error, tutorialSlug, stepIndex } = await req.json();

  // Look up step server-side — never trust client-supplied titles/instructions
  const step = allSteps[String(tutorialSlug)]?.[parseInt(stepIndex, 10)];
  if (!step) {
    return NextResponse.json({ feedback: null });
  }

  const context = error
    ? `Compiler error:\n${String(error).slice(0, 400)}`
    : `Their output: "${String(output).slice(0, 200)}"`;

  const expected = step.expectedOutput.length > 0
    ? `Expected output to contain: ${step.expectedOutput.slice(0, 3).join(", ")}`
    : "The program should produce some output.";

  const isWrongOutput = !error;

  // Sanitize user code to prevent backtick injection
  const safeCode = String(code).slice(0, 1200).replace(/`{3}/g, "` ` `");

  const prompt = `A student is learning Go. They're working on: "${step.title}"

Task: ${step.instruction.slice(0, 300)}
${expected}

Their code:
\`\`\`go
${safeCode}
\`\`\`

${context}

${isWrongOutput
  ? "Their code ran but produced the WRONG output — it does NOT match what's expected. Give ONE short sentence telling them specifically what's missing or wrong (max 20 words). Be direct but friendly. Don't say 'you're on the right track'. Don't reveal the full answer — just point at what needs to change."
  : "Give ONE short sentence of feedback (max 20 words). Be warm and specific. Don't reveal the full answer — nudge them in the right direction."
}
No prefix like "Feedback:" — just the sentence.`;

  try {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not set");
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 80,
      messages: [{ role: "user", content: prompt }],
    });
    const feedback = (response.content[0] as Anthropic.TextBlock).text.trim();
    return NextResponse.json({ feedback });
  } catch {
    return NextResponse.json({ feedback: null });
  }
});
