export default function Newsletter() {
  return (
    <section className="bg-[#2B2B2B] py-20 text-[#F5F5F5]">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="rounded-[2rem] border border-[#7A5C3E]/15 bg-[#111111]/90 p-10 shadow-[0_40px_120px_-60px_rgba(0,0,0,0.95)] md:p-12">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#C9A227]/80">Newsletter</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">Receive early access to limited edition drops.</h2>
              <p className="mt-4 text-base leading-7 text-[#D9D0A7]">
                Join the MobzBoss list for exclusive previews, VIP offers, and styling guides from our design team.
              </p>
            </div>

            <form className="space-y-4 sm:space-y-0">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <div className="flex flex-col gap-4 sm:flex-row">
                <input
                  id="newsletter-email"
                  type="email"
                  placeholder="Your email address"
                  className="min-w-0 flex-1 rounded-full border border-[#F5F5F5]/10 bg-[#1A1A1A] px-5 py-4 text-sm text-[#F5F5F5] placeholder:text-[#B2A87E] focus:border-[#C9A227] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/20"
                />
                <button
                  type="submit"
                  className="inline-flex min-w-[12rem] items-center justify-center rounded-full bg-[#C9A227] px-6 py-4 text-sm font-semibold text-[#111111] transition duration-300 hover:bg-[#b69323]"
                >
                  Subscribe Now
                </button>
              </div>
              <p className="text-xs leading-6 text-[#D9D0A7]/90">
                No spam. Just premium launches and styling insight sent directly to your inbox.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
