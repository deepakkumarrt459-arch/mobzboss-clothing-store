
export interface Product {
  id: string
  name: string
  price: number
  category: string
  // Optional fields — code should handle missing values safely
  description?: string
  sizes?: string[]
  colors?: string[]
  stock: number
  images?: string[]
  featured?: boolean
  rating?: number
  createdAt?: Date
  brand?: string
  color?: string
  gender?: string
  tags?: string[]
}

export interface ProductReview {
  id?: string
  userId: string
  userName: string
  rating: number
  review: string
  createdAt?: Date
  updatedAt?: Date
}
