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
import { getToken } from "@/utils/helpers";

let eventSource = null;
const listeners = new Set();
let reconnectTimer = null;

const SSE_RECONNECT_DELAY = 5000; // 5 seconds

/**
 * Connect to the SSE stream.
 * Safe to call multiple times — only one connection is opened.
 *
 * @param {function} onNotification - called with the parsed notification object
 * @returns {function} unsubscribe function
 */
export function subscribeToNotifications(onNotification) {
  if (typeof window === "undefined") return () => {};

  listeners.add(onNotification);

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

function getSseUrl() {
  const token = getToken();
  if (!token) return API_ROUTES.SSE_NOTIFICATIONS;
  const url = new URL(API_ROUTES.SSE_NOTIFICATIONS, window.location.origin);
  url.searchParams.set("token", token);
  return url.toString();
}

function openConnection() {
  closeConnection();
  if (reconnectTimer) {
    window.clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  try {
    const url = getSseUrl();
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
      // Keep-alive ping; no further action needed.
    });

    eventSource.onopen = () => {
      console.log("[SSE] connected to notification stream", {
        readyState: eventSource.readyState,
        url: eventSource.url,
      });
    };

    eventSource.onerror = (error) => {
      const readyState = error?.target?.readyState;
      const url = error?.target?.url;
      console.warn(
        "[SSE] connection error",
        { readyState, url },
        error
      );

      if (!eventSource || eventSource.readyState === EventSource.CLOSED) {
        scheduleReconnect();
      }
    };
  } catch (openError) {
    console.error("[SSE] failed to open EventSource:", openError);
    scheduleReconnect();
  }
}

function scheduleReconnect() {
  if (reconnectTimer || listeners.size === 0) return;
  reconnectTimer = window.setTimeout(() => {
    reconnectTimer = null;
    if (listeners.size > 0) {
      openConnection();
    }
  }, SSE_RECONNECT_DELAY);
}

function closeConnection() {
  if (reconnectTimer) {
    window.clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  if (eventSource) {
    try {
      eventSource.close();
    } catch (closeError) {
      console.warn("[SSE] error closing EventSource:", closeError);
    }
    eventSource = null;
    console.log("[SSE] connection closed");
  }
}

/** Force-close the SSE connection (e.g. on logout). */
export function disconnectSse() {
  listeners.clear();
  closeConnection();
}
