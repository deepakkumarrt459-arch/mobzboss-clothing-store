'use client'

import { useState } from 'react'
import { useOrders } from '../../../hooks/useOrders'
import { updateOrderStatus } from '../../../services/orderservice'
import Link from 'next/link'
import type { Order } from '../../../types/order'

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
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: Order) => (
                <tr key={order.id} className="border-b border-[#7A5C3E]/10">
                  <td className="px-4 py-4 text-[#F5F5F5]">{order.customerName}</td>
                  <td className="px-4 py-4 text-[#F5F5F5]/80">{order.phone}</td>
                  <td className="px-4 py-4 text-[#F5F5F5]">₹{order.total.toFixed(0)}</td>
                  <td className="px-4 py-4">
                    <span className="inline-flex rounded-full bg-[#C9A227]/15 px-3 py-1 text-xs font-semibold text-[#C9A227]">
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-[#F5F5F5]/80">{order.createdAt ? order.createdAt.toLocaleString() : '—'}</td>
                  <td className="px-4 py-4 space-x-2">
                    <button
                      type="button"
                      disabled={order.status !== 'Pending' || isUpdating}
                      onClick={() => order.id && handleStatusUpdate(order.id, 'Shipped')}
                      className="rounded-full bg-[#C9A227] px-3 py-2 text-xs font-semibold text-[#111111] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Mark as Shipped
                    </button>
                    <button
                      type="button"
                      disabled={order.status === 'Delivered' || isUpdating}
                      onClick={() => order.id && handleStatusUpdate(order.id, 'Delivered')}
                      className="rounded-full border border-[#F5F5F5]/10 bg-transparent px-3 py-2 text-xs font-semibold text-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-50 hover:border-[#C9A227] hover:text-[#C9A227]"
                    >
                      Mark as Delivered
                    </button>
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
