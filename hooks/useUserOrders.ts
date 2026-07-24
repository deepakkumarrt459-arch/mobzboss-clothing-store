'use client'

import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { useAuth } from '@/components/ui/context/AuthContext'
import { db } from '@/lib/firebase'
import { normalizeOrderStatus, parseFirestoreDate, parseTrackingHistory } from '@/lib/orderUtils'
import type { Order } from '@/types/order'

export function useUserOrders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.uid || !db) {
      void Promise.resolve().then(() => {
        setOrders([])
        setLoading(false)
      })
      return
    }

    setLoading(true)

    const ordersRef = collection(db, 'orders')
    const q = query(ordersRef, where('userId', '==', user.uid))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const nextOrders = snapshot.docs
          .map((docSnap) => {
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
              status: normalizeOrderStatus(data.status),
              paymentStatus: (data.paymentStatus as Order['paymentStatus']) ?? 'Paid',
              paymentMethod: typeof data.paymentMethod === 'string' ? data.paymentMethod : undefined,
              tax: typeof data.tax === 'number' ? data.tax : undefined,
              couponCode: typeof data.couponCode === 'string' ? data.couponCode : undefined,
              discount: typeof data.discount === 'number' ? data.discount : undefined,
              invoiceNumber: typeof data.invoiceNumber === 'string' ? data.invoiceNumber : undefined,
              invoiceGeneratedAt: parseFirestoreDate(data.invoiceGeneratedAt),
              trackingHistory: parseTrackingHistory(data.trackingHistory),
              createdAt: parseFirestoreDate(data.createdAt),
              updatedAt: parseFirestoreDate(data.updatedAt),
            }
          })
          .sort((a, b) => {
            const aTime = a.createdAt?.getTime() ?? 0
            const bTime = b.createdAt?.getTime() ?? 0
            return bTime - aTime
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
