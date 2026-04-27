import React, { useState, useEffect, useRef } from "react";
import AdminNavbar from "../../components/AdminNavbar";
import axios from "axios";



const ChatWithAI = () => {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hello 👋.., How Can I Help You ....😊" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef(null);

  // ✅ Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/chat", {
        message: input,
      });

      const aiMessage = {
        role: "ai",
        text: res.data.reply,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Error: Unable to get response 😢" },
      ]);
    }

    setLoading(false);
  };

  // 🧪 Loader (while AI thinking)
  const ChemistryLoader = () => {
    return (
      <div className="flex flex-col items-center py-6">
        <div className="relative w-16 h-16">
          <div className="absolute w-4 h-4 bg-indigo-500 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute w-16 h-16 border-2 border-indigo-400 rounded-full animate-spin"></div>
          <div className="absolute w-16 h-16 border-2 border-purple-400 rounded-full animate-spin [animation-duration:3s] rotate-45"></div>
          <div className="absolute w-16 h-16 border-2 border-pink-400 rounded-full animate-spin [animation-duration:4s] -rotate-45"></div>
        </div>
        <p className="text-gray-400 text-sm mt-2">
          Thinking like a chemist... 🧪
        </p>
      </div>
    );
  };

  // 🧑‍🔬 Welcome Animation (before chatting)
  const ChemistryAnimation = () => {
    return (
      <div className="relative flex flex-col items-center justify-center h-full overflow-hidden">

        {/* Floating bubbles */}
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 bg-blue-300 rounded-full opacity-40 animate-bubble"
              style={{
                left: `${Math.random() * 100}%`,
                animationDuration: `${4 + Math.random() * 4}s`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        {/* Emoji */}
        <div className="text-6xl animate-bounce z-10">
          🧑‍🔬
        </div>

        {/* Text */}
        <p className="text-gray-300 mt-4 text-sm animate-pulse z-10">
          Hi! Ready to explore chemistry? 🧪✨
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />

      <div className="max-w-4xl mx-auto p-4 flex flex-col h-[90vh]">
        
        {/* Header */}
        <h1 className="text-2xl font-bold mb-4 text-indigo-600">
          ChemFriend 😊
        </h1>

        {/* Chat Box */}
        <div className="flex-1 overflow-y-auto bg-black rounded-xl shadow p-4 space-y-4">

          {/* 🧑‍🔬 Show animation if no conversation */}
          {messages.length === 1 && !loading ? (
            <ChemistryAnimation />
          ) : (
            <>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`px-4 py-2 rounded-2xl max-w-[70%] text-sm ${
                      msg.role === "user"
                        ? "bg-indigo-500 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {msg.text}
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
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            placeholder="Type your question..."
            className="flex-1 border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />

          <button
            onClick={handleSend}
            className="bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWithAI;