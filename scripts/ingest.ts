import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const KNOWLEDGE_DIR = path.join(process.cwd(), "knowledge");
const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 50;

function chunkText(text: string): string[] {
  const words = text.split(" ");
  const chunks: string[] = [];
  let i = 0;

  while (i < words.length) {
    const chunk = words.slice(i, i + CHUNK_SIZE).join(" ");
    chunks.push(chunk);
    i += CHUNK_SIZE - CHUNK_OVERLAP;
  }

  return chunks.filter((c) => c.trim().length > 50);
}

async function getEmbedding(text: string, pipe: any): Promise<number[]> {
  const output = await pipe(text, { pooling: "mean", normalize: true });
  return Array.from(output.data) as number[];
}

async function ingest() {
  console.log("Loading local embedding model (first run downloads ~25MB)...");

  const { pipeline } = await import("@xenova/transformers");
  const pipe = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

  console.log("Model loaded. Starting ingestion...");

  const files = fs
    .readdirSync(KNOWLEDGE_DIR)
    .filter((f) => f.endsWith(".md"));

  console.log(`Found ${files.length} knowledge files`);

  // Clear existing chunks
  const { error: deleteError } = await supabase
    .from("knowledge_chunks")
    .delete()
    .neq("id", 0);

  if (deleteError) {
    console.error("Error clearing table:", deleteError);
    return;
  }

  console.log("Cleared existing chunks\n");

  for (const file of files) {
    const filePath = path.join(KNOWLEDGE_DIR, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const chunks = chunkText(content);

    console.log(`Processing ${file} → ${chunks.length} chunks`);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      try {
        const embedding = await getEmbedding(chunk, pipe);

        const { error } = await supabase.from("knowledge_chunks").insert({
          content: chunk,
          source_file: file,
          embedding,
        });

        if (error) {
          console.error(`  ✗ Chunk ${i + 1} error:`, error.message);
        } else {
          console.log(`  ✓ Chunk ${i + 1}/${chunks.length}`);
        }
      } catch (err) {
        console.error(`  ✗ Chunk ${i + 1} failed:`, err);
      }
    }
  }

  console.log("\nIngestion complete!");
  console.log("Check Supabase → Table Editor → knowledge_chunks to verify.");
}

ingest();