// filepath: [notification.service.js](http://_vscodecontentref_/0)
import Notification from "../models/Notification.js";

export async function saveNotification(type, userEmail, message = null, userId = null, username = null) {
    await Notification.create({ type, userEmail, message, userId, username });
    console.log(`Notification saved for ${userEmail}`);
}