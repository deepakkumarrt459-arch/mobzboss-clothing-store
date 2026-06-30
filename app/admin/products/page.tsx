"use client";

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Product } from '@/types/product'
import useProducts from '@/hooks/useProducts'
import { deleteProduct } from '@/services/productService'
import AdminTable from '@/components/admin/AdminTable'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function ProductsPage() {
  const [query, setQuery] = useState('')
  const { products, loading, refreshProducts } = useProducts()
  const [items, setItems] = useState<Product[]>([])

  useEffect(() => {
    setItems(products)
  }, [products])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
  }, [query, items])

  const router = useRouter()

  async function handleDelete(id: string) {
    if (!confirm('Delete this product?')) return

    try {
      await deleteProduct(id)
      await refreshProducts()
      setItems((s) => s.filter((p) => p.id !== id))
    } catch (error) {
      console.error('Failed to delete product', error)
      alert('Unable to delete product. Please try again.')
    }
  }

  function handleEdit(id: string) {
    router.push(`/admin/products/${id}/edit`)
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
