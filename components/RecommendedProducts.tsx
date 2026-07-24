'use client'

import { useMemo } from 'react'
import ProductCard from '@/components/ProductCard'
import type { Product } from '@/types/product'

interface RecommendedProductsProps {
  title: string
  products: Product[]
  loading?: boolean
  maxDisplay?: number
}

export default function RecommendedProducts({
  title,
  products,
  loading = false,
  maxDisplay = 6,
}: RecommendedProductsProps) {
  const displayed = useMemo(() => products.slice(0, maxDisplay), [products, maxDisplay])

  if (loading) {
    return (
      <div className="my-12">
        <h2 className="mb-6 text-2xl font-semibold text-[#F5F5F5]">{title}</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-[#1a1a1a]" />
          ))}
        </div>
      </div>
    )
  }

  if (!displayed.length) {
    return null
  }

  return (
    <div className="my-12">
      <h2 className="mb-6 text-2xl font-semibold text-[#F5F5F5]">{title}</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {displayed.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
