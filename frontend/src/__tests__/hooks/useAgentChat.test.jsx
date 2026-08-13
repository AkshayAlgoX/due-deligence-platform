// src/__tests__/hooks/useAgentChat.test.jsx
import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { useAgentChat } from "@/hooks/useAgentChat";

// Builds a fetch Response-like object with an SSE-ish stream.
// "SGVsbG8=" is base64 for "Hello".
const streamResponse = (chunks) => ({
  ok: true,
  status: 200,
  body: new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(new TextEncoder().encode(chunk));
      }
      controller.close();
    },
  }),
});

describe("useAgentChat", () => {
  beforeEach(() => {
    localStorage.setItem("auth_token", "test-token");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts with no messages and not streaming", () => {
    // When
    const { result } = renderHook(() => useAgentChat(1));

    // Then
    expect(result.current.messages).toEqual([]);
    expect(result.current.isStreaming).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("adds the user message and streams the assistant reply", async () => {
    // Given — a mock SSE-style stream
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(streamResponse(["data: SGVsbG8=\n\n"]))
    );

    // When
    const { result } = renderHook(() => useAgentChat(1));
    await act(async () => {
      await result.current.sendMessage("Hi");
    });

    // Then
    expect(result.current.messages[0]).toMatchObject({
      role: "user",
      content: "Hi",
    });
    await waitFor(() => {
      expect(result.current.messages[1].content).toBe("Hello");
      expect(result.current.messages[1].streaming).toBe(false);
    });
    expect(result.current.isStreaming).toBe(false);
  });

  it("sets an auth error when no token is stored", async () => {
    // Given — not logged in
    localStorage.removeItem("auth_token");

    // When
    const { result } = renderHook(() => useAgentChat(1));
    await act(async () => {
      await result.current.sendMessage("Hi");
    });

    // Then — assistant placeholder removed, user message kept, error set
    expect(result.current.error).toContain("Not logged in");
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].role).toBe("user");
  });
});
