// src/ai/AiChat.jsx
// Drop this file at:  src/ai/AiChat.jsx
// Import in App.jsx:  import AiChat from "./ai/AiChat";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Trash2, Loader2, Bot, User } from "lucide-react";

// ── API base matches your env.API_PREFIX (/api/v1) ───────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const getToken = () =>
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken") ||
    "";

const sendMessage = async (message) => {
    const res = await fetch(`${API_BASE}/ai/chat`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ message }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Request failed");
    }
    return res.json();
};

const clearServerHistory = async () => {
    await fetch(`${API_BASE}/ai/chat/history`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
    });
};

const SUGGESTIONS = [
    "How many leaves do I have?",
    "Show my recent leaves",
    "Apply leave from tomorrow for 2 days",
    "Show my latest payslip",
    "Show my attendance summary",
    "Team pending leaves",
];

// ── Bubble ────────────────────────────────────────────────────────────────────
const Bubble = ({ msg }) => {
    const isUser = msg.role === "user";
    return (
        <div className={`flex gap-2 mb-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
            <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white mt-0.5
        ${isUser ? "bg-gradient-to-br from-blue-500 to-indigo-600" : "bg-gradient-to-br from-violet-500 to-purple-700"}`}>
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>
            <div className={`max-w-[78%] px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line rounded-2xl
        ${isUser
                    ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-tr-sm"
                    : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-600 shadow-sm rounded-tl-sm"
                }`}>
                {msg.content}
                {msg.isError && <span className="block text-xs mt-1 opacity-70">⚠ Try again</span>}
            </div>
        </div>
    );
};

// ── Typing indicator ──────────────────────────────────────────────────────────
const Typing = () => (
    <div className="flex gap-2 mb-3">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
            <Bot className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
            <div className="flex gap-1 items-center h-4">
                {[0, 150, 300].map((d) => (
                    <span key={d} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                        style={{ animationDelay: `${d}ms` }} />
                ))}
            </div>
        </div>
    </div>
);

// ── Main ──────────────────────────────────────────────────────────────────────
const AiChat = () => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [unread, setUnread] = useState(0);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([{
        id: 0,
        role: "assistant",
        content: "Hi! I'm your HR Assistant 👋\n\nI can help you with:\n• Leave balance & applications\n• Payslip information\n• Attendance summary\n• Team pending leaves (managers)\n\nWhat can I do for you?",
    }]);

    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    useEffect(() => {
        if (open) {
            setUnread(0);
            setTimeout(() => inputRef.current?.focus(), 120);
        }
    }, [open]);

    const push = (role, content, extra = {}) =>
        setMessages((prev) => [...prev, { id: Date.now() + Math.random(), role, content, ...extra }]);

    const handleSend = useCallback(async (text) => {
        const msg = (text ?? input).trim();
        if (!msg || loading) return;
        setInput("");
        push("user", msg);
        setLoading(true);
        try {
            const result = await sendMessage(msg);
            push("assistant", result.reply || "Done!");
            if (!open) setUnread((n) => n + 1);
        } catch (err) {
            push("assistant", err.message || "Something went wrong. Please try again.", { isError: true });
        } finally {
            setLoading(false);
        }
    }, [input, loading, open]);

    const handleKey = (e) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    const handleClear = async () => {
        await clearServerHistory().catch(() => { });
        setMessages([{ id: Date.now(), role: "assistant", content: "Conversation cleared. How can I help you?" }]);
    };

    return (
        <>
            {/* Floating button */}
            <button onClick={() => setOpen((o) => !o)} aria-label="Open HR Assistant"
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full
          bg-gradient-to-br from-violet-600 to-purple-700 text-white
          shadow-lg hover:shadow-xl hover:scale-105 active:scale-95
          transition-all duration-200 flex items-center justify-center">
                {open ? <X className="w-6 h-6" /> : (
                    <>
                        <MessageCircle className="w-6 h-6" />
                        {unread > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500
                text-white text-[10px] font-bold flex items-center justify-center">
                                {unread}
                            </span>
                        )}
                    </>
                )}
            </button>

            {/* Chat panel */}
            {open && (
                <div className="fixed bottom-24 right-6 z-50 w-[360px] sm:w-[400px] h-[560px]
          flex flex-col rounded-2xl overflow-hidden shadow-2xl
          border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                    style={{ animation: "aiSlideUp 0.2s ease" }}>

                    {/* Header */}
                    <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0
            bg-gradient-to-r from-violet-600 to-purple-700 text-white">
                        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                            <Bot className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm">HR Assistant</p>
                            <p className="text-xs text-purple-200">Powered by Claude AI</p>
                        </div>
                        <button onClick={handleClear} title="Clear conversation"
                            className="p-1.5 rounded-lg hover:bg-white/20 transition">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-4">
                        {messages.map((m) => <Bubble key={m.id} msg={m} />)}
                        {loading && <Typing />}
                        <div ref={bottomRef} />
                    </div>

                    {/* Suggestion chips — only on the welcome message */}
                    {messages.length === 1 && !loading && (
                        <div className="px-4 pb-2 flex flex-wrap gap-1.5 flex-shrink-0">
                            {SUGGESTIONS.map((s) => (
                                <button key={s} onClick={() => handleSend(s)}
                                    className="text-xs px-3 py-1.5 rounded-full
                    bg-white dark:bg-gray-700
                    border border-gray-200 dark:border-gray-600
                    text-gray-700 dark:text-gray-300
                    hover:bg-violet-50 hover:border-violet-300 hover:text-violet-700
                    dark:hover:bg-violet-900/30 transition">
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className="px-3 py-3 flex-shrink-0 bg-white dark:bg-gray-800
            border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-end gap-2 bg-gray-100 dark:bg-gray-700 rounded-xl px-3 py-2">
                            <textarea ref={inputRef} rows={1} value={input} maxLength={500}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKey}
                                placeholder="Ask about leaves, payslip, attendance..."
                                className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white
                  placeholder-gray-400 resize-none outline-none leading-5 max-h-24"
                                style={{ minHeight: "20px" }} />
                            <button onClick={() => handleSend()} disabled={!input.trim() || loading}
                                className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center
                  bg-gradient-to-br from-violet-600 to-purple-700 text-white
                  disabled:opacity-40 hover:opacity-90 active:scale-95 transition-all">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-400 text-center mt-1.5">
                            Enter to send · Shift+Enter for new line
                        </p>
                    </div>
                </div>
            )}

            <style>{`
        @keyframes aiSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </>
    );
};

export default AiChat;
