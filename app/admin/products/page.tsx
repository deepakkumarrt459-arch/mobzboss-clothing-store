"use client"

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { products as allProducts, Product } from '@/data/products'
import AdminTable from '@/components/admin/AdminTable'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function ProductsPage() {
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<Product[]>(allProducts)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
  }, [query, items])

  function handleDelete(id: string) {
    if (!confirm('Delete this product?')) return
    setItems((s) => s.filter((p) => p.id !== id))
  }

  function handleEdit(id: string) {
    // navigate to edit or open modal; placeholder
    alert('Edit ' + id)
  }

  return (
    <section>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>
        <div className="flex items-center gap-3">
          <Link href="/admin/products/new">
            <Button>Add Product</Button>
          </Link>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Input placeholder="Search products" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>

        <AdminTable items={filtered} onDelete={handleDelete} onEdit={handleEdit} />
      </div>
    </section>
  )
}
