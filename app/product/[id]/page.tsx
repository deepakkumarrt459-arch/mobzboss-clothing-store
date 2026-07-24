"use client"

import Link from 'next/link'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import type { Product } from '@/types/product'
import { useCart } from '@/components/ui/context/cartcontext'
import { useAuth } from '@/components/ui/context/AuthContext'
import useProducts from '@/hooks/useProducts'
import { useProductReviews } from '@/hooks/useProductReviews'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import { ensureAuth, consumePostLoginAction } from '@/lib/authHelpers'
import { useRecommendations } from '@/hooks/useRecommendations'
import dynamic from 'next/dynamic'
const RecommendedProducts = dynamic(() => import('@/components/RecommendedProducts'), { ssr: false })
import Button from '@/components/ui/Button'
import Image from 'next/image'

export default function ProductPage() {
  const params = useParams()
  const id = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : undefined
  const { products, loading } = useProducts()
  const [qty, setQty] = useState(1)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)

  const product = useMemo<Product | null>(
    () => products.find((item) => item.id === id) ?? null,
    [products, id]
  )

  const { addToRecentlyViewed } = useRecentlyViewed()
  const { similarCategory, similarBrand, sameTags, trending } = useRecommendations(product || undefined)

  useEffect(() => {
    if (product) {
      addToRecentlyViewed(product)
    }
  }, [product, addToRecentlyViewed])

  const related = useMemo(() => {
    if (!product) return []
    return products
      .filter((item) => item.category === product.category && item.id !== product.id)
      .slice(0, 4)
  }, [products, product])

  useEffect(() => {
    if (!product) return
    setSelectedSize(product.sizes?.[0] ?? null)
    setSelectedColor(product.colors?.[0] ?? null)
    setQty(1)
  }, [product])

  const { addToCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const { reviews, loading: reviewsLoading, averageRating, reviewCount, canReview, checkingEligibility, existingReview, submitReview } = useProductReviews(id)
  const [reviewText, setReviewText] = useState('')
  const [ratingInput, setRatingInput] = useState('5')
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)


  const increase = () => setQty((q) => {
    if (!product) return q
    if (q >= product.stock) return q
    return q + 1
  })

  const decrease = () => setQty((q) => Math.max(1, q - 1))

  const requireAuth = useCallback(() => {
    if (!ensureAuth(router, user, { action: 'buy_now', payload: { productId: product?.id, qty } })) {
      return false
    }
    return true
  }, [router, user, product?.id, qty])

  const handleAddToCart = useCallback(() => {
    if (!product || product.stock <= 0) return
    if (!requireAuth()) return
    addToCart(product, Math.min(qty, product.stock))
  }, [product, qty, addToCart, requireAuth])

  const handleBuyNow = useCallback(() => {
    if (!product || product.stock <= 0) return
    if (!requireAuth()) return
    handleAddToCart()
    router.push('/cart')
  }, [product, handleAddToCart, requireAuth, router])

  // Handle post-login actions (e.g., continue Buy Now)
  useEffect(() => {
    if (!product) return
    const action = consumePostLoginAction()
    if (!action) return

    if (action.action === 'buy_now' && action.payload?.productId === product.id) {
      // try to continue the action
      handleAddToCart()
      router.push('/cart')
    } else if (action.action === 'add_to_cart' && action.payload?.productId === product.id) {
      handleAddToCart()
    }
  }, [product, router, handleAddToCart])

  const handleReviewSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!product || !user?.uid) {
      alert('Please log in to leave a review.')
      router.push('/login')
      return
    }

    if (!canReview) {
      setReviewError('Only customers with a delivered order for this product can submit a review.')
      return
    }

    const parsedRating = Number(ratingInput)
    if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      setReviewError('Please choose a rating from 1 to 5.')
      return
    }

    const trimmedReview = reviewText.trim()
    if (trimmedReview.length > 500) {
      setReviewError('Reviews must be 500 characters or fewer.')
      return
    }

    setSubmittingReview(true)
    setReviewError('')
    try {
      await submitReview({
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || 'Customer',
        rating: parsedRating,
        review: trimmedReview,
      })
      setReviewSuccess(existingReview ? 'Your review has been updated.' : 'Your review has been submitted.')
      setReviewText(trimmedReview)
    } catch (error) {
      console.error('Failed to submit review', error)
      setReviewError('Unable to submit your review. Please try again.')
    } finally {
      setSubmittingReview(false)
    }
  }

  const imageSrc = useMemo(() => {
    if (!product) return '/products/placeholder.png'

    const firstImage = product.images?.find((image) => Boolean(image?.trim()))

    if (!firstImage) return '/products/placeholder.png'
    if (/^https?:\/\//i.test(firstImage)) return firstImage
    if (firstImage.startsWith('/')) return firstImage

    return `/${firstImage.replace(/^\/+/, '')}`
  }, [product])

  if (loading) {
    return <div className="p-12 text-center text-[#F5F5F5]">Loading product…</div>
  }

  if (!product) {
    return <div className="p-12 text-center text-[#F5F5F5]">Product not found.</div>
  }
 
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-[#151515]">
            <Image
              src={imageSrc}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              className="object-cover"
              unoptimized
            />
          </div>
        </div>

        <div className="text-[#F5F5F5]">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <div className="mt-2 flex items-center justify-between">
            <div className="text-lg font-semibold text-[#C9A227]">₹{product.price.toFixed(0)}</div>
            <div className="text-sm text-[#F5F5F5]/80">Rating: {(product.rating ?? 4).toFixed(1)}</div>
          </div>

          <p className="mt-4 text-sm text-[#D9D0A7]">{product.description}</p>

          <div className="mt-6">
            <div className="mb-2 text-sm font-semibold text-[#F5F5F5]">Sizes</div>
            <div className="flex flex-wrap gap-2">
              {product.sizes?.length === 0 && <div className="text-sm text-[#F5F5F5]/80">One size</div>}
              {product.sizes?.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`rounded-md px-3 py-1 text-sm ${selectedSize === s ? 'bg-[#C9A227] text-[#111111]' : 'bg-[#151515] text-[#F5F5F5]'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 text-sm font-semibold text-[#F5F5F5]">Colors</div>
            <div className="flex items-center gap-2">
              {product.colors?.length === 0 && <div className="text-sm text-[#F5F5F5]/80">Standard</div>}
              {product.colors?.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  title={c}
                  className={`h-8 w-8 rounded-full border ${selectedColor === c ? 'ring-2 ring-[#C9A227]' : ''}`}
                  style={{ backgroundColor: c.toLowerCase() }}
                />
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center rounded-md bg-[#151515]">
              <button onClick={decrease} className="px-3 py-1 text-sm text-[#F5F5F5]/90">-</button>
              <div className="px-4 py-1 text-sm font-medium">{qty}</div>
              <button onClick={increase} className="px-3 py-1 text-sm text-[#F5F5F5]/90">+</button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className={`rounded-full px-5 py-2 text-sm font-semibold text-[#111111] transition ${
                product.stock <= 0 ? 'bg-[#555555] cursor-not-allowed' : 'bg-[#C9A227] hover:bg-[#b69323]'
              }`}
            >
              {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
              className={`rounded-full border px-5 py-2 text-sm font-semibold transition ${
                product.stock <= 0 ? 'border-[#555555] text-[#777777] cursor-not-allowed' : 'border-[#C9A227] text-[#C9A227] hover:border-[#ebc656] hover:text-[#ebc656]'
              }`}
            >
              {product.stock <= 0 ? 'Unavailable' : 'Buy Now'}
            </button>
          </div>

          <div className="mt-10 rounded-3xl border border-[#7A5C3E]/10 bg-[#111111] p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#F5F5F5]">Reviews</h3>
                <p className="mt-1 text-sm text-[#D9D0A7]">
                  {averageRating > 0 ? `${'★'.repeat(Math.round(averageRating))} ${averageRating.toFixed(1)}` : 'No ratings yet'}
                </p>
                <p className="text-sm text-[#D9D0A7]">Based on {reviewCount} review{reviewCount === 1 ? '' : 's'}</p>
              </div>
            </div>

            <form onSubmit={handleReviewSubmit} className="mt-6 space-y-4">
              {!user?.uid ? (
                <p className="text-sm text-[#D9D0A7]">Please log in to leave a review.</p>
              ) : checkingEligibility ? (
                <p className="text-sm text-[#D9D0A7]">Checking your eligibility…</p>
              ) : canReview ? (
                <>
                  <label className="block text-sm text-[#F5F5F5]">
                    <span className="mb-2 block">Your rating</span>
                    <select value={ratingInput} onChange={(event) => setRatingInput(event.target.value)} className="rounded-md border border-[#7A5C3E]/10 bg-[#151515] px-3 py-2 text-sm text-[#F5F5F5]">
                      {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value} star{value === 1 ? '' : 's'}</option>)}
                    </select>
                  </label>
                  <label className="block text-sm text-[#F5F5F5]">
                    <span className="mb-2 block">Your review</span>
                    <textarea value={reviewText} onChange={(event) => setReviewText(event.target.value)} maxLength={500} className="min-h-[120px] w-full rounded-md border border-[#7A5C3E]/10 bg-[#151515] px-3 py-2 text-sm text-[#F5F5F5]" placeholder="Share your experience with this product" />
                  </label>
                  {reviewError ? <p className="text-sm text-[#F56565]">{reviewError}</p> : null}
                  {reviewSuccess ? <p className="text-sm text-[#7ED957]">{reviewSuccess}</p> : null}
                  <Button type="submit" disabled={submittingReview}>
                    {submittingReview ? 'Saving…' : existingReview ? 'Edit Review' : 'Submit Review'}
                  </Button>
                </>
              ) : (
                <p className="text-sm text-[#D9D0A7]">Only customers with a delivered order for this product can submit a review.</p>
              )}
            </form>

            <div className="mt-8 space-y-4">
              {reviewsLoading ? (
                <p className="text-sm text-[#D9D0A7]">Loading reviews…</p>
              ) : reviews.length === 0 ? (
                <p className="text-sm text-[#D9D0A7]">No reviews yet.</p>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="rounded-2xl border border-[#7A5C3E]/10 bg-[#0f0f0f] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C9A227] text-sm font-semibold text-[#111111]">
                          {(review.userName || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-[#F5F5F5]">{review.userName}</p>
                          <p className="text-xs text-[#D9D0A7]">{review.createdAt ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(review.createdAt) : ''}</p>
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-[#C9A227]">{'★'.repeat(review.rating)}</div>
                    </div>
                    <p className="mt-3 text-sm text-[#D9D0A7]">{review.review}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-10">
            <h3 className="text-lg font-semibold text-[#F5F5F5]">Related Products</h3>
            <div className="mt-4 grid grid-cols-2 gap-4">
              {related.map((r) => (
                <Link key={r.id} href={`/product/${r.id}`} className="rounded-md border border-[#7A5C3E]/10 bg-[#111111] p-3">
                  <div className="relative h-32 w-full overflow-hidden">
                    <Image src={r.images?.[0] ?? '/products/placeholder.png'} alt={r.name} fill className="object-cover" unoptimized />
                  </div>
                  <div className="mt-2 text-sm font-semibold text-[#F5F5F5]">{r.name}</div>
                  <div className="text-sm text-[#C9A227]">₹{r.price.toFixed(0)}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12">
        <RecommendedProducts title="Similar Products" products={similarCategory} maxDisplay={4} />
        <RecommendedProducts title="Other Products from This Brand" products={similarBrand} maxDisplay={4} />
        <RecommendedProducts title="Products with Similar Style" products={sameTags} maxDisplay={4} />
        <RecommendedProducts title="Customer Favorites" products={trending} maxDisplay={4} />
      </div>
    </div>
  )
}


