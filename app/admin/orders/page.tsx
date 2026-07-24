'use client'

import { useState } from 'react'
import { useOrders } from '../../../hooks/useOrders'
import { resendOrderEmail, updateOrderStatus, getOrderById } from '../../../services/orderservice'
import { buildInvoicePdf } from '../../../lib/invoice'
import Link from 'next/link'
import type { Order } from '../../../types/order'

const ORDER_STATUSES: Array<{ value: Order['status']; label: string }> = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'packed', label: 'Packed' },
  { value: 'out_for_delivery', label: 'Out for delivery' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

function normalizeStatus(status: Order['status'] | string) {
  const value = String(status).toLowerCase().replace(/ /g, '_')

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

function statusLabel(status: Order['status'] | string) {
  const normalized = normalizeStatus(status)
  if (normalized === 'out_for_delivery') {
    return 'Out for delivery'
  }
  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

function statusClass(status: Order['status'] | string) {
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
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const [isResending, setIsResending] = useState(false)
  const [resendingOrderId, setResendingOrderId] = useState<string | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)

  const handleStatusUpdate = async (id: string, status: Order['status']) => {
    setIsUpdating(true)
    setUpdatingOrderId(id)
    setFeedbackMessage(null)

    try {
      await updateOrderStatus(id, status)
      await refreshOrders()
      setFeedbackMessage(`Status updated to ${statusLabel(status)}.`)
    } catch (error) {
      console.error('Failed to update order status', error)
      setFeedbackMessage('Unable to update order status right now.')
    } finally {
      setIsUpdating(false)
      setUpdatingOrderId(null)
    }
  }

  const handleDownloadInvoice = async (order: Order) => {
    try {
      // Fetch complete order to ensure all invoice data is present
      const completeOrder = order.id ? await getOrderById(order.id) : null
      const orderToUse = completeOrder ?? order

      const pdfBytes = await buildInvoicePdf(orderToUse)
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${orderToUse.invoiceNumber ?? 'invoice'}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download invoice', error)
      setFeedbackMessage('Unable to generate invoice PDF.')
    }
  }

  const handleResendEmail = async (id: string) => {
    setIsResending(true)
    setResendingOrderId(id)
    setFeedbackMessage(null)

    try {
      await resendOrderEmail(id)
      await refreshOrders()
      setFeedbackMessage('Email resent successfully.')
    } catch (error) {
      console.error('Failed to resend order email', error)
      setFeedbackMessage('Unable to resend email right now.')
    } finally {
      setIsResending(false)
      setResendingOrderId(null)
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

      {feedbackMessage ? (
        <div className="mb-4 rounded-2xl border border-[#C9A227]/20 bg-[#C9A227]/10 px-4 py-3 text-sm text-[#F5D76E]">
          {feedbackMessage}
        </div>
      ) : null}

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
                <th className="px-4 py-3">Invoice</th>
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
                  <td className="px-4 py-4 text-[#F5F5F5]/80">{order.invoiceNumber ?? '—'}</td>
                  <td className="px-4 py-4 text-[#F5F5F5]">₹{order.total.toFixed(0)}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${paymentStatusClass(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClass(order.status)}`}>
                      {statusLabel(order.status)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-[#F5F5F5]/80">{order.createdAt ? order.createdAt.toLocaleString() : '—'}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-2">
                      <select
                        value={normalizeStatus(order.status)}
                        disabled={isUpdating || updatingOrderId === order.id}
                        onChange={(event) => order.id && handleStatusUpdate(order.id, event.target.value as Order['status'])}
                        className="rounded-full border border-[#7A5C3E]/20 bg-[#111111] px-3 py-2 text-sm text-[#F5F5F5] outline-none transition hover:border-[#C9A227]"
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option key={status.value} value={status.value} className="bg-[#111111] text-[#F5F5F5]">
                            {status.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        disabled={isResending || resendingOrderId === order.id}
                        onClick={() => order.id && handleResendEmail(order.id)}
                        className="rounded-full border border-[#7A5C227]/20 bg-[#111111] px-3 py-2 text-sm font-semibold text-[#F5F5F5] transition hover:border-[#C9A227] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {resendingOrderId === order.id ? 'Resending…' : 'Resend Email'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadInvoice(order)}
                        className="rounded-full border border-[#7A5C227]/20 bg-[#111111] px-3 py-2 text-sm font-semibold text-[#F5F5F5] transition hover:border-[#C9A227]"
                      >
                        Download Invoice
                      </button>
                      {order.emailStatus ? (
                        <span className="text-xs text-[#F5F5F5]/80">
                          Email {order.emailStatus} {order.lastEmailType ? `(${order.lastEmailType.replace('order_', '').replace('_', ' ')})` : ''}
                        </span>
                      ) : null}
                    </div>
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
