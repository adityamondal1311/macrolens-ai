"use client";
import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are MacroLens, an elite AI macro market analyst. You think like a senior analyst at a top global macro hedge fund — confident, precise, and data-driven.

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
- Be direct — no hedging, no "it depends" without substance
- End complex answers with a "Bottom Line:" summary
- Occasionally reference real macro frameworks: Fed dot plots, Taylor Rule, Fisher Effect, Mundell-Fleming, etc.

When asked about current prices or live data, note that your knowledge has a training cutoff but explain the mechanisms clearly.

Keep responses concise but insightful — 150-300 words typically, longer for complex topics.`;

const SUGGESTED_PROMPTS = [
  "Why does yield curve inversion predict recession?",
  "How do rate hikes affect emerging markets?",
  "What is the relationship between DXY and gold?",
  "Explain quantitative tightening and its effects",
  "Why does inflation hurt long-duration bonds?",
  "How does the Fed funds rate impact equities?",
];

const FOLLOW_UP_SETS: Record<string, string[]> = {
  default: [
    "Explain deeper",
    "Real-world example",
    "How does this affect equities?",
    "Historical precedent",
  ],
  rates: [
    "Impact on bonds",
    "Impact on equities",
    "EM market effect",
    "Historical comparison",
  ],
  inflation: [
    "Fed's response",
    "Bond market impact",
    "Sector rotation play",
    "Compare to 1970s",
  ],
};

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  done?: boolean;
}

function getFollowUps(content: string): string[] {
  const lower = content.toLowerCase();
  if (lower.includes("rate") || lower.includes("fed") || lower.includes("yield"))
    return FOLLOW_UP_SETS.rates;
  if (lower.includes("inflation") || lower.includes("cpi") || lower.includes("price"))
    return FOLLOW_UP_SETS.inflation;
  return FOLLOW_UP_SETS.default;
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 18px", background: "#111318", borderRadius: 12, border: "1px solid #1e2130", maxWidth: 180 }}>
      <span style={{ fontSize: 11, color: "#4ecca3", fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>ANALYZING</span>
      <div style={{ display: "flex", gap: 4 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 5, height: 5, borderRadius: "50%", background: "#4ecca3",
            animation: "pulse 1.2s ease-in-out infinite",
            animationDelay: `${i * 0.2}s`,
            opacity: 0.4,
          }} />
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ msg, onFollowUp }: { msg: Message; onFollowUp: (label: string) => void }) {
  const isUser = msg.role === "user";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start", marginBottom: 20, animation: "fadeSlideIn 0.35s ease forwards" }}>
      {!isUser && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #0d2c1e 0%, #0a1f2e 100%)", border: "1px solid #4ecca3", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L8.5 5.5H13L9.5 8L11 12.5L7 10L3 12.5L4.5 8L1 5.5H5.5L7 1Z" fill="#4ecca3" opacity="0.9" />
            </svg>
          </div>
          <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#4ecca3", letterSpacing: 1 }}>MACROLENS</span>
          <span style={{ fontSize: 10, color: "#3a3f52", fontFamily: "'DM Mono', monospace" }}>
            {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      )}
      <div style={{
        maxWidth: "82%",
        padding: isUser ? "12px 16px" : "16px 18px",
        borderRadius: isUser ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
        background: isUser ? "linear-gradient(135deg, #0a2a1a 0%, #061d28 100%)" : "#0d1117",
        border: isUser ? "1px solid #1a4a2e" : "1px solid #1a1f2e",
        color: isUser ? "#c8f5e0" : "#c8ccd8",
        fontSize: 14,
        lineHeight: 1.75,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        letterSpacing: 0.1,
      }}>
        {msg.content}
      </div>
      {!isUser && msg.content && msg.done && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10, maxWidth: "82%" }}>
          {getFollowUps(msg.content).map((label, i) => (
            <button
              key={i}
              onClick={() => onFollowUp(label)}
              onMouseEnter={e => {
                const btn = e.currentTarget as HTMLButtonElement;
                btn.style.borderColor = "#4ecca3";
                btn.style.color = "#4ecca3";
                btn.style.background = "rgba(78,204,163,0.05)";
              }}
              onMouseLeave={e => {
                const btn = e.currentTarget as HTMLButtonElement;
                btn.style.borderColor = "#1e2535";
                btn.style.color = "#6b7280";
                btn.style.background = "transparent";
              }}
              style={{
                padding: "5px 12px",
                background: "transparent",
                border: "1px solid #1e2535",
                borderRadius: 20,
                color: "#6b7280",
                fontSize: 11,
                fontFamily: "'DM Mono', monospace",
                cursor: "pointer",
                letterSpacing: 0.5,
                transition: "all 0.2s ease",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      {isUser && (
        <span style={{ fontSize: 10, color: "#3a3f52", fontFamily: "'DM Mono', monospace", marginTop: 4 }}>
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      )}
    </div>
  );
}

function EmptyState({ onChipClick }: { onChipClick: (p: string) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "40px 20px", animation: "fadeSlideIn 0.5s ease forwards" }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, #0a2a1a 0%, #061d28 100%)", border: "1px solid #2a4a3a", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <path d="M13 2L15.5 9.5H23L17 14L19.5 21.5L13 17.5L6.5 21.5L9 14L3 9.5H10.5L13 2Z" fill="#4ecca3" opacity="0.85" />
        </svg>
      </div>
      <h2 style={{ color: "#e8eaf0", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 22, margin: "0 0 6px", letterSpacing: -0.5 }}>MacroLens</h2>
      <p style={{ color: "#4a5068", fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: 2, margin: "0 0 32px", textTransform: "uppercase" }}>AI Macro Market Analyst</p>
      <p style={{ color: "#5a6070", fontSize: 13, fontFamily: "'DM Sans', sans-serif", textAlign: "center", maxWidth: 360, lineHeight: 1.7, marginBottom: 32 }}>
        Ask about inflation, bond markets, central bank policy, currency flows, or any macro topic.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", maxWidth: 520 }}>
        {SUGGESTED_PROMPTS.map((p, i) => (
          <button
            key={i}
            onClick={() => onChipClick(p)}
            onMouseEnter={e => {
              const btn = e.currentTarget as HTMLButtonElement;
              btn.style.borderColor = "#2a4a3a";
              btn.style.color = "#4ecca3";
              btn.style.background = "rgba(78,204,163,0.04)";
            }}
            onMouseLeave={e => {
              const btn = e.currentTarget as HTMLButtonElement;
              btn.style.borderColor = "#1a2030";
              btn.style.color = "#7a8090";
              btn.style.background = "#0d1117";
            }}
            style={{
              padding: "8px 14px",
              background: "#0d1117",
              border: "1px solid #1a2030",
              borderRadius: 20,
              color: "#7a8090",
              fontSize: 12,
              fontFamily: "'DM Sans', sans-serif",
              cursor: "pointer",
              transition: "all 0.2s ease",
              lineHeight: 1.4,
            }}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function MacroLens() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text: string = "") => {
    const userText = (text || input).trim();
    if (!userText || loading) return;
    setInput("");
    setError(null);

    const userMsg: Message = { role: "user", content: userText, timestamp: Date.now() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    const assistantMsg: Message = { role: "assistant", content: "", timestamp: Date.now(), done: false };
    setMessages(prev => [...prev, assistantMsg]);

    try {
      const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          stream: true,
          messages: apiMessages,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err?.error?.message || "API error");
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === "content_block_delta" && parsed.delta?.type === "text_delta") {
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  content: updated[updated.length - 1].content + parsed.delta.text,
                };
                return updated;
              });
            }
          } catch { /* skip malformed chunks */ }
        }
      }

      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { ...updated[updated.length - 1], done: true };
        return updated;
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Something went wrong. Please try again.";
      setError(msg);
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1a2030; border-radius: 4px; }
      `}</style>

      <div style={{
        display: "flex", flexDirection: "column", height: "100vh",
        background: "#080b10", fontFamily: "'DM Sans', sans-serif",
        color: "#c8ccd8", position: "relative", overflow: "hidden",
      }}>
        {/* Background grid */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(rgba(78,204,163,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(78,204,163,0.015) 1px, transparent 1px)",
          backgroundSize: "48px 48px", zIndex: 0,
        }} />

        {/* Header */}
        <div style={{
          position: "relative", zIndex: 2,
          borderBottom: "1px solid #0f1520", padding: "14px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(8,11,16,0.9)", backdropFilter: "blur(10px)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg, #0a2a1a, #061d28)", border: "1px solid #2a4a3a", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L9.5 5.5H14L10.5 8L12 12.5L8 10L4 12.5L5.5 8L2 5.5H6.5L8 1Z" fill="#4ecca3" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#e8eaf0", letterSpacing: -0.3 }}>MacroLens</div>
              <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#2e4a3a", letterSpacing: 1.5 }}>MACRO MARKET AI</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ecca3", boxShadow: "0 0 6px rgba(78,204,163,0.6)" }} />
            <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#2e4a3a", letterSpacing: 1 }}>LIVE</span>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px", position: "relative", zIndex: 1, display: "flex", flexDirection: "column" }}>
          {messages.length === 0 ? (
            <EmptyState onChipClick={sendMessage} />
          ) : (
            <div style={{ maxWidth: 720, width: "100%", margin: "0 auto" }}>
              {messages.map((msg, i) => (
                <MessageBubble key={i} msg={msg} onFollowUp={sendMessage} />
              ))}
              {loading && messages[messages.length - 1]?.content === "" && (
                <div style={{ marginBottom: 20, animation: "fadeSlideIn 0.3s ease forwards" }}>
                  <TypingIndicator />
                </div>
              )}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Chips bar */}
        {messages.length > 0 && !loading && (
          <div style={{
            position: "relative", zIndex: 2, padding: "8px 20px 4px",
            display: "flex", gap: 6, overflowX: "auto", flexShrink: 0,
            borderTop: "1px solid #0a0e18",
          }}>
            {SUGGESTED_PROMPTS.slice(0, 4).map((p, i) => (
              <button
                key={i}
                onClick={() => sendMessage(p)}
                onMouseEnter={e => {
                  const btn = e.currentTarget as HTMLButtonElement;
                  btn.style.borderColor = "#1e3030";
                  btn.style.color = "#4ecca3";
                }}
                onMouseLeave={e => {
                  const btn = e.currentTarget as HTMLButtonElement;
                  btn.style.borderColor = "#12182a";
                  btn.style.color = "#3a4060";
                }}
                style={{
                  flexShrink: 0, padding: "5px 12px",
                  background: "transparent", border: "1px solid #12182a",
                  borderRadius: 16, color: "#3a4060",
                  fontSize: 11, fontFamily: "'DM Mono', monospace",
                  cursor: "pointer", letterSpacing: 0.3,
                  transition: "all 0.15s ease", whiteSpace: "nowrap",
                }}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ padding: "8px 20px", background: "rgba(180,40,40,0.08)", borderTop: "1px solid rgba(180,40,40,0.15)", color: "#e07070", fontSize: 12, fontFamily: "'DM Mono', monospace", textAlign: "center", position: "relative", zIndex: 2 }}>
            ⚠ {error}
          </div>
        )}

        {/* Input */}
        <div style={{ position: "relative", zIndex: 2, padding: "14px 20px 20px", background: "rgba(8,11,16,0.95)", borderTop: "1px solid #0f1520" }}>
          <div
            style={{ maxWidth: 720, margin: "0 auto", display: "flex", alignItems: "flex-end", gap: 10, background: "#0d1117", borderRadius: 14, border: "1px solid #1a2030", padding: "10px 14px", transition: "border-color 0.2s ease" }}
            onFocus={e => (e.currentTarget.style.borderColor = "#1e3530")}
            onBlur={e => (e.currentTarget.style.borderColor = "#1a2030")}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about macro markets, central banks, bonds, currencies..."
              rows={1}
              style={{
                flex: 1, background: "transparent", border: "none", outline: "none",
                color: "#c8ccd8", fontSize: 14, fontFamily: "'DM Sans', sans-serif",
                resize: "none", lineHeight: 1.6, maxHeight: 120, overflowY: "auto",
                caretColor: "#4ecca3",
              }}
              onInput={e => {
                const el = e.currentTarget as HTMLTextAreaElement;
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 120) + "px";
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              style={{
                width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                background: input.trim() && !loading ? "linear-gradient(135deg, #0a3a28, #083a20)" : "#0f1520",
                border: input.trim() && !loading ? "1px solid #2a5a3a" : "1px solid #141824",
                cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s ease",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 7L13 7M8 2L13 7L8 12" stroke={input.trim() && !loading ? "#4ecca3" : "#2a3040"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <p style={{ textAlign: "center", marginTop: 8, fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#1e2535", letterSpacing: 0.5 }}>
            MACROLENS · POWERED BY CLAUDE · MACRO ANALYSIS AI
          </p>
        </div>
      </div>
    </>
  );
}