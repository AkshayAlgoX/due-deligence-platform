/**
 * sseService — manages the SSE connection to /api/sse/notifications.
 *
 * Design (Slack / Linear / Discord tier):
 *  - Singleton EventSource per browser tab
 *  - Exponential backoff: 1s → 2s → 4s → 8s → 16s → 30s (capped)
 *  - Random jitter added to prevent thundering herd on backend recovery
 *  - Logs the outage ONCE, then stays silent until recovery
 *  - Logs recovery ONCE when connection is restored
 *  - Exposes reconnect state via subscribeToConnectionState() for UI badges
 *  - Auto-reset backoff on successful connection
 *  - Pauses reconnect when tab is hidden (saves battery)
 *  - Resumes immediately when tab becomes visible again
 */
import { API_ROUTES } from "@/constants/apiRoutes";
import { getToken } from "@/utils/helpers";

let eventSource = null;
const listeners = new Set();
const connectionStateListeners = new Set();
let reconnectTimer = null;

// Backoff configuration
const INITIAL_DELAY_MS = 1_000;
const MAX_DELAY_MS = 30_000;
const BACKOFF_MULTIPLIER = 2;
const JITTER_MS = 400; // ±400ms randomness

// State tracking
let reconnectAttempts = 0;
let outageLogged = false;
let currentState = "disconnected"; // "connected" | "connecting" | "disconnected" | "reconnecting"
let visibilityListenerAttached = false;

// ─────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────

export function subscribeToNotifications(onNotification) {
  if (typeof window === "undefined") return () => {};

  listeners.add(onNotification);
  attachVisibilityListener();

  if (!eventSource || eventSource.readyState === EventSource.CLOSED) {
    openConnection();
  }

  return () => {
    listeners.delete(onNotification);
    if (listeners.size === 0) {
      closeConnection();
    }
  };
}

/**
 * Subscribe to connection state changes.
 * Use this to show "Reconnecting…" pill in UI.
 *
 * @param {(state: "connected"|"connecting"|"disconnected"|"reconnecting") => void} callback
 * @returns {function} unsubscribe
 */
export function subscribeToConnectionState(callback) {
  connectionStateListeners.add(callback);
  // Immediately push current state so consumer starts in sync
  callback(currentState);
  return () => connectionStateListeners.delete(callback);
}

/** Force-close the SSE connection (e.g. on logout). */
export function disconnectSse() {
  listeners.clear();
  reconnectAttempts = 0;
  outageLogged = false;
  setState("disconnected");
  closeConnection();
}

// ─────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────

function setState(newState) {
  if (currentState === newState) return;
  currentState = newState;
  connectionStateListeners.forEach((cb) => {
    try {
      cb(newState);
    } catch (err) {
      // Never let a broken listener break state updates
    }
  });
}

function getSseUrl() {
  const token = getToken();
  if (!token) return null;

  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://localhost:8080";

  const url = new URL(API_ROUTES.SSE_NOTIFICATIONS, baseUrl);
  url.searchParams.set("token", token);
  return url.toString();
}

function computeBackoffDelay() {
  // Exponential: 1s, 2s, 4s, 8s, 16s, 30s (cap)
  const base = Math.min(
    INITIAL_DELAY_MS * Math.pow(BACKOFF_MULTIPLIER, reconnectAttempts),
    MAX_DELAY_MS
  );
  // Add jitter: base ± JITTER_MS
  const jitter = Math.floor(Math.random() * (JITTER_MS * 2)) - JITTER_MS;
  return Math.max(500, base + jitter);
}

function openConnection() {
  closeConnection();

  if (reconnectTimer) {
    window.clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  setState(reconnectAttempts === 0 ? "connecting" : "reconnecting");

  try {
    const url = getSseUrl();
    if (!url) {
      // No token — nothing to do, silently defer
      setState("disconnected");
      return;
    }

    eventSource = new EventSource(url, { withCredentials: true });

    eventSource.addEventListener("notification", (event) => {
      if (!event.data) return;
      try {
        const notification = JSON.parse(event.data);
        listeners.forEach((listener) => {
          try {
            listener(notification);
          } catch (listenerError) {
            console.warn("[SSE] listener error:", listenerError);
          }
        });
      } catch (parseError) {
        console.warn("[SSE] failed to parse notification:", parseError);
      }
    });

    eventSource.addEventListener("ping", () => {
      // Keep-alive; nothing to do
    });

    eventSource.onopen = () => {
      // Successful connection — reset all failure state
      const wasReconnecting = reconnectAttempts > 0 || outageLogged;

      reconnectAttempts = 0;

      if (wasReconnecting) {
        console.info("[SSE] Connection restored");
        outageLogged = false;
      }

      setState("connected");
    };

    eventSource.onerror = () => {
      // EventSource fires onerror on every failed poll attempt.
      // We DO NOT log here — we only log once per outage below.
      if (!eventSource || eventSource.readyState === EventSource.CLOSED) {
        scheduleReconnect();
      }
    };
  } catch (openError) {
    // Real synchronous error opening — log this one, it's unusual
    console.error("[SSE] failed to open EventSource:", openError);
    scheduleReconnect();
  }
}

function scheduleReconnect() {
  if (reconnectTimer || listeners.size === 0) return;

  // Pause retries if tab is hidden — save battery + backend load
  if (typeof document !== "undefined" && document.hidden) {
    setState("disconnected");
    return;
  }

  // Log the outage exactly ONCE per outage window
  if (!outageLogged) {
    console.warn(
      "[SSE] Connection lost — reconnecting with exponential backoff. " +
        "Further attempts will be silent until restored."
    );
    outageLogged = true;
  }

  const delay = computeBackoffDelay();
  setState("reconnecting");

  reconnectTimer = window.setTimeout(() => {
    reconnectTimer = null;
    if (listeners.size > 0) {
      reconnectAttempts += 1;
      openConnection();
    }
  }, delay);
}

function closeConnection() {
  if (reconnectTimer) {
    window.clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  if (eventSource) {
    try {
      eventSource.close();
    } catch {
      // ignore
    }
    eventSource = null;
  }
}

// ─────────────────────────────────────────────────────────────
// Visibility handling — pause when hidden, resume when visible
// ─────────────────────────────────────────────────────────────

function attachVisibilityListener() {
  if (visibilityListenerAttached || typeof document === "undefined") return;
  visibilityListenerAttached = true;

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      // Tab hidden — no need to spam retries
      return;
    }

    // Tab visible again — if disconnected, try immediately
    if (
      listeners.size > 0 &&
      (!eventSource || eventSource.readyState === EventSource.CLOSED)
    ) {
      // Reset backoff for fast recovery when user returns
      reconnectAttempts = 0;
      if (reconnectTimer) {
        window.clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      openConnection();
    }
  });
}