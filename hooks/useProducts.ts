"use client"

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
      setProducts(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshProducts()
  }, [refreshProducts])

  return { products, loading, refreshProducts }
}
