import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

const keySecret = process.env.RAZORPAY_KEY_SECRET
if (!keySecret) {
  throw new Error('Razorpay secret is not configured on the server.')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body || {}

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment verification details' }, { status: 400 })
    }

    const payload = `${razorpay_order_id}|${razorpay_payment_id}`
    const expectedSignature = crypto.createHmac('sha256', keySecret as string).update(payload).digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ success: false, error: 'Payment verification failed' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to verify Razorpay payment', error)
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 })
  }
}
