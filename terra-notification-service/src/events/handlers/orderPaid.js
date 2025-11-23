import { sendEmail } from '../services/mailer.service.js';
import { saveNotification } from '../services/notification.service.js';



export async function handleOrderPaid(orderData, envelope) {
  const { order_id, order_number, buyer, farmer, total_amount, transaction } = orderData;

  console.log(`💰 Processing payment for order ${order_number}`);

  

  // 3. Notifications
  if (buyer && buyer.email) {
    await sendEmail({
      to: buyer.email,
      subject: `✅ Paiement confirmé - Commande #${order_number}`,
      template: 'payment_confirmed',
      data: {
        order_number,
        total_amount,
        payment_method: transaction?.payment_method_display || 'Mobile Money'
      }
    });
  }

  // Sauvegarder notification
  await saveNotification({
    type: 'ORDER_PAID',
    userId: buyer.id,
    title: 'Paiement confirmé',
    message: `Votre paiement de ${total_amount} XAF a été confirmé`,
    data: { order_id, order_number }
  });
}