import { useState, useRef, useEffect } from "react";

const MODES = {
  consultant: {
    icon: "🎨", title: "Theme Consultant",
    sub: "Pudikala nu solu — I'll find your perfect theme",
    system: `You are Aura AI, expert luxury event theme consultant for "Aura Events" — a premium Indian event management company. Personality: warm, creative, like a high-end planner who genuinely cares.

When users don't like a theme or want new ideas, ask about:
- Color preferences (warm/cool/bold/pastel/earthy)
- Vibe (romantic/modern/traditional/luxury/rustic/fun)
- Indoor or outdoor
- Season / time of day
- Rough guest count
- Any inspiration (places, movies, feelings)

Then suggest 2-3 specific custom themes each with:
✦ Creative theme name
✦ Color palette (3-4 colors)
✦ Key décor elements (flowers, materials, lighting)
✦ Overall vibe
✦ Best venue type

Keep responses conversational and warm. Use emoji naturally. Tanglish is totally fine if user speaks it. Under 280 words unless detailing themes. Always end with a follow-up question.`,
    quick: [
      "I don't like traditional wedding themes — give me something unique",
      "I want royal but modern wedding vibes",
      "Suggest a theme for outdoor evening wedding",
      "I love the ocean — what theme fits?",
      "Birthday party for a 25 year old woman",
      "Corporate event that doesn't feel boring",
    ],
  },
  planner: {
    icon: "📋", title: "Event Planner Bot",
    sub: "Full planning conversation — step by step",
    system: `You are Aura AI, full-service event planning assistant for "Aura Events" — premium Indian event management. 

Gather info naturally through conversation (don't ask all at once):
1. Event type (wedding/corporate/birthday/cultural/gala/concert)
2. Approximate date and city
3. Guest count
4. Budget range (in ₹)
5. Special vision or requirements

Based on answers recommend:
✦ Best package (Silver/Gold/Platinum)
✦ Suggested themes
✦ Must-have add-ons
✦ Realistic timeline (how many months before)
✦ Quick checklist

After gathering key info, give a clean "📋 Event Plan Summary" with estimated INR costs per category.

Be warm and professional. Tanglish welcome. Use ✦ for bullets.`,
    quick: [
      "Help me plan my daughter's wedding in 3 months",
      "Corporate conference for 300 people",
      "Planning a surprise birthday party — where to start?",
      "How early should I book for a December wedding?",
      "What's the full checklist for a cultural event?",
      "Help me plan a 50th anniversary celebration",
    ],
  },
  budget: {
    icon: "💰", title: "Budget Advisor",
    sub: "Smart budget breakdown for any event",
    system: `You are Aura AI, budget planning specialist for "Aura Events" — premium Indian event management.

For any budget + event type given, provide:
1. Category-wise breakdown with % and INR estimate:
   - Venue, Décor, Catering, Photography/Video, Entertainment, Coordination, Miscellaneous
2. Where to SPLURGE (worth it)
3. Where to SAVE (cut without regret)
4. 2-3 smart tips to maximise value

Indian rough cost guides:
- Wedding: basic ₹1.5L-3L | mid ₹3L-8L | premium ₹8L-20L | luxury ₹20L+
- Corporate per head: ₹800-5000
- Birthday: ₹20K-2L
- Cultural: ₹50K-3L

Be honest — if budget is too low for expectations, say so kindly. Format clearly with ₹ symbol. Tanglish welcome.`,
    quick: [
      "Wedding budget of ₹5 lakhs — what's realistic?",
      "I have ₹2 lakhs for a birthday — what can I get?",
      "Corporate event for 100 people with ₹3 lakh budget",
      "Where should I NOT compromise in a wedding?",
      "How to plan a luxury wedding under ₹10 lakhs?",
      "What hidden costs should I budget for?",
    ],
  },
  faq: {
    icon: "💬", title: "General Q&A",
    sub: "Ask anything about events — I know it all",
    system: `You are Aura AI, knowledgeable assistant for "Aura Events" — premium Indian event management based in Chennai, Tamil Nadu.

Answer anything about:
- Event planning timelines and checklists
- Vendor selection (photographers, caterers, florists, DJs, decorators)
- Venue selection advice for different event types
- Indian wedding customs, rituals, and traditions
- Cultural and religious event specifics
- Décor and theme inspiration and 2025 trends
- Guest management and seating
- Food and beverage planning
- Aura Events services (give rough price ranges, suggest contacting for exact quotes)
- Event industry best practices

Be helpful, specific, and practical. Give real actionable advice. Tanglish welcome.`,
    quick: [
      "How many months before should I start planning a wedding?",
      "What questions should I ask a photographer?",
      "How to choose catering for 200 guests?",
      "What makes a corporate event truly memorable?",
      "Tips for outdoor events in Indian summer heat",
      "What's trending in wedding décor for 2025?",
    ],
  },
};

