'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import { useAuth } from '@/components/ui/context/AuthContext'
import { useCart } from '@/components/ui/context/cartcontext'
import { useWishlist } from '@/hooks/useWishlist'
import { getWishlistProducts } from '@/services/productService'
import type { Product } from '@/types/product'

export default function WishlistPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { addToCart } = useCart()
  const { wishlistIds, removeFromWishlist, loading: wishlistLoading } = useWishlist()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login')
      return
    }

    if (!user?.uid) return

    let active = true
    setLoading(true)

    getWishlistProducts(user.uid)
      .then((data) => {
        if (active) setProducts(data)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [authLoading, router, user, wishlistIds.length])

  const wishlistProducts = useMemo(() => {
    return products.filter((product) => wishlistIds.includes(product.id))
  }, [products, wishlistIds])

  const handleMoveToCart = async (product: Product) => {
    addToCart(product)
    await removeFromWishlist(product.id)
  }

  if (authLoading || (wishlistLoading && !user)) {
    return <div className="min-h-screen bg-[#090909] p-12 text-center text-[#F5F5F5]/70">Loading wishlist…</div>
  }

  return (
    <main className="min-h-screen bg-[#090909] text-[#F5F5F5]">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[#C9A227]">Wishlist</p>
            <h1 className="text-4xl font-semibold text-[#F5F5F5]">Saved items</h1>
            <p className="mt-2 text-sm text-[#F5F5F5]/70">Keep your favorite pieces ready for the next order.</p>
          </div>
          <Link href="/shop" className="text-sm font-semibold text-[#C9A227] hover:text-[#ebc656]">
            Continue shopping
          </Link>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-[#7A5C3E]/10 bg-[#0b0b0b] p-12 text-center text-[#F5F5F5]/70">Loading wishlist…</div>
        ) : wishlistProducts.length === 0 ? (
          <div className="rounded-3xl border border-[#7A5C3E]/10 bg-[#0b0b0b] p-12 text-center text-[#F5F5F5]/70">
            Your wishlist is empty.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {wishlistProducts.map((product) => (
              <section key={product.id} className="rounded-3xl border border-[#7A5C3E]/10 bg-[#0b0b0b] p-6">
                <div className="flex flex-col gap-6 sm:flex-row">
                  <div className="relative h-40 w-full sm:w-40 rounded-2xl overflow-hidden">
                    <Image src={product.images?.[0] ?? '/products/placeholder.png'} alt={product.name} fill className="object-cover" unoptimized />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-semibold text-[#F5F5F5]">{product.name}</h2>
                        <p className="mt-2 text-sm text-[#D9D0A7]">{product.category || 'Uncategorized'}</p>
                      </div>
                      <span className="text-sm font-semibold text-[#C9A227]">₹{product.price.toFixed(0)}</span>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                      <span className={`rounded-full px-3 py-1 ${product.stock > 0 ? 'bg-[#1e6e40]/20 text-[#7ED957]' : 'bg-[#6e1e2b]/20 text-[#F56565]'}`}>
                        {product.stock > 0 ? 'In stock' : 'Unavailable'}
                      </span>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Button variant="ghost" onClick={() => removeFromWishlist(product.id)}>
                        Remove
                      </Button>
                      <Button onClick={() => handleMoveToCart(product)} disabled={product.stock <= 0}>
                        {product.stock > 0 ? 'Move to Cart' : 'Unavailable'}
                      </Button>
                    </div>
                  </div>
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
