# MacroLens AI — Macro Market Analyst Chatbot

> A RAG-powered AI chatbot that thinks like a macro hedge fund analyst. Built with Next.js 15, Claude API, Transformers.js, and Supabase pgvector.

🔗 **Live Demo:** [macrolens-ai-khaki.vercel.app](https://macrolens-ai-khaki.vercel.app)

---

## Why This Topic

Global macro finance is one of the most information-dense domains in the world. A single question like *"how do rate hikes affect emerging markets?"* requires synthesizing knowledge across central bank policy, currency mechanics, capital flow dynamics, debt structures, and historical precedent — simultaneously.

Most AI chatbots answer macro questions using generic training data. MacroLens is different — it answers from a curated, structured knowledge base built specifically around the way macro traders think. The goal was to build something that feels like asking a question to a senior analyst at a hedge fund, not a search engine.

The topic was chosen because:
- It is intellectually deep, requiring multi-layered reasoning across interconnected concepts
- It demonstrates RAG's value clearly — responses are grounded in specific documents, not hallucinated
- It is directly relevant to fintech, trading platforms, and financial services companies — the kind of product a startup would actually ship
- It produces responses that are verifiably good or bad, making the quality of the RAG system easy to evaluate

---

## What It Does

MacroLens is a domain-expert chatbot trained on 26 hand-crafted markdown documents covering the full spectrum of global macro finance. Users can ask questions about any macro topic and receive structured, analyst-quality responses grounded in the knowledge base.

**Example questions it handles well:**
- *"Why does yield curve inversion predict recession?"*
- *"What is the relationship between real interest rates and gold?"*
- *"How do rate hikes affect emerging markets?"*
- *"Explain quantitative tightening and its effects on liquidity"*
- *"What is the carry trade and when does it unwind?"*

---

## Architecture

```
User Question
     ↓
React Frontend (Next.js 15)
     ↓
/api/chat — Next.js API Route
     ↓
Transformers.js — Local Embedding Model
(Xenova/all-MiniLM-L6-v2, runs on server, no API cost)
     ↓
Supabase pgvector — Similarity Search
(Top 7 most relevant knowledge chunks retrieved)
     ↓
Claude API — claude-sonnet-4-20250514
(System prompt injected with retrieved context)
     ↓
Streaming Response → UI (RAF-batched for smooth rendering)
```

This is a full **RAG (Retrieval Augmented Generation)** pipeline. Every response is grounded in the knowledge base rather than relying purely on model training data.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React, TypeScript |
| UI | Custom dark theme, DM Sans + DM Mono, react-markdown |
| AI Model | Anthropic Claude (claude-sonnet-4-20250514) |
| Embeddings | Transformers.js — `Xenova/all-MiniLM-L6-v2` (local, free) |
| Vector Database | Supabase with pgvector extension |
| Streaming | Anthropic streaming API, RAF-batched ReadableStream |
| Deployment | Vercel |

---

## Features

- **Streaming responses** — text renders smoothly using `requestAnimationFrame` batching, eliminating the choppy spurt effect common in AI chat UIs
- **RAG-grounded answers** — every response is retrieved from and grounded in the 26-document knowledge base, not generic model output
- **Contextual follow-up buttons** — 12 topic-specific follow-up sets (gold, recession, currency, QE/QT, credit spreads, carry trade, VIX, and more) that only appear on the latest response and disappear when a new question is asked
- **Markdown rendering** — responses render with proper bold, headers, lists, and code blocks
- **Copy button** — one-click copy on every response with visual confirmation state
- **RAG badge** — subtle "RAG · KNOWLEDGE BASE" label signals grounded responses to technical reviewers
- **Rotating loading messages** — contextual messages like "Scanning yield curve signals..." and "Checking central bank policy..." while waiting
- **Auto-focus + keyboard shortcuts** — cursor lands in input on page load, Ctrl+K refocuses from anywhere, Shift+Enter for new lines
- **Session reset** — clear conversation button in the header with confirm step and "SESSION RESET" pill animation
- **Friendly error states** — randomized macro-themed error messages instead of raw API errors
- **Staggered message animations** — messages animate in with a 40ms delay per index for a smooth cascade feel

---

## Knowledge Base

The chatbot's knowledge comes from 26 hand-written markdown documents covering:

| File | Topic |
|---|---|
| `inflation.md` | CPI, PCE, inflation regimes, asset impact |
| `bond_yields.md` | Nominal vs real yields, Treasury market |
| `yield_curve.md` | Curve shapes, inversion, steepener/flattener trades |
| `central_banks.md` | Fed, ECB, BoJ, BoE, PBoC, rate transmission |
| `interest_rates.md` | Policy rates, real rates, dot plot, neutral rate |
| `quantitative_easing.md` | QE/QT mechanics, balance sheet, taper tantrum |
| `quantitative_tightening.md` | QT mechanics, reserve levels, market impact |
| `currency_markets.md` | DXY, major pairs, carry trade, EM FX |
| `macro_trading_strategies.md` | Economic cycle, risk-on/off, key macro trades |
| `gold_and_commodities.md` | Gold drivers, oil, copper, commodity supercycle |
| `emerging_markets.md` | EM drivers, crises, vulnerability indicators |
| `recession_indicators.md` | Yield curve, PMI, credit spreads, recession playbook |
| `inflation_expectations.md` | Breakeven inflation, TIPS, inflation swaps |
| `real_interest_rates.md` | Nominal vs real rates, gold relationship, equity valuation |
| `liquidity_and_money_supply.md` | M2, global liquidity cycles, central bank balance sheets |
| `fiscal_policy.md` | Government spending, deficits, stimulus, austerity |
| `global_capital_flows.md` | Cross-border flows, currency effects, bond yields |
| `dollar_dominance.md` | Reserve currency, petrodollar, dollar smile theory |
| `carry_trade.md` | Funding currencies, target currencies, unwind risk |
| `risk_on_risk_off.md` | RORO regime, asset behavior, safe haven hierarchy |
| `volatility_and_vix.md` | VIX, volatility spikes, cross-asset volatility |
| `equity_valuation_and_rates.md` | Discount rates, growth vs value, sector rotation |
| `yield_curve_control.md` | BoJ YCC, mechanism, global implications |
| `term_premium.md` | Term premium decomposition, ACM model, fiscal risk |
| `credit_spreads.md` | IG vs HY spreads, recession predictor, CDS |
| `repo_market.md` | Repo mechanics, SOFR, September 2019 crisis, basis trade |

---

## How RAG Works in This Project

1. The 26 markdown files are split into ~47 text chunks
2. Each chunk is embedded using `Xenova/all-MiniLM-L6-v2` — a free, local sentence transformer model
3. Embeddings (384-dimension vectors) are stored in Supabase using the `pgvector` extension
4. When a user asks a question, the question is embedded using the same model
5. Supabase performs a cosine similarity search and returns the top 7 most relevant chunks
6. Those chunks are injected into the Claude system prompt as context
7. Claude generates a response grounded in that specific knowledge

This means responses are traceable to specific source documents — not hallucinated from generic training data.

---

## Project Structure

```
macrolens/
├── app/
│   ├── api/chat/
│   │   └── route.ts          ← API route: RAG retrieval + Claude streaming
│   ├── page.tsx              ← Main page
│   ├── layout.tsx
│   └── globals.css
├── components/
│   └── MacroLens.tsx         ← Full chat UI with markdown rendering
├── lib/
│   └── embeddings.ts         ← Transformers.js embedding + Supabase retrieval
├── knowledge/
│   ├── inflation.md
│   ├── bond_yields.md
│   └── ... (26 files total)
├── scripts/
│   └── ingest.ts             ← One-time script to embed and store knowledge
├── .env.local                ← API keys (never committed)
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## Running Locally

**1. Clone the repository**
```bash
git clone https://github.com/adityamondal1311/macrolens-ai.git
cd macrolens-ai
```

**2. Install dependencies**
```bash
npm install
```

**3. Set up environment variables**

Create a `.env.local` file in the root:
```
ANTHROPIC_API_KEY=sk-ant-xxxxx
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
```

**4. Set up Supabase**

Run this SQL in your Supabase SQL Editor:
```sql
create extension if not exists vector;

create table knowledge_chunks (
  id bigserial primary key,
  content text not null,
  source_file text not null,
  embedding vector(384)
);

create or replace function match_knowledge(
  query_embedding vector(384),
  match_count int default 7
)
returns table (id bigint, content text, source_file text, similarity float)
language plpgsql as $$
begin
  return query
  select knowledge_chunks.id, knowledge_chunks.content, knowledge_chunks.source_file,
    1 - (knowledge_chunks.embedding <=> query_embedding) as similarity
  from knowledge_chunks
  order by knowledge_chunks.embedding <=> query_embedding
  limit match_count;
end;
$$;
```

**5. Run the ingestion script**
```bash
npm install -D tsx
npx tsx scripts/ingest.ts
```

This embeds all 26 knowledge files and stores them in Supabase. Takes ~2 minutes on first run (downloads the embedding model).

**6. Start the dev server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deployment

This project is deployed on Vercel. To deploy your own instance:

1. Push the repo to GitHub
2. Import the project on [vercel.com](https://vercel.com)
3. Add environment variables in the Vercel dashboard:
   - `ANTHROPIC_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
4. Deploy — Vercel auto-detects Next.js and configures everything

---

## Design Decisions

**Why Transformers.js instead of OpenAI embeddings?**
Transformers.js runs the embedding model locally on the server with zero API cost. The `all-MiniLM-L6-v2` model produces 384-dimension vectors and performs well for structured domain documents. For a 26-file knowledge base with clear topic boundaries, retrieval quality is excellent.

**Why Supabase + pgvector instead of Pinecone?**
Supabase offers a generous free tier, a built-in SQL interface for easy inspection, and pgvector is a mature, well-tested extension. For a knowledge base of this size it is more than sufficient and far simpler to manage than a dedicated vector database.

**Why a hand-written knowledge base instead of scraped data?**
Scraped data introduces noise, inconsistent formatting, and copyright concerns. Hand-written documents allow precise control over structure, terminology, and depth — ensuring every chunk is genuinely useful for retrieval.

**Why RAF batching for streaming?**
The default approach of calling `setState` on every token causes React to re-render on each chunk, producing a choppy experience especially when the network delivers multiple tokens simultaneously. Buffering tokens and flushing them on `requestAnimationFrame` aligns state updates with the browser's paint cycle, producing smooth continuous text flow.