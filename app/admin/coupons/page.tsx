'use client'

import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { createCoupon, deleteCoupon, getCoupons, updateCoupon } from '@/services/couponService'
import type { Coupon } from '@/types/coupon'

const emptyCoupon: Omit<Coupon, 'id'> = {
  code: '',
  type: 'percentage',
  value: 10,
  minimumOrder: 0,
  maximumDiscount: 0,
  expiry: '',
  active: true,
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [form, setForm] = useState<Omit<Coupon, 'id'>>(emptyCoupon)
  const [editingId, setEditingId] = useState<string | null>(null)

  const loadCoupons = async () => {
    const data = await getCoupons()
    setCoupons(data)
  }

  useEffect(() => {
    loadCoupons()
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.code.trim()) return

    try {
      if (editingId) {
        await updateCoupon(editingId, form)
      } else {
        await createCoupon(form)
      }
      setForm(emptyCoupon)
      setEditingId(null)
      await loadCoupons()
    } catch (error) {
      console.error('Failed to save coupon', error)
      alert('Unable to save coupon.')
    }
  }

  const startEdit = (coupon: Coupon) => {
    setEditingId(coupon.id ?? null)
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minimumOrder: coupon.minimumOrder,
      maximumDiscount: coupon.maximumDiscount,
      expiry: coupon.expiry,
      active: coupon.active,
    })
  }

  const handleDelete = async (id?: string) => {
    if (!id || !confirm('Delete this coupon?')) return
    await deleteCoupon(id)
    await loadCoupons()
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#F5F5F5]">Coupons</h1>
      </div>

      <form onSubmit={handleSubmit} className="rounded-3xl border border-[#7A5C3E]/10 bg-[#0b0b0b] p-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-[#F5F5F5]">
            <span className="mb-2 block">Code</span>
            <Input value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} placeholder="SAVE10" />
          </label>
          <label className="text-sm text-[#F5F5F5]">
            <span className="mb-2 block">Type</span>
            <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as Coupon['type'] })} className="w-full rounded-md border border-[#7A5C3E]/10 bg-[#111111] px-3 py-2 text-sm text-[#F5F5F5]">
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed</option>
            </select>
          </label>
          <label className="text-sm text-[#F5F5F5]">
            <span className="mb-2 block">Value</span>
            <Input type="number" value={form.value} onChange={(event) => setForm({ ...form, value: Number(event.target.value) })} />
          </label>
          <label className="text-sm text-[#F5F5F5]">
            <span className="mb-2 block">Minimum Order</span>
            <Input type="number" value={form.minimumOrder} onChange={(event) => setForm({ ...form, minimumOrder: Number(event.target.value) })} />
          </label>
          <label className="text-sm text-[#F5F5F5]">
            <span className="mb-2 block">Maximum Discount</span>
            <Input type="number" value={form.maximumDiscount} onChange={(event) => setForm({ ...form, maximumDiscount: Number(event.target.value) })} />
          </label>
          <label className="text-sm text-[#F5F5F5]">
            <span className="mb-2 block">Expiry</span>
            <Input type="date" value={form.expiry} onChange={(event) => setForm({ ...form, expiry: event.target.value })} />
          </label>
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-[#F5F5F5]">
          <input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} />
          Active
        </label>
        <Button type="submit">{editingId ? 'Update Coupon' : 'Create Coupon'}</Button>
      </form>

      <div className="rounded-3xl border border-[#7A5C3E]/10 bg-[#0b0b0b] p-6">
        <h2 className="text-xl font-semibold text-[#F5F5F5]">Existing Coupons</h2>
        <div className="mt-4 space-y-3">
          {coupons.map((coupon) => (
            <div key={coupon.id} className="rounded-2xl border border-[#7A5C3E]/10 bg-[#111111] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-[#F5F5F5]">{coupon.code}</p>
                  <p className="text-sm text-[#D9D0A7]">{coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`} • Min ₹{coupon.minimumOrder} • Max ₹{coupon.maximumDiscount}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => startEdit(coupon)}>Edit</Button>
                  <Button variant="ghost" onClick={() => handleDelete(coupon.id)}>Delete</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
