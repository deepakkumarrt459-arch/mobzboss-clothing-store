import { Product, products } from '@/data/products'

const trendingProducts: Product[] = products.slice(0, 4)

export default function TrendingProducts() {
  return (
    <section id="trending" className="bg-[#2B2B2B] py-20 text-[#F5F5F5]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#C9A227]/80">Trending</p>
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Featured drops shaping the season.</h2>
            <p className="mt-4 text-base leading-7 text-[#D9D0A7]">
              Shop standout MobzBoss pieces that capture sophisticated streetwear energy and polished detail.
            </p>
          </div>
          <a
            href="#collections"
            className="inline-flex items-center rounded-full border border-[#C9A227]/30 bg-[#C9A227]/10 px-6 py-3 text-sm font-semibold text-[#C9A227] transition duration-300 hover:bg-[#C9A227] hover:text-[#111111]"
          >
            View All
          </a>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-4">
          {trendingProducts.map((product) => (
            <article
              key={product.id}
              className="group overflow-hidden rounded-[2rem] border border-[#7A5C3E]/15 bg-[#111111]/95 shadow-[0_30px_70px_-40px_rgba(0,0,0,0.9)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_40px_90px_-40px_rgba(0,0,0,0.95)]"
            >
              <div className="overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-[380px] w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="space-y-4 p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-[#C9A227]/80">{product.category}</p>
                    <h3 className="mt-2 text-xl font-semibold text-[#F5F5F5]">{product.name}</h3>
                  </div>
                  <span className="text-sm font-semibold text-[#C9A227]">{product.price}</span>
                </div>
                <p className="text-sm leading-7 text-[#D9D0A7]">{product.description}</p>
                <a
                  href="#contact"
                  className="inline-flex rounded-full bg-[#C9A227] px-4 py-2 text-sm font-semibold text-[#111111] transition duration-300 hover:bg-[#b69323]"
                >
                  Reserve Now
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
