/**
 * notificationService — thin API client for all notification endpoints.
 * Mirrors NotificationController exactly.
 */
import api from "@/services/api";
import { API_ROUTES } from "@/constants/apiRoutes";

const notificationService = {
  /**
   * Paginated notification history.
   * @param {object} params - { page?, size?, unread?, type? }
   */
  list({ page = 0, size = 20, unread = false, type = null } = {}) {
    const params = { page, size, unread };
    if (type) params.type = type;
    return api.get(API_ROUTES.NOTIFICATIONS.LIST, { params }).then((r) => r.data);
  },

  /**
   * Unread count for bell badge.
   * @returns {Promise<{ unreadCount: number }>}
   */
  getUnreadCount() {
    return api.get(API_ROUTES.NOTIFICATIONS.UNREAD_COUNT).then((r) => r.data);
  },

  /**
   * Mark a single notification as read.
   * @param {number} id
   */
  markAsRead(id) {
    return api.put(API_ROUTES.NOTIFICATIONS.MARK_READ(id)).then((r) => r.data);
  },

  /**
   * Mark all as read.
   */
  markAllAsRead() {
    return api.put(API_ROUTES.NOTIFICATIONS.MARK_ALL_READ).then((r) => r.data);
  },

  /**
   * Delete a single notification.
   * @param {number} id
   */
  delete(id) {
    return api.delete(API_ROUTES.NOTIFICATIONS.DELETE(id)).then((r) => r.data);
  },

  /**
   * Clear all notifications.
   */
  clearAll() {
    return api.delete(API_ROUTES.NOTIFICATIONS.CLEAR_ALL).then((r) => r.data);
  },

  /**
   * Get notification preferences.
   * @returns {Promise<NotificationPreferenceDto>}
   */
  getPreferences() {
    return api.get(API_ROUTES.NOTIFICATIONS.PREFERENCES).then((r) => r.data);
  },

  /**
   * Update notification preferences.
   * @param {object} prefs - full preference object
   */
  updatePreferences(prefs) {
    return api.put(API_ROUTES.NOTIFICATIONS.PREFERENCES, prefs).then((r) => r.data);
  },

  /**
   * Send a test notification to self.
   */
  sendTest() {
    return api.post(API_ROUTES.NOTIFICATIONS.TEST).then((r) => r.data);
  },

  /**
   * Admin: bulk broadcast a system notification.
   * @param {string} title
   * @param {string} message
   */
  sendBulk(title, message) {
    return api
      .post(API_ROUTES.NOTIFICATIONS.SEND_BULK, { title, message })
      .then((r) => r.data);
  },
};

export default notificationService;
