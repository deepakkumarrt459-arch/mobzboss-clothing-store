"use client";

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Product } from '@/types/product'
import { useCart } from './ui/context/cartcontext'
import { useAuth } from './ui/context/AuthContext'
import { ensureAuth } from '@/lib/authHelpers'
import { useWishlist } from '@/hooks/useWishlist'
import { useProductReviews } from '@/hooks/useProductReviews'

type Props = {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const imageUrl = product.images?.[0] ?? 'https://placehold.co/400x500/111111/F5F5F5?text=No+Image'
  const priceLabel = `$${product.price.toFixed(2)}`
  const ratingLabel = product.rating ? product.rating.toFixed(1) : '—'

  const { addToCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const { wishlistIds, toggleWishlist, loading: wishlistLoading } = useWishlist()
  const { averageRating, reviewCount } = useProductReviews(product.id)
  const [added, setAdded] = useState(false)
  const [wishlistMessage, setWishlistMessage] = useState('')

  const isOutOfStock = product.stock <= 0
  const isWishlisted = wishlistIds.includes(product.id)

  const handleAdd = () => {
    if (isOutOfStock) return
    if (!user?.uid) {
      ensureAuth(router, user, { action: 'add_to_cart', payload: { productId: product.id } })
      return
    }
    addToCart(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1400)
  }

  const handleWishlistToggle = async () => {
    if (!user?.uid) {
      setWishlistMessage('Please log in to save products to your wishlist.')
      ensureAuth(router, user, { action: 'wishlist_toggle', payload: { productId: product.id } })
      return
    }

    const result = await toggleWishlist(product.id)
    setWishlistMessage(result ? 'Added to wishlist' : 'Removed from wishlist')
    setTimeout(() => setWishlistMessage(''), 1200)
  }

  return (
    <article className="group rounded-[1.5rem] overflow-hidden border border-[#7A5C3E]/10 bg-[#111111] transition hover:shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)]">
      <div className="relative">
        <Link href={`/product/${product.id}`} className="overflow-hidden block transition duration-500 hover:opacity-90">
        <div className="relative h-[340px] w-full overflow-hidden">
          <Image src={imageUrl} alt={product.name} fill className="object-cover transition duration-500 group-hover:scale-105" unoptimized />
        </div>
        </Link>
        <button
          type="button"
          onClick={handleWishlistToggle}
          disabled={wishlistLoading}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border text-lg transition ${
            isWishlisted ? 'border-[#C9A227] bg-[#C9A227] text-[#111111]' : 'border-[#F5F5F5]/20 bg-[#111111]/80 text-[#F5F5F5] hover:border-[#C9A227] hover:text-[#C9A227]'
          } ${wishlistLoading ? 'opacity-60' : ''}`}
        >
          {isWishlisted ? '❤️' : '♡'}
        </button>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between">
          <Link href={`/product/${product.id}`} className="text-sm font-semibold tracking-tight text-[#F5F5F5] hover:text-[#C9A227]">
            {product.name}
          </Link>
          <span className="text-sm font-semibold text-[#C9A227]">{priceLabel}</span>
        </div>
        <Link href={`/product/${product.id}`} className="mt-3 block text-xs text-[#D9D0A7] line-clamp-2 hover:text-[#C9A227]">
          {product.description}
        </Link>
        <div className="mt-3 flex items-center justify-between text-xs text-[#F5F5F5]/70">
          <span>{isOutOfStock ? 'Out of stock' : `Stock: ${product.stock} available`}</span>
          <span>{ratingLabel}</span>
        </div>
        <div className="mt-3 text-sm text-[#D9D0A7]">
          ⭐ {averageRating > 0 ? averageRating.toFixed(1) : '—'} {reviewCount > 0 ? `(${reviewCount})` : ''}
        </div>
        {wishlistMessage ? <p className="mt-3 text-xs text-[#C9A227]">{wishlistMessage}</p> : null}
        <div className="mt-4 flex items-center justify-between">
          <div className="relative">
            <button
              onClick={handleAdd}
              disabled={isOutOfStock}
              className={`rounded-full px-4 py-2 text-xs font-semibold text-[#111111] transition ${
                isOutOfStock ? 'bg-[#555555] cursor-not-allowed' : 'bg-[#C9A227] hover:bg-[#b69323]'
              }`}
            >
              {isOutOfStock ? 'Sold out' : 'Add to Cart'}
            </button>
            {added && !isOutOfStock && (
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 rounded-md bg-[#C9A227] px-2 py-1 text-xs font-semibold text-[#111111]">Added to Cart</span>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
