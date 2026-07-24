import { addDoc, collection, deleteDoc, doc, getDocs, Timestamp, updateDoc, query, where, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Coupon } from '@/types/coupon'

const COUPONS_COLLECTION = 'coupons'

function getDb() {
  if (!db) throw new Error('Firestore not initialized')
  return db
}

export async function getActiveCoupons(): Promise<Coupon[]> {
  const couponsRef = collection(getDb(), COUPONS_COLLECTION)
  const q = query(couponsRef, where('active', '==', true), orderBy('code', 'asc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    code: docSnap.data().code,
    type: docSnap.data().type,
    value: docSnap.data().value,
    minimumOrder: docSnap.data().minimumOrder ?? 0,
    maximumDiscount: docSnap.data().maximumDiscount ?? 0,
    expiry: docSnap.data().expiry,
    active: Boolean(docSnap.data().active),
  }))
}

export async function getCouponByCode(code: string): Promise<Coupon | null> {
  const couponsRef = collection(getDb(), COUPONS_COLLECTION)
  const q = query(couponsRef, where('code', '==', code.toUpperCase()), where('active', '==', true))
  const snapshot = await getDocs(q)
  if (snapshot.empty) return null
  const docSnap = snapshot.docs[0]
  const data = docSnap.data()
  return {
    id: docSnap.id,
    code: data.code,
    type: data.type,
    value: data.value,
    minimumOrder: data.minimumOrder ?? 0,
    maximumDiscount: data.maximumDiscount ?? 0,
    expiry: data.expiry,
    active: Boolean(data.active),
  }
}

export async function getCoupons(): Promise<Coupon[]> {
  const couponsRef = collection(getDb(), COUPONS_COLLECTION)
  const snapshot = await getDocs(query(couponsRef, orderBy('code', 'asc')))
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    code: docSnap.data().code,
    type: docSnap.data().type,
    value: docSnap.data().value,
    minimumOrder: docSnap.data().minimumOrder ?? 0,
    maximumDiscount: docSnap.data().maximumDiscount ?? 0,
    expiry: docSnap.data().expiry,
    active: Boolean(docSnap.data().active),
  }))
}

export async function createCoupon(coupon: Omit<Coupon, 'id'>): Promise<string> {
  const couponsRef = collection(getDb(), COUPONS_COLLECTION)
  const payload = {
    ...coupon,
    code: coupon.code.toUpperCase(),
    active: Boolean(coupon.active),
    createdAt: Timestamp.now(),
  }
  const docRef = await addDoc(couponsRef, payload)
  return docRef.id
}

export async function updateCoupon(id: string, updates: Partial<Omit<Coupon, 'id'>>) {
  const couponRef = doc(getDb(), COUPONS_COLLECTION, id)
  await updateDoc(couponRef, {
    ...updates,
    code: updates.code ? updates.code.toUpperCase() : undefined,
    active: updates.active !== undefined ? Boolean(updates.active) : undefined,
  })
}

export async function deleteCoupon(id: string) {
  const couponRef = doc(getDb(), COUPONS_COLLECTION, id)
  await deleteDoc(couponRef)
}
