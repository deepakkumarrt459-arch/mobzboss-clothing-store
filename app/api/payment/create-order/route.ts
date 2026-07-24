import Razorpay from 'razorpay'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 500 })
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret })
    const body = await request.json()
    const amount = Number(body?.amount)

    if (!amount || Number.isNaN(amount) || amount < 1) {
      return NextResponse.json({ error: 'Invalid payment amount' }, { status: 400 })
    }

    // Cap maximum order amount at 500,000 INR (~$6,000 USD)
    if (amount > 500000) {
      return NextResponse.json({ error: 'Order amount exceeds maximum limit' }, { status: 400 })
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      payment_capture: true,
    })

    // Return exact JSON shape expected by frontend
    return NextResponse.json(
      {
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key: keyId,
      },
      { status: 200 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create payment order'
    // If it's a bad request from Razorpay, return 502; otherwise 500
    const status = message.includes('Invalid API key') ? 502 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
