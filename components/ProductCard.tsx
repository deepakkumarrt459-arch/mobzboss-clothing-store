import React from 'react'
import type { Product } from '@/types/product'

type Props = {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const imageUrl = product.images?.[0] ?? 'https://placehold.co/400x500/111111/F5F5F5?text=No+Image'
  const priceLabel = `$${product.price.toFixed(2)}`
  const ratingLabel = product.rating ? product.rating.toFixed(1) : '—'

  return (
    <article className="group rounded-[1.5rem] overflow-hidden border border-[#7A5C3E]/10 bg-[#111111] transition hover:shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)]">
      <div className="overflow-hidden">
        <img src={imageUrl} alt={product.name} className="h-[340px] w-full object-cover transition duration-500 group-hover:scale-105" />
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-tight text-[#F5F5F5]">{product.name}</h3>
          <span className="text-sm font-semibold text-[#C9A227]">{priceLabel}</span>
        </div>
        <p className="mt-3 text-xs text-[#D9D0A7] line-clamp-2">{product.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <button className="rounded-full bg-[#C9A227] px-4 py-2 text-xs font-semibold text-[#111111] transition hover:bg-[#b69323]">Quick Reserve</button>
          <div className="text-xs text-[#F5F5F5]/70">{ratingLabel}</div>
        </div>
      </div>
    </article>
  )
}
