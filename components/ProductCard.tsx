"use client";

import React, { useState } from 'react'
import Link from 'next/link'
import type { Product } from '@/types/product'
import { useCart } from './ui/context/cartcontext'

type Props = {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const imageUrl = product.images?.[0] ?? 'https://placehold.co/400x500/111111/F5F5F5?text=No+Image'
  const priceLabel = `$${product.price.toFixed(2)}`
  const ratingLabel = product.rating ? product.rating.toFixed(1) : '—'

  const { addToCart } = useCart()
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    addToCart(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1400)
  }

  return (
    <article className="group rounded-[1.5rem] overflow-hidden border border-[#7A5C3E]/10 bg-[#111111] transition hover:shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)]">
      <Link href={`/product/${product.id}`} className="overflow-hidden block transition duration-500 hover:opacity-90">
        <img src={imageUrl} alt={product.name} className="h-[340px] w-full object-cover transition duration-500 group-hover:scale-105" />
      </Link>
      <div className="p-5">
        <div className="flex items-center justify-between">
          <Link href={`/product/${product.id}`} className="text-sm font-semibold tracking-tight text-[#F5F5F5] hover:text-[#C9A227]">
            {product.name}
          </Link>
          <span className="text-sm font-semibold text-[#C9A227]">{priceLabel}</span>
        </div>
        <Link href={`/product/${product.id}`} className="mt-3 block text-xs text-[#D9D0A7] line-clamp-2 hover:text-[#C9A227]">
          {product.description}
        </Link>
        <div className="mt-4 flex items-center justify-between">
          <div className="relative">
            <button onClick={handleAdd} className="rounded-full bg-[#C9A227] px-4 py-2 text-xs font-semibold text-[#111111] transition hover:bg-[#b69323]">
              Add to Cart
            </button>
            {added && (
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 rounded-md bg-[#C9A227] px-2 py-1 text-xs font-semibold text-[#111111]">Added to Cart</span>
            )}
          </div>
          <div className="text-xs text-[#F5F5F5]/70">{ratingLabel}</div>
        </div>
      </div>
    </article>
  )
}
