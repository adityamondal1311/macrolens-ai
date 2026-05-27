import { NextRequest } from "next/server";
import { retrieveRelevantChunksWithSources } from "@/lib/embeddings";

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
  let sources: string[] = [];
  try {
    ({ context, sources } = await retrieveRelevantChunksWithSources(latestUserMessage, 7));

    console.log("--------- RAG QUERY ---------");
    console.log("User question:", latestUserMessage);
    console.log("Sources:", sources);
    console.log("Retrieved context:", context.slice(0, 500));
    console.log("-----------------------------");
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

  // Prepend a single sources metadata event before forwarding Claude's stream
  const sourcesEvent = `data: ${JSON.stringify({ type: "sources", sources })}\n\n`;
  const sourcesBytes = new TextEncoder().encode(sourcesEvent);

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  (async () => {
    await writer.write(sourcesBytes);
    const reader = response.body!.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      await writer.write(value);
    }
    await writer.close();
  })();

  return new Response(readable, {
    status: response.status,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}