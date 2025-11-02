import { sendEmail } from '../../services/mailer.service.js';
import { saveNotification } from '../../services/notification.service.js';

// simple handler: send a notification email and persist a notification
export async function handleUserUpdated(data) {
  // expected fields: { user_id, email, username, role }
  const email = data.email;
  const username = data.username || data.username;
  const userId = data.user_id ?? data.userId ?? null;

  const subject = 'Profile updated';
  const message = `Hi ${username || 'user'}, your profile was updated.`;

  if (email) {
    try { await sendEmail(email, subject, message); console.log('mailer: email sent'); } catch (e) { console.error('mailer error', e); }
  }

  try {
    await saveNotification('USER_UPDATED', email, message, userId, username);
    console.log('notification: saved');
  } catch (e) { console.error('notification save error', e); }
}