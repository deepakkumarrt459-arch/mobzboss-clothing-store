"use client"

import { useEffect, useState, useCallback } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import type { Product } from '@/types/product'
import { db } from '@/lib/firebase'
import { getProducts } from '@/services/productService'

export default function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const refreshProducts = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getProducts()
      const normalized = data.map((product) => ({
        ...product,
        description: product.description ?? '',
        sizes: product.sizes && product.sizes.length ? product.sizes : ['S', 'M', 'L', 'XL'],
        colors: product.colors && product.colors.length ? product.colors : ['Black', 'White'],
        rating: typeof product.rating === 'number' ? product.rating : 4,
        stock: typeof product.stock === 'number' ? product.stock : 10,
        images: product.images ?? [],
      }))

      setProducts(normalized)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!db) {
      void Promise.resolve().then(() => setLoading(false))
      return
    }

    const unsubscribe = onSnapshot(
      collection(db, 'products'),
      (snapshot) => {
        const normalized = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as Partial<Product>
          return {
            id: docSnap.id,
            name: typeof data.name === 'string' ? data.name : 'Untitled product',
            price: typeof data.price === 'number' ? data.price : 0,
            category: typeof data.category === 'string' ? data.category : 'Uncategorized',
            description: typeof data.description === 'string' ? data.description : '',
            sizes: Array.isArray(data.sizes) ? (data.sizes as string[]) : ['S', 'M', 'L', 'XL'],
            colors: Array.isArray(data.colors) ? (data.colors as string[]) : ['Black', 'White'],
            rating: typeof data.rating === 'number' ? data.rating : 4,
            stock: typeof data.stock === 'number' ? data.stock : 10,
            images: Array.isArray(data.images) ? (data.images as string[]) : [],
            featured: Boolean(data.featured),
            createdAt: data.createdAt instanceof Date ? data.createdAt : undefined,
          } satisfies Product
        })

        setProducts(normalized)
        setLoading(false)
      },
      () => {
        setLoading(false)
      },
    )

    void Promise.resolve().then(refreshProducts)

    return () => unsubscribe()
  }, [refreshProducts])

  return { products, loading, refreshProducts }
}
