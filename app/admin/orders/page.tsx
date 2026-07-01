'use client'

import { useState } from 'react'
import { useOrders } from '../../../hooks/useOrders'
import { updateOrderStatus } from '../../../services/orderservice'
import Link from 'next/link'
import type { Order } from '../../../types/order'

const ORDER_STATUSES: Order['status'][] = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled']

function statusClass(status: Order['status']) {
  switch (status) {
    case 'Pending':
      return 'bg-[#4b4a1e]/20 text-[#F5D76E]'
    case 'Confirmed':
      return 'bg-[#1e3f6e]/20 text-[#6CB2EB]'
    case 'Packed':
      return 'bg-[#4a2f6e]/20 text-[#B57EEA]'
    case 'Shipped':
      return 'bg-[#6e4a1e]/20 text-[#F6AD55]'
    case 'Delivered':
      return 'bg-[#1e6e40]/20 text-[#7ED957]'
    case 'Cancelled':
      return 'bg-[#6e1e2b]/20 text-[#F56565]'
    default:
      return 'bg-[#C9A227]/20 text-[#C9A227]'
  }
}

function paymentStatusClass(status: Order['paymentStatus']) {
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

export default function AdminOrdersPage() {
  const { orders, loading, refreshOrders } = useOrders()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusUpdate = async (id: string, status: Order['status']) => {
    setIsUpdating(true)
    try {
      await updateOrderStatus(id, status)
      await refreshOrders()
    } catch (error) {
      console.error('Failed to update order status', error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#F5F5F5]">Orders</h1>
          <p className="mt-2 text-sm text-[#F5F5F5]/80">Manage customer orders and update shipment status in real time.</p>
        </div>
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center rounded-full border border-[#C9A227] bg-[#C9A227]/10 px-4 py-2 text-sm font-semibold text-[#C9A227] hover:bg-[#C9A227]/20"
        >
          Admin Dashboard
        </Link>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-[#7A5C3E]/10 bg-[#0b0b0b] p-6">
        {loading ? (
          <div className="py-16 text-center text-[#F5F5F5]/80">Loading orders…</div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-[#F5F5F5]/80">No orders have been placed yet.</div>
        ) : (
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#7A5C3E]/10 text-[#F5F5F5]/80">
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Update</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: Order) => (
                <tr key={order.id} className="border-b border-[#7A5C3E]/10">
                  <td className="px-4 py-4 text-[#F5F5F5]/80">{order.id}</td>
                  <td className="px-4 py-4 text-[#F5F5F5]">{order.customerName}</td>
                  <td className="px-4 py-4 text-[#F5F5F5]/80">{order.email}</td>
                  <td className="px-4 py-4 text-[#F5F5F5]">₹{order.total.toFixed(0)}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${paymentStatusClass(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-[#F5F5F5]/80">{order.createdAt ? order.createdAt.toLocaleString() : '—'}</td>
                  <td className="px-4 py-4">
                    <select
                      value={order.status}
                      disabled={isUpdating}
                      onChange={(event) => order.id && handleStatusUpdate(order.id, event.target.value as Order['status'])}
                      className="rounded-full border border-[#7A5C3E]/20 bg-[#111111] px-3 py-2 text-sm text-[#F5F5F5] outline-none transition hover:border-[#C9A227]"
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status} className="bg-[#111111] text-[#F5F5F5]">
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
