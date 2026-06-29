
import { Product, products } from '@/data/products'
import { notFound } from 'next/navigation'

type Props = {
	params: {
		id: string
	}
}

export default function ProductPage({ params }: Props) {
	const product = products.find((p) => p.id === params.id)

	if (!product) {
		notFound()
	}

	return (
		<main className="min-h-screen bg-[#111111] text-[#F5F5F5]">
			<div className="mx-auto max-w-6xl px-6 py-12">
				<div className="grid gap-8 md:grid-cols-2">
					<div className="rounded-[1.5rem] overflow-hidden border border-[#7A5C3E]/10 bg-[#111111]">
						<img src={product!.image} alt={product!.name} className="w-full object-cover" />
					</div>
					<div>
						<p className="text-sm uppercase tracking-[0.28em] text-[#C9A227]/80">{product!.category}</p>
						<h1 className="mt-4 text-3xl font-semibold">{product!.name}</h1>
						<p className="mt-2 text-xl font-semibold text-[#C9A227]">{product!.price}</p>
						<p className="mt-6 text-sm leading-7 text-[#D9D0A7]">{product!.description}</p>

						<div className="mt-8 flex items-center gap-4">
							<button className="rounded-full bg-[#C9A227] px-6 py-3 text-sm font-semibold text-[#111111] transition hover:bg-[#b69323]">Reserve Now</button>
							<button className="rounded-full border border-[#7A5C3E]/10 px-6 py-3 text-sm font-semibold text-[#F5F5F5] hover:bg-[#1A1A1A]">Add to Cart</button>
						</div>

						<div className="mt-6 text-sm text-[#D9D0A7]">Rating: {product!.rating ?? '—'}</div>
					</div>
				</div>
			</div>
		</main>
	)
}
