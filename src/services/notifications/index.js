import { getNotifications, addNotification, markNotificationRead } from "@/lib/data-store";

export async function fetchUserNotifications(userId) {
  return await getNotifications(userId);
}

export async function sendNotification({ userId, title, message, type = "info", link = null }) {
  return await addNotification({
    userId,
    title,
    message,
    type,
    link,
  });
}

export async function setNotificationAsRead(id) {
  return await markNotificationRead(id);
}
