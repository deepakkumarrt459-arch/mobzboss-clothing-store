"use client";

import React, { useEffect, useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export type ProductFormPayload = {
  name: string
  price: number
  category: string
  description: string
  sizes: string[]
  colors: string[]
  stock: number
  rating: number
  image: string
}

type Props = {
  onSubmit?: (payload: ProductFormPayload) => Promise<void> | void
  disabled?: boolean
  initialValues?: ProductFormPayload
  submitLabel?: string
}

const DEFAULT_SIZES = ['S', 'M', 'L', 'XL']
const DEFAULT_COLORS = ['Black', 'White']
const DEFAULT_RATING = 4
const DEFAULT_STOCK = 10

export default function ProductForm({ onSubmit, disabled = false, initialValues, submitLabel }: Props) {
  const [name, setName] = useState(initialValues?.name ?? '')
  const [price, setPrice] = useState(initialValues?.price ? String(initialValues.price) : '')
  const [category, setCategory] = useState(initialValues?.category ?? 'Tops')
  const [description, setDescription] = useState(initialValues?.description ?? '')
  const [sizes, setSizes] = useState(initialValues?.sizes?.join(',') ?? DEFAULT_SIZES.join(','))
  const [colors, setColors] = useState(initialValues?.colors?.join(',') ?? DEFAULT_COLORS.join(','))
  const [stock, setStock] = useState(initialValues?.stock !== undefined ? String(initialValues.stock) : '0')
  const [rating, setRating] = useState(initialValues?.rating ? String(initialValues.rating) : String(DEFAULT_RATING))
  const [image, setImage] = useState(initialValues?.image ?? '')

  useEffect(() => {
    if (!initialValues) return

    setName(initialValues.name)
    setPrice(String(initialValues.price))
    setCategory(initialValues.category)
    setDescription(initialValues.description)
    setSizes(initialValues.sizes.join(','))
    setColors(initialValues.colors.join(','))
    setStock(String(initialValues.stock ?? 0))
    setRating(String(initialValues.rating))
    setImage(initialValues.image)
  }, [initialValues])

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!name.trim() || !price.trim() || !description.trim() || !image.trim()) {
      alert('Please fill in name, price, description, and image filename.')
      return
    }

    const parsedStock = Number(stock)
    if (Number.isNaN(parsedStock) || parsedStock < 0) {
      alert('Stock must be a non-negative number.')
      return
    }

    const parsedSizes = sizes
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    const parsedColors = colors
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean)

    const payload: ProductFormPayload = {
      name: name.trim(),
      price: Number(price.toString().replace(/[^0-9.]/g, '')) || 0,
      category,
      description: description.trim(),
      sizes: parsedSizes.length ? parsedSizes : DEFAULT_SIZES,
      colors: parsedColors.length ? parsedColors : DEFAULT_COLORS,
      stock: parsedStock,
      rating: Number(rating) || DEFAULT_RATING,
      image: image.trim(),
    }

    await onSubmit?.(payload)
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
        <option>T-Shirts</option>
        <option>Oversized T-Shirts</option>
        <option>Shirts</option>
        <option>Hoodies</option>
        <option>Sweatshirts</option>
        <option>Jerkins</option>
        <option>Jackets</option>
        <option>Cargo Pants</option>
        <option>Jeans</option>
        <option>Shorts</option>
        <option>Track Pants</option>
        <option>Accessories</option>
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
      <Input placeholder="Rating (number)" value={rating} onChange={(e) => setRating(e.target.value)} disabled={disabled} />
      <Input
        placeholder="Stock"
        type="number"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        disabled={disabled}
        min={0}
      />
      <Input
        placeholder="Image filename (e.g. ferari.jpeg)"
        value={image}
        onChange={(e) => setImage(e.target.value)}
        disabled={disabled}
      />

      <div className="flex flex-col gap-3">
        <Button type="submit" disabled={disabled}>
          {disabled ? 'Publishing…' : 'Publish Product'}
        </Button>
      </div>
    </form>
  )
}
