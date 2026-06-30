import Link from 'next/link'

export default function OrderSuccessPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-24 text-center text-[#F5F5F5]">
      <div className="mx-auto max-w-2xl rounded-3xl border border-[#7A5C3E]/10 bg-[#0b0b0b] p-12 shadow-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#C9A227]/80">Order Complete</p>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-[#F5F5F5]">Your order has been placed successfully.</h1>
        <p className="mt-4 text-sm leading-7 text-[#F5F5F5]/70">
          Thanks for shopping with MobzBoss. Your order is now pending and will be processed for delivery.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/shop" className="rounded-full bg-[#C9A227] px-8 py-3 text-sm font-semibold text-[#111111] transition hover:bg-[#b69323]">
            Continue Shopping
          </Link>
          <Link href="/" className="rounded-full border border-[#F5F5F5]/10 px-8 py-3 text-sm font-semibold text-[#F5F5F5] transition hover:border-[#C9A227] hover:text-[#C9A227]">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
