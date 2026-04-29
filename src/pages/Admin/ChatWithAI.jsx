import React, { useState, useEffect, useRef } from "react";
import AdminNavbar from "../../components/AdminNavbar";
import API from "../../services/api";

/* ─── Theme Token Helper ─────────────────────────────────────── */
const getTokens = (dark) => ({
  pageBg: dark ? "#0a0a0a" : "#f8fafc",
  chatBg: dark ? "#111111" : "#ffffff",
  chatBorder: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)",
  chatShadow: dark ? "none" : "0 4px 24px rgba(0,0,0,0.06)",
  // header
  headerText: dark ? "#c8f230" : "#6366f1",
  headerSub: dark ? "#666666" : "#94a3b8",
  // user bubble
  userBg: dark
    ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
    : "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
  userText: "#ffffff",
  userShadow: dark
    ? "0 4px 16px rgba(99,102,241,0.25)"
    : "0 4px 16px rgba(99,102,241,0.20)",
  // ai bubble
  aiBg: dark ? "#1a1a1a" : "#f1f5f9",
  aiBorder: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
  aiText: dark ? "#e2e8f0" : "#1e293b",
  aiAccent: dark ? "#c8f230" : "#6366f1",
  // input
  inputBg: dark ? "#111111" : "#ffffff",
  inputBorder: dark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.12)",
  inputBorderFocus: dark ? "#c8f230" : "#6366f1",
  inputText: dark ? "#ffffff" : "#0f172a",
  inputPlaceholder: dark ? "#555555" : "#94a3b8",
  // send button
  sendBg: dark ? "#c8f230" : "#6366f1",
  sendText: dark ? "#0a0a0a" : "#ffffff",
  sendHoverBg: dark ? "#d4f752" : "#4f46e5",
  sendShadow: dark
    ? "0 4px 20px rgba(200,242,48,0.30)"
    : "0 4px 20px rgba(99,102,241,0.25)",
  // loader
  loaderText: dark ? "#666666" : "#94a3b8",
  // welcome
  welcomeText: dark ? "#555555" : "#94a3b8",
  bubbleColor: dark ? "rgba(200,242,48,0.15)" : "rgba(99,102,241,0.15)",
  // scrollbar
  scrollThumb: dark ? "#333333" : "#cbd5e1",
  scrollTrack: dark ? "transparent" : "transparent",
});

