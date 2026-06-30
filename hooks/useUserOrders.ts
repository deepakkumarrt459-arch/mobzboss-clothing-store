'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/ui/context/AuthContext'
import type { Order } from '@/types/order'
import { getOrdersByUserId } from '@/services/orderservice'

export function useUserOrders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const loadOrders = async () => {
      setLoading(true)
      if (!user?.uid) {
        setOrders([])
        setLoading(false)
        return
      }

      try {
        const fetchedOrders = await getOrdersByUserId(user.uid)
        if (!cancelled) {
          setOrders(fetchedOrders)
        }
      } catch (error) {
        console.error('Failed to load user orders', error)
        if (!cancelled) {
          setOrders([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadOrders()

    return () => {
      cancelled = true
    }
  }, [user?.uid])

  return {
    orders,
    loading,
    refresh: async () => {
      if (!user?.uid) {
        setOrders([])
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        setOrders(await getOrdersByUserId(user.uid))
      } catch (error) {
        console.error('Failed to refresh user orders', error)
      } finally {
        setLoading(false)
      }
    },
  }
}
