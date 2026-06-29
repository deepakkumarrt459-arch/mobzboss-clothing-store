"use client"

import React, { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export type ProductFormPayload = {
  name: string
  price: string
  category: string
  description: string
  sizes: string
  colors: string
  stock: string
  imageFile: File | null
}

type Props = {
  onSubmit?: (payload: ProductFormPayload) => Promise<void> | void
  disabled?: boolean
}

export default function ProductForm({ onSubmit, disabled = false }: Props) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('Tops')
  const [description, setDescription] = useState('')
  const [sizes, setSizes] = useState('S,M,L')
  const [colors, setColors] = useState('Black')
  const [stock, setStock] = useState('0')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageLabel, setImageLabel] = useState('No file selected')

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!name.trim() || !price.trim() || !description.trim()) {
      alert('Please fill in name, price, and description.')
      return
    }

    await onSubmit?.({
      name: name.trim(),
      price: price.trim(),
      category,
      description: description.trim(),
      sizes,
      colors,
      stock,
      imageFile,
    })
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    setImageFile(file)
    setImageLabel(file?.name ?? 'No file selected')
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <Input placeholder="Product name" value={name} onChange={(e) => setName(e.target.value)} disabled={disabled} />
      <Input placeholder="Price (e.g. 199)" value={price} onChange={(e) => setPrice(e.target.value)} disabled={disabled} />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        disabled={disabled}
        className="rounded-md border border-[#7A5C3E]/10 bg-[#111111] px-3 py-2 text-sm text-[#F5F5F5]"
      >
        <option>Outerwear</option>
        <option>Tops</option>
        <option>Bottoms</option>
        <option>Accessories</option>
        <option>Essentials</option>
      </select>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        disabled={disabled}
        className="min-h-[140px] rounded-md border border-[#7A5C3E]/10 bg-[#111111] px-3 py-2 text-sm text-[#F5F5F5]"
      />
      <Input placeholder="Sizes (comma separated)" value={sizes} onChange={(e) => setSizes(e.target.value)} disabled={disabled} />
      <Input placeholder="Colors (comma separated)" value={colors} onChange={(e) => setColors(e.target.value)} disabled={disabled} />
      <Input placeholder="Stock" value={stock} onChange={(e) => setStock(e.target.value)} disabled={disabled} />

      <div className="flex flex-col gap-3">
        <label className="inline-flex items-center justify-between rounded-md bg-[#1A1A1A] px-4 py-3 text-sm text-[#F5F5F5]">
          <span>Upload Image</span>
          <span className="text-xs text-[#D9D0A7]">{imageLabel}</span>
          <input type="file" accept="image/*" className="sr-only" onChange={handleFileChange} disabled={disabled} />
        </label>

        <Button type="submit" disabled={disabled}>
          {disabled ? 'Publishing…' : 'Publish Product'}
        </Button>
      </div>
    </form>
  )
}
