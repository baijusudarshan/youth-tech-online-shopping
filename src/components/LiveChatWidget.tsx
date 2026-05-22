import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, Headset } from "lucide-react";
import { ChatMessage } from "../types";

export default function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      sender: "bot",
      text: "Namaste! Welcome to Youth Tech AI Support. Ask me anything about our Laptops, Gaming Smartphones, smart wearable audio gear, e-wallet checkouts (eSewa/Khalti) or order logs! हाल मलाई नेपाली भाषामा पनि सोध्न सक्नुहुन्छ।",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic
  useEffect(() => {
    if (isOpen && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, isOpen, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: "u_" + Date.now(),
      sender: "user",
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      // Send chat log to express server-side Gemini routing
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ sender: m.sender, text: m.text }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        const botMsg: ChatMessage = {
          id: "b_" + Date.now(),
          sender: "bot",
          text: data.botResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error("Chat api returned error");
      }
    } catch (err) {
      console.error("Live assistant channel failure", err);
      // Local fallback fallback
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: "err_" + Date.now(),
            sender: "bot",
            text: "My connection seems fluctuating slightly! Please try sending your laptop or eSewa/Khalti checkout query again, or try contacting support at +977-1-4433221.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }
        ]);
      }, 1000);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating Chat Portal */}
      {isOpen ? (
        <div className="w-[320px] sm:w-[360px] h-[450px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-6 duration-200 leading-normal mb-3">
          
          {/* Portal Header */}
          <div className="p-4 bg-gradient-to-r from-indigo-600 to-violet-500 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 animate-pulse" />
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-white">Youth Tech AI assistant</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping"></span>
                  <span className="text-[9px] font-bold text-indigo-100 uppercase tracking-wider">Live & Active</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/10 rounded-full text-white cursor-pointer focus:outline-none"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages ledger container */}
          <div
            ref={containerRef}
            className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-slate-50/50 dark:bg-slate-950/20"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col max-w-[80%] text-xs ${
                  m.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                <div
                  className={`p-3 rounded-2xl ${
                    m.sender === "user"
                      ? "bg-indigo-600 text-white rounded-br-none"
                      : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none shadow-sm border border-slate-150/50 dark:border-slate-800"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                </div>
                <span className="text-[8px] text-slate-400 mt-1 font-mono tracking-wider">
                  {m.timestamp}
                </span>
              </div>
            ))}

            {/* Simulated typing indicator */}
            {isTyping && (
              <div className="flex items-center space-x-1 p-2 mr-auto bg-white border dark:bg-slate-800 dark:border-slate-800 rounded-xl rounded-bl-none shadow-sm">
                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            )}
          </div>

          {/* Input control form */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 border-t bg-white dark:bg-slate-900 border-slate-20 w-full flex gap-1.5 items-center"
          >
            <input
              type="text"
              required
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about laptops, eSewa or specs..."
              className="flex-1 h-9 px-3.5 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md active:scale-95 duration-150"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      ) : null}

      {/* Primary Toggle Chat bubble */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 hover:scale-105 active:scale-95 text-white flex items-center justify-center shadow-xl shadow-indigo-600/30 transition-all outline-none"
        title="Open AI Gadget Assistant"
      >
        {isOpen ? <X className="w-5.5 h-5.5" /> : <MessageSquare className="w-5.5 h-5.5" />}
      </button>

    </div>
  );
}
