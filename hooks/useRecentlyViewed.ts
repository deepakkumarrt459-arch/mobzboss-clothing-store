import { useEffect, useState, useCallback } from 'react'
import { collection, query, where, getDocs, setDoc, doc, deleteDoc, DocumentData } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Product } from '@/types/product'

const RECENTLY_VIEWED_STORAGE_KEY = 'mobzboss_recently_viewed'
const MAX_RECENTLY_VIEWED = 12

function getLocalRecentlyViewed(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveLocalRecentlyViewed(productIds: string[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify(productIds.slice(0, MAX_RECENTLY_VIEWED)))
}

export function useRecentlyViewed(userId?: string) {
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Load recently viewed on mount
  useEffect(() => {
    const loadRecentlyViewed = async () => {
      try {
        setLoading(true)

        if (userId && db) {
          // Fetch from Firestore for logged-in users
          const q = query(collection(db, 'recentlyViewed'), where('userId', '==', userId))
          const snapshot = await getDocs(q)

          if (!snapshot.empty) {
            const doc = snapshot.docs[0]
            const data = doc.data() as DocumentData
            const productIds = data.productIds || []

            // Fetch product details
            const productsCollection = collection(db, 'products')
            const products: Product[] = []

            for (const id of productIds) {
              try {
                const productDoc = await getDocs(
                  query(productsCollection, where('__name__', '==', id))
                )
                if (!productDoc.empty) {
                  const pd = productDoc.docs[0].data() as DocumentData
                  products.push({
                    id: productDoc.docs[0].id,
                    name: pd.name || '',
                    price: pd.price || 0,
                    category: pd.category || '',
                    description: pd.description,
                    sizes: pd.sizes,
                    colors: pd.colors,
                    stock: pd.stock || 0,
                    images: pd.images,
                    featured: pd.featured,
                    rating: pd.rating,
                    createdAt: pd.createdAt?.toDate?.(),
                  })
                }
              } catch {
                // Skip product if fetch fails
              }
            }

            setRecentlyViewed(products)
          }
        } else {
          // Use localStorage for guests
          const productIds = getLocalRecentlyViewed()
          if (productIds.length > 0 && db) {
            const productsCollection = collection(db, 'products')
            const products: Product[] = []

            for (const id of productIds) {
              try {
                const productDoc = await getDocs(query(productsCollection, where('__name__', '==', id)))
                if (!productDoc.empty) {
                  const pd = productDoc.docs[0].data() as DocumentData
                  products.push({
                    id: productDoc.docs[0].id,
                    name: pd.name || '',
                    price: pd.price || 0,
                    category: pd.category || '',
                    description: pd.description,
                    sizes: pd.sizes,
                    colors: pd.colors,
                    stock: pd.stock || 0,
                    images: pd.images,
                    featured: pd.featured,
                    rating: pd.rating,
                    createdAt: pd.createdAt?.toDate?.(),
                  })
                }
              } catch {
                // Skip product if fetch fails
              }
            }

            setRecentlyViewed(products)
          }
        }
      } catch (error) {
        console.error('Error loading recently viewed:', error)
      } finally {
        setLoading(false)
      }
    }

    loadRecentlyViewed()
  }, [userId])

  const addToRecentlyViewed = useCallback(async (product: Product) => {
    if (!product.id) return

    if (userId && db) {
      // Save to Firestore for logged-in users
      try {
        const docRef = doc(collection(db, 'recentlyViewed'), userId)
        const snapshot = await getDocs(query(collection(db, 'recentlyViewed'), where('userId', '==', userId)))

        let productIds = [product.id]
        if (!snapshot.empty) {
          const existingIds = (snapshot.docs[0].data() as DocumentData).productIds || []
          productIds = [product.id, ...existingIds.filter((id: string) => id !== product.id)].slice(
            0,
            MAX_RECENTLY_VIEWED,
          )
        }

        await setDoc(docRef, { userId, productIds, updatedAt: new Date() })
        setRecentlyViewed((prev) => [product, ...prev.filter((p) => p.id !== product.id)].slice(0, MAX_RECENTLY_VIEWED))
      } catch (error) {
        console.error('Error saving to recently viewed:', error)
      }
    } else {
      // Save to localStorage for guests
      const productIds = getLocalRecentlyViewed()
      const updated = [product.id, ...productIds.filter((id) => id !== product.id)].slice(0, MAX_RECENTLY_VIEWED)
      saveLocalRecentlyViewed(updated)
      setRecentlyViewed((prev) => [product, ...prev.filter((p) => p.id !== product.id)].slice(0, MAX_RECENTLY_VIEWED))
    }
  }, [userId])

  const clearRecentlyViewed = async () => {
    if (userId && db) {
      try {
        const q = query(collection(db, 'recentlyViewed'), where('userId', '==', userId))
        const snapshot = await getDocs(q)
        if (!snapshot.empty) {
          await deleteDoc(snapshot.docs[0].ref)
        }
      } catch (error) {
        console.error('Error clearing recently viewed:', error)
      }
    } else {
      saveLocalRecentlyViewed([])
    }
    setRecentlyViewed([])
  }

  return { recentlyViewed, loading, addToRecentlyViewed, clearRecentlyViewed }
}
