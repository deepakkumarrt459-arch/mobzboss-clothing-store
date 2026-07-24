'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/components/ui/context/AuthContext'
import { getOrdersByUserId } from '@/services/orderservice'
import { subscribeToProductReviews, submitProductReview, deleteProductReview } from '@/services/productService'
import type { ProductReview } from '@/types/product'

export function useProductReviews(productId?: string) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [loading, setLoading] = useState(true)
  const [canReview, setCanReview] = useState(false)
  const [existingReview, setExistingReview] = useState<ProductReview | null>(null)
  const [checkingEligibility, setCheckingEligibility] = useState(false)

  useEffect(() => {
    if (!productId) {
      void Promise.resolve().then(() => {
        setReviews([])
        setLoading(false)
        setCanReview(false)
        setExistingReview(null)
      })
      return
    }

    setLoading(true)
    const unsubscribe = subscribeToProductReviews(productId, (nextReviews) => {
      setReviews(nextReviews)
      setLoading(false)
      if (user?.uid) {
        const match = nextReviews.find((review) => review.userId === user.uid)
        setExistingReview(match ?? null)
      } else {
        setExistingReview(null)
      }
    })

    return () => unsubscribe()
  }, [productId, user?.uid])

  useEffect(() => {
    let active = true

    async function checkEligibility() {
      if (!productId || !user?.uid) {
        setCanReview(false)
        return
      }

      setCheckingEligibility(true)
      try {
        const orders = await getOrdersByUserId(user.uid)
        const hasCompletedPurchase = orders.some((order) => {
          const orderUserId = typeof order.userId === 'string' ? order.userId : ''
          const isDelivered = typeof order.status === 'string' && order.status.toLowerCase() === 'delivered'
          const hasMatchingItem = Array.isArray(order.items) && order.items.some((item) => item.productId === productId)
          return Boolean(orderUserId === user.uid && isDelivered && hasMatchingItem)
        })

        if (active) setCanReview(hasCompletedPurchase)
      } finally {
        if (active) setCheckingEligibility(false)
      }
    }

    checkEligibility()

    return () => {
      active = false
    }
  }, [productId, user?.uid])

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0
    const total = reviews.reduce((sum, review) => sum + review.rating, 0)
    return total / reviews.length
  }, [reviews])

  const submitReview = async (payload: Omit<ProductReview, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!productId || !user?.uid) return
    await submitProductReview(productId, { ...payload, userId: user.uid, userName: payload.userName || user.displayName || 'Customer' })
  }

  const removeReview = async (reviewId?: string) => {
    if (!productId || !reviewId) return
    await deleteProductReview(productId, reviewId)
  }

  return {
    reviews,
    loading,
    averageRating,
    reviewCount: reviews.length,
    canReview,
    checkingEligibility,
    existingReview,
    submitReview,
    removeReview,
  }
}
