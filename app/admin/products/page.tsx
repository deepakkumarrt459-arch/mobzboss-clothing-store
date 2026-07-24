"use client";

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Product, ProductReview } from '@/types/product'
import useProducts from '@/hooks/useProducts'
import { deleteProduct, deleteProductReview } from '@/services/productService'
import AdminTable from '@/components/admin/AdminTable'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function ProductsPage() {
  const [query, setQuery] = useState('')
  const { products, refreshProducts } = useProducts()
  const [items, setItems] = useState<Product[]>([])
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)

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

  async function handleViewReviews(productId: string) {
    setSelectedProductId(productId)
    setReviewsLoading(true)
    try {
      const response = await fetch(`/api/products/${productId}/reviews`)
      if (!response.ok) throw new Error('Failed to load reviews')
      const data = await response.json()
      setReviews(data.reviews ?? [])
    } catch (error) {
      console.error('Failed to fetch reviews', error)
      setReviews([])
    } finally {
      setReviewsLoading(false)
    }
  }

  async function handleDeleteReview(productId: string, reviewId: string) {
    if (!confirm('Delete this review?')) return
    try {
      await deleteProductReview(productId, reviewId)
      setReviews((current) => current.filter((review) => review.id !== reviewId))
    } catch (error) {
      console.error('Failed to delete review', error)
      alert('Unable to delete review. Please try again.')
    }
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

        <div className="rounded-3xl border border-[#7A5C3E]/10 bg-[#0b0b0b] p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#F5F5F5]">Customer Reviews</h2>
            {selectedProductId ? <span className="text-sm text-[#D9D0A7]">Viewing {selectedProductId}</span> : null}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {items.map((product) => (
              <Button key={product.id} variant="ghost" onClick={() => handleViewReviews(product.id)}>
                {product.name}
              </Button>
            ))}
          </div>
          <div className="mt-6 space-y-3">
            {reviewsLoading ? (
              <p className="text-sm text-[#D9D0A7]">Loading reviews…</p>
            ) : reviews.length === 0 ? (
              <p className="text-sm text-[#D9D0A7]">Select a product to view reviews.</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="rounded-2xl border border-[#7A5C3E]/10 bg-[#111111] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#F5F5F5]">{review.userName}</p>
                      <p className="text-sm text-[#D9D0A7]">{review.rating} / 5</p>
                    </div>
                    <Button variant="ghost" onClick={() => selectedProductId && handleDeleteReview(selectedProductId, review.id ?? '')}>
                      Delete
                    </Button>
                  </div>
                  <p className="mt-3 text-sm text-[#D9D0A7]">{review.review}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
