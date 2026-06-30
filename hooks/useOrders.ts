import { useEffect, useState } from 'react'
import type { Order } from '../types/order'
import { getOrders as fetchOrders } from '../services/orderservice'

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const loadOrders = async () => {
    setLoading(true)
    try {
      const data = await fetchOrders()
      setOrders(data)
    } catch (error) {
      console.error('Failed to load orders', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadOrders()
  }, [])

  return {
    orders,
    loading,
    refreshOrders: loadOrders,
  }
}