const WELCOME_CHIPS = [
  "💍 I need a unique wedding theme",
  "🎂 Birthday theme ideas please",
  "💰 Budget breakdown for my event",
  "📋 Help me plan from scratch",
];

export default function AuraAI() {
  const [mode, setModeState] = useState("consultant");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const now = () =>
    new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");

    const userMsg = { role: "user", content: msg, time: now() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const historyForApi = [...messages, userMsg]
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 800,
          system: MODES[mode].system,
          messages: historyForApi,
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Sorry, try again bro!";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply, time: now() },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ Something went wrong. Please try again!",
          time: now(),
        },
      ]);
    }
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const switchMode = (m) => {
    setModeState(m);
  };

  const clearChat = () => setMessages([]);

  const fmtText = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/✦/g, '<span style="color:#c9a96e">✦</span>')
      .replace(/₹/g, '<span style="color:#c9a96e">₹</span>')
      .replace(/\n/g, "<br/>");
  };

  const s = {
    app: { display: "flex", height: "100vh", fontFamily: "'DM Sans', sans-serif", background: "#080808", color: "#fff", overflow: "hidden" },
    sidebar: { width: 260, flexShrink: 0, background: "#0f0f0f", borderRight: "1px solid rgba(201,169,110,0.12)", display: "flex", flexDirection: "column", overflow: "hidden" },
    sideTop: { padding: "18px 16px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)" },
    logo: { display: "flex", alignItems: "center", gap: 8, marginBottom: 12 },
    logoStar: { color: "#c9a96e", fontSize: 16, display: "inline-block", animation: "spin 8s linear infinite" },
    logoTxt: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 17, letterSpacing: ".1em" },
    logoEm: { fontFamily: "'Cormorant Garamond', serif", color: "#c9a96e", fontStyle: "italic", fontSize: 14 },
    badge: { display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(201,169,110,0.1)", border: "1px solid rgba(201,169,110,0.25)", padding: "4px 10px", fontSize: 10, color: "#c9a96e", letterSpacing: ".08em", textTransform: "uppercase" },
    dot: { width: 5, height: 5, background: "#4caf50", borderRadius: "50%" },
    modeSection: { padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)" },
    secLabel: { fontSize: 9, textTransform: "uppercase", letterSpacing: ".12em", color: "#888", marginBottom: 7 },
    quickSection: { padding: "12px 14px", flex: 1, overflowY: "auto" },
    sideFooter: { padding: "12px 14px", borderTop: "1px solid rgba(255,255,255,0.05)" },
    chat: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
    chatHead: { padding: "14px 22px", background: "rgba(8,8,8,0.9)", borderBottom: "1px solid rgba(201,169,110,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 },
    msgs: { flex: 1, overflowY: "auto", padding: "18px 22px", display: "flex", flexDirection: "column", gap: 14 },
    inputArea: { padding: "12px 22px 16px", background: "rgba(8,8,8,0.9)", borderTop: "1px solid rgba(201,169,110,0.1)", flexShrink: 0 },
    inputWrap: { display: "flex", gap: 10, alignItems: "flex-end", background: "#161616", border: "1px solid rgba(255,255,255,0.08)", padding: "10px 14px" },
  };

  const ModeBtn = ({ m }) => (
    <button
      onClick={() => switchMode(m)}
      style={{
        width: "100%", background: mode === m ? "rgba(201,169,110,0.08)" : "transparent",
        border: `1px solid ${mode === m ? "rgba(201,169,110,0.4)" : "rgba(255,255,255,0.07)"}`,
        color: mode === m ? "#c9a96e" : "#888", padding: "8px 10px",
        fontFamily: "'DM Sans', sans-serif", fontSize: 12, cursor: "pointer",
        textAlign: "left", display: "flex", alignItems: "center", gap: 7,
        marginBottom: 5, transition: "all .2s ease",
      }}
    >
      <span>{MODES[m].icon}</span>
      <div>
        <div style={{ fontWeight: 500, color: "inherit" }}>{MODES[m].title}</div>
      </div>
    </button>
  );

  const QuickBtn = ({ text }) => (
    <button
      onClick={() => sendMessage(text)}
      style={{
        display: "block", width: "100%", background: "transparent",
        border: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.45)",
        padding: "7px 9px", fontFamily: "'DM Sans', sans-serif", fontSize: 11,
        cursor: "pointer", textAlign: "left", marginBottom: 5, lineHeight: 1.5,
        transition: "all .2s ease",
      }}
      onMouseEnter={(e) => { e.target.style.borderColor = "rgba(201,169,110,0.3)"; e.target.style.color = "#fff"; }}
      onMouseLeave={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.06)"; e.target.style.color = "rgba(255,255,255,0.45)"; }}
    >
      ↗ {text}
    </button>
  );

  const Welcome = () => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", padding: 40, gap: 18 }}>
      <div style={{ fontSize: 50 }}>✨</div>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 300, lineHeight: 1.2 }}>
        Your Event <em style={{ color: "#c9a96e", fontStyle: "italic" }}>AI Assistant</em>
      </h2>
      <p style={{ fontSize: 13, color: "#888", lineHeight: 1.75, maxWidth: 380 }}>
        Real AI powered by Claude — ask me about themes, planning, budget, or anything events!
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, justifyContent: "center" }}>
        {WELCOME_CHIPS.map((c) => (
          <button key={c} onClick={() => sendMessage(c)}
            style={{ background: "rgba(201,169,110,0.08)", border: "1px solid rgba(201,169,110,0.2)", color: "rgba(255,255,255,0.65)", padding: "7px 14px", fontSize: 12, cursor: "pointer", transition: "all .2s ease" }}
            onMouseEnter={(e) => { e.target.style.background = "rgba(201,169,110,0.15)"; e.target.style.color = "#fff"; }}
            onMouseLeave={(e) => { e.target.style.background = "rgba(201,169,110,0.08)"; e.target.style.color = "rgba(255,255,255,0.65)"; }}
          >{c}</button>
        ))}
      </div>
    </div>
  );

  const Typing = () => (
    <div style={{ display: "flex", gap: 12 }}>
      <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(201,169,110,0.15)", border: "1px solid rgba(201,169,110,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#c9a96e", fontSize: 12, flexShrink: 0 }}>✦</div>
      <div style={{ background: "#161616", border: "1px solid rgba(255,255,255,0.06)", padding: "12px 16px", borderRadius: "2px 10px 10px 10px" }}>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {[0, 200, 400].map((d) => (
            <div key={d} style={{ width: 5, height: 5, background: "#c9a96e", borderRadius: "50%", animation: `bounce 1.2s ${d}ms infinite` }} />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={s.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,400&family=DM+Sans:wght@300;400;500&family=Bebas+Neue&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes bounce { 0%,60%,100%{transform:translateY(0);opacity:.4;} 30%{transform:translateY(-5px);opacity:1;} }
        @keyframes msgIn { from{opacity:0;transform:translateY(8px);} to{opacity:1;transform:translateY(0);} }
        ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-thumb{background:rgba(201,169,110,0.35);}
        .msg-in { animation: msgIn .3s ease both; }
        textarea { scrollbar-width: none; }
        textarea::-webkit-scrollbar { display: none; }
        strong { color: #c9a96e !important; font-weight: 500; }
      `}</style>

      {/* SIDEBAR */}
      <div style={s.sidebar}>
        <div style={s.sideTop}>
          <div style={s.logo}>
            <span style={s.logoStar}>✦</span>
            <span style={s.logoTxt}>AURA <span style={s.logoEm}>AI</span></span>
          </div>
          <div style={s.badge}><span style={s.dot} />AI Online</div>
        </div>

        <div style={s.modeSection}>
          <div style={s.secLabel}>Mode</div>
          {Object.keys(MODES).map((m) => <ModeBtn key={m} m={m} />)}
        </div>

        <div style={s.quickSection}>
          <div style={s.secLabel}>Quick Prompts</div>
          {MODES[mode].quick.map((p) => <QuickBtn key={p} text={p} />)}
        </div>

        <div style={s.sideFooter}>
          <button onClick={clearChat}
            style={{ width: "100%", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#888", padding: 9, fontFamily: "'DM Sans',sans-serif", fontSize: 11, cursor: "pointer", letterSpacing: ".08em", textTransform: "uppercase" }}
            onMouseEnter={(e) => { e.target.style.borderColor = "rgba(255,80,80,0.4)"; e.target.style.color = "#ff6b6b"; }}
            onMouseLeave={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.color = "#888"; }}
          >✕ Clear Chat</button>
        </div>
      </div>

      {/* CHAT */}
      <div style={s.chat}>
        <div style={s.chatHead}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>{MODES[mode].icon}</span>
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.2rem", fontWeight: 300 }}>{MODES[mode].title}</div>
              <div style={{ fontSize: 11, color: "#888" }}>{MODES[mode].sub}</div>
            </div>
          </div>
          <div style={{ fontSize: 10, color: "rgba(201,169,110,0.45)", letterSpacing: ".08em" }}>
            Powered by <span style={{ color: "#c9a96e" }}>Claude AI</span> ✦
          </div>
        </div>

        <div style={s.msgs}>
          {messages.length === 0 ? <Welcome /> : null}

          {messages.map((m, i) => (
            <div key={i} className="msg-in" style={{ display: "flex", gap: 10, flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: m.role === "user" ? "rgba(255,255,255,0.08)" : "rgba(201,169,110,0.15)", border: `1px solid ${m.role === "user" ? "rgba(255,255,255,0.12)" : "rgba(201,169,110,0.3)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0, color: m.role === "user" ? "#fff" : "#c9a96e" }}>
                {m.role === "user" ? "👤" : "✦"}
              </div>
              <div style={{ maxWidth: "74%", padding: "11px 15px", fontSize: 13, lineHeight: 1.75, background: m.role === "user" ? "rgba(201,169,110,0.1)" : "#161616", border: `1px solid ${m.role === "user" ? "rgba(201,169,110,0.22)" : "rgba(255,255,255,0.06)"}`, borderRadius: m.role === "user" ? "10px 2px 10px 10px" : "2px 10px 10px 10px", color: "rgba(255,255,255,0.88)" }}>
                {m.role === "assistant"
                  ? <span dangerouslySetInnerHTML={{ __html: fmtText(m.content) }} />
                  : m.content}
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.18)", marginTop: 5 }}>{m.time}</div>
              </div>
            </div>
          ))}

          {loading && <Typing />}
          <div ref={messagesEndRef} />
        </div>

        <div style={s.inputArea}>
          <div style={s.inputWrap}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Type your message... (Shift+Enter for new line)"
              rows={1}
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#fff", fontFamily: "'DM Sans',sans-serif", fontSize: 13, resize: "none", maxHeight: 100, lineHeight: 1.5 }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{ background: loading || !input.trim() ? "rgba(201,169,110,0.3)" : "#c9a96e", border: "none", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: loading || !input.trim() ? "not-allowed" : "pointer", flexShrink: 0, fontSize: 14, transition: "all .2s ease" }}
            >➤</button>
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.12)", marginTop: 7, textAlign:"center", letterSpacing: ".04em" }}>
            Enter to send · Shift+Enter for new line
          </div>
        </div>
      </div>
    </div>
  );
}