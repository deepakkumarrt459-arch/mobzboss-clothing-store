export type CouponType = 'percentage' | 'fixed'

export interface Coupon {
  id?: string
  code: string
  type: CouponType
  value: number
  minimumOrder: number
  maximumDiscount: number
  expiry: string
  active: boolean
}
