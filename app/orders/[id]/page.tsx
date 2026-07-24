'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/components/ui/context/AuthContext'
import { getOrderById } from '@/services/orderservice'
import Button from '@/components/ui/Button'
import InvoiceActions from '@/components/InvoiceActions'
import OrderTimeline from '@/components/OrderTimeline'
import type { Order } from '@/types/order'
import Image from 'next/image'

export default function OrderDetailPage() {
  const params = useParams()
  const orderId = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : undefined
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login')
    }
  }, [authLoading, router, user])

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId || !user?.uid) {
        setLoading(false)
        return
      }

      try {
        const fetchedOrder = await getOrderById(orderId)
        if (!fetchedOrder || fetchedOrder.userId !== user.uid) {
          setError('Order not found or access denied.')
          setOrder(null)
        } else {
          setOrder(fetchedOrder)
        }
      } catch (fetchError) {
        console.error('Failed to load order details', fetchError)
        setError('Unable to load order details at this time.')
      } finally {
        setLoading(false)
      }
    }

    void fetchOrder()
  }, [orderId, user?.uid])

  const formatDate = (date?: Date) =>
    date ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date) : '-'

  if (loading || authLoading) {
    return <div className="min-h-screen bg-[#090909] p-12 text-[#F5F5F5]">Loading order details…</div>
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#090909] p-12 text-[#F5F5F5]">
        <div className="rounded-3xl border border-[#7A5C3E]/10 bg-[#0b0b0b] p-10 text-center">
          <p className="text-lg font-semibold text-[#F5F5F5]">{error}</p>
          <Button variant="ghost" onClick={() => router.push('/orders')}>
            Back to orders
          </Button>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#090909] p-12 text-[#F5F5F5]">
        <div className="rounded-3xl border border-[#7A5C3E]/10 bg-[#0b0b0b] p-10 text-center">
          <p className="text-lg font-semibold text-[#F5F5F5]">Order not found.</p>
          <Button variant="ghost" onClick={() => router.push('/orders')}>
            Back to orders
          </Button>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#090909] text-[#F5F5F5]">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[#C9A227]">Order details</p>
            <h1 className="text-4xl font-semibold text-[#F5F5F5]">#{order.id}</h1>
            <p className="mt-2 text-sm text-[#F5F5F5]/70">Placed on {formatDate(order.createdAt)}.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => router.push('/orders')}>
              Back to orders
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <section className="space-y-6 rounded-3xl border border-[#7A5C3E]/10 bg-[#0b0b0b] p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#C9A227]">Customer</p>
                <p className="mt-2 text-sm text-[#F5F5F5]">{order.customerName}</p>
                <p className="text-sm text-[#F5F5F5]/70">{order.email}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#C9A227]">Shipping address</p>
                <p className="mt-2 text-sm text-[#F5F5F5]">{order.address}</p>
                <p className="text-sm text-[#F5F5F5]/70">{order.phone}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-[#111111] p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-[#C9A227]">Total</p>
                <p className="mt-2 text-xl font-semibold text-[#F5F5F5]">₹{order.total.toFixed(0)}</p>
              </div>
              <div className="rounded-3xl bg-[#111111] p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-[#C9A227]">Payment</p>
                <p className="mt-2 text-sm font-semibold text-[#F5F5F5]">{order.paymentStatus}</p>
              </div>
              <div className="rounded-3xl bg-[#111111] p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-[#C9A227]">Current status</p>
                <p className="mt-2 text-sm font-semibold text-[#F5F5F5]">{order.status.replace(/_/g, ' ')}</p>
              </div>
            </div>

            <div className="rounded-3xl border border-[#7A5C3E]/10 bg-[#111111] p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-[#C9A227]">Items</p>
              <ul className="mt-4 space-y-3">
                {order.items.map((item) => (
                  <li key={item.productId} className="flex flex-col gap-3 rounded-3xl border border-[#2A2A2A] bg-[#0f0f0f] p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        {item.image ? (
                          <div className="relative h-14 w-14 overflow-hidden rounded-xl">
                            <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized />
                          </div>
                        ) : null}
                      <div>
                        <p className="font-semibold text-[#F5F5F5]">{item.name}</p>
                        <p className="text-sm text-[#F5F5F5]/70">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-[#F5F5F5]">₹{(item.price * item.quantity).toFixed(0)}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-[#7A5C3E]/10 bg-[#0b0b0b] p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-[#C9A227]">Invoice</p>
              <p className="mt-3 text-sm text-[#F5F5F5]/70">Number: {order.invoiceNumber ?? 'Pending'}</p>
              <p className="text-sm text-[#F5F5F5]/70">Generated: {formatDate(order.invoiceGeneratedAt ?? order.createdAt)}</p>
              <div className="mt-4">
                <InvoiceActions order={order} />
              </div>
            </div>

            <div className="rounded-3xl border border-[#7A5C3E]/10 bg-[#0b0b0b] p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-[#C9A227]">Order timeline</p>
              <div className="mt-4">
                <OrderTimeline events={order.trackingHistory} />
              </div>
            </div>

            <div className="rounded-3xl border border-[#7A5C3E]/10 bg-[#0b0b0b] p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-[#C9A227]">Communication</p>
              <p className="mt-3 text-sm text-[#F5F5F5]/70">Last notification: {order.lastEmailType ?? 'None'}</p>
              <p className="text-sm text-[#F5F5F5]/70">Email status: {order.emailStatus ?? 'Unavailable'}</p>
              <p className="text-sm text-[#F5F5F5]/70">Updated: {formatDate(order.lastEmailSentAt ?? order.updatedAt ?? order.createdAt)}</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
