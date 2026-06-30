"use client";

import React from 'react'
import { useCart } from '../ui/context/cartcontext'

export default function CartButton() {
	const { count, toggleCart } = useCart()

	return (
		<button
			onClick={toggleCart}
			aria-label="Open cart"
			className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#F5F5F5]/10 bg-[#2B2B2B]/95 text-[#F5F5F5] transition hover:border-[#C9A227] hover:text-[#C9A227]"
		>
			<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
				<path d="M6 6h15l-1.5 9h-12z" />
				<circle cx="9" cy="20" r="1" />
				<circle cx="18" cy="20" r="1" />
			</svg>
			{count > 0 && (
				<span className="pointer-events-none absolute -top-1 -right-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[#C9A227] px-1.5 text-xs font-semibold text-[#111111]">
					{count}
				</span>
			)}
		</button>
	)
}
