"use client";

import React from 'react'
import { Product } from '@/types/product'
import Button from '@/components/ui/Button'

type Props = {
  items: Product[]
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export default function AdminTable({ items, onEdit, onDelete }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="text-left text-sm text-[#D9D0A7]">
            <th className="px-4 py-3">Product</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Stock</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id} className="border-t border-[#2B2B2B]">
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <img
                    src={it.images?.[0] ?? 'https://placehold.co/80x80/111111/F5F5F5?text=No+Image'}
                    alt={it.name}
                    className="h-12 w-10 object-cover"
                  />
                  <div>
                    <div className="text-sm font-semibold text-[#F5F5F5]">{it.name}</div>
                    <div className="text-xs text-[#D9D0A7]">{it.description ?? 'No description'}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 text-sm text-[#D9D0A7]">{it.category}</td>
              <td className="px-4 py-4 text-sm text-[#F5F5F5]">₹{it.price}</td>
              <td className="px-4 py-4 text-sm text-[#F5F5F5]">{it.stock}</td>
              <td className="px-4 py-4 text-sm">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    it.stock > 5
                      ? 'bg-[#213113] text-[#80C76F]'
                      : it.stock > 0
                      ? 'bg-[#3f2d0c] text-[#E9C175]'
                      : 'bg-[#3a0d0d] text-[#F56B6B]'
                  }`}
                >
                  {it.stock > 5 ? 'In Stock' : it.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                </span>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={() => onEdit?.(it.id)}>Edit</Button>
                  <Button variant="ghost" onClick={() => onDelete?.(it.id)}>Delete</Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
