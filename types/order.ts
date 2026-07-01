export type OrderStatus = 'Pending' | 'Confirmed' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled'
export type PaymentStatus = 'Paid' | 'Pending' | 'Failed' | 'Refunded'

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
  email: string
  phone: string
  address: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  createdAt?: Date
  updatedAt?: Date
}
