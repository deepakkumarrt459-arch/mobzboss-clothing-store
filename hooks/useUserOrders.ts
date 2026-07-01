'use client'

import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { useAuth } from '@/components/ui/context/AuthContext'
import { db } from '@/lib/firebase'
import type { Order } from '@/types/order'

function toDate(value: unknown): Date | undefined {
  if (value instanceof Date) return value
  if (typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as { toDate?: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate()
  }
  return undefined
}

export function useUserOrders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.uid || !db) {
      setOrders([])
      setLoading(false)
      return
    }

    setLoading(true)

    const ordersRef = collection(db, 'orders')
    const q = query(ordersRef, where('userId', '==', user.uid), orderBy('createdAt', 'desc'))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const nextOrders = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as Record<string, unknown>
          return {
            id: docSnap.id,
            userId: typeof data.userId === 'string' ? data.userId : undefined,
            customerName: typeof data.customerName === 'string' ? data.customerName : '',
            email: typeof data.email === 'string' ? data.email : '',
            phone: typeof data.phone === 'string' ? data.phone : '',
            address: typeof data.address === 'string' ? data.address : '',
            items: Array.isArray(data.items) ? (data.items as Order['items']) : [],
            total: typeof data.total === 'number' ? data.total : 0,
            status: (data.status as Order['status']) ?? 'Pending',
            paymentStatus: (data.paymentStatus as Order['paymentStatus']) ?? 'Paid',
            createdAt: toDate(data.createdAt),
            updatedAt: toDate(data.updatedAt),
          }
        })

        setOrders(nextOrders)
        setLoading(false)
      },
      (error) => {
        console.error('Failed to load user orders', error)
        setOrders([])
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [user?.uid])

  return {
    orders,
    loading,
    refresh: () => {
      if (!user?.uid) {
        setOrders([])
        setLoading(false)
      }
    },
  }
}
