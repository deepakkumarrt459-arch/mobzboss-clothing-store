import { collection, doc, getDoc, getDocs, addDoc, setDoc, deleteDoc, query, orderBy, Timestamp, type DocumentData } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import type { Product } from '@/types/product'

const PRODUCTS_COLLECTION = 'products'

/**
 * Add a new product document to Firestore.
 */
const DEFAULT_SIZES = ['S', 'M', 'L', 'XL']
const DEFAULT_COLORS = ['Black', 'White']
const DEFAULT_RATING = 4
const DEFAULT_STOCK = 10

function normalizeFirestoreProduct(product: Omit<Product, 'id' | 'createdAt'>) {
  return {
    ...product,
    sizes: product.sizes && product.sizes.length ? product.sizes : DEFAULT_SIZES,
    colors: product.colors && product.colors.length ? product.colors : DEFAULT_COLORS,
    rating: typeof product.rating === 'number' ? product.rating : DEFAULT_RATING,
    stock: typeof product.stock === 'number' ? product.stock : DEFAULT_STOCK,
  }
}

export async function addProduct(product: Omit<Product, 'id' | 'createdAt'>) {
  if (!db) throw new Error('Firestore not initialized')
  const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
    ...normalizeFirestoreProduct(product),
    createdAt: Timestamp.now(),
  })

  return docRef.id
}

/**
 * Fetch all product documents from Firestore ordered by creation date.
 */
export async function getProducts(): Promise<Product[]> {
  if (!db) throw new Error('Firestore not initialized')
  const q = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data() as DocumentData
    return {
      id: docSnap.id,
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      sizes: data.sizes ?? ['S','M','L','XL'],
      colors: data.colors ?? ['Black','White'],
      stock: typeof data.stock === 'number' ? data.stock : 10,
      images: data.images ?? [],
      featured: data.featured ?? false,
      rating: typeof data.rating === 'number' ? data.rating : 4,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
    }
  })
}

export async function getProduct(id: string): Promise<Product | null> {
  if (!db) throw new Error('Firestore not initialized')
  const productRef = doc(db, PRODUCTS_COLLECTION, id)
  const snap = await getDoc(productRef)

  if (!snap.exists()) {
    return null
  }

  const data = snap.data() as DocumentData
  return {
    id: snap.id,
    name: data.name,
    description: data.description,
    price: data.price,
    category: data.category,
    sizes: data.sizes ?? ['S','M','L','XL'],
    colors: data.colors ?? ['Black','White'],
    stock: typeof data.stock === 'number' ? data.stock : 10,
    images: data.images ?? [],
    featured: data.featured ?? false,
    rating: typeof data.rating === 'number' ? data.rating : 4,
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
  }
}

/**
 * Update an existing product document in Firestore.
 */
export async function updateProduct(id: string, product: Partial<Omit<Product, 'id' | 'createdAt'>>) {
  if (!db) throw new Error('Firestore not initialized')
  const productRef = doc(db, PRODUCTS_COLLECTION, id)
  await setDoc(productRef, product, { merge: true })
}

/**
 * Delete a product document from Firestore.
 */
export async function deleteProduct(id: string) {
  if (!db) throw new Error('Firestore not initialized')
  const productRef = doc(db, PRODUCTS_COLLECTION, id)
  await deleteDoc(productRef)
}

/**
 * Upload a product image to Firebase Storage and return its public URL.
 */
export async function uploadProductImage(file: File, productId: string): Promise<string> {
  if (!storage) throw new Error('Firebase storage not initialized')
  const storageRef = ref(storage, `products/${productId}/${file.name}`)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}
