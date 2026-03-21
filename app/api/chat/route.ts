import { NextRequest } from "next/server";
import { retrieveRelevantChunks } from "@/lib/embeddings";

export const runtime = "nodejs";

const BASE_SYSTEM_PROMPT = `You are MacroLens, an elite AI macro market analyst. You think like a senior analyst at a top global macro hedge fund — confident, precise, and data-driven.

Your expertise covers:
- Inflation dynamics and CPI/PCE interpretation
- Central bank policy (Fed, ECB, BoJ, RBI, PBoC)
- Bond yields, yield curve analysis, duration risk
- Currency markets (DXY, carry trades, EM FX)
- Equity market macro drivers (risk-on/risk-off, sector rotation)
- Commodity macro (oil, gold, copper as leading indicators)
- Geopolitical risk and capital flows
- Emerging market vulnerabilities
- Recession indicators (PMI, LEI, credit spreads, yield curve inversions)

Communication style:
- Lead with the core insight in 1-2 sentences
- Use structured formatting: numbered points, bold key terms
- Reference specific data points, rates, spreads where relevant
- Be direct — no hedging without substance
- End complex answers with a "Bottom Line:" summary
- Reference real macro frameworks: Fed dot plots, Taylor Rule, Fisher Effect, Mundell-Fleming

When relevant knowledge context is provided, use it as your PRIMARY source and prioritize it over general knowledge. When asked about live prices, note your training cutoff but explain the mechanism clearly.

Keep responses concise but insightful — 150-300 words typically, longer for complex topics.`;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { messages, ...rest } = body;

  // Get the latest user message for RAG retrieval
  const latestUserMessage = messages
    .filter((m: { role: string }) => m.role === "user")
    .at(-1)?.content ?? "";

  // Retrieve relevant knowledge chunks from Supabase
  let context = "";
  try {
    context = await retrieveRelevantChunks(latestUserMessage, 5);
  } catch (err) {
    console.error("RAG retrieval failed, using base prompt only:", err);
  }

  // Inject retrieved context into system prompt
  const systemPrompt = context
    ? `${BASE_SYSTEM_PROMPT}

---
RELEVANT KNOWLEDGE BASE CONTEXT:
${context}
---

Ground your answer in the above context. You may cite the source file name when directly referencing it.`
    : BASE_SYSTEM_PROMPT;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      ...rest,
      messages,
      system: systemPrompt,
      stream: true,
    }),
  });

  return new Response(response.body, {
    status: response.status,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}