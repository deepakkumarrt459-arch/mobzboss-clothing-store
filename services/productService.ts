import { collection, doc, getDoc, getDocs, addDoc, setDoc, deleteDoc, query, orderBy, Timestamp, onSnapshot, where, type DocumentData } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import type { Product, ProductReview } from '@/types/product'

const PRODUCTS_COLLECTION = 'products'
const WISHLIST_COLLECTION = 'wishlist'

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
    stock: typeof product.stock === 'number' ? Math.max(0, product.stock) : DEFAULT_STOCK,
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
  const sanitizedProduct = {
    ...product,
    stock: product.stock !== undefined ? Math.max(0, product.stock) : undefined,
  }
  await setDoc(productRef, sanitizedProduct, { merge: true })
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

export async function addWishlistItem(userId: string, productId: string) {
  if (!db) throw new Error('Firestore not initialized')
  const wishlistRef = doc(db, 'users', userId, WISHLIST_COLLECTION, productId)
  await setDoc(wishlistRef, {
    productId,
    createdAt: Timestamp.now(),
  })
}

export async function removeWishlistItem(userId: string, productId: string) {
  if (!db) throw new Error('Firestore not initialized')
  const wishlistRef = doc(db, 'users', userId, WISHLIST_COLLECTION, productId)
  await deleteDoc(wishlistRef)
}

export function subscribeToWishlist(userId: string, callback: (ids: string[]) => void) {
  if (!db) {
    callback([])
    return () => undefined
  }

  const wishlistRef = collection(db, 'users', userId, WISHLIST_COLLECTION)
  return onSnapshot(wishlistRef, (snapshot) => {
    callback(snapshot.docs.map((docSnap) => docSnap.id))
  })
}

export async function getWishlistProducts(userId: string): Promise<Product[]> {
  if (!db) return []

  const wishlistRef = collection(db, 'users', userId, WISHLIST_COLLECTION)
  const snapshot = await getDocs(wishlistRef)

  const productIds = snapshot.docs.map((docSnap) => docSnap.id)
  if (productIds.length === 0) return []

  const productsRef = collection(db, PRODUCTS_COLLECTION)
  const productsSnapshot = await getDocs(productsRef)
  return productsSnapshot.docs
    .filter((docSnap) => productIds.includes(docSnap.id))
    .map((docSnap) => {
      const data = docSnap.data() as DocumentData
      return {
        id: docSnap.id,
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        sizes: data.sizes ?? ['S', 'M', 'L', 'XL'],
        colors: data.colors ?? ['Black', 'White'],
        stock: typeof data.stock === 'number' ? data.stock : 10,
        images: data.images ?? [],
        featured: data.featured ?? false,
        rating: typeof data.rating === 'number' ? data.rating : 4,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
      }
    })
}

export function subscribeToProductReviews(productId: string, callback: (reviews: ProductReview[]) => void) {
  if (!db) {
    callback([])
    return () => undefined
  }

  const reviewsRef = collection(db, PRODUCTS_COLLECTION, productId, 'reviews')
  const q = query(reviewsRef, orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snapshot) => {
    const reviews = snapshot.docs.map((docSnap) => {
      const data = docSnap.data() as DocumentData
      return {
        id: docSnap.id,
        userId: data.userId,
        userName: data.userName,
        rating: data.rating,
        review: data.review,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : undefined,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : undefined,
      } as ProductReview
    })
    callback(reviews)
  })
}

export async function submitProductReview(productId: string, payload: Omit<ProductReview, 'id' | 'createdAt' | 'updatedAt'>) {
  if (!db) throw new Error('Firestore not initialized')
  const reviewsRef = collection(db, PRODUCTS_COLLECTION, productId, 'reviews')
  const existingQuery = query(reviewsRef, where('userId', '==', payload.userId))
  const existingSnapshot = await getDocs(existingQuery)

  const reviewData = {
    ...payload,
    rating: Math.min(5, Math.max(1, payload.rating)),
    review: payload.review.slice(0, 500),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  }

  if (!existingSnapshot.empty) {
    const existingDoc = existingSnapshot.docs[0]
    await setDoc(doc(db, PRODUCTS_COLLECTION, productId, 'reviews', existingDoc.id), reviewData, { merge: true })
    return existingDoc.id
  }

  const newDoc = await addDoc(reviewsRef, reviewData)
  return newDoc.id
}

export async function deleteProductReview(productId: string, reviewId: string) {
  if (!db) throw new Error('Firestore not initialized')
  await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId, 'reviews', reviewId))
}
