"use client";

import { useEffect, useState, useCallback } from 'react'
import type { Product } from '@/types/product'
import { getProducts } from '@/services/productService'

export default function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const refreshProducts = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getProducts()
      // Normalize product fields to ensure UI safety
      const normalized = data.map((p) => ({
        ...p,
        description: p.description ?? '',
        sizes: p.sizes && p.sizes.length ? p.sizes : ['S', 'M', 'L', 'XL'],
        colors: p.colors && p.colors.length ? p.colors : ['Black', 'White'],
        rating: typeof p.rating === 'number' ? p.rating : 4,
        stock: typeof p.stock === 'number' ? p.stock : 10,
        images: p.images ?? [],
      }))

      setProducts(normalized)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshProducts()
  }, [refreshProducts])

  return { products, loading, refreshProducts }
}
