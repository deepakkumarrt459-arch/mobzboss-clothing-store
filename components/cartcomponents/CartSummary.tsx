"use client";

import React from 'react'
import Link from 'next/link'
import { useCart } from '../ui/context/cartcontext'

const SHIPPING = 50

export default function CartSummary() {
	const { subtotal, clearCart } = useCart()

	const grand = subtotal + (subtotal > 0 ? SHIPPING : 0)

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

			<div className="mt-3 flex items-center justify-between border-t border-[#7A5C3E]/8 pt-3">
				<div className="text-sm text-[#F5F5F5]/90">Total</div>
				<div className="text-lg font-bold">₹{grand.toFixed(0)}</div>
			</div>

			<div className="mt-4 flex gap-3">
				<Link href="/checkout" className={`flex-1 rounded-md py-2 text-sm font-semibold text-[#111111] ${subtotal > 0 ? 'bg-[#C9A227] hover:bg-[#b69323]' : 'bg-[#555555] cursor-not-allowed'}`}>
					Checkout
				</Link>
				<button onClick={clearCart} className="rounded-md border border-[#F5F5F5]/10 px-4 py-2 text-sm text-[#F5F5F5]">Clear</button>
			</div>
		</div>
	)
}
