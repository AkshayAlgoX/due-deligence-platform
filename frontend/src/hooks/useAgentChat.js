"use client";

import { useState, useRef, useCallback } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://duediligence-agent.duckdns.org";

export function useAgentChat(propertyId = null) {
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const sendMessage = useCallback(
    async (question) => {
      if (!question?.trim() || isStreaming) return;

      setError(null);

      const userMessage = { role: "user", content: question.trim(), id: Date.now() };
      setMessages((prev) => [...prev, userMessage]);

      const aiMessageId = Date.now() + 1;
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "", id: aiMessageId, streaming: true },
      ]);

      setIsStreaming(true);

      try {
        const token =
          localStorage.getItem("auth_token") ||
          sessionStorage.getItem("auth_token") ||
          localStorage.getItem("token") ||
          sessionStorage.getItem("token");

        if (!token) {
          throw new Error("Not logged in. Please log in and try again.");
        }

        const history = messages.map((m) => ({ role: m.role, content: m.content }));

        const response = await fetch(`${API_BASE}/api/agent/chat/stream`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            propertyId: propertyId || null,
            question: question.trim(),
            history,
          }),
          signal: (abortRef.current = new AbortController()).signal,
        });

        if (response.status === 401) {
          throw new Error("Session expired. Please log in again.");
        }
        if (response.status === 403) {
          throw new Error("You don't have permission to use the AI assistant.");
        }
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";
        let buffer = "";

        // Helper: base64 decode with proper UTF-8 handling
        const decodeToken = (b64) => {
          try {
            const binary = atob(b64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
              bytes[i] = binary.charCodeAt(i);
            }
            return new TextDecoder("utf-8").decode(bytes);
          } catch (e) {
            return "";
          }
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const events = buffer.split("\n\n");
          buffer = events.pop() || "";

          for (const event of events) {
            const lines = event.split("\n");
            for (const line of lines) {
              if (line.startsWith("data:")) {
                let encoded = line.slice(5).trim(); // safe to trim base64 — no whitespace inside
                if (!encoded || encoded === "[DONE]") continue;

                const text = decodeToken(encoded);
                if (text) {
                  accumulated += text;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === aiMessageId
                        ? { ...m, content: accumulated, streaming: true }
                        : m
                    )
                  );
                }
              }
            }
          }
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMessageId ? { ...m, streaming: false } : m
          )
        );
      } catch (err) {
        if (err.name === "AbortError") return;
        setError(err.message || "Failed to connect to AI assistant");
        setMessages((prev) => prev.filter((m) => m.id !== aiMessageId));
      } finally {
        setIsStreaming(false);
      }
    },
    [messages, isStreaming, propertyId]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
    setMessages((prev) =>
      prev.map((m, i) =>
        i === prev.length - 1 ? { ...m, streaming: false } : m
      )
    );
  }, []);

  return {
    messages,
    isStreaming,
    error,
    sendMessage,
    clearChat,
    stopStreaming,
  };
}