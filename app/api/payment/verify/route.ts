import crypto from 'crypto'
import { NextRequest } from 'next/server'
import { initAdmin, getAdminDb } from '@/lib/firebaseAdmin'
import { sendOrderNotificationEmail } from '@/lib/emailService'
import { getOrderTrackingEvent } from '@/lib/orderUtils'
import { getNextInvoiceNumber } from '@/lib/invoice'
import { successResponse, validationError, authError, serverError, sanitizeString, isValidEmail } from '@/lib/apiResponse'
import { error as logError } from '@/lib/logger'
import type { Order } from '@/types/order'

export async function POST(request: NextRequest) {
  try {
    initAdmin()
    const adminDb = getAdminDb()
    const body = await request.json()
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      items,
      customerName,
      email,
      phone,
      address,
      total,
      couponCode,
      discount,
      userId,
    } = body || {}

    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keySecret) {
      return serverError('Payment gateway not configured')
    }

    // Validate payment signature fields
    if (typeof razorpay_payment_id !== 'string' || !razorpay_payment_id.trim()) {
      return validationError('Invalid payment ID')
    }
    if (typeof razorpay_order_id !== 'string' || !razorpay_order_id.trim()) {
      return validationError('Invalid order ID')
    }
    if (typeof razorpay_signature !== 'string' || !razorpay_signature.trim()) {
      return validationError('Invalid payment signature')
    }

    // Validate user authentication
    const resolvedUserId = typeof userId === 'string' && userId.trim() ? userId.trim() : null
    if (!resolvedUserId) {
      return authError('Authentication required')
    }

    // Verify payment signature (critical security step)
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`
    const expectedSignature = crypto.createHmac('sha256', keySecret).update(payload).digest('hex')
    if (expectedSignature !== razorpay_signature) {
      return validationError('Payment verification failed')
    }

    // Validate order items
    if (!Array.isArray(items) || items.length === 0) {
      return validationError('No order items provided')
    }

    const normalizedItems = items
      .map((item: Record<string, unknown>) => {
        const productId = String(item?.productId || '').trim()
        const quantity = Number(item?.quantity || 0)
        if (!productId || quantity <= 0) return null
        return {
          productId,
          name: sanitizeString(item?.name),
          price: Math.max(0, Number(item?.price || 0)),
          quantity,
          image: typeof item?.image === 'string' ? item.image : undefined,
        }
      })
      .filter((item) => item !== null)

    if (normalizedItems.length === 0) {
      return validationError('No valid order items')
    }

    // Validate customer information
    const trimmedEmail = String(email || '').trim()
    const trimmedPhone = String(phone || '').trim()
    const trimmedAddress = sanitizeString(address)

    if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
      return validationError('Invalid email address')
    }
    if (!trimmedPhone || trimmedPhone.length < 7) {
      return validationError('Invalid phone number')
    }
    if (!trimmedAddress) {
      return validationError('Invalid address')
    }

    const invoiceNumber = await getNextInvoiceNumber(adminDb)
    const orderRef = adminDb.collection('orders').doc()
    const createdAt = new Date()

    // Atomic transaction: verify stock and create order
    await adminDb.runTransaction(async (transaction) => {
      for (const item of normalizedItems) {
        const productId = item.productId
        const quantity = item.quantity

        const productRef = adminDb.doc(`products/${productId}`)
        const productSnapshot = await transaction.get(productRef)

        if (!productSnapshot.exists) {
          throw new Error(`Product not found: ${productId}`)
        }

        const productData = productSnapshot.data() as Record<string, unknown> | undefined
        const availableStock = typeof productData?.stock === 'number' ? (productData.stock as number) : 0

        if (availableStock < quantity) {
          throw new Error(`Insufficient stock for product: ${productId}`)
        }

        // Deduct stock (never go below 0)
        transaction.update(productRef, { stock: Math.max(0, availableStock - quantity) })
      }

      transaction.set(orderRef, {
        userId: resolvedUserId,
        customerName: sanitizeString(customerName),
        email: trimmedEmail,
        phone: trimmedPhone,
        address: trimmedAddress,
        items: normalizedItems,
        total: Math.max(0, Number(total) || 0),
        couponCode: typeof couponCode === 'string' ? sanitizeString(couponCode) : '',
        discount: Math.max(0, Number(discount) || 0),
        tax: 0,
        paymentMethod: 'Razorpay',
        invoiceNumber,
        invoiceGeneratedAt: createdAt,
        status: 'confirmed',
        paymentStatus: 'Paid',
        trackingHistory: [getOrderTrackingEvent('confirmed')],
        paymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        createdAt,
        updatedAt: createdAt,
      })
    })

    const order: Order = {
      id: orderRef.id,
      userId: resolvedUserId,
      customerName: sanitizeString(customerName),
      email: trimmedEmail,
      phone: trimmedPhone,
      address: trimmedAddress,
      items: normalizedItems,
      total: Math.max(0, Number(total) || 0),
      couponCode: typeof couponCode === 'string' ? sanitizeString(couponCode) : undefined,
      discount: Math.max(0, Number(discount) || 0),
      tax: 0,
      paymentMethod: 'Razorpay',
      invoiceNumber,
      invoiceGeneratedAt: createdAt,
      status: 'confirmed',
      paymentStatus: 'Paid',
      createdAt,
      updatedAt: createdAt,
    }

    // Send confirmation email (non-blocking)
    try {
      const emailResult = await sendOrderNotificationEmail(order, 'order_confirmed')
      await orderRef.update({
        emailStatus: emailResult.success ? 'sent' : 'failed',
        lastEmailType: 'order_confirmed',
        lastEmailSentAt: new Date(),
      })
    } catch (emailError) {
      // Log but don't fail order if email fails
      logError('[Email Error] Failed to send confirmation email', emailError)
    }

    return successResponse({ orderId: orderRef.id }, 'Order created successfully')
  } catch (error) {
    if (error instanceof Error) {
      // Handle known error types
      if (error.message.includes('Insufficient stock')) {
        return validationError('One or more items are out of stock')
      }
      if (error.message.includes('not found')) {
        return validationError('Product not found')
      }
    }
    return serverError('Payment processing failed', error)
  }
}
