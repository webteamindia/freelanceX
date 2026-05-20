import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { FiMessageSquare, FiSend, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useStateProvider } from "../context/StateContext";

const WELCOME_MESSAGE = {
  role: "assistant",
  content:
    "Hi, I'm ffiver Assistant. Ask me about gigs, orders, buying, selling, or getting help on the platform.",
};

const AIChatBot = () => {
  const router = useRouter();
  const [{ userInfo }] = useStateProvider();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  const pageContext = useMemo(() => {
    const path = router.pathname || "/";
    const userRole = userInfo?.isSeller ? "seller" : "buyer";
    return `${path} | role: ${userRole}`;
  }, [router.pathname, userInfo?.isSeller]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, isLoading]);

  useEffect(() => {
    if (isOpen) {
      textareaRef.current?.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const nextMessages = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: nextMessages,
          context: pageContext,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to reach the assistant.");
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            data?.message ||
            "I could not generate a response just now. Please try again.",
        },
      ]);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[60] pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="pointer-events-auto mb-4 w-[calc(100vw-2rem)] sm:w-[22rem] md:w-[26rem] overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/95 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-white">ffiver Assistant</p>
                <p className="text-xs text-zinc-400">OpenRouter · DeepSeek V4 Flash</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
                aria-label="Close chat"
              >
                <FiX />
              </button>
            </div>

            <div ref={scrollRef} className="max-h-[28rem] space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      message.role === "user"
                        ? "bg-primary text-white"
                        : "bg-zinc-900 text-zinc-100 border border-white/5"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl border border-white/5 bg-zinc-900 px-4 py-3 text-sm text-zinc-400">
                    Thinking...
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}
            </div>

            <div className="border-t border-white/10 p-4">
              <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-zinc-900 px-3 py-2">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  rows={2}
                  placeholder="Ask ffiver Assistant anything..."
                  className="max-h-32 flex-1 resize-none bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Send message"
                >
                  <FiSend />
                </button>
              </div>
              <p className="mt-2 text-[11px] text-zinc-500">
                Press Enter to send, Shift+Enter for a new line.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="pointer-events-auto ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-[0_12px_30px_rgba(29,191,115,0.35)] transition-transform hover:scale-105"
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <FiX className="text-xl" /> : <FiMessageSquare className="text-xl" />}
      </button>
    </div>
  );
};

export default AIChatBot;
