"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import Card from '@/components/admin/Card'
import Button from '@/components/ui/Button'
import useProducts from '@/hooks/useProducts'
import { useAuth } from '@/components/ui/context/AuthContext'
import { db } from '@/lib/firebase'
import { getRecentOrders, getTotalCustomers, getTotalRevenue } from '@/lib/adminAnalytics'
import type { Order, OrderStatus } from '@/types/order'

interface RecentOrderRow {
  id: string
  customerName: string
  total: number
  status: OrderStatus
  createdAt: string
  itemCount: number
}

interface TopCustomerRow {
  id: string
  name: string
  email: string
  orders: number
  revenue: number
}

interface TopProductRow {
  productId: string
  name: string
  quantity: number
  revenue: number
  category: string
}

interface CategorySaleRow {
  name: string
  value: number
}

const chartColors = ['#C9A227', '#8B6A2F', '#D8B24F', '#7A5C3E', '#E0C46D']

function normalizeStatus(status: unknown): string {
  return String(status ?? 'Pending').toLowerCase()
}

function toDate(value: unknown): Date | null {
  if (!value) return null
  if (value instanceof Date) return value

  type HasToDate = { toDate: () => Date }
  if (typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as HasToDate).toDate === 'function') {
    return (value as HasToDate).toDate()
  }

  return null
}

