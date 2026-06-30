"use client";

import React from 'react'
import { CartItem as CI, useCart } from '../ui/context/cartcontext'

export default function CartItem({ item }: { item: CI }) {
	const { increaseQuantity, decreaseQuantity, removeFromCart } = useCart()

	return (
		<div className="flex items-center gap-4 rounded-md border border-[#7A5C3E]/10 p-3">
			<img src={item.product.images?.[0] ?? '/products/placeholder.png'} alt={item.product.name} className="h-16 w-16 rounded-md object-cover" />

			<div className="flex-1">
				<div className="flex items-center justify-between">
					<div>
						<div className="font-semibold">{item.product.name}</div>
						<div className="text-sm text-[#F5F5F5]/80">₹{item.product.price.toFixed(0)}</div>
					</div>
					<div className="text-sm font-semibold">₹{(item.product.price * item.quantity).toFixed(0)}</div>
				</div>

				<div className="mt-2 flex items-center gap-3">
					<div className="flex items-center rounded-md bg-[#151515]">
						<button onClick={() => decreaseQuantity(item.product.id)} className="px-3 py-1 text-sm text-[#F5F5F5]/90">-</button>
						<div className="px-3 py-1 text-sm font-medium">{item.quantity}</div>
						<button onClick={() => increaseQuantity(item.product.id)} className="px-3 py-1 text-sm text-[#F5F5F5]/90">+</button>
					</div>

					<button onClick={() => removeFromCart(item.product.id)} className="text-sm text-[#F5F5F5]/80 hover:text-[#C9A227]">
						Remove
					</button>
				</div>
			</div>
		</div>
	)
}
