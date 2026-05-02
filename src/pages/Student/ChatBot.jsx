import React, { useState, useEffect, useRef } from "react";
import StudentNavbar from "../../components/StudentNavbar";
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
  // model selector
  toggleBg: dark ? "#1a1a1a" : "#e2e8f0",
  toggleBorder: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
  toggleActiveBg: dark ? "#c8f230" : "#6366f1",
  toggleActiveText: dark ? "#0a0a0a" : "#ffffff",
  toggleInactiveText: dark ? "#888888" : "#64748b",
});

const defaultMessages = [{ role: "ai", text: "Hello 👋.., How Can I Help You ....😊" }];

const ChatBot = () => {
  const [chats, setChats] = useState(() => {
    try {
      const saved = localStorage.getItem("chemOneStudentChats");
      if (saved) {
        let parsed = JSON.parse(saved);
        const now = Date.now();
        return parsed.filter(c => now - c.timestamp < 86400000);
      }
    } catch (e) {
      console.error("Failed to load chats", e);
    }
    return [];
  });

  const [currentChatId, setCurrentChatId] = useState(() => {
    if (chats && chats.length > 0) return chats[0].id;
    return null;
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini");
  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains("dark")
  );

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const chatEndRef = useRef(null);

  /* Watch for theme toggles */
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

  // Save chats to localStorage whenever they update
  useEffect(() => {
    localStorage.setItem("chemOneStudentChats", JSON.stringify(chats));
  }, [chats]);

  const currentChat = chats.find(c => c.id === currentChatId);
  const messages = currentChat ? currentChat.messages : defaultMessages;

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const t = getTokens(isDark);

  const handleSend = async () => {
    if (!input.trim()) return;

    let chatId = currentChatId;
    let newChats = [...chats];
    let chatIndex = newChats.findIndex(c => c.id === chatId);

    const userMessage = { role: "user", text: input };
    const currentInput = input;

    setInput("");
    setLoading(true);

    if (chatIndex === -1) {
      // Create new chat
      chatId = Date.now().toString();
      const title = currentInput.split(" ").slice(0, 4).join(" ") + (currentInput.length > 20 ? "..." : "");
      const newChat = {
        id: chatId,
        title: title || "New Chat",
        timestamp: Date.now(),
        messages: [...defaultMessages, userMessage]
      };
      newChats.unshift(newChat);
      setCurrentChatId(chatId);
      chatIndex = 0;
    } else {
      newChats[chatIndex] = {
        ...newChats[chatIndex],
        messages: [...newChats[chatIndex].messages, userMessage],
        timestamp: Date.now()
      };
      // Move to top if it's not already
      if (chatIndex > 0) {
        const [movedChat] = newChats.splice(chatIndex, 1);
        newChats.unshift(movedChat);
      }
    }

    setChats(newChats);
    setIsSidebarOpen(false);

    try {
      const res = await API.post("/chat", {
        message: currentInput,
        model: selectedModel,
      });

      const aiMessage = {
        role: "ai",
        text: res.data.reply,
        model: res.data.model || selectedModel,
      };

      setChats(prev => {
        const updated = [...prev];
        const idx = updated.findIndex(c => c.id === chatId);
        if (idx !== -1) {
          updated[idx] = {
            ...updated[idx],
            messages: [...updated[idx].messages, aiMessage]
          };
        }
        return updated;
      });
    } catch (error) {
      const errorMsg = error.response?.data?.reply || "Error: Unable to get response 😢";
      setChats(prev => {
        const updated = [...prev];
        const idx = updated.findIndex(c => c.id === chatId);
        if (idx !== -1) {
          updated[idx] = {
            ...updated[idx],
            messages: [...updated[idx].messages, { role: "ai", text: errorMsg }]
          };
        }
        return updated;
      });
    }

    setLoading(false);
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    setIsSidebarOpen(false);
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
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: t.pageBg,
        transition: "background 0.3s ease",
        overflow: "hidden",
      }}
    >
      <StudentNavbar />

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
        @media (max-width: 768px) {
          .sidebar-container {
            position: fixed !important;
            left: -260px;
            top: 64px;
            bottom: 0;
            z-index: 100;
            transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 10px 0 30px rgba(0,0,0,0.1);
          }
          .sidebar-open .sidebar-container {
            left: 0 !important;
          }
          .mobile-overlay {
            display: none;
            position: fixed;
            inset: 0;
            top: 64px;
            background: rgba(0,0,0,0.4);
            backdrop-filter: blur(4px);
            z-index: 90;
            opacity: 0;
            transition: opacity 0.3s ease;
          }
          .sidebar-open .mobile-overlay {
            display: block;
            opacity: 1;
          }
          .chat-area-container {
            padding: 0.75rem !important;
          }
          .header-container {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 1rem;
            margin-bottom: 1rem !important;
          }
          .header-text-group {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .model-selector-container {
            width: 100%;
            justify-content: space-between;
          }
          .model-selector-container button {
            flex: 1;
            padding: 8px !important;
          }
          .message-bubble {
            max-width: 85% !important;
          }
          .mobile-toggle {
            display: flex !important;
          }
          .input-container {
            padding-bottom: 0.5rem;
          }
        }
      `}</style>

      {/* Main Container */}
      <div 
        className={isSidebarOpen ? "sidebar-open" : ""}
        style={{ display: "flex", flex: 1, overflow: "hidden" }}
      >
        {/* Mobile Overlay */}
        <div 
          className="mobile-overlay" 
          onClick={() => setIsSidebarOpen(false)}
        />

        {/* Sidebar */}
        <div
          className="chat-scrollbar sidebar-container"
          style={{
            width: "260px",
            minWidth: "260px",
            background: isDark ? "#121212" : "#f1f5f9",
            borderRight: `1px solid ${t.chatBorder}`,
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
            transition: "background 0.3s ease, border-color 0.3s ease",
          }}
        >
          <div style={{ padding: "1.25rem" }}>
            <button
              onClick={handleNewChat}
              style={{
                width: "100%",
                background: t.sendBg,
                color: t.sendText,
                border: "none",
                borderRadius: "8px",
                padding: "0.75rem",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "0.875rem",
                cursor: "pointer",
                marginBottom: "1.5rem",
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
              + New Chat
            </button>

            <div style={{
              display: "flex",
              alignItems: "center",
              color: isDark ? "#ffffff" : "#0f172a",
              fontWeight: 600,
              fontSize: "0.9rem",
              marginBottom: "1rem",
              fontFamily: "'Space Grotesk', sans-serif",
            }}>
              Recents
              <svg style={{ width: "16px", height: "16px", marginLeft: "4px", opacity: 0.7 }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {chats.map(c => (
                <div
                  key={c.id}
                  onClick={() => {
                    setCurrentChatId(c.id);
                    setIsSidebarOpen(false);
                  }}
                  style={{
                    padding: "0.75rem",
                    borderRadius: "8px",
                    cursor: "pointer",
                    background: currentChatId === c.id ? (isDark ? "#2a2a2a" : "#e2e8f0") : "transparent",
                    color: currentChatId === c.id ? (isDark ? "#c8f230" : "#6366f1") : (isDark ? "#d1d5db" : "#334155"),
                    transition: "all 0.2s ease",
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "0.85rem",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}
                  onMouseEnter={(e) => {
                    if (currentChatId !== c.id) {
                      e.currentTarget.style.background = isDark ? "#262626" : "#e2e8f0";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentChatId !== c.id) {
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  {c.title}
                </div>
              ))}

              {chats.length === 0 && (
                <div style={{
                  color: t.headerSub,
                  fontSize: "0.8rem",
                  textAlign: "center",
                  marginTop: "1rem",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}>
                  No recent chats
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div
          className="chat-area-container"
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            padding: "1.5rem",
            overflow: "hidden"
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "56rem",
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            {/* Header */}
            <div 
              className="header-container"
              style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}
            >
              <div className="header-text-group">
                <div style={{ display: "flex", alignItems: "center" }}>
                  {/* Mobile Menu Toggle */}
                  <button 
                    className="mobile-toggle"
                    onClick={() => setIsSidebarOpen(true)}
                    style={{
                      display: "none",
                      background: "transparent",
                      border: "none",
                      color: t.headerText,
                      cursor: "pointer",
                      padding: "0.5rem",
                      marginRight: "0.5rem",
                      marginLeft: "-0.5rem",
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="3" y1="12" x2="21" y2="12"></line>
                      <line x1="3" y1="6" x2="21" y2="6"></line>
                      <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                  </button>
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
                </div>
                
                {/* Desktop subtitle - hidden on mobile if needed, or kept */}
                <p
                  className="desktop-subtitle"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "0.8rem",
                    color: t.headerSub,
                    marginTop: "0.15rem",
                    transition: "color 0.3s ease",
                  }}
                >
                  Your AI chemistry assistant
                </p>
              </div>

              {/* AI Model Toggle */}
              <div
                id="model-selector"
                className="model-selector-container"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0",
                  background: t.toggleBg,
                  border: `1px solid ${t.toggleBorder}`,
                  borderRadius: "12px",
                  padding: "4px",
                  fontFamily: "'Space Grotesk', sans-serif",
                  transition: "all 0.3s ease",
                }}
              >
                <button
                  id="model-gemini-btn"
                  onClick={() => setSelectedModel("gemini")}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "9px",
                    border: "none",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    fontFamily: "'Space Grotesk', sans-serif",
                    cursor: "pointer",
                    transition: "all 0.25s ease",
                    background: selectedModel === "gemini" ? t.toggleActiveBg : "transparent",
                    color: selectedModel === "gemini" ? t.toggleActiveText : t.toggleInactiveText,
                    boxShadow: selectedModel === "gemini" ? "0 2px 8px rgba(0,0,0,0.15)" : "none",
                  }}
                >
                  Model 1✨
                </button>
                <button
                  id="model-llama-btn"
                  onClick={() => setSelectedModel("llama")}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "9px",
                    border: "none",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    fontFamily: "'Space Grotesk', sans-serif",
                    cursor: "pointer",
                    transition: "all 0.25s ease",
                    background: selectedModel === "llama" ? t.toggleActiveBg : "transparent",
                    color: selectedModel === "llama" ? t.toggleActiveText : t.toggleInactiveText,
                    boxShadow: selectedModel === "llama" ? "0 2px 8px rgba(0,0,0,0.15)" : "none",
                  }}
                >
                  Model 2✨
                </button>
              </div>
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
                        className="message-bubble"
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
                            ChemFriend {msg.model === "llama" ? "🦙" : msg.model === "gemini" ? "✨" : ""}
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
              className="input-container"
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
      </div>
    </div>
  );
};

export default ChatBot;