import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
  Timestamp,
  where,
} from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import { normalizeOrderStatus, parseTrackingHistory, getOrderTrackingEvent, parseFirestoreDate } from '@/lib/orderUtils'
import type { Order } from '../types/order'

function getDb() {
  if (!db) throw new Error('Firestore not initialized')
  return db
}

const ordersCollection = () => collection(getDb(), 'orders')

export async function createOrder(order: Omit<Order, 'id' | 'createdAt'>): Promise<string> {
  const payload = {
    ...order,
    status: normalizeOrderStatus(order.status ?? 'pending'),
    paymentStatus: order.paymentStatus ?? 'Paid',
    trackingHistory: [getOrderTrackingEvent(normalizeOrderStatus(order.status ?? 'pending'))],
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
      status: normalizeOrderStatus(data.status),
      paymentStatus: (data.paymentStatus as Order['paymentStatus']) ?? 'Paid',
      paymentMethod: typeof data.paymentMethod === 'string' ? data.paymentMethod : undefined,
      tax: typeof data.tax === 'number' ? data.tax : undefined,
      couponCode: typeof data.couponCode === 'string' ? data.couponCode : undefined,
      discount: typeof data.discount === 'number' ? data.discount : undefined,
      invoiceNumber: typeof data.invoiceNumber === 'string' ? data.invoiceNumber : undefined,
      invoiceGeneratedAt: data.invoiceGeneratedAt?.toDate?.() ?? undefined,
      trackingHistory: parseTrackingHistory(data.trackingHistory),
      emailStatus: data.emailStatus as Order['emailStatus'] | undefined,
      lastEmailType: data.lastEmailType as Order['lastEmailType'] | undefined,
      lastEmailSentAt: data.lastEmailSentAt?.toDate?.() ?? undefined,
      createdAt: data.createdAt?.toDate?.() ?? undefined,
      updatedAt: data.updatedAt?.toDate?.() ?? undefined,
    }
  })
}

export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  const ordersQuery = query(ordersCollection(), where('userId', '==', userId))
  const snapshot = await getDocs(ordersQuery)

  return snapshot.docs
    .map((docSnap) => {
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
        status: normalizeOrderStatus(data.status),
        paymentStatus: (data.paymentStatus as Order['paymentStatus']) ?? 'Paid',
        paymentMethod: typeof data.paymentMethod === 'string' ? data.paymentMethod : undefined,
        tax: typeof data.tax === 'number' ? data.tax : undefined,
        couponCode: typeof data.couponCode === 'string' ? data.couponCode : undefined,
        discount: typeof data.discount === 'number' ? data.discount : undefined,
        invoiceNumber: typeof data.invoiceNumber === 'string' ? data.invoiceNumber : undefined,
        invoiceGeneratedAt: data.invoiceGeneratedAt?.toDate?.() ?? undefined,
        trackingHistory: parseTrackingHistory(data.trackingHistory),
        emailStatus: data.emailStatus as Order['emailStatus'] | undefined,
        lastEmailType: data.lastEmailType as Order['lastEmailType'] | undefined,
        lastEmailSentAt: data.lastEmailSentAt?.toDate?.() ?? undefined,
        createdAt: data.createdAt?.toDate?.() ?? undefined,
        updatedAt: data.updatedAt?.toDate?.() ?? undefined,
      }
    })
    .sort((a, b) => {
      const aTime = a.createdAt?.getTime() ?? 0
      const bTime = b.createdAt?.getTime() ?? 0
      return bTime - aTime
    })
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const docRef = doc(ordersCollection(), orderId)
  const snapshot = await getDoc(docRef)
  if (!snapshot.exists()) {
    return null
  }

  const data = snapshot.data()
  return {
    id: snapshot.id,
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
    status: normalizeOrderStatus(data.status),
    paymentStatus: (data.paymentStatus as Order['paymentStatus']) ?? 'Paid',
    paymentMethod: typeof data.paymentMethod === 'string' ? data.paymentMethod : undefined,
    tax: typeof data.tax === 'number' ? data.tax : undefined,
    couponCode: typeof data.couponCode === 'string' ? data.couponCode : undefined,
    discount: typeof data.discount === 'number' ? data.discount : undefined,
    invoiceNumber: typeof data.invoiceNumber === 'string' ? data.invoiceNumber : undefined,
    invoiceGeneratedAt: data.invoiceGeneratedAt?.toDate?.() ?? undefined,
    trackingHistory: parseTrackingHistory(data.trackingHistory),
    emailStatus: data.emailStatus as Order['emailStatus'] | undefined,
    lastEmailType: data.lastEmailType as Order['lastEmailType'] | undefined,
    lastEmailSentAt: data.lastEmailSentAt?.toDate?.() ?? undefined,
    createdAt: parseFirestoreDate(data.createdAt),
    updatedAt: parseFirestoreDate(data.updatedAt),
  }
}

export async function updateOrderStatus(id: string, status: Order['status']): Promise<void> {
  const token = await auth?.currentUser?.getIdToken()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch('/api/admin/orders/status', {
    method: 'POST',
    headers,
    body: JSON.stringify({ orderId: id, status }),
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data?.error ?? 'Failed to update order status')
  }
}

export async function resendOrderEmail(id: string): Promise<void> {
  const token = await auth?.currentUser?.getIdToken()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch('/api/admin/orders/resend-email', {
    method: 'POST',
    headers,
    body: JSON.stringify({ orderId: id }),
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data?.error ?? 'Failed to resend order email')
  }
}
