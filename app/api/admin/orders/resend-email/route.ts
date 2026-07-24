import { NextRequest } from 'next/server'
import { initAdmin, getAdminDb, verifyAdminUser } from '@/lib/firebaseAdmin'
import { normalizeOrderStatus, parseFirestoreDate } from '@/lib/orderUtils'
import { getOrderEmailTemplate, getOrderEmailTypeForStatus } from '@/lib/emailTemplates'
import { sendEmail } from '@/lib/emailService'
import { validationError, successResponse, serverError, authorizationError, notFoundError } from '@/lib/apiResponse'
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
    const { orderId } = body || {}

    // Validate inputs
    if (typeof orderId !== 'string' || !orderId.trim()) {
      return validationError('Invalid order ID')
    }

    const orderRef = adminDb.doc(`orders/${orderId}`)
    const orderSnapshot = await orderRef.get()

    if (!orderSnapshot.exists) {
      return notFoundError('Order not found')
    }

    const orderData = orderSnapshot.data() as Record<string, unknown>
    const currentStatus = normalizeOrderStatus(orderData.status)
    const emailType = getOrderEmailTypeForStatus(currentStatus) ?? (String(orderData.lastEmailType) as Order['lastEmailType'])

    if (!emailType) {
      return validationError('No email type found for this order')
    }

    // Construct order object for email
    const order: Order = {
      id: orderId,
      userId: typeof orderData.userId === 'string' ? orderData.userId : undefined,
      customerName: String(orderData.customerName ?? ''),
      email: String(orderData.email ?? ''),
      phone: String(orderData.phone ?? ''),
      address: String(orderData.address ?? ''),
      items: Array.isArray(orderData.items) ? (orderData.items as Order['items']) : [],
      total: Number(orderData.total ?? 0),
      couponCode: typeof orderData.couponCode === 'string' ? orderData.couponCode : undefined,
      discount: typeof orderData.discount === 'number' ? orderData.discount : undefined,
      paymentStatus: (String(orderData.paymentStatus || 'Paid') as Order['paymentStatus']),
      status: currentStatus,
      createdAt: parseFirestoreDate(orderData.createdAt) ?? new Date(),
      updatedAt: parseFirestoreDate(orderData.updatedAt) ?? new Date(),
    }

    // Prevent duplicate sends of the same email
    const lastEmailType = String(orderData.lastEmailType)
    const emailStatus = String(orderData.emailStatus)
    if (lastEmailType === emailType && emailStatus === 'sent' && orderData.lastEmailSentAt) {
      const lastSentTime = parseFirestoreDate(orderData.lastEmailSentAt)
      if (lastSentTime && new Date().getTime() - lastSentTime.getTime() < 300000) {
        // Less than 5 minutes since last send
        return successResponse({ sent: false }, 'Email was recently sent, please wait before retrying')
      }
    }

    // Send email
    const emailResult = await sendEmail(getOrderEmailTemplate(emailType, order))

    // Update order with email status
    await orderRef.update({
      emailStatus: emailResult.success ? 'sent' : 'failed',
      lastEmailType: emailType,
      lastEmailSentAt: new Date(),
      updatedAt: new Date(),
    })

    return successResponse({ sent: emailResult.success }, 'Email sent successfully')
  } catch (error) {
    return serverError('Failed to resend email', error)
  }
}