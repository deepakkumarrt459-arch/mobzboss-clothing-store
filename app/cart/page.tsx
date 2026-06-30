"use client";

import React from 'react'
import { useCart } from '../../components/ui/context/cartcontext'
import CartItem from '../../components/cartcomponents/CartItem'
import CartSummary from '../../components/cartcomponents/CartSummary'

export default function CartPage() {
	const { items } = useCart()

	return (
		<div className="mx-auto max-w-7xl px-6 py-12">
			<div className="mb-8">
				<h1 className="text-3xl font-bold tracking-wide text-[#F5F5F5]">Your Cart</h1>
				<p className="mt-2 text-sm text-[#F5F5F5]/80">Review your selections before checkout.</p>
			</div>

			<div className="grid grid-cols-1 gap-8 md:grid-cols-3">
				<div className="md:col-span-2 space-y-4">
					{items.length === 0 ? (
						<div className="rounded-md border border-[#7A5C3E]/10 bg-[#0b0b0b] p-8 text-center text-[#F5F5F5]/80">Your cart is empty.</div>
					) : (
						items.map((it) => <CartItem key={it.product.id} item={it} />)
					)}
				</div>

				<div className="md:col-span-1">
					<CartSummary />
				</div>
			</div>
		</div>
	)
}
