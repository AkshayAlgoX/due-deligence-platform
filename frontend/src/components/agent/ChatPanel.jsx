"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  Square,
  Trash2,
  Sparkles,
  RotateCcw,
  Loader2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useAgentChat } from "@/hooks/useAgentChat";

const SUGGESTED_INITIAL = [
  "Is this a good investment?",
  "What are the top 3 risks?",
  "Explain the flood risk score",
  "Should I proceed with purchase?",
  "Any legal red flags?",
];

const FOLLOW_UP_QUESTIONS = [
  "Explain in more detail",
  "What should I verify?",
  "Give me next steps",
  "Compare to typical properties",
];

export default function ChatPanel({ isOpen, onClose, propertyId = null, propertyAddress = null }) {
  const { messages, isStreaming, error, sendMessage, clearChat, stopStreaming } =
    useAgentChat(propertyId);

  const [input, setInput] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    sendMessage(input.trim());
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Show follow-up suggestions when: last message is AI, not streaming, has 1+ exchanges
  const showFollowUps =
    !isStreaming &&
    messages.length >= 2 &&
    messages[messages.length - 1]?.role === "assistant" &&
    messages[messages.length - 1]?.content?.length > 20;

  // Is the AI thinking? (last message is empty assistant that's streaming)
  const isThinking =
    isStreaming &&
    messages.length > 0 &&
    messages[messages.length - 1]?.role === "assistant" &&
    !messages[messages.length - 1]?.content;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop (mobile) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />

          {/* Panel — supports light + dark */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.97 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 flex flex-col w-[400px] max-w-[calc(100vw-24px)] h-[620px] max-h-[calc(100vh-80px)] rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0d1117] shadow-2xl shadow-black/10 dark:shadow-black/40 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-white/[0.06] bg-gray-50 dark:bg-[#161b22]">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500/15 to-teal-500/15 dark:from-emerald-500/20 dark:to-teal-500/20 border border-emerald-500/30">
                <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  AI Due Diligence Assistant
                </p>
                <p className="text-xs text-gray-500 dark:text-white/40 truncate">
                  {propertyAddress ? propertyAddress : "General property analysis"}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    className="p-1.5 rounded-lg text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition"
                    title="Clear chat"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 space-y-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 dark:scrollbar-thumb-white/10">
              {messages.length === 0 ? (
                <EmptyState
                  propertyAddress={propertyAddress}
                  onSuggest={(q) => sendMessage(q)}
                />
              ) : (
                <>
                  {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                  ))}

                  {/* Thinking indicator (before first token) */}
                  {isThinking && <ThinkingBubble />}

                  {/* Follow-up suggestions */}
                  {showFollowUps && (
                    <FollowUpChips onSelect={(q) => sendMessage(q)} />
                  )}
                </>
              )}

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs">
                  <RotateCcw className="h-3.5 w-3.5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-gray-200 dark:border-white/[0.06] bg-gray-50 dark:bg-[#161b22]">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    propertyAddress
                      ? "Ask about this property..."
                      : "Ask about real estate..."
                  }
                  rows={1}
                  className="flex-1 resize-none bg-white dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition max-h-[120px] scrollbar-none"
                  style={{ minHeight: "40px" }}
                  onInput={(e) => {
                    e.target.style.height = "auto";
                    e.target.style.height =
                      Math.min(e.target.scrollHeight, 120) + "px";
                  }}
                  disabled={isStreaming}
                />
                {isStreaming ? (
                  <button
                    onClick={stopStreaming}
                    className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-xl bg-red-500/15 dark:bg-red-500/20 border border-red-500/30 text-red-500 dark:text-red-400 hover:bg-red-500/25 dark:hover:bg-red-500/30 transition"
                    title="Stop"
                  >
                    <Square className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed text-white transition shadow-lg shadow-emerald-500/20"
                    title="Send"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                )}
              </div>
              <p className="mt-1.5 text-[10px] text-gray-400 dark:text-white/20 text-center">
                Powered by Llama 3.3 70B · Not financial advice
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────
// Message Bubble
// ─────────────────────────────────────────────────────────

function MessageBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="flex-shrink-0 h-6 w-6 rounded-lg bg-gradient-to-br from-emerald-500/15 to-teal-500/15 dark:from-emerald-500/20 dark:to-teal-500/20 border border-emerald-500/20 flex items-center justify-center mr-2 mt-0.5">
          <Sparkles className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
        </div>
      )}
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed overflow-hidden ${
          isUser
            ? "bg-emerald-500 text-white rounded-tr-sm"
            : "bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.06] text-gray-800 dark:text-white/90 rounded-tl-sm"
        }`}
        style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none break-words">
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="mb-2 last:mb-0 whitespace-pre-wrap break-words">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-5 mb-2 space-y-1 break-words">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-5 mb-2 space-y-1 break-words">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-gray-700 dark:text-white/80 break-words">
                    {children}
                  </li>
                ),
                strong: ({ children }) => (
                  <strong className="text-gray-900 dark:text-white font-semibold">
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em className="text-gray-700 dark:text-white/80 italic">
                    {children}
                  </em>
                ),
                code: ({ children }) => (
                  <code className="bg-gray-200 dark:bg-white/10 px-1 rounded text-emerald-700 dark:text-emerald-300 text-xs break-all">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="bg-gray-200 dark:bg-white/10 p-2 rounded text-xs overflow-x-auto whitespace-pre-wrap break-words my-2">
                    {children}
                  </pre>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-emerald-500 pl-3 my-2 text-gray-600 dark:text-white/60 italic">
                    {children}
                  </blockquote>
                ),
                a: ({ children, href }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 dark:text-emerald-400 hover:underline break-all"
                  >
                    {children}
                  </a>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-2">
                    <table className="min-w-full text-xs border border-gray-200 dark:border-white/10">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="px-2 py-1 bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/10 text-left font-semibold">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-2 py-1 border border-gray-200 dark:border-white/10">
                    {children}
                  </td>
                ),
                h1: ({ children }) => (
                  <h1 className="text-base font-bold mt-2 mb-1 text-gray-900 dark:text-white">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-sm font-bold mt-2 mb-1 text-gray-900 dark:text-white">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-sm font-semibold mt-2 mb-1 text-gray-900 dark:text-white">
                    {children}
                  </h3>
                ),
                hr: () => (
                  <hr className="border-gray-200 dark:border-white/10 my-2" />
                ),
              }}
            >
              {message.content || ""}
            </ReactMarkdown>
            {message.streaming && message.content && (
              <span className="inline-block w-1.5 h-4 bg-emerald-500 dark:bg-emerald-400 rounded-sm ml-0.5 animate-pulse align-middle" />
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────
// Thinking indicator (animated dots)
// ─────────────────────────────────────────────────────────

function ThinkingBubble() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start"
    >
      <div className="flex-shrink-0 h-6 w-6 rounded-lg bg-gradient-to-br from-emerald-500/15 to-teal-500/15 dark:from-emerald-500/20 dark:to-teal-500/20 border border-emerald-500/20 flex items-center justify-center mr-2 mt-0.5">
        <Sparkles className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
      </div>
      <div className="bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.06] rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────
// Follow-up suggestion chips
// ─────────────────────────────────────────────────────────

function FollowUpChips({ onSelect }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="flex flex-wrap gap-1.5 pl-8"
    >
      {FOLLOW_UP_QUESTIONS.map((q) => (
        <button
          key={q}
          onClick={() => onSelect(q)}
          className="px-2.5 py-1 rounded-full bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-[11px] text-gray-600 dark:text-white/60 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/40 transition"
        >
          {q}
        </button>
      ))}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────────────────

function EmptyState({ propertyAddress, onSuggest }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-8 px-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-teal-500/15 dark:from-emerald-500/20 dark:to-teal-500/20 border border-emerald-500/20 flex items-center justify-center mb-4"
      >
        <Sparkles className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
      </motion.div>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
        {propertyAddress ? "Ask about this property" : "AI Due Diligence Assistant"}
      </h3>
      <p className="text-xs text-gray-500 dark:text-white/40 text-center mb-6 max-w-[260px]">
        {propertyAddress
          ? `Analysing: ${propertyAddress}`
          : "Ask me anything about real estate due diligence, risks, or property analysis."}
      </p>
      <div className="w-full space-y-2">
        {SUGGESTED_INITIAL.map((q, i) => (
          <motion.button
            key={q}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onSuggest(q)}
            className="w-full text-left px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.06] text-xs text-gray-700 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/[0.08] hover:text-gray-900 dark:hover:text-white/90 hover:border-emerald-500/30 transition"
          >
            {q}
          </motion.button>
        ))}
      </div>
    </div>
  );
}