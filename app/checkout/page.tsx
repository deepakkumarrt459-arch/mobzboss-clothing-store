'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Input from '../../components/ui/Input'
import { useCart } from '../../components/ui/context/cartcontext'
import { useAuth } from '../../components/ui/context/AuthContext'
import { createOrder } from '../../services/orderservice'
import { loadRazorpayScript } from '../../lib/razorpay'
import type { Order } from '../../types/order'

interface RazorpayOrderResponse {
  order_id: string
  amount: number
  currency: string
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart()
  const { user } = useAuth()
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const shipping = subtotal > 0 ? 50 : 0
  const total = subtotal + shipping

  const orderItems = useMemo(
    () =>
      items.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.images?.[0],
      })),
    [items],
  )

  const canSubmit = items.length > 0 && customerName.trim() && phone.trim() && address.trim()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit) return

    setIsSubmitting(true)

    try {
      await loadRazorpayScript()

      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total }),
      })

      if (!response.ok) {
        throw new Error('Could not create payment order')
      }

      const data = (await response.json()) as RazorpayOrderResponse

      if (!data?.order_id || !data?.amount || !data?.currency) {
        throw new Error('Invalid payment order response')
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: data.amount,
        currency: data.currency,
        name: 'MobzBoss',
        description: 'Complete your purchase',
        order_id: data.order_id,
        prefill: {
          name: customerName.trim() || user?.displayName || '',
          email: user?.email || '',
        },
        handler: async (paymentResult: any) => {
          try {
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: paymentResult.razorpay_payment_id,
                razorpay_order_id: paymentResult.razorpay_order_id,
                razorpay_signature: paymentResult.razorpay_signature,
              }),
            })

            if (!verifyResponse.ok) {
              throw new Error('Payment verification failed')
            }

            const verifyData = await verifyResponse.json()
            if (!verifyData?.success) {
              throw new Error(verifyData.error || 'Verification response invalid')
            }

            const order: Omit<Order, 'id' | 'createdAt'> = {
              userId: user?.uid,
              customerName: customerName.trim(),
              phone: phone.trim(),
              address: address.trim(),
              items: orderItems,
              total,
              status: 'Pending',
            }

            await createOrder(order)
            clearCart()
            router.push('/order-success')
          } catch (verifyError) {
            console.error('Payment verification error', verifyError)
            alert('Payment could not be verified. Please try again or contact support.')
          }
        },
        modal: {
          ondismiss: () => {
            setIsSubmitting(false)
          },
        },
      }

      const razorpay = new (window as any).Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error('Failed to process payment', error)
      alert('Unable to complete payment. Please try again later.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-wide text-[#F5F5F5]">Checkout</h1>
        <p className="mt-2 text-sm text-[#F5F5F5]/80">Complete your order details and place your order with MobzBoss.</p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-[#7A5C3E]/10 bg-[#0b0b0b] p-10 text-center text-[#F5F5F5]/80">
          Your cart is empty.{' '}
          <Link href="/shop" className="font-semibold text-[#C9A227] hover:text-[#ebc656]">
            Continue shopping
          </Link>
          .
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <form onSubmit={handleSubmit} className="space-y-8 rounded-3xl border border-[#7A5C3E]/10 bg-[#0b0b0b] p-8">
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-[#F5F5F5]">Shipping information</h2>
              <p className="text-sm text-[#F5F5F5]/70">We’ll use this information to keep your order safe and on time.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-[#F5F5F5]">
                <span>Name</span>
                <Input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Full name" required />
              </label>
              <label className="space-y-2 text-sm text-[#F5F5F5]">
                <span>Phone</span>
                <Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Phone number" required />
              </label>
            </div>

            <label className="space-y-2 text-sm text-[#F5F5F5]">
              <span>Address</span>
              <textarea
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="Street, city, postal code"
                required
                className="min-h-[120px] w-full rounded-md border border-[#7A5C3E]/10 bg-[#111111] px-3 py-3 text-sm text-[#F5F5F5] placeholder:text-[#B2A87E] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30"
              />
            </label>

            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-full bg-[#C9A227] px-6 py-3 text-sm font-semibold text-[#111111] transition hover:bg-[#b69323] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Placing order…' : 'Place Order'}
            </button>
          </form>

          <aside className="space-y-6 rounded-3xl border border-[#7A5C3E]/10 bg-[#0b0b0b] p-8">
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-[#F5F5F5]">Order summary</h2>
              <p className="text-sm text-[#F5F5F5]/70">Review the items before you complete checkout.</p>
            </div>

            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.product.id} className="rounded-3xl border border-[#7A5C3E]/10 bg-[#111111] p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 overflow-hidden rounded-xl bg-[#1a1a1a]">
                      {item.product.images?.[0] ? (
                        <img src={item.product.images[0]} alt={item.product.name} className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#F5F5F5]">{item.product.name}</p>
                      <p className="text-sm text-[#F5F5F5]/70">{item.quantity} × ₹{item.product.price.toFixed(0)}</p>
                    </div>
                    <div className="text-sm font-semibold text-[#F5F5F5]">₹{(item.product.price * item.quantity).toFixed(0)}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-3xl border border-[#7A5C3E]/10 bg-[#111111] p-5">
              <div className="flex items-center justify-between text-sm text-[#F5F5F5]/80">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(0)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-[#F5F5F5]/80">
                <span>Shipping</span>
                <span>₹{shipping}</span>
              </div>
              <div className="mt-4 border-t border-[#7A5C3E]/10 pt-4 text-lg font-semibold text-[#F5F5F5] flex items-center justify-between">
                <span>Total</span>
                <span>₹{total.toFixed(0)}</span>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
