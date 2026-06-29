// Product type definitions used across the MobzBoss app.
export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  sizes: string[]
  colors: string[]
  stock: number
  images: string[]
  featured: boolean
  rating: number
  createdAt: Date
}
