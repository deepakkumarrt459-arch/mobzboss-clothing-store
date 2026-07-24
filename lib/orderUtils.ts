import type { Order, OrderStatus, OrderTrackingEvent } from '@/types/order'

export function normalizeOrderStatus(status: unknown): Order['status'] {
  const value = typeof status === 'string' ? status.toLowerCase().replace(/ /g, '_') : 'pending'

  switch (value) {
    case 'confirmed':
      return 'confirmed'
    case 'processing':
      return 'processing'
    case 'packed':
      return 'packed'
    case 'out_for_delivery':
    case 'outfor_delivery':
    case 'out for delivery':
      return 'out_for_delivery'
    case 'shipped':
      return 'shipped'
    case 'delivered':
      return 'delivered'
    case 'cancelled':
      return 'cancelled'
    case 'pending':
    default:
      return 'pending'
  }
}

export function parseFirestoreDate(value: unknown): Date | undefined {
  if (!value) {
    return undefined
  }

  if (value instanceof Date) {
    return value
  }

  type HasToDate = { toDate: () => Date }
  if (typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as HasToDate).toDate === 'function') {
    return (value as HasToDate).toDate()
  }

  return undefined
}

export function getOrderTrackingLabel(status: OrderStatus) {
  switch (status) {
    case 'pending':
      return 'Order placed'
    case 'confirmed':
      return 'Order confirmed'
    case 'processing':
      return 'Processing'
    case 'packed':
      return 'Packed'
    case 'out_for_delivery':
      return 'Out for delivery'
    case 'shipped':
      return 'Shipped'
    case 'delivered':
      return 'Delivered'
    case 'cancelled':
      return 'Cancelled'
  }
}

export function getOrderTrackingNote(status: OrderStatus) {
  switch (status) {
    case 'pending':
      return 'Your order has been received and is awaiting confirmation.'
    case 'confirmed':
      return 'Your order has been confirmed and is being prepared for shipment.'
    case 'processing':
      return 'Your order is being picked and packed.'
    case 'packed':
      return 'Your order has been packed and is ready for shipment.'
    case 'out_for_delivery':
      return 'Your order is out for delivery and will arrive soon.'
    case 'shipped':
      return 'Your order has left the warehouse and is on its way.'
    case 'delivered':
      return 'Your order has been delivered successfully.'
    case 'cancelled':
      return 'This order was cancelled. Contact support for help.'
  }
}

export function getOrderTrackingEvent(status: OrderStatus, note?: string): OrderTrackingEvent {
  return {
    status,
    label: getOrderTrackingLabel(status),
    note: note ?? getOrderTrackingNote(status),
    timestamp: new Date(),
  }
}

export function parseTrackingHistory(value: unknown): OrderTrackingEvent[] | undefined {
  if (!Array.isArray(value)) {
    return undefined
  }

  const events: OrderTrackingEvent[] = []

  for (const entry of value) {
    if (typeof entry !== 'object' || entry === null) {
      continue
    }

    const record = entry as Record<string, unknown>
    const status = normalizeOrderStatus(record.status)
    const timestamp = parseFirestoreDate(record.timestamp) ?? new Date()

    events.push({
      status,
      label: typeof record.label === 'string' ? record.label : getOrderTrackingLabel(status),
      note: typeof record.note === 'string' ? record.note : getOrderTrackingNote(status),
      timestamp,
    })
  }

  return events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
}
