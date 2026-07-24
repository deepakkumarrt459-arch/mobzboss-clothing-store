import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from './firebase'
import type { Order } from '@/types/order'
import type { Product } from '@/types/product'

function getDb() {
  if (!db) throw new Error('Firestore not initialized')
  return db
}

const ordersCollection = () => collection(getDb(), 'orders')
const productsCollection = () => collection(getDb(), 'products')

export async function getTotalOrders(): Promise<number> {
  const snapshot = await getDocs(ordersCollection())
  return snapshot.size
}

export async function getTotalRevenue(): Promise<number> {
  const snapshot = await getDocs(ordersCollection())
  return snapshot.docs.reduce((sum, docSnap) => {
    const data = docSnap.data() as Order
    return sum + (typeof data.total === 'number' ? data.total : 0)
  }, 0)
}

function convertToDate(value: unknown): Date | undefined {
  if (value instanceof Date) return value
  if (typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as { toDate?: unknown }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate()
  }
  return undefined
}

export async function getRecentOrders(limit = 5): Promise<Order[]> {
  const q = query(ordersCollection(), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.slice(0, limit).map((docSnap) => {
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
      createdAt: convertToDate(data.createdAt),
    }
  })
}

export async function getTotalProducts(): Promise<number> {
  const snapshot = await getDocs(productsCollection())
  return snapshot.size
}

export async function getTopProducts(limit = 5): Promise<Product[]> {
  const snapshot = await getDocs(productsCollection())
  const products = snapshot.docs.map((docSnap) => {
    const data = docSnap.data() as Record<string, unknown>
    return {
      id: docSnap.id,
      name: typeof data.name === 'string' ? data.name : 'Untitled product',
      price: typeof data.price === 'number' ? data.price : 0,
      category: typeof data.category === 'string' ? data.category : 'Uncategorized',
      description: typeof data.description === 'string' ? data.description : '',
      sizes: Array.isArray(data.sizes) ? (data.sizes as string[]) : [],
      colors: Array.isArray(data.colors) ? (data.colors as string[]) : [],
      stock: typeof data.stock === 'number' ? data.stock : 0,
      images: Array.isArray(data.images) ? (data.images as string[]) : [],
      featured: typeof data.featured === 'boolean' ? data.featured : false,
      rating: typeof data.rating === 'number' ? data.rating : 0,
      createdAt: convertToDate(data.createdAt),
    } satisfies Product
  })

  return products.slice(0, limit)
}

export async function getTotalCustomers(): Promise<number> {
  const snapshot = await getDocs(collection(getDb(), 'users'))
  return snapshot.size
}

export async function getRevenueChartData(): Promise<Array<{ label: string; revenue: number }>> {
  const snapshot = await getDocs(ordersCollection())
  const groups = snapshot.docs.reduce<Record<string, number>>((acc, docSnap) => {
    const data = docSnap.data() as Order
    const createdAt = convertToDate(data.createdAt)
    if (!createdAt) return acc

    const month = createdAt.toLocaleString('default', { month: 'short', year: 'numeric' })
    acc[month] = (acc[month] || 0) + (typeof data.total === 'number' ? data.total : 0)
    return acc
  }, {})

  return Object.keys(groups)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    .map((label) => ({ label, revenue: groups[label] }))
}
