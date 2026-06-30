import { collection, getDocs, query, orderBy, where } from 'firebase/firestore'
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

export async function getRecentOrders(limit = 5): Promise<Order[]> {
  const q = query(ordersCollection(), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.slice(0, limit).map((docSnap) => {
    const data = docSnap.data() as Order
    return {
      id: docSnap.id,
      userId: data.userId,
      customerName: data.customerName,
      phone: data.phone,
      address: data.address,
      items: data.items,
      total: data.total,
      status: data.status,
      createdAt: data.createdAt?.toDate?.() ?? undefined,
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
    const data = docSnap.data() as Product
    return {
      id: docSnap.id,
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      sizes: data.sizes,
      colors: data.colors,
      stock: data.stock,
      images: data.images,
      featured: data.featured,
      rating: data.rating,
      createdAt: data.createdAt?.toDate?.() ?? undefined,
    }
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
    const createdAt = data.createdAt?.toDate?.()
    if (!createdAt) return acc

    const month = createdAt.toLocaleString('default', { month: 'short', year: 'numeric' })
    acc[month] = (acc[month] || 0) + (typeof data.total === 'number' ? data.total : 0)
    return acc
  }, {})

  return Object.keys(groups)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    .map((label) => ({ label, revenue: groups[label] }))
}
