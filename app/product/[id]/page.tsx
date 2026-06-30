"use client"

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import type { Product } from '@/types/product'
import { useCart } from '@/components/ui/context/cartcontext'
import useProducts from '@/hooks/useProducts'

export default function ProductPage() {
  const params = useParams()
  const id = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : undefined
  const { products, loading } = useProducts()
  const [qty, setQty] = useState(1)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)

  const product = useMemo(
    () => products.find((item) => item.id === id) ?? null,
    [products, id]
  )

  const related = useMemo(() => {
    if (!product) return []
    return products
      .filter((item) => item.category === product.category && item.id !== product.id)
      .slice(0, 4)
  }, [products, product])

  useEffect(() => {
    if (!product) return
    setSelectedSize(product.sizes?.[0] ?? null)
    setSelectedColor(product.colors?.[0] ?? null)
    setQty(1)
  }, [product])

  const { addToCart } = useCart()
  const router = useRouter()

  const increase = () => setQty((q) => q + 1)
  const decrease = () => setQty((q) => Math.max(1, q - 1))

  const handleAddToCart = () => {
    if (!product) return
    addToCart(product, qty)
  }

  const handleBuyNow = () => {
    handleAddToCart()
    router.push('/cart')
  }

  if (loading) {
    return <div className="p-12 text-center text-[#F5F5F5]">Loading product…</div>
  }

  if (!product) {
    return <div className="p-12 text-center text-[#F5F5F5]">Product not found.</div>
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <img
            src={product.images?.[0] ?? '/products/placeholder.png'}
            alt={product.name}
            className="w-full rounded-2xl object-cover"
          />
        </div>

        <div className="text-[#F5F5F5]">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <div className="mt-2 flex items-center justify-between">
            <div className="text-lg font-semibold text-[#C9A227]">₹{product.price.toFixed(0)}</div>
            <div className="text-sm text-[#F5F5F5]/80">Rating: {(product.rating ?? 4).toFixed(1)}</div>
          </div>

          <p className="mt-4 text-sm text-[#D9D0A7]">{product.description}</p>

          <div className="mt-6">
            <div className="mb-2 text-sm font-semibold text-[#F5F5F5]">Sizes</div>
            <div className="flex flex-wrap gap-2">
              {product.sizes?.length === 0 && <div className="text-sm text-[#F5F5F5]/80">One size</div>}
              {product.sizes?.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`rounded-md px-3 py-1 text-sm ${selectedSize === s ? 'bg-[#C9A227] text-[#111111]' : 'bg-[#151515] text-[#F5F5F5]'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 text-sm font-semibold text-[#F5F5F5]">Colors</div>
            <div className="flex items-center gap-2">
              {product.colors?.length === 0 && <div className="text-sm text-[#F5F5F5]/80">Standard</div>}
              {product.colors?.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  title={c}
                  className={`h-8 w-8 rounded-full border ${selectedColor === c ? 'ring-2 ring-[#C9A227]' : ''}`}
                  style={{ backgroundColor: c.toLowerCase() }}
                />
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center rounded-md bg-[#151515]">
              <button onClick={decrease} className="px-3 py-1 text-sm text-[#F5F5F5]/90">-</button>
              <div className="px-4 py-1 text-sm font-medium">{qty}</div>
              <button onClick={increase} className="px-3 py-1 text-sm text-[#F5F5F5]/90">+</button>
            </div>

            <button onClick={handleAddToCart} className="rounded-full bg-[#C9A227] px-5 py-2 text-sm font-semibold text-[#111111]">
              Add to Cart
            </button>
            <button onClick={handleBuyNow} className="rounded-full border border-[#C9A227] px-5 py-2 text-sm font-semibold text-[#C9A227]">
              Buy Now
            </button>
          </div>

          <div className="mt-10">
            <h3 className="text-lg font-semibold text-[#F5F5F5]">Related Products</h3>
            <div className="mt-4 grid grid-cols-2 gap-4">
              {related.map((r) => (
                <Link key={r.id} href={`/product/${r.id}`} className="rounded-md border border-[#7A5C3E]/10 bg-[#111111] p-3">
                  <img
                    src={r.images?.[0] ?? '/products/placeholder.png'}
                    alt={r.name}
                    className="h-32 w-full object-cover"
                  />
                  <div className="mt-2 text-sm font-semibold text-[#F5F5F5]">{r.name}</div>
                  <div className="text-sm text-[#C9A227]">₹{r.price.toFixed(0)}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

