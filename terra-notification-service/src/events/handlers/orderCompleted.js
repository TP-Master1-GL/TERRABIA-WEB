import { sendEmail } from '../services/mailer.service.js';


export async function handleOrderCompleted(orderData, envelope) {
  const { order_id, order_number, buyer, farmer, total_amount } = orderData;

  console.log(`✅ Processing completion for order ${order_number}`);

  // 2. Notifications de complétion
  if (buyer && buyer.email) {
    await sendEmail({
      to: buyer.email,
      subject: `🎉 Commande #${order_number} livrée!`,
      template: 'order_completed',
      data: {
        order_number,
        total_amount,
        delivery_rating: true // Inviter à noter la livraison
      }
    });
  }
}