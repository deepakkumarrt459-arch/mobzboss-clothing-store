"use client";

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '../ui/context/cartcontext'
import { useAuth } from '../ui/context/AuthContext'
import { ensureAuth } from '@/lib/authHelpers'
import { useCouponValidation } from '@/hooks/useCoupons'

const SHIPPING = 50

export default function CartSummary() {
	const { subtotal, clearCart } = useCart()
	const { user } = useAuth()
	const router = useRouter()
	const { appliedCoupon, message, loading, applyCoupon, resetCoupon } = useCouponValidation()
	const [couponCode, setCouponCode] = useState('')

	const discount = useMemo(() => {
		if (!appliedCoupon) return 0
		if (appliedCoupon.type === 'percentage') {
			return Math.min(Math.round((subtotal * appliedCoupon.value) / 100), appliedCoupon.maximumDiscount || subtotal)
		}
		return Math.min(appliedCoupon.value, appliedCoupon.maximumDiscount || appliedCoupon.value)
	}, [appliedCoupon, subtotal])

	const grand = Math.max(subtotal - discount, 0) + (subtotal > 0 ? SHIPPING : 0)

	const handleCheckoutClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
		if (!user?.uid) {
			event.preventDefault()
			ensureAuth(router, user, { action: 'checkout' })
		}
	}

	return (
		<div className="rounded-md border border-[#7A5C3E]/10 bg-[#0b0b0b] p-4">
			<div className="flex items-center justify-between">
				<div className="text-sm text-[#F5F5F5]/90">Subtotal</div>
				<div className="font-semibold">₹{subtotal.toFixed(0)}</div>
			</div>

			<div className="mt-2 flex items-center justify-between text-sm text-[#F5F5F5]/80">
				<div>Shipping</div>
				<div>₹{subtotal > 0 ? SHIPPING : 0}</div>
			</div>

			{appliedCoupon ? (
				<div className="mt-2 flex items-center justify-between text-sm text-[#7ED957]">
					<div>Coupon discount</div>
					<div>-₹{discount.toFixed(0)}</div>
				</div>
			) : null}

			<div className="mt-3 flex items-center justify-between border-t border-[#7A5C3E]/8 pt-3">
				<div className="text-sm text-[#F5F5F5]/90">Total</div>
				<div className="text-lg font-bold">₹{grand.toFixed(0)}</div>
			</div>

			<div className="mt-4 space-y-2">
				<div className="flex gap-2">
					<input value={couponCode} onChange={(event) => setCouponCode(event.target.value)} placeholder="Coupon code" className="flex-1 rounded-md border border-[#7A5C3E]/10 bg-[#111111] px-3 py-2 text-sm text-[#F5F5F5]" />
					<button onClick={() => applyCoupon(couponCode, subtotal)} disabled={loading} className="rounded-md bg-[#C9A227] px-3 py-2 text-sm font-semibold text-[#111111]">
						{loading ? '...' : 'Apply'}
					</button>
				</div>
				{message ? <p className={`text-sm ${appliedCoupon ? 'text-[#7ED957]' : 'text-[#F56565]'}`}>{message}</p> : null}
				{appliedCoupon ? (
					<button onClick={() => { resetCoupon(); setCouponCode('') }} className="text-sm text-[#C9A227]">Remove coupon</button>
				) : null}
			</div>

			<div className="mt-4 flex gap-3">
				<Link href="/checkout" onClick={handleCheckoutClick} className={`flex-1 rounded-md py-2 text-sm font-semibold text-[#111111] ${subtotal > 0 ? 'bg-[#C9A227] hover:bg-[#b69323]' : 'bg-[#555555] cursor-not-allowed'}`}>
					Checkout
				</Link>
				<button onClick={clearCart} className="rounded-md border border-[#F5F5F5]/10 px-4 py-2 text-sm text-[#F5F5F5]">Clear</button>
			</div>
		</div>
	)
}
