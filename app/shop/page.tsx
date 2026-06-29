"use client"

import { useMemo, useState } from 'react'
import Input from '@/components/ui/Input'
import ProductCard from '@/components/ProductCard'
import useProducts from '@/hooks/useProducts'
import type { Product } from '@/types/product'

const SORT_OPTIONS = ['none', 'low', 'high', 'rating'] as const

type SortOption = (typeof SORT_OPTIONS)[number]

export default function ShopPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState<SortOption>('none')
  const { products, loading } = useProducts()

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(products.map((product) => product.category)))
    return ['All', ...uniqueCategories]
  }, [products])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = products

    if (q) {
      list = list.filter((product) => {
        const inName = product.name.toLowerCase().includes(q)
        const inCategory = product.category.toLowerCase().includes(q)
        return inName || inCategory
      })
    }

    if (category !== 'All') {
      list = list.filter((product) => product.category.toLowerCase().includes(category.toLowerCase()))
    }

    if (sort === 'low') list = [...list].sort((a, b) => a.price - b.price)
    if (sort === 'high') list = [...list].sort((a, b) => b.price - a.price)
    if (sort === 'rating') list = [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))

    return list
  }, [products, query, category, sort])

  return (
    <main className="min-h-screen bg-[#111111] text-[#F5F5F5]">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <header className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Shop MobzBoss</h1>
            <p className="mt-2 text-sm text-[#D9D0A7]">Curated pieces. Limited drops. Premium materials.</p>
          </div>

          <div className="flex w-full max-w-2xl items-center gap-3 md:w-auto">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or category"
              className="flex-1 rounded-full border border-[#7A5C3E]/10 bg-[#1A1A1A] px-4 py-3 text-sm text-[#F5F5F5] placeholder:text-[#B2A87E] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30"
            />
            <select value={sort} onChange={(e) => setSort(e.target.value as SortOption)} className="rounded-full border border-[#7A5C3E]/10 bg-[#1A1A1A] px-3 py-3 text-sm text-[#F5F5F5]">
              <option value="none">Sort</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </header>

        <div className="mb-8 flex flex-wrap gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${category === cat ? 'bg-[#C9A227] text-[#111111]' : 'bg-[#1A1A1A] text-[#F5F5F5] hover:bg-[#2B2B2B]'}`}>
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
                {filtered.map((product: Product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {filtered.length === 0 && (
                <p className="mt-8 text-center text-sm text-[#D9D0A7]">No products match your search.</p>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  )
}
