import Image from 'next/image'

export default function Hero() {
  return (
    <section id="home" className="relative overflow-hidden bg-[#111111] text-[#F5F5F5]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(201,162,39,0.16),_transparent_28%)] opacity-80" />
      <div className="mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl grid-cols-1 items-center gap-12 px-6 py-20 md:grid-cols-[1.2fr_0.8fr] lg:px-8">
        <div className="relative z-10 max-w-2xl space-y-8">
          <span className="inline-flex rounded-full border border-[#C9A227]/40 bg-[#2B2B2B]/90 px-4 py-1 text-sm uppercase tracking-[0.38em] text-[#F5F5F5]">
            Luxury vintage streetwear
          </span>
          <h1 className="text-5xl font-semibold tracking-[-0.04em] text-[#F5F5F5] sm:text-6xl">
            Own the night with precision, texture, and timeless attitude.
          </h1>
          <p className="max-w-xl text-lg leading-8 text-[#D9D0A7]">
            MobzBoss creates premium essentials with matte black foundations, warm gold accents, and bold silhouettes made to stand out.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <a
              href="#collections"
              className="inline-flex items-center justify-center rounded-full bg-[#C9A227] px-8 py-3 text-sm font-semibold text-[#111111] transition duration-300 hover:bg-[#b69323]"
            >
              Explore the Drop
            </a>
            <a
              href="#about"
              className="inline-flex items-center justify-center rounded-full border border-[#F5F5F5]/20 bg-[#F5F5F5]/5 px-8 py-3 text-sm font-semibold text-[#F5F5F5] transition duration-300 hover:border-[#C9A227] hover:bg-[#F5F5F5]/10"
            >
              Learn the Craft
            </a>
          </div>
        </div>

        <div className="relative z-10 w-full sm:max-w-xl">
          <div className="overflow-hidden rounded-[2rem] border border-[#7A5C3E]/20 bg-[#222222]/80 shadow-[0_40px_120px_-60px_rgba(0,0,0,0.95)] relative h-full">
            <Image src="https://placehold.co/600x800/111111/F5F5F5?text=MobzBoss" alt="MobzBoss premium streetwear collection" fill className="object-cover transition duration-500 hover:scale-105" unoptimized />
          </div>
        </div>
      </div>
    </section>
  )
}
