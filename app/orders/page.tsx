'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/ui/context/AuthContext'
import { useUserOrders } from '@/hooks/useUserOrders'
import Button from '@/components/ui/Button'

export default function OrdersPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { orders, loading, refresh } = useUserOrders()

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login')
    }
  }, [authLoading, router, user])

  const formattedDate = (date?: Date) =>
    date ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date) : '-'

  return (
    <main className="min-h-screen bg-[#090909] text-[#F5F5F5]">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[#C9A227]">Orders</p>
            <h1 className="text-4xl font-semibold text-[#F5F5F5]">My orders</h1>
            <p className="mt-2 text-sm text-[#F5F5F5]/70">Review your order history and track each purchase.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => router.push('/account')}>
              Account
            </Button>
            <Button type="button" onClick={refresh}>
              Refresh
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-[#7A5C3E]/10 bg-[#0b0b0b] p-12 text-center text-[#F5F5F5]/70">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-[#7A5C3E]/10 bg-[#0b0b0b] p-12 text-center text-[#F5F5F5]/70">
            You have not placed any orders yet.
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <section key={order.id} className="rounded-3xl border border-[#7A5C3E]/10 bg-[#0b0b0b] p-8">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-[#F5F5F5]/70">Order #{order.id}</p>
                    <h2 className="text-2xl font-semibold text-[#F5F5F5]">{formattedDate(order.createdAt)}</h2>
                  </div>
                  <div className="rounded-full border border-[#C9A227] px-4 py-2 text-sm font-semibold text-[#C9A227]">
                    {order.status}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-[#C9A227]">Items</p>
                    <p className="mt-2 text-sm text-[#F5F5F5]">{order.items.length}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-[#C9A227]">Total</p>
                    <p className="mt-2 text-sm text-[#F5F5F5]">₹{order.total.toFixed(0)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-[#C9A227]">Shipping Address</p>
                    <p className="mt-2 text-sm text-[#F5F5F5]/80">{order.address}</p>
                  </div>
                </div>
                <div className="mt-6 rounded-3xl border border-[#7A5C3E]/10 bg-[#111111] p-4">
                  <p className="text-sm text-[#F5F5F5]/70">Order items</p>
                  <ul className="mt-4 space-y-3">
                    {order.items.map((item) => (
                      <li key={item.productId} className="flex items-center justify-between gap-3 rounded-3xl border border-[#2A2A2A] bg-[#0f0f0f] p-4">
                        <div>
                          <p className="font-semibold text-[#F5F5F5]">{item.name}</p>
                          <p className="text-sm text-[#F5F5F5]/70">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-[#F5F5F5]">₹{(item.price * item.quantity).toFixed(0)}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
