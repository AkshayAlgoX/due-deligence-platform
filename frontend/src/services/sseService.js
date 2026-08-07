/**
 * sseService — manages the SSE connection to /api/sse/notifications.
 *
 * Design:
 *  - Singleton: one EventSource per browser tab
 *  - Reconnects automatically (native EventSource behaviour)
 *  - Allows multiple subscribers via listener pattern
 *  - Cleans up on disconnect
 */
import { API_ROUTES } from "@/constants/apiRoutes";

let eventSource = null;
const listeners = new Set();

/**
 * Connect to the SSE stream.
 * Safe to call multiple times — only one connection is opened.
 *
 * @param {function} onNotification - called with the parsed notification object
 * @returns {function} unsubscribe function
 */
export function subscribeToNotifications(onNotification) {
  if (typeof window === "undefined") return () => {};

  // Register the listener
  listeners.add(onNotification);

  // Open the connection if not already open
  if (!eventSource || eventSource.readyState === EventSource.CLOSED) {
    openConnection();
  }

  // Return unsubscribe function
  return () => {
    listeners.delete(onNotification);
    if (listeners.size === 0) {
      closeConnection();
    }
  };
}

function openConnection() {
  try {
    // EventSource uses GET with cookies — Next.js proxy forwards to backend
    eventSource = new EventSource(API_ROUTES.SSE_NOTIFICATIONS, {
      withCredentials: true,
    });

    eventSource.addEventListener("notification", (event) => {
      try {
        const notification = JSON.parse(event.data);
        listeners.forEach((listener) => {
          try {
            listener(notification);
          } catch (e) {
            console.warn("[SSE] listener error:", e);
          }
        });
      } catch (e) {
        console.warn("[SSE] failed to parse notification:", e);
      }
    });

    eventSource.addEventListener("ping", () => {
      // Keep-alive — no action needed
    });

    eventSource.onerror = (err) => {
      console.warn("[SSE] connection error, will reconnect automatically:", err);
      // EventSource auto-reconnects — we just log
    };

    eventSource.onopen = () => {
      console.log("[SSE] connected to notification stream");
    };
  } catch (e) {
    console.error("[SSE] failed to open EventSource:", e);
  }
}

function closeConnection() {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
    console.log("[SSE] connection closed");
  }
}

/** Force-close the SSE connection (e.g. on logout). */
export function disconnectSse() {
  listeners.clear();
  closeConnection();
}
