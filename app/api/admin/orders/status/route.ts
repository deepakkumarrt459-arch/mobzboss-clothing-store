import { NextRequest } from 'next/server'
import { initAdmin, getAdminDb, verifyAdminUser, admin } from '@/lib/firebaseAdmin'
import { normalizeOrderStatus, parseFirestoreDate, getOrderTrackingEvent } from '@/lib/orderUtils'
import { getOrderEmailTypeForStatus } from '@/lib/emailTemplates'
import { sendOrderNotificationEmail } from '@/lib/emailService'
import { validationError, successResponse, serverError, authorizationError, notFoundError } from '@/lib/apiResponse'
import { error as logError } from '@/lib/logger'
import type { Order } from '@/types/order'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return authorizationError('Admin authorization required')
    }

    initAdmin()
    await verifyAdminUser(authHeader.replace(/^Bearer\s+/i, ''))
    const adminDb = getAdminDb()
    const body = await request.json()
    const { orderId, status } = body || {}

    // Validate inputs
    if (typeof orderId !== 'string' || !orderId.trim()) {
      return validationError('Invalid order ID')
    }

    const newStatus = normalizeOrderStatus(status)
    if (!newStatus) {
      return validationError('Invalid order status')
    }

    const orderRef = adminDb.doc(`orders/${orderId}`)
    const orderSnapshot = await orderRef.get()

    if (!orderSnapshot.exists) {
      return notFoundError('Order not found')
    }

    const orderData = orderSnapshot.data() as Record<string, unknown>
    const currentStatus = normalizeOrderStatus(orderData.status)

    // No need to update if status is the same
    if (currentStatus === newStatus) {
      return successResponse({ updated: false }, 'Order already has this status')
    }

    // Update order with new status and tracking history
    await orderRef.update({
      status: newStatus,
      updatedAt: new Date(),
      trackingHistory: admin.firestore.FieldValue.arrayUnion(getOrderTrackingEvent(newStatus)),
    })

    // Fetch updated order
    const updatedSnapshot = await orderRef.get()
    const updatedOrderData = updatedSnapshot.data() as Record<string, unknown>

    const emailType = getOrderEmailTypeForStatus(newStatus)

    // Construct order object for email
    const order: Order = {
      id: orderId,
      userId: typeof updatedOrderData.userId === 'string' ? updatedOrderData.userId : undefined,
      customerName: String(updatedOrderData.customerName ?? ''),
      email: String(updatedOrderData.email ?? ''),
      phone: String(updatedOrderData.phone ?? ''),
      address: String(updatedOrderData.address ?? ''),
      items: Array.isArray(updatedOrderData.items) ? (updatedOrderData.items as Order['items']) : [],
      total: Number(updatedOrderData.total ?? 0),
      couponCode: typeof updatedOrderData.couponCode === 'string' ? updatedOrderData.couponCode : undefined,
      discount: typeof updatedOrderData.discount === 'number' ? updatedOrderData.discount : undefined,
      tax: typeof updatedOrderData.tax === 'number' ? updatedOrderData.tax : undefined,
      paymentMethod: typeof updatedOrderData.paymentMethod === 'string' ? updatedOrderData.paymentMethod : undefined,
      invoiceNumber: typeof updatedOrderData.invoiceNumber === 'string' ? updatedOrderData.invoiceNumber : undefined,
      invoiceGeneratedAt: parseFirestoreDate(updatedOrderData.invoiceGeneratedAt) ?? undefined,
      paymentStatus: (String(updatedOrderData.paymentStatus || 'Paid') as Order['paymentStatus']),
      status: newStatus,
      createdAt: parseFirestoreDate(updatedOrderData.createdAt) ?? new Date(),
      updatedAt: parseFirestoreDate(updatedOrderData.updatedAt) ?? new Date(),
    }

    // Send notification email (non-blocking)
    try {
      const emailResult = await sendOrderNotificationEmail(order, emailType)
      await orderRef.update({
        emailStatus: emailResult.success ? 'sent' : 'failed',
        lastEmailType: emailType,
        lastEmailSentAt: new Date(),
      })
    } catch (emailError) {
      logError('[Email Error] Failed to send status notification', emailError)
    }

    return successResponse({ updated: true }, 'Order status updated and notification sent')
  } catch (error) {
    return serverError('Failed to update order status', error)
  }
}

