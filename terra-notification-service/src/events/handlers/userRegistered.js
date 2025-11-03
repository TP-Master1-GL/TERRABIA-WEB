// events/handlers/userRegistered.js
import { sendEmail } from '../../services/mailer.service.js';
import { saveNotification } from '../../services/notification.service.js';

export async function handleUserRegistration(eventData) {
  // Normalize payload
  const data = eventData.payload ?? eventData;
  const { email, id, name, username } = data;

  const displayName = name || username || 'User';
  const subject = 'Welcome to terrabia';
  const message = `Hi ${displayName}, your account has been created successfully!`;

  if (email) {
    try {
      await sendEmail(email, subject, message);
      console.log('mailer: welcome email sent');
    } catch (e) {
      console.error('mailer error:', e);
    }
  }

  try {
    await saveNotification('USER_REGISTERED', email, message, id, displayName);
    console.log('notification: saved');
  } catch (e) {
    console.error('save error:', e);
  }
}