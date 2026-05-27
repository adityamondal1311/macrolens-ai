import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Cache the pipeline so it only loads once per server session
let pipelineInstance: any = null;

async function getPipeline() {
  if (!pipelineInstance) {
    console.log("Loading embedding model...");
    const { pipeline } = await import("@xenova/transformers");
    pipelineInstance = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
    console.log("Embedding model ready.");
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
  matchCount: number = 7
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

export async function retrieveRelevantChunksWithSources(
  query: string,
  matchCount: number = 7
): Promise<{ context: string; sources: string[] }> {
  const embedding = await getQueryEmbedding(query);

  const { data, error } = await supabase.rpc("match_knowledge", {
    query_embedding: embedding,
    match_count: matchCount,
  });

  if (error) {
    console.error("Supabase retrieval error:", error);
    return { context: "", sources: [] };
  }

  if (!data || data.length === 0) {
    return { context: "", sources: [] };
  }

  const context = data
    .map(
      (chunk: { source_file: string; content: string; similarity: number }) =>
        `[Source: ${chunk.source_file}]\n${chunk.content}`
    )
    .join("\n\n---\n\n");

  const sources = [...new Set(data.map((chunk: { source_file: string }) => chunk.source_file))] as string[];

  return { context, sources };
}