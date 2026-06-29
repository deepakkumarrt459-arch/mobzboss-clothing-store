const testimonials = [
  {
    name: 'Jordan Miles',
    role: 'Creative Director',
    quote: 'MobzBoss feels like a statement — every piece is polished, bold, and beautifully considered.',
  },
  {
    name: 'Avery Chen',
    role: 'Entrepreneur',
    quote: 'The craftsmanship is unmatched. I wear it for evenings, events, and wherever I want to stand out.',
  },
  {
    name: 'Rhea Patel',
    role: 'Style Curator',
    quote: 'The vintage accents and premium fit make this brand a consistent go-to for curated streetwear.',
  },
]

export default function Testimonials() {
  return (
    <section className="bg-[#111111] py-20 text-[#F5F5F5]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#C9A227]/80">Testimonials</p>
          <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Trusted by modern tastemakers.</h2>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <blockquote
              key={testimonial.name}
              className="group rounded-[2rem] border border-[#7A5C3E]/15 bg-[#1C1C1C] p-8 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.6)] transition duration-300 hover:-translate-y-1 hover:border-[#C9A227]/30"
            >
              <p className="text-lg leading-8 text-[#D9D0A7]">“{testimonial.quote}”</p>
              <footer className="mt-6 text-sm uppercase tracking-[0.24em] text-[#F5F5F5]/70">
                {testimonial.name}, {testimonial.role}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}
