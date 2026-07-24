'use client'

import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ensureAuth } from '@/lib/authHelpers'
import Input from '../../components/ui/Input'
import { useCart } from '../../components/ui/context/cartcontext'
import { useAuth } from '../../components/ui/context/AuthContext'
import { useCouponValidation } from '@/hooks/useCoupons'
import { loadRazorpayScript } from '../../lib/razorpay'

interface RazorpayOrderResponse {
  order_id: string
  amount: number
  currency: string
  key: string
}

interface StockValidationIssue {
  name: string
  available: number
}

interface RazorpayPaymentResult {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

interface RazorpayCheckoutOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  prefill: {
    name: string
    email: string
  }
  handler: (response: RazorpayPaymentResult) => Promise<void>
  modal: {
    ondismiss: () => void
  }
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart()
  const { user, loading: authLoading } = useAuth()
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { appliedCoupon, message, loading, applyCoupon, resetCoupon } = useCouponValidation()

  const shipping = subtotal > 0 ? 50 : 0
  const discount = useMemo(() => {
    if (!appliedCoupon) return 0
    if (appliedCoupon.type === 'percentage') {
      return Math.min(Math.round((subtotal * appliedCoupon.value) / 100), appliedCoupon.maximumDiscount || subtotal)
    }
    return Math.min(appliedCoupon.value, appliedCoupon.maximumDiscount || appliedCoupon.value)
  }, [appliedCoupon, subtotal])
  const total = Math.max(subtotal - discount, 0) + shipping

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

  const isUserReady = !authLoading && Boolean(user?.uid)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit) return
    if (!isUserReady) {
      // redirect to login and preserve intent to checkout
      ensureAuth(router, user, { action: 'checkout' })
      return
    }

    setIsSubmitting(true)

    try {
      const validationResponse = await fetch('/api/payment/validate-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: orderItems }),
      })

      if (!validationResponse.ok) {
        const validationData = (await validationResponse.json().catch(() => null)) as { error?: string; issues?: StockValidationIssue[] } | null
        const message = validationData?.error || 'Some items are no longer available in the requested quantity.'
        const issueText = Array.isArray(validationData?.issues)
          ? validationData.issues.map((issue) => `${issue.name}: ${issue.available} available`).join('\n')
          : ''
        alert(`${message}${issueText ? `\n${issueText}` : ''}`)
        setIsSubmitting(false)
        return
      }

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
      console.log('Create Order Response:', data)

      // Validate required fields before opening Razorpay
      if (!data?.order_id || !data?.amount || !data?.currency || !data?.key) {
        console.error('Create Order Response missing required fields:', data)
        alert('Unable to initiate payment. Please try again later.')
        setIsSubmitting(false)
        return
      }

      if (!data?.order_id || !data?.amount || !data?.currency) {
        throw new Error('Invalid payment order response')
      }

      const options = {
        key: data.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: data.amount,
        currency: data.currency,
        name: 'MobzBoss',
        description: 'Complete your purchase',
        order_id: data.order_id,
        prefill: {
          name: customerName.trim() || user?.displayName || '',
          email: user?.email || '',
        },
        handler: async (paymentResult: RazorpayPaymentResult) => {
          try {
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: paymentResult.razorpay_payment_id,
                razorpay_order_id: paymentResult.razorpay_order_id,
                razorpay_signature: paymentResult.razorpay_signature,
                items: orderItems,
                customerName: customerName.trim(),
                email: user?.email ?? '',
                phone: phone.trim(),
                address: address.trim(),
                total,
                couponCode: appliedCoupon?.code ?? '',
                discount,
                userId: user?.uid ?? '',
              }),
            })

            if (!verifyResponse.ok) {
              throw new Error('Payment verification failed')
            }

            const verifyData = await verifyResponse.json()
            if (!verifyData?.success) {
              throw new Error(verifyData.error || 'Verification response invalid')
            }

            clearCart()
            setIsSubmitting(false)
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

      type RazorpayInstance = { open: () => void }
      const windowWithRazorpay = window as Window & { Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayInstance }
      if (!windowWithRazorpay.Razorpay) {
        throw new Error('Razorpay checkout library failed to initialize')
      }
      const razorpay = new windowWithRazorpay.Razorpay(options)
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

            <div className="space-y-2 rounded-2xl border border-[#7A5C3E]/10 bg-[#111111] p-4">
              <div className="flex gap-2">
                <Input value={couponCode} onChange={(event) => setCouponCode(event.target.value)} placeholder="Coupon code" />
                <button type="button" onClick={() => applyCoupon(couponCode, subtotal)} disabled={loading} className="rounded-md bg-[#C9A227] px-4 py-2 text-sm font-semibold text-[#111111] disabled:opacity-60">
                  {loading ? '...' : 'Apply'}
                </button>
              </div>
              {message ? <p className={`text-sm ${appliedCoupon ? 'text-[#7ED957]' : 'text-[#F56565]'}`}>{message}</p> : null}
              {appliedCoupon ? <button type="button" onClick={() => { resetCoupon(); setCouponCode('') }} className="text-sm text-[#C9A227]">Remove coupon</button> : null}
            </div>

            <button
              type="submit"
              disabled={!canSubmit || isSubmitting || !isUserReady}
              className="inline-flex w-full items-center justify-center rounded-full bg-[#C9A227] px-6 py-3 text-sm font-semibold text-[#111111] transition hover:bg-[#b69323] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {authLoading ? 'Preparing checkout…' : isSubmitting ? 'Placing order…' : 'Place Order'}
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
                    <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-[#1a1a1a]">
                      {item.product.images?.[0] ? (
                        <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" unoptimized />
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
              {appliedCoupon ? (
                <div className="mt-3 flex items-center justify-between text-sm text-[#7ED957]">
                  <span>Coupon discount</span>
                  <span>-₹{discount.toFixed(0)}</span>
                </div>
              ) : null}
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
