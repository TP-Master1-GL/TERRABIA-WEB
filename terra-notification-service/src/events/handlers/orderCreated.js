import { sendEmail } from '../../services/mailer.service.js';
import { saveNotification } from '../../services/notification.service.js';


export async function handleOrderCreated(orderData) {
  const { order_id, order_number, buyer, farmer, items, total_amount } = orderData;

  console.log(`🛒 Processing new order ${order_number}`);

  // 2. Notification à l'acheteur
  if (buyer && buyer.email) {
    try {
      await sendEmail({
        to: buyer.email,
        subject: `✅ Commande #${order_number} créée avec succès`,
        template: 'order_created_buyer',
        data: {
          order_number,
          total_amount,
          buyer_name: buyer.name,
          items_count: items.length
        }
      });
      console.log(`📧 Confirmation email sent to buyer for order ${order_number}`);
    } catch (emailError) {
      console.error(`❌ Failed to send email to buyer:`, emailError);
      // Ne pas propager l'erreur pour éviter de bloquer le processus
    }
  }

  // 3. Notification à l'agriculteur
  if (farmer && farmer.email) {
    try {
      await sendEmail({
        to: farmer.email,
        subject: `🎉 Nouvelle commande #${order_number} reçue!`,
        template: 'new_order_farmer',
        data: {
          order_number,
          total_amount,
          buyer_name: buyer.name,
          items_count: items.length,
          delivery_address: orderData.delivery_address
        }
      });
      console.log(`📧 Notification email sent to farmer for order ${order_number}`);
    } catch (emailError) {
      console.error(`❌ Failed to send email to farmer:`, emailError);
    }
  }

  // 4. Sauvegarder la notification en base
  try {
     await saveNotification('ORDER_CREATED',email, message, order_id, displayName);
  } catch (notifError) {
    console.error(`❌ Failed to save notification:`, notifError);
  }
}

