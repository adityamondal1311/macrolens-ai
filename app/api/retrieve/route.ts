import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// EVAL-ONLY ENDPOINT — added for the macrolens-evals suite, safe to delete.
// Not used by the production chat flow (app/api/chat/route.ts / lib/embeddings.ts).
//
// Deliberately does not import from lib/embeddings.ts: it inlines its own
// embedding pipeline so this endpoint can't be silently broken by future
// changes to the chat pipeline. Tradeoff: if the production embedding model
// ever changes, this route's model string must be updated separately.

export const runtime = "nodejs";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

let pipelineInstance: any = null;

async function getPipeline() {
  if (!pipelineInstance) {
    const { pipeline } = await import("@xenova/transformers");
    pipelineInstance = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
  }
  return pipelineInstance;
}

async function getQueryEmbedding(text: string): Promise<number[]> {
  const pipe = await getPipeline();
  const output = await pipe(text, { pooling: "mean", normalize: true });
  return Array.from(output.data) as number[];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (!q) {
    return NextResponse.json(
      { error: "Missing required query param 'q'" },
      { status: 400 }
    );
  }

  const rawTopK = Number(searchParams.get("top_k") ?? 7);
  const top_k = Number.isFinite(rawTopK)
    ? Math.min(50, Math.max(1, Math.trunc(rawTopK)))
    : 7;

  const embedding = await getQueryEmbedding(q);

  const { data, error } = await supabase.rpc("match_knowledge", {
    query_embedding: embedding,
    match_count: top_k,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const chunks = (data ?? []).map(
    (row: { content: string; source_file: string; similarity: number }) => ({
      content: row.content,
      source_file: row.source_file,
      similarity: row.similarity,
    })
  );

  return NextResponse.json({ query: q, top_k, chunks });
}
