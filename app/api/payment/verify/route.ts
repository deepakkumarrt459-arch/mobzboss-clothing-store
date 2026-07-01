import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { initAdmin, getAdminDb } from '@/lib/firebaseAdmin'

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
      userId,
    } = body || {}

    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keySecret) {
      return NextResponse.json({ success: false, error: 'Razorpay secret is not configured on the server.' }, { status: 500 })
    }

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment verification details' }, { status: 400 })
    }

    const payload = `${razorpay_order_id}|${razorpay_payment_id}`
    const expectedSignature = crypto.createHmac('sha256', keySecret).update(payload).digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ success: false, error: 'Payment verification failed' }, { status: 400 })
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No order items provided for stock update' }, { status: 400 })
    }

    const normalizedItems = items
      .map((item: Record<string, unknown>) => ({
        productId: String(item?.productId || ''),
        name: String(item?.name || ''),
        price: Number(item?.price || 0),
        quantity: Number(item?.quantity || 0),
        image: typeof item?.image === 'string' ? item.image : undefined,
      }))
      .filter((item) => item.productId && item.quantity > 0)

    if (normalizedItems.length === 0) {
      return NextResponse.json({ error: 'No valid order items provided for stock update' }, { status: 400 })
    }

    const orderRef = adminDb.collection('orders').doc()
    const createdAt = new Date()

    await adminDb.runTransaction(async (transaction) => {
      for (const item of normalizedItems) {
        const productId = item.productId
        const quantity = item.quantity

        const productRef = adminDb.doc(`products/${productId}`)
        const productSnapshot = await transaction.get(productRef)

        if (!productSnapshot.exists) {
          throw new Error(`Product ${productId} not found`)
        }

        const productData = productSnapshot.data() as Record<string, unknown> | undefined
        const availableStock = typeof productData?.stock === 'number' ? (productData.stock as number) : 0

        if (availableStock < quantity) {
          throw new Error(`Insufficient stock for ${productId}`)
        }

        transaction.update(productRef, { stock: availableStock - quantity })
      }

      transaction.set(orderRef, {
        userId: typeof userId === 'string' ? userId : undefined,
        customerName: typeof customerName === 'string' ? customerName : '',
        email: typeof email === 'string' ? email : '',
        phone: typeof phone === 'string' ? phone : '',
        address: typeof address === 'string' ? address : '',
        items: normalizedItems,
        total: Number(total) || 0,
        status: 'Pending',
        paymentStatus: 'Paid',
        paymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        createdAt,
        updatedAt: createdAt,
      })
    })

    return NextResponse.json({ success: true, orderId: orderRef.id })
  } catch (error) {
    console.error('Failed to verify Razorpay payment', error)
    return NextResponse.json({ success: false, error: 'Payment verification failed', details: String(error) }, { status: 500 })
  }
}