export default function DashboardPage() {
  const { products, loading: productsLoading } = useProducts()
  const { logout } = useAuth()
  const router = useRouter()

  const [orders, setOrders] = useState<Order[]>([])
  const [totalCustomers, setTotalCustomers] = useState(0)
  const [activeCoupons, setActiveCoupons] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const productCount = products.length
  const lowStockProducts = useMemo(
    () => products.filter((product) => product.stock > 0 && product.stock <= 5).slice(0, 6),
    [products],
  )

  useEffect(() => {
    let isMounted = true

    if (!db) {
      setError('Firestore is not initialized on the client.')
      setLoading(false)
      return
    }

    const firestoreDb = db

    const loadInitialStats = async () => {
      try {
        const [, initialCustomers, initialOrders] = await Promise.all([
          getTotalRevenue(),
          getTotalCustomers(),
          getRecentOrders(5),
        ])

        if (!isMounted) return
        setTotalCustomers(initialCustomers)
        setOrders(initialOrders as Order[])
        setLoading(false)
      } catch (fetchError) {
        console.error('Unable to load dashboard analytics', fetchError)
        if (isMounted) {
          setError('Unable to load dashboard analytics at this time.')
          setLoading(false)
        }
      }
    }

    loadInitialStats()

    const ordersUnsubscribe = onSnapshot(
      query(collection(firestoreDb, 'orders'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        if (!isMounted) return
        const nextOrders = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Partial<Order>),
        })) as Order[]
        setOrders(nextOrders)
        setLoading(false)
      },
      (snapshotError) => {
        console.error('Orders listener failed', snapshotError)
        if (isMounted) {
          setError('Unable to live update dashboard orders.')
        }
      },
    )

    const usersUnsubscribe = onSnapshot(
      collection(firestoreDb, 'users'),
      (snapshot) => {
        if (isMounted) setTotalCustomers(snapshot.size)
      },
      (snapshotError) => {
        console.error('Customers listener failed', snapshotError)
      },
    )

    const couponsUnsubscribe = onSnapshot(
      collection(firestoreDb, 'coupons'),
      (snapshot) => {
        if (isMounted) {
          const active = snapshot.docs.filter((docSnap) => Boolean(docSnap.data().active)).length
          setActiveCoupons(active)
        }
      },
      (snapshotError) => {
        console.error('Coupons listener failed', snapshotError)
      },
    )

    return () => {
      isMounted = false
      ordersUnsubscribe()
      usersUnsubscribe()
      couponsUnsubscribe()
    }
  }, [])

  const metrics = useMemo(() => {
    const now = new Date()
    const today = new Date(now)
    today.setHours(0, 0, 0, 0)

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const last30Days = Array.from({ length: 30 }, (_, index) => {
      const currentDate = new Date(now)
      currentDate.setDate(now.getDate() - (29 - index))
      currentDate.setHours(0, 0, 0, 0)
      return {
        label: currentDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        key: currentDate.toISOString().split('T')[0],
        revenue: 0,
        orders: 0,
      }
    })
    const revenueByMonth = new Map<string, number>()
    const topProductsMap = new Map<string, TopProductRow>()
    const categorySalesMap = new Map<string, number>()
    const topCustomersMap = new Map<string, TopCustomerRow>()

    let totalRevenue = 0
    let todaysRevenue = 0
    let monthlyRevenue = 0
    let pendingOrders = 0
    let deliveredOrders = 0
    let cancelledOrders = 0

    const productLookup = new Map(products.map((product) => [product.id, product]))

    orders.forEach((order) => {
      const createdAt = toDate(order.createdAt)
      const total = typeof order.total === 'number' ? order.total : 0
      totalRevenue += total

      if (createdAt && createdAt >= today) {
        todaysRevenue += total
      }
      if (createdAt && createdAt >= monthStart) {
        monthlyRevenue += total
      }

      if (createdAt) {
        const monthLabel = createdAt.toLocaleString('default', { month: 'short', year: 'numeric' })
        revenueByMonth.set(monthLabel, (revenueByMonth.get(monthLabel) ?? 0) + total)
      }

      const status = normalizeStatus(order.status)
      if (status.includes('pending')) pendingOrders += 1
      if (status.includes('delivered')) deliveredOrders += 1
      if (status.includes('cancel')) cancelledOrders += 1

      const dateKey = createdAt ? createdAt.toISOString().split('T')[0] : null
      const last30DayPoint = dateKey
        ? last30Days.find((point) => point.key === dateKey)
        : null
      if (last30DayPoint) {
        last30DayPoint.revenue += total
        last30DayPoint.orders += 1
      }

      const customerKey = order.email || order.customerName || 'guest'
      const existingCustomer = topCustomersMap.get(customerKey)
      if (existingCustomer) {
        existingCustomer.orders += 1
        existingCustomer.revenue += total
      } else {
        topCustomersMap.set(customerKey, {
          id: customerKey,
          name: order.customerName || 'Guest customer',
          email: order.email || 'No email',
          orders: 1,
          revenue: total,
        })
      }

      const items = Array.isArray(order.items) ? order.items : []
      items.forEach((item) => {
        const productId = item?.productId ?? 'unknown'
        const quantity = typeof item?.quantity === 'number' ? item.quantity : 0
        const unitPrice = typeof item?.price === 'number' ? item.price : 0
        const itemRevenue = unitPrice * quantity

        const existingProduct = topProductsMap.get(productId)
        const productMeta = productLookup.get(productId)
        const category = productMeta?.category ?? 'Uncategorized'
        if (existingProduct) {
          existingProduct.quantity += quantity
          existingProduct.revenue += itemRevenue
        } else {
          topProductsMap.set(productId, {
            productId,
            name: item?.name ?? 'Unnamed product',
            quantity,
            revenue: itemRevenue,
            category,
          })
        }

        categorySalesMap.set(category, (categorySalesMap.get(category) ?? 0) + itemRevenue)
      })
    })

    const revenueChart = Array.from(revenueByMonth.entries())
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([label, revenueValue]) => ({ label, revenue: revenueValue }))

    const recentOrders: RecentOrderRow[] = orders.slice(0, 5).map((order) => {
      const createdAt = toDate(order.createdAt)
      const totalItems = (Array.isArray(order.items) ? order.items : []).reduce((sum, item) => sum + (typeof item?.quantity === 'number' ? item.quantity : 0), 0)
      return {
        id: order.id ?? 'unknown',
        customerName: order.customerName || 'Guest customer',
        total: typeof order.total === 'number' ? order.total : 0,
        status: order.status ?? 'Pending',
        createdAt: createdAt ? createdAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown',
        itemCount: totalItems,
      }
    })

    const topCustomers = Array.from(topCustomersMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    const topSellingProducts = Array.from(topProductsMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)

    const categorySales: CategorySaleRow[] = Array.from(categorySalesMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }))

    return {
      totalRevenue,
      todaysRevenue,
      monthlyRevenue,
      totalOrders: orders.length,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      totalCustomers,
      totalProducts: productCount,
      recentOrders,
      topCustomers,
      topSellingProducts,
      revenueChart,
      orderTrend: last30Days,
      monthlyRevenueChart: revenueChart,
      categorySales,
      activeCoupons,
    }
  }, [activeCoupons, orders, productCount, products, totalCustomers])

  const isLoading = loading || productsLoading

  const handleLogout = async () => {
    await logout()
    router.push('/admin/login')
  }

  return (
    <section className="space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#F5F5F5]">Sales Analytics</h1>
          <p className="mt-1 text-sm text-[#F5F5F5]/70">
            Monitor revenue, orders, stock health, and customer performance in real time.
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

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <Card title="Total Revenue" value={isLoading ? '…' : `₹${metrics.totalRevenue.toLocaleString()}`} />
        <Card title="Today's Revenue" value={isLoading ? '…' : `₹${metrics.todaysRevenue.toLocaleString()}`} />
        <Card title="Monthly Revenue" value={isLoading ? '…' : `₹${metrics.monthlyRevenue.toLocaleString()}`} />
        <Card title="Total Orders" value={isLoading ? '…' : metrics.totalOrders} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <Card title="Pending Orders" value={isLoading ? '…' : metrics.pendingOrders} />
        <Card title="Delivered Orders" value={isLoading ? '…' : metrics.deliveredOrders} />
        <Card title="Cancelled Orders" value={isLoading ? '…' : metrics.cancelledOrders} />
        <Card title="Total Customers" value={isLoading ? '…' : metrics.totalCustomers} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <Card title="Total Products" value={isLoading ? '…' : metrics.totalProducts} />
        <Card title="Low Stock Products" value={isLoading ? '…' : lowStockProducts.length} />
        <Card title="Active Coupons" value={isLoading ? '…' : metrics.activeCoupons} />
        <Card title="Out of Stock" value={isLoading ? '…' : products.filter((product) => product.stock <= 0).length} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <div className="rounded-3xl border border-[#7A5C3E]/10 bg-[#0b0b0b] p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#D9D0A7]">Revenue</p>
              <h2 className="mt-2 text-2xl font-semibold text-[#F5F5F5]">Last 30 Days</h2>
            </div>
            <span className="rounded-full bg-[#C9A227]/10 px-3 py-1 text-xs font-semibold text-[#C9A227]">Live</span>
          </div>

          {isLoading ? (
            <div className="h-[320px] animate-pulse rounded-2xl bg-[#111111]" />
          ) : metrics.orderTrend.length > 0 ? (
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.orderTrend} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid stroke="#3e3e3e" strokeDasharray="3 3" />
                  <XAxis dataKey="label" stroke="#F5F5F5" tick={{ fill: '#F5F5F5', fontSize: 12 }} />
                  <YAxis stroke="#F5F5F5" tick={{ fill: '#F5F5F5', fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111111', borderColor: '#7A5C3E', color: '#F5F5F5' }} />
                  <Line type="monotone" dataKey="revenue" stroke="#C9A227" strokeWidth={3} dot={{ r: 3, fill: '#C9A227' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[320px] items-center justify-center text-sm text-[#F5F5F5]/70">No revenue data yet.</div>
          )}
        </div>

        <div className="rounded-3xl border border-[#7A5C3E]/10 bg-[#0b0b0b] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#D9D0A7]">Orders</p>
          <h2 className="mt-2 text-2xl font-semibold text-[#F5F5F5]">Last 30 Days</h2>
          {isLoading ? (
            <div className="mt-6 h-[320px] animate-pulse rounded-2xl bg-[#111111]" />
          ) : metrics.orderTrend.length > 0 ? (
            <div className="mt-6 h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.orderTrend} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid stroke="#3e3e3e" strokeDasharray="3 3" />
                  <XAxis dataKey="label" stroke="#F5F5F5" tick={{ fill: '#F5F5F5', fontSize: 12 }} />
                  <YAxis stroke="#F5F5F5" tick={{ fill: '#F5F5F5', fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111111', borderColor: '#7A5C3E', color: '#F5F5F5' }} />
                  <Line type="monotone" dataKey="orders" stroke="#8B6A2F" strokeWidth={3} dot={{ r: 3, fill: '#8B6A2F' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="mt-6 flex h-[320px] items-center justify-center text-sm text-[#F5F5F5]/70">No order activity yet.</div>
          )}
        </div>
      </div>

      <div className="grid gap-6 2xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-[#7A5C3E]/10 bg-[#0b0b0b] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#D9D0A7]">Monthly revenue</p>
          <h2 className="mt-2 text-2xl font-semibold text-[#F5F5F5]">Revenue by month</h2>
          {isLoading ? (
            <div className="mt-6 h-[320px] animate-pulse rounded-2xl bg-[#111111]" />
          ) : metrics.monthlyRevenueChart.length > 0 ? (
            <div className="mt-6 h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.monthlyRevenueChart}>
                  <CartesianGrid stroke="#3e3e3e" strokeDasharray="3 3" />
                  <XAxis dataKey="label" stroke="#F5F5F5" tick={{ fill: '#F5F5F5', fontSize: 12 }} />
                  <YAxis stroke="#F5F5F5" tick={{ fill: '#F5F5F5', fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111111', borderColor: '#7A5C3E', color: '#F5F5F5' }} />
                  <Bar dataKey="revenue" fill="#C9A227" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="mt-6 flex h-[320px] items-center justify-center text-sm text-[#F5F5F5]/70">No monthly revenue history.</div>
          )}
        </div>

        <div className="rounded-3xl border border-[#7A5C3E]/10 bg-[#0b0b0b] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#D9D0A7]">Category sales</p>
          <h2 className="mt-2 text-2xl font-semibold text-[#F5F5F5]">Performance by category</h2>
          {isLoading ? (
            <div className="mt-6 h-[320px] animate-pulse rounded-2xl bg-[#111111]" />
          ) : metrics.categorySales.length > 0 ? (
            <div className="mt-6 h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={metrics.categorySales} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={3}>
                    {metrics.categorySales.map((entry, index) => (
                      <Cell key={`${entry.name}-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#111111', borderColor: '#7A5C3E', color: '#F5F5F5' }} />
                  <Legend wrapperStyle={{ color: '#F5F5F5' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="mt-6 flex h-[320px] items-center justify-center text-sm text-[#F5F5F5]/70">No category sales yet.</div>
          )}
        </div>
      </div>

      <div className="grid gap-6 2xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-[#7A5C3E]/10 bg-[#0b0b0b] p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#D9D0A7]">Recent Orders</p>
              <h2 className="text-2xl font-semibold text-[#F5F5F5]">Latest transactions</h2>
            </div>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-16 animate-pulse rounded-2xl bg-[#111111]" />
              ))}
            </div>
          ) : metrics.recentOrders.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-[#7A5C3E]/10">
              <table className="min-w-full divide-y divide-[#7A5C3E]/10 text-sm">
                <thead className="bg-[#111111] text-[#D9D0A7]">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Customer</th>
                    <th className="px-4 py-3 text-left font-medium">Items</th>
                    <th className="px-4 py-3 text-left font-medium">Total</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#7A5C3E]/10 bg-[#0f0f0f]">
                  {metrics.recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-4 py-3 text-[#F5F5F5]">{order.customerName}</td>
                      <td className="px-4 py-3 text-[#F5F5F5]/80">{order.itemCount}</td>
                      <td className="px-4 py-3 text-[#C9A227]">₹{order.total.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-[#C9A227]/10 px-2.5 py-1 text-xs font-semibold text-[#C9A227]">
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-3xl border border-[#7A5C3E]/10 bg-[#111111] p-6 text-sm text-[#F5F5F5]/70">No recent orders yet.</div>
          )}
        </div>

        <div className="rounded-3xl border border-[#7A5C3E]/10 bg-[#0b0b0b] p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#D9D0A7]">Top Customers</p>
              <h2 className="text-2xl font-semibold text-[#F5F5F5]">Best spenders</h2>
            </div>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-14 animate-pulse rounded-2xl bg-[#111111]" />
              ))}
            </div>
          ) : metrics.topCustomers.length > 0 ? (
            <div className="space-y-3">
              {metrics.topCustomers.map((customer) => (
                <div key={customer.id} className="flex items-center justify-between rounded-2xl border border-[#7A5C3E]/10 bg-[#111111] p-4">
                  <div>
                    <p className="text-sm font-semibold text-[#F5F5F5]">{customer.name}</p>
                    <p className="text-xs text-[#F5F5F5]/70">{customer.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#C9A227]">₹{customer.revenue.toLocaleString()}</p>
                    <p className="text-xs text-[#F5F5F5]/70">{customer.orders} orders</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-[#7A5C3E]/10 bg-[#111111] p-6 text-sm text-[#F5F5F5]/70">No customer insights yet.</div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-[#7A5C3E]/10 bg-[#0b0b0b] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#D9D0A7]">Top Selling Products</p>
          <h2 className="mt-2 text-2xl font-semibold text-[#F5F5F5]">Best performers</h2>
          {isLoading ? (
            <div className="mt-6 space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-14 animate-pulse rounded-2xl bg-[#111111]" />
              ))}
            </div>
          ) : metrics.topSellingProducts.length > 0 ? (
            <div className="mt-6 space-y-3">
              {metrics.topSellingProducts.map((product, index) => (
                <div key={product.productId} className="flex items-center justify-between rounded-2xl border border-[#7A5C3E]/10 bg-[#111111] p-4">
                  <div>
                    <p className="text-sm font-semibold text-[#F5F5F5]">{index + 1}. {product.name}</p>
                    <p className="text-xs text-[#F5F5F5]/70">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#C9A227]">₹{product.revenue.toLocaleString()}</p>
                    <p className="text-xs text-[#F5F5F5]/70">Qty sold: {product.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-[#7A5C3E]/10 bg-[#111111] p-6 text-sm text-[#F5F5F5]/70">No product sales yet.</div>
          )}
        </div>

        <div className="rounded-3xl border border-[#7A5C3E]/10 bg-[#0b0b0b] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#D9D0A7]">Low Stock Products</p>
          <h2 className="mt-2 text-2xl font-semibold text-[#F5F5F5]">Inventory attention</h2>
          {isLoading ? (
            <div className="mt-6 space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-14 animate-pulse rounded-2xl bg-[#111111]" />
              ))}
            </div>
          ) : lowStockProducts.length > 0 ? (
            <div className="mt-6 space-y-3">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between rounded-2xl border border-[#7A5C3E]/10 bg-[#111111] p-4">
                  <div>
                    <p className="text-sm font-semibold text-[#F5F5F5]">{product.name}</p>
                    <p className="text-xs text-[#F5F5F5]/70">{product.category}</p>
                  </div>
                  <span className="rounded-full bg-[#C9A227]/10 px-3 py-1 text-xs font-semibold text-[#C9A227]">
                    {product.stock} left
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-[#7A5C3E]/10 bg-[#111111] p-6 text-sm text-[#F5F5F5]/70">No low stock items at the moment.</div>
          )}
        </div>
      </div>
    </section>
  )
}
