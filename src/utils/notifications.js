/**
 * Browser Notification Utilities for CampusConnect
 * Schedules reminders for upcoming registered events
 */

// Map to keep references so we can cancel if needed
const scheduledTimers = new Map();

/**
 * Request browser notification permission
 * @returns {Promise<boolean>} true if granted
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

/**
 * Send an immediate browser notification
 */
function sendNotification(title, body, icon = '/favicon.ico') {
  if (Notification.permission !== 'granted') return;
  try {
    new Notification(title, { body, icon, badge: '/favicon.ico' });
  } catch (e) {
    console.warn('Notification failed:', e);
  }
}

/**
 * Schedule reminders for all upcoming events
 * @param {Array} registrations - array of registration objects with populated eventId
 */
export function scheduleEventReminders(registrations) {
  // Cancel previously scheduled timers
  scheduledTimers.forEach(id => clearTimeout(id));
  scheduledTimers.clear();

  const now = Date.now();

  registrations.forEach((reg) => {
    const ev = reg.eventId;
    if (!ev?.startAt) return;

    const eventTime = new Date(ev.startAt).getTime();
    const timeUntil = eventTime - now;

    // Don't schedule for past events
    if (timeUntil <= 0) return;

    const eventName = ev.title || 'Event';
    const venue = ev.venue || 'Campus';

    // 24-hour reminder
    const time24h = timeUntil - 24 * 60 * 60 * 1000;
    if (time24h > 0) {
      const id24 = setTimeout(() => {
        sendNotification(
          `⏰ Tomorrow: ${eventName}`,
          `📍 ${venue} — Starts in 24 hours. Don't forget your ticket! 🎫`,
        );
      }, time24h);
      scheduledTimers.set(`${reg._id}-24h`, id24);
    }

    // 1-hour reminder
    const time1h = timeUntil - 60 * 60 * 1000;
    if (time1h > 0) {
      const id1h = setTimeout(() => {
        sendNotification(
          `🚀 Starting Soon: ${eventName}`,
          `📍 ${venue} — Starts in 1 hour! Get ready 🎉`,
        );
      }, time1h);
      scheduledTimers.set(`${reg._id}-1h`, id1h);
    }
  });
}

/**
 * Get upcoming events within next 24 hours from registrations
 */
export function getUpcomingToday(registrations) {
  const now = Date.now();
  const in24h = now + 24 * 60 * 60 * 1000;
  return registrations.filter((reg) => {
    const t = new Date(reg.eventId?.startAt).getTime();
    return t > now && t <= in24h;
  });
}

/**
 * Format time until event as a human-readable string
 */
export function formatTimeUntil(dateStr) {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return 'Started';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
