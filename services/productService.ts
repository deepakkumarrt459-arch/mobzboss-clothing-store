import { collection, doc, getDocs, addDoc, setDoc, deleteDoc, query, orderBy, Timestamp, type DocumentData } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import type { Product } from '@/types/product'

const PRODUCTS_COLLECTION = 'products'

/**
 * Add a new product document to Firestore.
 */
export async function addProduct(product: Omit<Product, 'id' | 'createdAt'>) {
  const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
    ...product,
    createdAt: Timestamp.now(),
  })

  return docRef.id
}

/**
 * Fetch all product documents from Firestore ordered by creation date.
 */
export async function getProducts(): Promise<Product[]> {
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
      sizes: data.sizes ?? [],
      colors: data.colors ?? [],
      stock: data.stock,
      images: data.images ?? [],
      featured: data.featured ?? false,
      rating: data.rating ?? 0,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
    }
  })
}

/**
 * Update an existing product document in Firestore.
 */
export async function updateProduct(id: string, product: Partial<Omit<Product, 'id' | 'createdAt'>>) {
  const productRef = doc(db, PRODUCTS_COLLECTION, id)
  await setDoc(productRef, product, { merge: true })
}

/**
 * Delete a product document from Firestore.
 */
export async function deleteProduct(id: string) {
  const productRef = doc(db, PRODUCTS_COLLECTION, id)
  await deleteDoc(productRef)
}

/**
 * Upload a product image to Firebase Storage and return its public URL.
 */
export async function uploadProductImage(file: File, productId: string): Promise<string> {
  const storageRef = ref(storage, `products/${productId}/${file.name}`)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}
