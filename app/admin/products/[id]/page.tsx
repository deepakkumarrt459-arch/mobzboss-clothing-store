"use client"

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ProductForm, { type ProductFormPayload } from '@/components/admin/ProductForm'
import { getProduct, updateProduct } from '@/services/productService'
import type { Product } from '@/types/product'

export default function EditProductPage() {
  const params = useParams()
  const id = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : undefined
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    let mounted = true

    async function loadProduct() {
      setLoading(true)

      try {
        if (!id) {
          throw new Error('Product id is missing')
        }
        const existing = await getProduct(id)
        if (mounted) {
          setProduct(existing)
        }
      } catch (error) {
        console.error('Failed to load product', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadProduct()

    return () => {
      mounted = false
    }
  }, [id])

  async function handleSubmit(payload: ProductFormPayload) {
    if (!id) return

    setSaving(true)

    try {
      await updateProduct(id, {
        name: payload.name,
        description: payload.description,
        price: payload.price,
        category: payload.category,
        sizes: payload.sizes,
        colors: payload.colors,
        stock: payload.stock,
        rating: payload.rating,
        images: [`/products/${payload.image.trim()}`],
      })
      router.push('/admin/products')
    } catch (error) {
      console.error('Failed to save product', error)
      alert('Unable to save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-12 text-center text-[#F5F5F5]">Loading product…</div>
  }

  if (!product) {
    return <div className="p-12 text-center text-[#F5F5F5]">Product not found.</div>
  }

  const initialValues: ProductFormPayload = {
    name: product.name,
    price: product.price,
    category: product.category,
    description: product.description ?? '',
    sizes: product.sizes ?? ['S', 'M', 'L', 'XL'],
    colors: product.colors ?? ['Black', 'White'],
    stock: product.stock ?? 10,
    rating: product.rating ?? 4,
    image: product.images?.[0] ? product.images[0].replace(/^\/products\//, '') : '',
  }

  return (
    <section>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Edit Product</h1>
          <p className="mt-2 text-sm text-[#D9D0A7]">Update the existing product details and save.</p>
        </div>
      </div>

      <div className="mt-6 max-w-2xl">
        <ProductForm
          initialValues={initialValues}
          submitLabel={saving ? 'Saving…' : 'Save Changes'}
          disabled={saving}
          onSubmit={handleSubmit}
        />
      </div>
    </section>
  )
}
