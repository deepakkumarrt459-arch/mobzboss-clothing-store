 'use client'

import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
const SmartSearch = dynamic(() => import('@/components/SmartSearch'), { ssr: false })
import ProductCard from '@/components/ProductCard'
import { consumePostLoginAction } from '@/lib/authHelpers'
import { useCart } from '@/components/ui/context/cartcontext'
import { useEffect } from 'react'
import useProducts from '@/hooks/useProducts'
import type { Product } from '@/types/product'

const SORT_OPTIONS = ['none', 'low', 'high', 'rating'] as const

type SortOption = (typeof SORT_OPTIONS)[number]

export default function ShopPage() {
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState<SortOption>('none')
  const [hasSearched, setHasSearched] = useState(false)
  const { products, loading } = useProducts()
  const { addToCart } = useCart()

  useEffect(() => {
    const action = consumePostLoginAction()
    if (!action) return

    if (action.action === 'add_to_cart' && action.payload?.productId) {
      const found = products.find((p) => p.id === action.payload?.productId)
      if (found) addToCart(found)
    }
  }, [products, addToCart])

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(products.map((product) => product.category)))
    return ['All', ...uniqueCategories]
  }, [products])

  const displayProducts = useMemo(() => {
    let list = hasSearched ? searchResults : products

    if (category !== 'All') {
      list = list.filter((product) => product.category.toLowerCase() === category.toLowerCase())
    }

    if (sort === 'low') list = [...list].sort((a, b) => a.price - b.price)
    if (sort === 'high') list = [...list].sort((a, b) => b.price - a.price)
    if (sort === 'rating') list = [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))

    return list
  }, [products, searchResults, category, sort, hasSearched])

  const handleSearch = (results: Product[]) => {
    setSearchResults(results)
    setHasSearched(true)
  }

  return (
    <main className="min-h-screen bg-[#111111] text-[#F5F5F5]">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <header className="mb-8 flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-semibold">Shop MobzBoss</h1>
            <p className="mt-2 text-sm text-[#D9D0A7]">Curated pieces. Limited drops. Premium materials.</p>
          </div>

          <div className="flex w-full flex-col gap-4">
            <SmartSearch onSearch={handleSearch} />

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="rounded-full border border-[#7A5C3E]/10 bg-[#1A1A1A] px-4 py-2 text-sm text-[#F5F5F5] outline-none transition hover:border-[#C9A227]"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === 'none' ? 'Sort' : opt === 'low' ? 'Price: Low to High' : opt === 'high' ? 'Price: High to Low' : 'Highest Rated'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        <div className="mb-8 flex flex-wrap gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                category === cat
                  ? 'bg-[#C9A227] text-[#111111]'
                  : 'bg-[#1A1A1A] text-[#F5F5F5] hover:bg-[#2B2B2B]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <section>
          {loading ? (
            <div className="rounded-[1.5rem] border border-[#7A5C3E]/10 bg-[#1A1A1A] p-12 text-center text-sm text-[#D9D0A7]">
              Loading products…
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                {displayProducts.map((product: Product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {displayProducts.length === 0 && (
                <p className="mt-8 text-center text-sm text-[#D9D0A7]">
                  {hasSearched ? 'No products match your search.' : 'No products available.'}
                </p>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  )
}
