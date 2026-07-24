import { useEffect, useState } from 'react'
import { collection, getDocs, query, orderBy, type DocumentData } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Product } from '@/types/product'

export function useRecommendations(currentProduct?: Product) {
  const [similarCategory, setSimilarCategory] = useState<Product[]>([])
  const [similarBrand, setSimilarBrand] = useState<Product[]>([])
  const [sameTags, setSameTags] = useState<Product[]>([])
  const [trending, setTrending] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!currentProduct || !db) return

    const loadRecommendations = async () => {
      try {
        setLoading(true)
        const q = query(collection(db!, 'products'), orderBy('createdAt', 'desc'))
        const snapshot = await getDocs(q)

        const allProducts = snapshot.docs
          .map((doc) => {
            const data = doc.data() as DocumentData
            return {
              id: doc.id,
              name: data.name || '',
              price: data.price || 0,
              category: data.category || '',
              description: data.description,
              sizes: data.sizes,
              colors: data.colors,
              stock: data.stock || 0,
              images: data.images,
              featured: data.featured,
              rating: data.rating,
              createdAt: data.createdAt?.toDate?.(),
              brand: data.brand,
              color: data.color,
              gender: data.gender,
              tags: data.tags,
            } as Product
          })
          .filter((p) => p.id !== currentProduct.id)

        // Similar category
        const catProducts = allProducts
          .filter((p) => p.category.toLowerCase() === currentProduct.category.toLowerCase())
          .slice(0, 8)
        setSimilarCategory(catProducts)

        // Similar brand
        const brandProducts = allProducts
          .filter((p) => p.brand && currentProduct.brand && p.brand.toLowerCase() === currentProduct.brand.toLowerCase())
          .slice(0, 8)
        setSimilarBrand(brandProducts)

        // Same tags
        const tagProducts = allProducts
          .filter(
            (p) =>
              p.tags &&
              currentProduct.tags &&
              p.tags.some((tag) => currentProduct.tags!.includes(tag)),
          )
          .slice(0, 8)
        setSameTags(tagProducts)

        // Trending (highest rated, recently added)
        const trendingProducts = allProducts
          .sort((a, b) => {
            const ratingDiff = (b.rating || 0) - (a.rating || 0)
            if (ratingDiff !== 0) return ratingDiff
            return (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
          })
          .slice(0, 8)
        setTrending(trendingProducts)
      } catch (error) {
        console.error('Error loading recommendations:', error)
      } finally {
        setLoading(false)
      }
    }

    loadRecommendations()
  }, [currentProduct])

  return {
    similarCategory,
    similarBrand,
    sameTags,
    trending,
    loading,
  }
}
