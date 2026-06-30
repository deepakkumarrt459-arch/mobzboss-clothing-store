"use client";

import React from 'react'
import { useCart } from '../ui/context/cartcontext'
import CartItem from './CartItem'
import CartSummary from './CartSummary'

export default function CartDrawer() {
	const { isOpen, closeCart, items } = useCart()

	if (!isOpen) return null

	return (
		<div className="fixed inset-0 z-50 flex">
			<div className="absolute inset-0 bg-black/50" onClick={closeCart} />
			<aside className="relative ml-auto h-full w-full max-w-md bg-[#0b0b0b] p-6 text-[#F5F5F5] shadow-2xl">
				<div className="flex items-center justify-between">
					<h3 className="text-lg font-semibold tracking-wide">Your Cart</h3>
					<button onClick={closeCart} aria-label="Close cart" className="text-[#F5F5F5]/80 hover:text-[#C9A227]">
						✕
					</button>
				</div>

				<div className="mt-6 space-y-4 overflow-y-auto">
					{items.length === 0 ? (
						<div className="py-12 text-center text-sm text-[#F5F5F5]/80">Your cart is empty.</div>
					) : (
						items.map((it) => <CartItem key={it.product.id} item={it} />)
					)}
				</div>

				<div className="mt-6">
					<CartSummary />
				</div>
			</aside>
		</div>
	)
}
