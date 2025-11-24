import { sendEmail } from '../../services/mailer.service.js';

export async function handleOrderCancelled(orderData) {
  const { order_id, order_number, buyer, farmer, cancellation_reason, items } = orderData;

  console.log(`❌ Processing cancellation for order ${order_number}`);

  // 2. Notifications
  if (buyer && buyer.email) {
    await sendEmail({
      to: buyer.email,
      subject: `❌ Commande #${order_number} annulée`,
      template: 'order_cancelled',
      data: {
        order_number,
        cancellation_reason,
        requires_refund: orderData.requires_refund
      }
    });
  }
}