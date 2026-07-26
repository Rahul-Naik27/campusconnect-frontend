import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "1",
      role: "bot",
      text: "👋 Hi! I'm **CampusConnect Assistant**. I can help you with campus events, registrations, schedules, and more. What would you like to know?",
      timestamp: new Date(),
    },
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const API_BASE =
    import.meta.env.VITE_API_BASE || "http://localhost:5000/api/v1";

  // ── Auto-scroll ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // ── Focus input when chat opens ──
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 150);
  }, [isOpen]);

  // ── Send message to backend ──
  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg = {
      id: Date.now().toString(),
      role: "user",
      text: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/chatbot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.message || "Server error");

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "bot",
          text: data.reply || "Sorry, I couldn't generate a response.",
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "bot",
          text: `❌ **Error:** ${err.message}\n\nPlease make sure the backend server is running.`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    "📅 What events are coming up?",
    "🎫 How do I register?",
    "📍 Where are events held?",
    "🎟️ How to get my ticket?",
  ];

  return (
    <>
      <style>{`
        @keyframes chatSlideUp {
          from { opacity:0; transform:translateY(20px) scale(0.95); }
          to   { opacity:1; transform:translateY(0)    scale(1);    }
        }
        @keyframes typingDot {
          0%,80%,100% { transform:scale(0.6); opacity:0.4; }
          40%          { transform:scale(1);   opacity:1;   }
        }
        .cc-scroll::-webkit-scrollbar       { width:4px; }
        .cc-scroll::-webkit-scrollbar-track  { background:transparent; }
        .cc-scroll::-webkit-scrollbar-thumb  { background:#ddd6fe; border-radius:4px; }
        .cc-bot p      { margin:0 0 4px; }
        .cc-bot ul     { margin:4px 0 4px 16px; padding:0; }
        .cc-bot li     { margin-bottom:2px; }
        .cc-bot strong { font-weight:700; }
        .cc-close:hover { background:rgba(255,255,255,0.25) !important; }
        .cc-quick:hover { background:#7c3aed !important; color:#fff !important; border-color:#7c3aed !important; }
      `}</style>

      {/* ── Chat Window ── */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "90px",
            right: "24px",
            width: "380px",
            maxWidth: "calc(100vw - 32px)",
            height: "560px",
            maxHeight: "calc(100vh - 120px)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow:
              "0 25px 60px rgba(109,40,217,0.25),0 8px 20px rgba(0,0,0,0.15)",
            fontFamily: "'Segoe UI',system-ui,sans-serif",
            animation: "chatSlideUp 0.3s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg,#6d28d9 0%,#4f46e5 100%)",
              padding: "16px 18px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                background: "rgba(255,255,255,0.2)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
              }}
            >
              🎓
            </div>

            <div style={{ flex: 1 }}>
              <div
                style={{
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "15px",
                  lineHeight: 1.2,
                }}
              >
                CampusConnect Bot
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.75)",
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    background: "#34d399",
                    borderRadius: "50%",
                    display: "inline-block",
                  }}
                />
                Online • Powered by Gemini
              </div>
            </div>

            <button
              className="cc-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "none",
                color: "#fff",
                width: 32,
                height: 32,
                borderRadius: "50%",
                cursor: "pointer",
                fontSize: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.2s",
              }}
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div
            className="cc-scroll"
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px 14px",
              background: "#faf9ff",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "82%",
                    display: "flex",
                    flexDirection: m.role === "user" ? "row-reverse" : "row",
                    gap: 8,
                    alignItems: "flex-end",
                  }}
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      flexShrink: 0,
                      background:
                        m.role === "bot"
                          ? "linear-gradient(135deg,#6d28d9,#4f46e5)"
                          : "#e0e7ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "13px",
                    }}
                  >
                    {m.role === "bot" ? "🎓" : "👤"}
                  </div>

                  {/* Bubble */}
                  <div
                    className={m.role === "bot" ? "cc-bot" : ""}
                    style={{
                      padding: "10px 13px",
                      borderRadius:
                        m.role === "user"
                          ? "18px 18px 4px 18px"
                          : "18px 18px 18px 4px",
                      background:
                        m.role === "user"
                          ? "linear-gradient(135deg,#6d28d9,#4f46e5)"
                          : "#fff",
                      color: m.role === "user" ? "#fff" : "#1e1b4b",
                      fontSize: "13.5px",
                      lineHeight: 1.5,
                      boxShadow:
                        m.role === "user"
                          ? "0 2px 12px rgba(109,40,217,0.3)"
                          : "0 2px 8px rgba(0,0,0,0.08)",
                      border: m.role === "bot" ? "1px solid #ede9fe" : "none",
                    }}
                  >
                    <ReactMarkdown>{m.text}</ReactMarkdown>
                    <div
                      style={{
                        fontSize: "10px",
                        opacity: 0.5,
                        marginTop: 4,
                        textAlign: m.role === "user" ? "right" : "left",
                      }}
                    >
                      {m.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#6d28d9,#4f46e5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px",
                  }}
                >
                  🎓
                </div>
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #ede9fe",
                    borderRadius: "18px 18px 18px 4px",
                    padding: "12px 16px",
                    display: "flex",
                    gap: 4,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: "#7c3aed",
                        animation: "typingDot 1.2s ease infinite",
                        animationDelay: `${i * 0.2}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quick questions — only shown before first user message */}
            {messages.length === 1 && !isLoading && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  marginTop: 4,
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    color: "#7c6fb0",
                    fontWeight: 600,
                    paddingLeft: 36,
                  }}
                >
                  Quick questions:
                </div>
                {quickQuestions.map((q) => (
                  <button
                    key={q}
                    className="cc-quick"
                    onClick={() => {
                      setInput(
                        q
                          .replace(
                            /^[\u{1F300}-\u{1FFFF}\u{2600}-\u{26FF}\s]+/u,
                            "",
                          )
                          .trim(),
                      );
                      inputRef.current?.focus();
                    }}
                    style={{
                      marginLeft: 36,
                      background: "#fff",
                      border: "1px solid #ddd6fe",
                      borderRadius: "20px",
                      padding: "7px 14px",
                      fontSize: "12px",
                      color: "#6d28d9",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.18s",
                      fontWeight: 500,
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: "12px 14px",
              background: "#fff",
              borderTop: "1px solid #ede9fe",
              display: "flex",
              gap: 8,
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about events, tickets…"
              style={{
                flex: 1,
                border: "1.5px solid #ddd6fe",
                borderRadius: "24px",
                padding: "9px 16px",
                fontSize: "13.5px",
                outline: "none",
                background: "#faf9ff",
                color: "#1e1b4b",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
              onBlur={(e) => (e.target.style.borderColor = "#ddd6fe")}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background:
                  isLoading || !input.trim()
                    ? "#c4b5fd"
                    : "linear-gradient(135deg,#6d28d9,#4f46e5)",
                border: "none",
                color: "#fff",
                cursor: isLoading || !input.trim() ? "not-allowed" : "pointer",
                fontSize: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "background 0.2s,transform 0.1s",
                boxShadow: "0 2px 8px rgba(109,40,217,0.3)",
              }}
              onMouseDown={(e) => {
                if (!isLoading && input.trim())
                  e.currentTarget.style.transform = "scale(0.92)";
              }}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* ── Floating Toggle Button ── */}
      <button
        onClick={() => setIsOpen((p) => !p)}
        aria-label={isOpen ? "Close CampusConnect Assistant" : "Open CampusConnect Assistant"}
        title="CampusConnect Assistant"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "58px",
          height: "58px",
          borderRadius: "50%",
          background: "linear-gradient(135deg,#6d28d9 0%,#4f46e5 100%)",
          border: "none",
          color: "#fff",
          fontSize: "24px",
          cursor: "pointer",
          zIndex: 9999,
          boxShadow: "0 4px 20px rgba(109,40,217,0.45)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition:
            "transform 0.3s cubic-bezier(0.16,1,0.3,1),box-shadow 0.3s",
          transform: isOpen ? "rotate(45deg) scale(1.05)" : "scale(1)",
        }}
        onMouseEnter={(e) => {
          if (!isOpen) e.currentTarget.style.transform = "scale(1.12)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = isOpen
            ? "rotate(45deg) scale(1.05)"
            : "scale(1)";
        }}
      >
        {isOpen ? "✕" : "🎓"}
      </button>
    </>
  );
};

export default ChatBot;
