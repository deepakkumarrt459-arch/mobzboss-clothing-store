'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/ui/context/AuthContext'
import { useUserOrders } from '@/hooks/useUserOrders'
import Button from '@/components/ui/Button'
import InvoiceActions from '@/components/InvoiceActions'
import OrderTimeline from '@/components/OrderTimeline'
import Image from 'next/image'

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

  const normalizeStatus = (status: string) => {
    const value = status.toLowerCase().replace(/ /g, '_')

    switch (value) {
      case 'confirmed':
        return 'confirmed'
      case 'processing':
        return 'processing'
      case 'packed':
        return 'packed'
      case 'out_for_delivery':
      case 'outfor_delivery':
      case 'out for delivery':
        return 'out_for_delivery'
      case 'shipped':
        return 'shipped'
      case 'delivered':
        return 'delivered'
      case 'cancelled':
        return 'cancelled'
      case 'pending':
      default:
        return 'pending'
    }
  }
 
    const statusClass = (status: string) => {
      switch (normalizeStatus(status)) {
        case 'pending':
          return 'bg-[#4b4a1e]/20 text-[#F5D76E]'
        case 'confirmed':
          return 'bg-[#1e3f6e]/20 text-[#6CB2EB]'
        case 'processing':
          return 'bg-[#4a2f6e]/20 text-[#B57EEA]'
        case 'packed':
          return 'bg-[#6e4a1e]/20 text-[#F6AD55]'
        case 'out_for_delivery':
          return 'bg-[#1e6e40]/20 text-[#7ED957]'
        case 'shipped':
          return 'bg-[#30475e]/20 text-[#94b7d2]'
        case 'delivered':
          return 'bg-[#1e6e40]/20 text-[#7ED957]'
        case 'cancelled':
          return 'bg-[#6e1e2b]/20 text-[#F56565]'
        default:
          return 'bg-[#C9A227]/20 text-[#C9A227]'
      }
    }

  const formatStatus = (status: string) => {
    const normalized = normalizeStatus(status)
    return normalized.charAt(0).toUpperCase() + normalized.slice(1)
  }

  const paymentClass = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-[#1e6e40]/20 text-[#7ED957]'
      case 'Pending':
        return 'bg-[#4b4a1e]/20 text-[#F5D76E]'
      case 'Failed':
        return 'bg-[#6e1e2b]/20 text-[#F56565]'
      case 'Refunded':
        return 'bg-[#1e3f6e]/20 text-[#6CB2EB]'
      default:
        return 'bg-[#C9A227]/20 text-[#C9A227]'
    }
  }

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
            No orders found.
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
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClass(order.status)}`}>
                      {formatStatus(order.status)}
                    </span>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${paymentClass(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </span>
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
                    <p className="text-xs uppercase tracking-[0.3em] text-[#C9A227]">Last updated</p>
                    <p className="mt-2 text-sm text-[#F5F5F5]/80">{formattedDate(order.updatedAt ?? order.createdAt)}</p>
                  </div>
                </div>
                <div className="mt-6 rounded-3xl border border-[#7A5C3E]/10 bg-[#111111] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-[#F5F5F5]/70">Order items</p>
                    <div className="flex flex-wrap items-center gap-3">
                      {order.invoiceNumber ? (
                        <span className="rounded-full bg-[#111111] px-3 py-1 text-xs text-[#F5F5F5]/70">{order.invoiceNumber}</span>
                      ) : null}
                      {order.id ? (
                        <Link href={`/orders/${order.id}`} className="text-sm font-semibold text-[#C9A227] hover:text-[#E0C46D]">
                          View details
                        </Link>
                      ) : null}
                    </div>
                  </div>
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
                <div className="mt-6 rounded-3xl border border-[#7A5C3E]/10 bg-[#111111] p-6">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#C9A227]">Invoice</p>
                      <p className="text-xs text-[#F5F5F5]/70">{order.invoiceNumber ?? 'Generating soon'}</p>
                    </div>
                    <InvoiceActions order={order} />
                  </div>
                </div>
                <div className="mt-6 rounded-3xl border border-[#7A5C3E]/10 bg-[#111111] p-6">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#C9A227]">Tracking timeline</p>
                    <p className="text-xs text-[#F5F5F5]/70">Updated {formattedDate(order.updatedAt ?? order.createdAt)}</p>
                  </div>
                  <OrderTimeline events={order.trackingHistory} />
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
