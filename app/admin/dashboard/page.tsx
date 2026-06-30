"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/admin/Card'
import Button from '@/components/ui/Button'
import useProducts from '@/hooks/useProducts'
import { useAuth } from '@/components/ui/context/AuthContext'
import { db } from '@/lib/firebase'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { Line, LineChart, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts'
import type { Order, OrderStatus } from '@/types/order'
import type { Product } from '@/types/product'

interface RecentOrder {
  id: string
  customerName: string
  total: number
  status: OrderStatus
  createdAt: string
  itemCount: number
}

interface BestSeller {
  productId: string
  name: string
  quantity: number
  revenue: number
}

interface RevenuePoint {
  label: string
  revenue: number
}

export default function DashboardPage() {
  const { products, loading: loadingProducts } = useProducts()
  const { logout } = useAuth()
  const router = useRouter()

  const [totalOrders, setTotalOrders] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalCustomers, setTotalCustomers] = useState(0)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [bestSellers, setBestSellers] = useState<BestSeller[]>([])
  const [chartData, setChartData] = useState<RevenuePoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const productCount = products.length

  const featuredProducts = useMemo(
    () => products.filter((product) => product.featured).slice(0, 5),
    [products],
  )

  const analyticsProducts = useMemo(() => {
    if (bestSellers.length > 0) {
      return bestSellers
    }

    return featuredProducts.map((product) => ({
      productId: product.id,
      name: product.name,
      quantity: 0,
      revenue: product.price,
    }))
  }, [bestSellers, featuredProducts])

  const handleLogout = async () => {
    await logout()
    router.push('/admin/login')
  }

  useEffect(() => {
    async function loadAnalytics() {
      if (!db) {
        setError('Firestore is not initialized on the client.')
        setLoading(false)
        return
      }

      try {
        const orderQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
        const orderSnapshot = await getDocs(orderQuery)
        const userSnapshot = await getDocs(collection(db, 'users'))

        const customers = userSnapshot.size
        setTotalCustomers(customers)

        let revenue = 0
        const monthlyRevenueMap = new Map<string, number>()
        const sellers = new Map<string, BestSeller>()

        const recent: RecentOrder[] = []

        orderSnapshot.docs.slice(0, 5).forEach((docSnap) => {
          const data = docSnap.data() as Partial<Order>
          const createdAt = data.createdAt?.toDate?.()
          const dateLabel = createdAt
            ? createdAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
            : 'Unknown'
          const total = typeof data.total === 'number' ? data.total : 0
          const items = Array.isArray(data.items) ? data.items : []

          recent.push({
            id: docSnap.id,
            customerName: data.customerName ?? 'Unknown',
            total,
            status: data.status ?? 'Pending',
            createdAt: dateLabel,
            itemCount: items.reduce((count, item) => count + (item?.quantity ?? 0), 0),
          })
        })

        orderSnapshot.docs.forEach((docSnap) => {
          const data = docSnap.data() as Partial<Order>
          const total = typeof data.total === 'number' ? data.total : 0
          revenue += total

          const createdAt = data.createdAt?.toDate?.()
          if (createdAt) {
            const monthLabel = createdAt.toLocaleString('default', { month: 'short', year: 'numeric' })
            monthlyRevenueMap.set(monthLabel, (monthlyRevenueMap.get(monthLabel) ?? 0) + total)
          }

          const items = Array.isArray(data.items) ? data.items : []
          items.forEach((item) => {
            const productId = item?.productId ?? 'unknown'
            const name = item?.name ?? 'Unnamed product'
            const quantity = typeof item?.quantity === 'number' ? item.quantity : 0
            const itemRevenue = typeof item?.price === 'number' ? item.price * quantity : 0

            const existing = sellers.get(productId)
            if (existing) {
              existing.quantity += quantity
              existing.revenue += itemRevenue
            } else {
              sellers.set(productId, {
                productId,
                name,
                quantity,
                revenue: itemRevenue,
              })
            }
          })
        })

        setTotalOrders(orderSnapshot.size)
        setTotalRevenue(revenue)

        const sortedSellers = Array.from(sellers.values())
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 5)

        setBestSellers(sortedSellers)

        const orderedMonths = Array.from(monthlyRevenueMap.entries())
          .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
          .map(([label, revenueValue]) => ({ label, revenue: revenueValue }))

        setChartData(orderedMonths)
      } catch (fetchError) {
        console.error('Unable to load dashboard analytics', fetchError)
        setError('Unable to load dashboard analytics at this time.')
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [products])

  return (
    <section className="space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#F5F5F5]">Analytics</h1>
          <p className="mt-1 text-sm text-[#F5F5F5]/70">
            Overview of product performance, orders, customers, and revenue.
          </p>
        </div>
        <Button onClick={handleLogout} variant="ghost">
          Logout
        </Button>
      </div>

      {error ? (
        <div className="rounded-3xl border border-red-500/20 bg-[#1b0f0f] p-6 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Products" value={productCount} />
        <Card title="Orders" value={totalOrders} />
        <Card title="Customers" value={totalCustomers} />
        <Card title="Revenue" value={`₹${totalRevenue.toLocaleString()}`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <div className="rounded-3xl border border-[#7A5C3E]/10 bg-[#0b0b0b] p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#D9D0A7]">Revenue</p>
              <h2 className="mt-2 text-2xl font-semibold text-[#F5F5F5]">Revenue Trend</h2>
            </div>
            <span className="rounded-full bg-[#C9A227]/10 px-3 py-1 text-xs font-semibold text-[#C9A227]">
              Last {chartData.length || 0} months
            </span>
          </div>

          {loading ? (
            <div className="flex h-[320px] items-center justify-center text-sm text-[#F5F5F5]/70">Loading chart…</div>
          ) : chartData.length > 0 ? (
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
                  <CartesianGrid stroke="#3e3e3e" strokeDasharray="3 3" />
                  <XAxis dataKey="label" stroke="#F5F5F5" tick={{ fill: '#F5F5F5', fontSize: 12 }} />
                  <YAxis stroke="#F5F5F5" tick={{ fill: '#F5F5F5', fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111111', borderColor: '#7A5C3E', color: '#F5F5F5' }} />
                  <Line type="monotone" dataKey="revenue" stroke="#C9A227" strokeWidth={3} dot={{ r: 3, fill: '#C9A227' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[320px] items-center justify-center text-sm text-[#F5F5F5]/70">
              No revenue data available yet.
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-[#7A5C3E]/10 bg-[#0b0b0b] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#D9D0A7]">Best selling</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#F5F5F5]">Top products</h2>

            <div className="mt-6 space-y-4">
              {analyticsProducts.length > 0 ? (
                analyticsProducts.map((product, index) => (
                  <div key={product.productId} className="flex items-center justify-between rounded-3xl border border-[#7A5C3E]/10 bg-[#111111] p-4">
                    <div>
                      <p className="text-sm font-semibold text-[#F5F5F5]">{index + 1}. {product.name}</p>
                      <p className="text-xs text-[#F5F5F5]/70">Qty sold: {product.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold text-[#C9A227]">₹{product.revenue.toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-[#7A5C3E]/10 bg-[#111111] p-6 text-sm text-[#F5F5F5]/70">
                  No product analytics available yet.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-[#7A5C3E]/10 bg-[#0b0b0b] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#D9D0A7]">Recent orders</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#F5F5F5]">Latest 5 orders</h2>

            <div className="mt-6 space-y-3">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div key={order.id} className="rounded-3xl border border-[#7A5C3E]/10 bg-[#111111] p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-[#F5F5F5]">{order.customerName}</p>
                        <p className="text-xs text-[#F5F5F5]/70">{order.createdAt}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-[#C9A227]">₹{order.total.toLocaleString()}</p>
                        <p className="text-xs text-[#F5F5F5]/70">{order.itemCount} items</p>
                      </div>
                    </div>
                    <div className="mt-3 inline-flex items-center rounded-full bg-[#C9A227]/10 px-3 py-1 text-xs font-semibold text-[#C9A227]">
                      {order.status}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-[#7A5C3E]/10 bg-[#111111] p-6 text-sm text-[#F5F5F5]/70">
                  No recent orders found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-[#7A5C3E]/10 bg-[#0b0b0b] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#D9D0A7]">Store summary</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-[#7A5C3E]/10 bg-[#111111] p-4">
            <p className="text-sm text-[#F5F5F5]/70">Revenue</p>
            <p className="mt-2 text-xl font-semibold text-[#F5F5F5]">₹{totalRevenue.toLocaleString()}</p>
          </div>
          <div className="rounded-3xl border border-[#7A5C3E]/10 bg-[#111111] p-4">
            <p className="text-sm text-[#F5F5F5]/70">Total Orders</p>
            <p className="mt-2 text-xl font-semibold text-[#F5F5F5]">{totalOrders}</p>
          </div>
          <div className="rounded-3xl border border-[#7A5C3E]/10 bg-[#111111] p-4">
            <p className="text-sm text-[#F5F5F5]/70">Customers</p>
            <p className="mt-2 text-xl font-semibold text-[#F5F5F5]">{totalCustomers}</p>
          </div>
          <div className="rounded-3xl border border-[#7A5C3E]/10 bg-[#111111] p-4">
            <p className="text-sm text-[#F5F5F5]/70">Products</p>
            <p className="mt-2 text-xl font-semibold text-[#F5F5F5]">{productCount}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