const ChatWithAI = () => {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hello 👋.., How Can I Help You ....😊" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains("dark")
  );

  const chatEndRef = useRef(null);

  /* Watch for theme toggles (the navbar toggles .dark on <html>) */
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // ✅ Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const t = getTokens(isDark);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await API.post("/chat", {
        message: input,
      });

      const aiMessage = {
        role: "ai",
        text: res.data.reply,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMsg = error.response?.data?.reply || "Error: Unable to get response 😢";
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: errorMsg },
      ]);
    }

    setLoading(false);
  };

  // 🧪 Loader (while AI thinking)
  const ChemistryLoader = () => {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "1.5rem 0" }}>
        <div style={{ position: "relative", width: "64px", height: "64px" }}>
          <div
            style={{
              position: "absolute",
              width: "16px",
              height: "16px",
              background: t.headerText,
              borderRadius: "50%",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "64px",
              height: "64px",
              border: `2px solid ${t.headerText}66`,
              borderRadius: "50%",
              animation: "spin 2s linear infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "64px",
              height: "64px",
              border: `2px solid ${t.aiAccent}44`,
              borderRadius: "50%",
              animation: "spin 3s linear infinite",
              transform: "rotate(45deg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "64px",
              height: "64px",
              border: `2px solid ${isDark ? "#f472b6" : "#ec4899"}44`,
              borderRadius: "50%",
              animation: "spin 4s linear infinite reverse",
              transform: "rotate(-45deg)",
            }}
          />
        </div>
        <p style={{ color: t.loaderText, fontSize: "0.875rem", marginTop: "0.5rem" }}>
          Thinking like a chemist... 🧪
        </p>
      </div>
    );
  };

  // 🧑‍🔬 Welcome Animation (before chatting)
  const ChemistryAnimation = () => {
    return (
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          overflow: "hidden",
        }}
      >
        {/* Floating bubbles */}
        <div style={{ position: "absolute", inset: 0 }}>
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: "12px",
                height: "12px",
                background: t.bubbleColor,
                borderRadius: "50%",
                opacity: 0.6,
                left: `${Math.random() * 100}%`,
                animation: `bubble ${4 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        {/* Emoji */}
        <div style={{ fontSize: "3.75rem", animation: "bounce 2s ease infinite", zIndex: 10 }}>
          🧑‍🔬
        </div>

        {/* Text */}
        <p
          style={{
            color: t.welcomeText,
            marginTop: "1rem",
            fontSize: "0.875rem",
            animation: "pulse 2s ease-in-out infinite",
            zIndex: 10,
          }}
        >
          Hi! Ready to explore chemistry? 🧪✨
        </p>
      </div>
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: t.pageBg,
        transition: "background 0.3s ease",
      }}
    >
      <AdminNavbar />

      {/* Inline keyframes for animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes bubble {
          0% { transform: translateY(100%) scale(0.5); opacity: 0; }
          30% { opacity: 0.6; }
          100% { transform: translateY(-100vh) scale(1); opacity: 0; }
        }
        .chat-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .chat-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .chat-scrollbar::-webkit-scrollbar-thumb {
          background: ${t.scrollThumb};
          border-radius: 3px;
        }
        .chat-input::placeholder {
          color: ${t.inputPlaceholder};
        }
      `}</style>

      <div
        style={{
          maxWidth: "56rem",
          margin: "0 auto",
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          height: "90vh",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "1rem" }}>
          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "1.5rem",
              fontWeight: 800,
              color: t.headerText,
              transition: "color 0.3s ease",
            }}
          >
            ChemFriend 😊
          </h1>
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "0.8rem",
              color: t.headerSub,
              marginTop: "0.15rem",
              transition: "color 0.3s ease",
            }}
          >
            Your AI chemistry assistant — ask anything!
          </p>
        </div>

        {/* Chat Box */}
        <div
          className="chat-scrollbar"
          style={{
            flex: 1,
            overflowY: "auto",
            background: t.chatBg,
            border: `1px solid ${t.chatBorder}`,
            borderRadius: "16px",
            boxShadow: t.chatShadow,
            padding: "1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            transition: "background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
          }}
        >
          {/* 🧑‍🔬 Show animation if no conversation */}
          {messages.length === 1 && !loading ? (
            <ChemistryAnimation />
          ) : (
            <>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "70%",
                      padding: "0.75rem 1rem",
                      borderRadius:
                        msg.role === "user"
                          ? "16px 16px 4px 16px"
                          : "16px 16px 16px 4px",
                      fontSize: "0.875rem",
                      lineHeight: 1.6,
                      transition: "all 0.3s ease",
                      ...(msg.role === "user"
                        ? {
                            background: t.userBg,
                            color: t.userText,
                            boxShadow: t.userShadow,
                          }
                        : {
                            background: t.aiBg,
                            border: `1px solid ${t.aiBorder}`,
                            color: t.aiText,
                          }),
                    }}
                  >
                    {msg.role === "ai" && (
                      <span
                        style={{
                          display: "inline-block",
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: t.aiAccent,
                          marginBottom: "0.25rem",
                        }}
                      >
                        ChemFriend
                      </span>
                    )}
                    <div style={{ whiteSpace: "pre-wrap" }}>{msg.text}</div>
                  </div>
                </div>
              ))}

              {/* Loader */}
              {loading && <ChemistryLoader />}
            </>
          )}

          {/* Auto scroll */}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div
          style={{
            marginTop: "0.75rem",
            display: "flex",
            gap: "0.5rem",
          }}
        >
          <input
            type="text"
            placeholder="Type your question..."
            className="chat-input"
            style={{
              flex: 1,
              background: t.inputBg,
              border: `1.5px solid ${t.inputBorder}`,
              borderRadius: "12px",
              padding: "0.75rem 1rem",
              fontSize: "0.875rem",
              color: t.inputText,
              outline: "none",
              transition: "all 0.3s ease",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            onFocus={(e) => {
              e.target.style.borderColor = t.inputBorderFocus;
              e.target.style.boxShadow = `0 0 0 3px ${t.inputBorderFocus}22`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = t.inputBorder;
              e.target.style.boxShadow = "none";
            }}
          />

          <button
            onClick={handleSend}
            style={{
              background: t.sendBg,
              color: t.sendText,
              border: "none",
              borderRadius: "12px",
              padding: "0.75rem 1.5rem",
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: "0.875rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: t.sendShadow,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = t.sendHoverBg;
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = t.sendBg;
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWithAI;