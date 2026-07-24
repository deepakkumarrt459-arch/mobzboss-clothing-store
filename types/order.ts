export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'out_for_delivery'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export type PaymentStatus = 'Paid' | 'Pending' | 'Failed' | 'Refunded'
export type OrderEmailType =
  | 'order_pending'
  | 'order_confirmed'
  | 'order_processing'
  | 'order_packed'
  | 'order_out_for_delivery'
  | 'order_shipped'
  | 'order_delivered'
  | 'order_cancelled'
export type EmailStatus = 'sent' | 'failed'

export interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
}

export interface OrderTrackingEvent {
  status: OrderStatus
  label: string
  timestamp: Date
  note?: string
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
  couponCode?: string
  discount?: number
  tax?: number
  paymentMethod?: string
  invoiceNumber?: string
  invoiceGeneratedAt?: Date
  status: OrderStatus
  paymentStatus: PaymentStatus
  trackingHistory?: OrderTrackingEvent[]
  emailStatus?: EmailStatus
  lastEmailType?: OrderEmailType
  lastEmailSentAt?: Date
  createdAt?: Date
  updatedAt?: Date
}
