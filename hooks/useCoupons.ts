'use client'

import { useMemo, useState } from 'react'
import { getCouponByCode } from '@/services/couponService'
import type { Coupon } from '@/types/coupon'

export function useCouponValidation() {
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const resetCoupon = () => {
    setAppliedCoupon(null)
    setMessage('')
  }

  const applyCoupon = async (code: string, subtotal: number) => {
    if (!code.trim()) {
      setAppliedCoupon(null)
      setMessage('Please enter a coupon code.')
      return null
    }

    setLoading(true)
    try {
      const coupon = await getCouponByCode(code.trim())
      if (!coupon) {
        setAppliedCoupon(null)
        setMessage('Invalid coupon code.')
        return null
      }

      const now = new Date()
      const expiry = coupon.expiry ? new Date(coupon.expiry) : null
      if (expiry && expiry < now) {
        setAppliedCoupon(null)
        setMessage('This coupon has expired.')
        return null
      }

      if (subtotal < coupon.minimumOrder) {
        setAppliedCoupon(null)
        setMessage(`Minimum order amount is ₹${coupon.minimumOrder}.`)
        return null
      }

      setAppliedCoupon(coupon)
      setMessage('Coupon applied successfully.')
      return coupon
    } finally {
      setLoading(false)
    }
  }

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0
    if (appliedCoupon.type === 'percentage') {
      return Math.min((appliedCoupon.value / 100) * 0, 0)
    }
    return 0
  }, [appliedCoupon])

  return {
    appliedCoupon,
    message,
    loading,
    applyCoupon,
    resetCoupon,
    discountAmount,
  }
}
