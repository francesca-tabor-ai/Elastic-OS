"use client";

import { useState } from "react";

const PROMPT_PROBES = [
  "What is ElasticOS?",
  "How do I register as a worker?",
  "How does employer verification work?",
  "What are engagement intensity and affiliation records?",
  "How do I set up MFA?",
  "What user roles exist on the platform?",
];

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const addMessage = (role: "user" | "assistant", content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role,
        content,
        timestamp: new Date(),
      },
    ]);
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage = content.trim();
    addMessage("user", userMessage);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();
      addMessage("assistant", data.reply ?? "Sorry, I couldn't process that. Try asking about the platform features, registration, or verification.");
    } catch {
      addMessage(
        "assistant",
        "I'm having trouble connecting. Please try again or ask: What is ElasticOS?"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleProbeClick = (probe: string) => {
    sendMessage(probe);
  };

  return (
    <>
      {/* Floating chat button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 shadow-lg transition-all hover:scale-105 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 dark:bg-emerald-500 dark:hover:bg-emerald-600"
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-7 w-7 text-white"
        >
          <path
            fillRule="evenodd"
            d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97-1.94.284-3.916.455-5.922.542a.75.75 0 0 1-.143-1.49c1.795-.105 3.65-.267 5.485-.506 1.12-.164 1.933-.776 1.933-1.564V6.26c0-.788-.813-1.4-1.933-1.564A47.78 47.78 0 0 0 12 3.75c-2.353 0-4.68.124-6.932.364-1.12.164-1.933.776-1.933 1.564v6.02c0 .788.813 1.4 1.933 1.564 1.835.24 3.69.4 5.485.506a.75.75 0 0 1-.143 1.49 49.066 49.066 0 0 1-5.922-.542C4.378 12.446 3 10.714 3 8.77V6.25c0-1.946 1.37-3.68 3.348-3.97Z"
            clipRule="evenodd"
          />
          <path d="M9 8.25a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5H9Z" />
          <path d="M13.5 8.25a.75.75 0 0 0 0 1.5H15a.75.75 0 0 0 0-1.5h-1.5Z" />
          <path
            fillRule="evenodd"
            d="M9.879 14.084a.75.75 0 0 1 1.06 0 3.5 3.5 0 0 0 4.95 0 .75.75 0 0 1 1.06 1.06 5 5 0 0 1-7.07 0 .75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[480px] w-[380px] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-zinc-200 bg-emerald-50 px-4 py-3 dark:border-zinc-700 dark:bg-emerald-950/30">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5 text-white"
              >
                <path
                  fillRule="evenodd"
                  d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97-1.94.284-3.916.455-5.922.542a.75.75 0 0 1-.143-1.49c1.795-.105 3.65-.267 5.485-.506 1.12-.164 1.933-.776 1.933-1.564V6.26c0-.788-.813-1.4-1.933-1.564A47.78 47.78 0 0 0 12 3.75c-2.353 0-4.68.124-6.932.364-1.12.164-1.933.776-1.933 1.564v6.02c0 .788.813 1.4 1.933 1.564 1.835.24 3.69.4 5.485.506a.75.75 0 0 1-.143 1.49 49.066 49.066 0 0 1-5.922-.542C4.378 12.446 3 10.714 3 8.77V6.25c0-1.946 1.37-3.68 3.348-3.97Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                ElasticOS Assistant
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Ask me about the platform
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Hi! I can help you understand ElasticOS — employment elasticity
                  infrastructure for workers and employers. What would you like
                  to know?
                </p>
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Try asking
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {PROMPT_PROBES.map((probe) => (
                      <button
                        key={probe}
                        onClick={() => handleProbeClick(probe)}
                        className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-left text-sm text-zinc-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-200"
                      >
                        {probe}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                        msg.role === "user"
                          ? "bg-emerald-600 text-white"
                          : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl bg-zinc-100 px-4 py-2 dark:bg-zinc-800">
                      <span className="animate-pulse text-sm text-zinc-500">
                        Thinking...
                      </span>
                    </div>
                  </div>
                )}
                {messages.length > 0 && !isLoading && (
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-400">
                      Or ask another
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {PROMPT_PROBES.slice(0, 3).map((probe) => (
                        <button
                          key={probe}
                          onClick={() => handleProbeClick(probe)}
                          className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-left text-sm text-zinc-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-200"
                        >
                          {probe}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-zinc-200 p-3 dark:border-zinc-700"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about ElasticOS..."
                disabled={isLoading}
                className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:placeholder:text-zinc-500"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path d="M3.478 2.405a.75.75 0 0 0-.926.94l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.405Z" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
