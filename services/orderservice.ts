import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  updateDoc,
  doc,
  Timestamp,
  where,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Order } from '../types/order'

function getDb() {
  if (!db) throw new Error('Firestore not initialized')
  return db
}

const ordersCollection = () => collection(getDb(), 'orders')

export async function createOrder(order: Omit<Order, 'id' | 'createdAt'>): Promise<string> {
  const payload = {
    ...order,
    status: order.status ?? 'Pending',
    paymentStatus: order.paymentStatus ?? 'Paid',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  }

  const docRef = await addDoc(ordersCollection(), payload)
  return docRef.id
}

export async function getOrders(): Promise<Order[]> {
  const ordersQuery = query(ordersCollection(), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(ordersQuery)

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data()
    return {
      id: docSnap.id,
      userId: data.userId as string | undefined,
      customerName: data.customerName as string,
      email: data.email as string,
      phone: data.phone as string,
      address: data.address as string,
      items: data.items as Array<{
        productId: string
        name: string
        price: number
        quantity: number
        image?: string
      }>,
      total: data.total as number,
      status: data.status as Order['status'],
      paymentStatus: (data.paymentStatus as Order['paymentStatus']) ?? 'Paid',
      createdAt: data.createdAt?.toDate?.() ?? undefined,
      updatedAt: data.updatedAt?.toDate?.() ?? undefined,
    }
  })
}

export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  const ordersQuery = query(ordersCollection(), where('userId', '==', userId), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(ordersQuery)

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data()
    return {
      id: docSnap.id,
      userId: data.userId as string | undefined,
      customerName: data.customerName as string,
      email: data.email as string,
      phone: data.phone as string,
      address: data.address as string,
      items: data.items as Array<{
        productId: string
        name: string
        price: number
        quantity: number
        image?: string
      }>,
      total: data.total as number,
      status: data.status as Order['status'],
      paymentStatus: (data.paymentStatus as Order['paymentStatus']) ?? 'Paid',
      createdAt: data.createdAt?.toDate?.() ?? undefined,
      updatedAt: data.updatedAt?.toDate?.() ?? undefined,
    }
  })
}

export async function updateOrderStatus(id: string, status: Order['status']): Promise<void> {
  const d = getDb()
  const orderDoc = doc(d, 'orders', id)
  await updateDoc(orderDoc, { status, updatedAt: Timestamp.now() })
}
