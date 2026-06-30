export type OrderStatus = 'Pending' | 'Shipped' | 'Delivered'

export interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
}

export interface Order {
  id?: string
  userId?: string
  customerName: string
  phone: string
  address: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  createdAt?: Date
}
