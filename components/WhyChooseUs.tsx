const reasons = [
  {
    title: 'Heritage Materials',
    detail: 'Premium wool, Italian cotton, and tactile finishes create elevated streetwear that feels luxurious and durable.',
  },
  {
    title: 'Crafted Tailoring',
    detail: 'Every silhouette is engineered for comfort, structure, and on-stage confidence.',
  },
  {
    title: 'Iconic Details',
    detail: 'Warm gold hardware, vintage stitching, and subtle branding make each piece instantly recognizable.',
  },
]

export default function WhyChooseUs() {
  return (
    <section id="about" className="bg-[#F5F5F5] py-20 text-[#111111]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#7A5C3E]/80">Why Choose Us</p>
          <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Designed for presence, comfort, and timeless luxury.</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#4A4A4A]">
            MobzBoss is the intersection of premium streetwear and vintage refinement, built for the modern tastemaker.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {reasons.map((reason) => (
            <div
              key={reason.title}
              className="rounded-[2rem] border border-[#7A5C3E]/10 bg-white p-8 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.15)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(0,0,0,0.2)]"
            >
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#111111] text-[#C9A227]">
                <span className="text-lg font-semibold">✓</span>
              </div>
              <h3 className="text-xl font-semibold text-[#111111]">{reason.title}</h3>
              <p className="mt-4 text-sm leading-7 text-[#555555]">{reason.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
