// Product type definitions used across the MobzBoss app.
export interface Product {
  id: string
  name: string
  price: number
  category: string
  // Optional fields — code should handle missing values safely
  description?: string
  sizes?: string[]
  colors?: string[]
  stock?: number
  images?: string[]
  featured?: boolean
  rating?: number
  createdAt?: Date
}
