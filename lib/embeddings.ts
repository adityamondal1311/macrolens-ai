import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Cache the pipeline so it only loads once per server session
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

export async function getQueryEmbedding(text: string): Promise<number[]> {
  const pipe = await getPipeline();
  const output = await pipe(text, { pooling: "mean", normalize: true });
  return Array.from(output.data) as number[];
}

export async function retrieveRelevantChunks(
  query: string,
  matchCount: number = 5
): Promise<string> {
  const embedding = await getQueryEmbedding(query);

  const { data, error } = await supabase.rpc("match_knowledge", {
    query_embedding: embedding,
    match_count: matchCount,
  });

  if (error) {
    console.error("Supabase retrieval error:", error);
    return "";
  }

  if (!data || data.length === 0) {
    return "";
  }

  const context = data
    .map(
      (chunk: { source_file: string; content: string; similarity: number }) =>
        `[Source: ${chunk.source_file}]\n${chunk.content}`
    )
    .join("\n\n---\n\n");

  return context;
}