import { collection, doc, getDoc, getDocs, setDoc, serverTimestamp, Timestamp, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { UserProfile } from '../types/user'

function getDb() {
  if (!db) throw new Error('Firestore not initialized')
  return db
}

const usersCollection = () => collection(getDb(), 'users')

export async function createUser(user: {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  role?: string
}): Promise<void> {
  const userRef = doc(usersCollection(), user.id)
  await setDoc(userRef, {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? '',
    address: user.address ?? '',
    role: user.role ?? 'customer',
    createdAt: serverTimestamp(),
  })
}

export async function getUser(id: string): Promise<UserProfile | null> {
  const userDoc = await getDoc(doc(usersCollection(), id))

  if (!userDoc.exists()) {
    return null
  }

  const data = userDoc.data()

  return {
    id: data.id as string,
    name: data.name as string,
    email: data.email as string,
    phone: data.phone as string,
    address: data.address as string,
    role: (data.role as string) ?? 'customer',
    createdAt: (data.createdAt as Timestamp)?.toDate?.() ?? new Date(),
  }
}

export async function updateUser(id: string, updates: {
  name?: string
  phone?: string
  address?: string
  role?: string
}): Promise<void> {
  const userRef = doc(usersCollection(), id)
  const payload: Record<string, string> = {}

  if (updates.name !== undefined) payload.name = updates.name
  if (updates.phone !== undefined) payload.phone = updates.phone
  if (updates.address !== undefined) payload.address = updates.address
  if (updates.role !== undefined) payload.role = updates.role

  if (Object.keys(payload).length === 0) {
    return
  }

  await updateDoc(userRef, payload)
}

export async function getCustomersCount(): Promise<number> {
  const snapshot = await getDocs(collection(getDb(), 'users'))
  return snapshot.size
}
