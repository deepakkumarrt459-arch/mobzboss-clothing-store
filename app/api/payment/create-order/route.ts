import Razorpay from 'razorpay'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (process.env.NODE_ENV === 'development') {
      console.log('Razorpay keyId loaded:', Boolean(keyId))
      console.log('Razorpay secret loaded:', Boolean(keySecret))
    }

    const missingKeys: string[] = []
    if (!keyId) missingKeys.push('NEXT_PUBLIC_RAZORPAY_KEY_ID or RAZORPAY_KEY_ID')
    if (!keySecret) missingKeys.push('RAZORPAY_KEY_SECRET')

    if (missingKeys.length > 0) {
      return NextResponse.json(
        { error: `Missing Razorpay configuration: ${missingKeys.join(', ')}` },
        { status: 500 },
      )
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret })
    const body = await request.json()
    const amount = Number(body?.amount)

    if (!amount || Number.isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      payment_capture: true,
    })

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    })
  } catch (error) {
    console.error('Failed to create Razorpay order', error)
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 })
  }
}
