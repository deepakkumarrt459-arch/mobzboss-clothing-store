'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/components/ui/context/AuthContext'
import { addWishlistItem, removeWishlistItem, subscribeToWishlist } from '@/services/productService'

export function useWishlist() {
  const { user } = useAuth()
  const [wishlistIds, setWishlistIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.uid) {
      void Promise.resolve().then(() => {
        setWishlistIds([])
        setLoading(false)
      })
      return
    }

    setLoading(true)

    const unsubscribe = subscribeToWishlist(user.uid, (ids) => {
      setWishlistIds(ids)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user?.uid])

  const toggleWishlist = useCallback(async (productId: string) => {
    if (!user?.uid) return false

    const isWishlisted = wishlistIds.includes(productId)
    if (isWishlisted) {
      await removeWishlistItem(user.uid, productId)
      return false
    }

    await addWishlistItem(user.uid, productId)
    return true
  }, [user?.uid, wishlistIds])

  const removeFromWishlist = useCallback(async (productId: string) => {
    if (!user?.uid) return
    await removeWishlistItem(user.uid, productId)
  }, [user?.uid])

  return {
    wishlistIds,
    loading,
    toggleWishlist,
    removeFromWishlist,
    isWishlisted: (productId: string) => wishlistIds.includes(productId),
  }
}
