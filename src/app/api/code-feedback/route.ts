import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// POST /api/code-feedback
// { code, output, error, expectedOutput, stepTitle, instruction }
export async function POST(req: NextRequest) {
  const { code, output, error, expectedOutput, stepTitle, instruction } = await req.json();

  const context = error
    ? `Compiler error:\n${String(error).slice(0, 400)}`
    : `Their output: "${String(output).slice(0, 200)}"`;

  const expected = Array.isArray(expectedOutput) && expectedOutput.length > 0
    ? `Expected output to contain: ${expectedOutput.slice(0, 3).join(", ")}`
    : "The program should produce some output.";

  const prompt = `A student is learning Go. They're working on: "${stepTitle}"

Task: ${String(instruction).slice(0, 300)}
${expected}

Their code:
\`\`\`go
${String(code).slice(0, 1200)}
\`\`\`

${context}

Give ONE short sentence of feedback (max 20 words). Be warm and encouraging. Don't reveal the answer — nudge them in the right direction. No prefix like "Feedback:" just the sentence.`;

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
}
