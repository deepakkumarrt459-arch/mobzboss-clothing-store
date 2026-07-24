import { collection, getDocs, query, orderBy, type DocumentData } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Product } from '@/types/product'

/**
 * Normalize text for partial keyword matching
 */
function normalizeText(text: string): string {
  return text.toLowerCase().trim()
}

/**
 * Check if a search query matches product fields
 */
function matchesQuery(product: Product, queryText: string): boolean {
  const q = normalizeText(queryText)
  if (!q) return true

  const fields = [
    product.name,
    product.category,
    product.description,
    product.brand,
    product.color,
    product.gender,
    product.tags?.join(' '),
  ]
    .filter((field): field is string => Boolean(field))
    .map(normalizeText)

  return fields.some((field) => field.includes(q))
}

/**
 * Extract price range from query (e.g., "under 1000", "below 2000")
 */
// price range parsing not currently used

/**
 * Filter products by price range
 */
function filterByPrice(products: Product[], priceRange: { min?: number; max?: number }): Product[] {
  return products.filter((product) => {
    if (priceRange.min !== undefined && product.price < priceRange.min) return false
    if (priceRange.max !== undefined && product.price > priceRange.max) return false
    return true
  })
}

/**
 * Search products by multiple criteria
 */
export async function searchProducts(
  keywords: string[],
  filters?: {
    category?: string
    brand?: string
    color?: string
    gender?: string
    priceRange?: { min?: number; max?: number }
  },
): Promise<Product[]> {
  if (!db) return []

  try {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)

    let results = snapshot.docs.map((doc) => {
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

    // Filter by keywords
    if (keywords.length > 0) {
      results = results.filter((product) => keywords.some((keyword) => matchesQuery(product, keyword)))
    }

    // Filter by category
    if (filters?.category && filters.category !== 'All') {
      results = results.filter((p) => p.category.toLowerCase() === filters.category!.toLowerCase())
    }

    // Filter by brand
    if (filters?.brand) {
      results = results.filter((p) => p.brand?.toLowerCase() === filters.brand!.toLowerCase())
    }

    // Filter by color
    if (filters?.color) {
      results = results.filter((p) => p.color?.toLowerCase() === filters.color!.toLowerCase())
    }

    // Filter by gender
    if (filters?.gender) {
      results = results.filter((p) => p.gender?.toLowerCase() === filters.gender!.toLowerCase())
    }

    // Filter by price range
    if (filters?.priceRange) {
      results = filterByPrice(results, filters.priceRange)
    }

    return results
  } catch (error) {
    console.error('Search error:', error)
    return []
  }
}

/**
 * Get search suggestions based on partial input
 */
export async function getSearchSuggestions(input: string, limit = 8): Promise<string[]> {
  if (!db || !input.trim()) return []

  try {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)

    const normalizedInput = normalizeText(input)
    const suggestions = new Set<string>()

    snapshot.docs.forEach((doc) => {
      const data = doc.data() as DocumentData
      const product: Product = {
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
      }

      if (product.name.toLowerCase().includes(normalizedInput)) {
        suggestions.add(product.name)
      }
      if (product.category.toLowerCase().includes(normalizedInput)) {
        suggestions.add(product.category)
      }
      if (product.brand && product.brand.toLowerCase().includes(normalizedInput)) {
        suggestions.add(product.brand)
      }
      if (product.tags?.some((tag) => tag.toLowerCase().includes(normalizedInput))) {
        product.tags.forEach((tag) => {
          if (tag.toLowerCase().includes(normalizedInput)) {
            suggestions.add(tag)
          }
        })
      }
    })

    return Array.from(suggestions).slice(0, limit)
  } catch (error) {
    console.error('Suggestions error:', error)
    return []
  }
}

/**
 * Get products by category
 */
export async function getProductsByCategory(category: string): Promise<Product[]> {
  if (!db) return []

  try {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)

    return snapshot.docs
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
      .filter((p) => p.category.toLowerCase() === category.toLowerCase())
  } catch (error) {
    console.error('Category search error:', error)
    return []
  }
}

/**
 * Get products by tags
 */
export async function getProductsByTags(tags: string[]): Promise<Product[]> {
  if (!db || !tags.length) return []

  try {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)

    return snapshot.docs
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
      .filter((p) => p.tags && p.tags.some((tag) => tags.includes(tag)))
  } catch (error) {
    console.error('Tag search error:', error)
    return []
  }
}

/**
 * Get products by brand
 */
export async function getProductsByBrand(brand: string): Promise<Product[]> {
  if (!db || !brand) return []

  try {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)

    return snapshot.docs
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
      .filter((p) => p.brand?.toLowerCase() === brand.toLowerCase())
  } catch (error) {
    console.error('Brand search error:', error)
    return []
  }
}
