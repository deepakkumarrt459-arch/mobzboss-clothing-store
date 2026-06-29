"use client"

import React, { useState } from 'react'
import ProductForm, { type ProductFormPayload } from '@/components/admin/ProductForm'
import { useRouter } from 'next/navigation'
import { addProduct } from '@/services/productService'

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(payload: ProductFormPayload) {
    setLoading(true)

    try {
      await addProduct({
        name: payload.name,
        description: payload.description,
        price: Number(payload.price.replace(/[^0-9.]/g, '')) || 0,
        category: payload.category,
        sizes: payload.sizes
          .split(',')
          .map((size) => size.trim())
          .filter(Boolean),
        colors: payload.colors
          .split(',')
          .map((color) => color.trim())
          .filter(Boolean),
        stock: Number(payload.stock) || 0,
        images: [`/products/${payload.image.trim()}`],
        featured: false,
        rating: 0,
      })

      router.push('/admin/products')
    } catch (error) {
      console.error('Error publishing product', error)
      alert('Failed to publish product. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold">New Product</h1>
      <div className="mt-6 max-w-2xl">
        <ProductForm onSubmit={handleSubmit} disabled={loading} />
      </div>
    </section>
  )
}
