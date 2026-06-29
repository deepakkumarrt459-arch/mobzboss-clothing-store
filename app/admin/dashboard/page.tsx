import React from 'react'
import Card from '@/components/admin/Card'
import { products } from '@/data/products'

export default function DashboardPage() {
  const productCount = products.length

  return (
    <section>
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Products" value={productCount} />
        <Card title="Orders" value={12} />
        <Card title="Customers" value={84} />
        <Card title="Revenue" value="$24,800" />
      </div>
    </section>
  )
}
