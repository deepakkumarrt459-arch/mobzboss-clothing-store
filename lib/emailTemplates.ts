import type { Order, OrderEmailType } from '@/types/order'

function formatCurrency(amount: number) {
  return `₹${amount.toFixed(2)}`
}

function formatOrderDate(date?: Date) {
  return date ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(date) : 'N/A'
}

function buildItemsTable(items: Order['items']) {
  return `
    <table style="width:100%; border-collapse: collapse; margin-top: 16px;">
      <thead>
        <tr>
          <th style="border-bottom: 1px solid #ddd; padding: 10px 8px; text-align:left;">Item</th>
          <th style="border-bottom: 1px solid #ddd; padding: 10px 8px; text-align:right;">Price</th>
          <th style="border-bottom: 1px solid #ddd; padding: 10px 8px; text-align:right;">Qty</th>
          <th style="border-bottom: 1px solid #ddd; padding: 10px 8px; text-align:right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${items
          .map(
            (item) => `
            <tr>
              <td style="padding: 10px 8px; border-bottom: 1px solid #f0f0f0;">${item.name}</td>
              <td style="padding: 10px 8px; border-bottom: 1px solid #f0f0f0; text-align:right;">${formatCurrency(item.price)}</td>
              <td style="padding: 10px 8px; border-bottom: 1px solid #f0f0f0; text-align:right;">${item.quantity}</td>
              <td style="padding: 10px 8px; border-bottom: 1px solid #f0f0f0; text-align:right;">${formatCurrency(item.price * item.quantity)}</td>
            </tr>
          `,
          )
          .join('')}
      </tbody>
    </table>
  `
}

export function getOrderEmailTypeForStatus(status: Order['status']): OrderEmailType {
  switch (String(status).toLowerCase()) {
    case 'pending':
      return 'order_pending'
    case 'confirmed':
      return 'order_confirmed'
    case 'processing':
      return 'order_processing'
    case 'packed':
      return 'order_packed'
    case 'out_for_delivery':
      return 'order_out_for_delivery'
    case 'shipped':
      return 'order_shipped'
    case 'delivered':
      return 'order_delivered'
    case 'cancelled':
      return 'order_cancelled'
    default:
      return 'order_pending'
  }
}

export function getOrderEmailTemplate(type: OrderEmailType, order: Order) {
  const orderDate = formatOrderDate(order.createdAt)
  const itemsTable = buildItemsTable(order.items)
  const subjectMap: Record<OrderEmailType, string> = {
    order_pending: `MobzBoss Order Received — #${order.id ?? 'N/A'}`,
    order_confirmed: `MobzBoss Order Confirmed — #${order.id ?? 'N/A'}`,
    order_processing: `MobzBoss Order Being Processed — #${order.id ?? 'N/A'}`,
    order_packed: `MobzBoss Order Packed — #${order.id ?? 'N/A'}`,
    order_out_for_delivery: `MobzBoss Order Out for Delivery — #${order.id ?? 'N/A'}`,
    order_shipped: `MobzBoss Order Shipped — #${order.id ?? 'N/A'}`,
    order_delivered: `MobzBoss Order Delivered — #${order.id ?? 'N/A'}`,
    order_cancelled: `MobzBoss Order Cancelled — #${order.id ?? 'N/A'}`,
  }

  const statusPhraseMap: Record<OrderEmailType, string> = {
    order_pending: 'Order Received',
    order_confirmed: 'Order Confirmed',
    order_processing: 'Order Being Processed',
    order_packed: 'Order Packed',
    order_out_for_delivery: 'Out for Delivery',
    order_shipped: 'Order Shipped',
    order_delivered: 'Order Delivered',
    order_cancelled: 'Order Cancelled',
  }

  const introMap: Record<OrderEmailType, string> = {
    order_pending: 'Thank you for your purchase! We\'ve received your order and are reviewing it now.',
    order_confirmed: 'Great! Your order has been confirmed and is being prepared for shipment.',
    order_processing: 'Your order is currently being picked and packed in our warehouse.',
    order_packed: 'Your order is packed and ready to ship. Tracking information coming soon!',
    order_out_for_delivery: 'Your order is out for delivery today. Track your shipment to know the exact time of arrival.',
    order_shipped: 'Excellent news — your order has shipped and is on the way to you!',
    order_delivered: 'Your order has been successfully delivered. We hope you absolutely love it!',
    order_cancelled: 'Your order has been cancelled as requested. If you have questions, please reach out to our support team.',
  }

  const statusPhrase = statusPhraseMap[type]
  const intro = introMap[type]

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.5;">
      <div style="max-width: 680px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 16px;">
        <h1 style="margin-bottom: 8px; font-size: 24px; color: #111111;">${statusPhrase}</h1>
        <p style="margin-top: 0; color: #555555;">Hi ${order.customerName},</p>
        <p style="color: #555555;">${intro}</p>
        <div style="margin-top: 24px; padding: 20px; background: #f7f7f7; border-radius: 12px;">
          <p style="margin: 0 0 8px; color: #111111;"><strong>Order ID:</strong> ${order.id ?? 'N/A'}</p>
          <p style="margin: 0 0 8px; color: #111111;"><strong>Order Date:</strong> ${orderDate}</p>
          <p style="margin: 0 0 8px; color: #111111;"><strong>Payment Status:</strong> ${order.paymentStatus}</p>
          <p style="margin: 0; color: #111111;"><strong>Total:</strong> ${formatCurrency(order.total)}</p>
        </div>
        ${itemsTable}
        <div style="margin-top: 24px; padding: 20px; background: #f7f7f7; border-radius: 12px;">
          <p style="margin: 0 0 8px; color: #111111;"><strong>Shipping Address</strong></p>
          <p style="margin: 0; color: #555555;">${order.address}</p>
          <p style="margin: 0; color: #555555;">${order.phone}</p>
        </div>
        <p style="margin-top: 24px; color: #555555;">If you have any questions, reply to this email or reach out to our support team.</p>
        <p style="margin: 0; color: #555555;">Thanks for shopping with MobzBoss.</p>
      </div>
    </div>
  `

  const text = `
${statusPhrase}\n\n${intro}\n\nOrder ID: ${order.id ?? 'N/A'}\nOrder Date: ${orderDate}\nPayment Status: ${order.paymentStatus}\nTotal: ${formatCurrency(order.total)}\n\nItems:\n${order.items
    .map((item) => `- ${item.name} x${item.quantity}: ${formatCurrency(item.price * item.quantity)}`)
    .join('\n')}\n\nShipping Address:\n${order.address}\n${order.phone}\n\nThank you for shopping with MobzBoss.
  `

  return { subject: subjectMap[type], html, text }
}
