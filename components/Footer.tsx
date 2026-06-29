const links = [
  { label: 'About', href: '#about' },
  { label: 'Collections', href: '#collections' },
  { label: 'Trending', href: '#trending' },
  { label: 'Contact', href: '#contact' },
]

const socials = [
  { label: 'Instagram', href: 'https://instagram.com' },
  { label: 'TikTok', href: 'https://tiktok.com' },
  { label: 'Email', href: 'mailto:hello@mobzboss.com' },
]

export default function Footer() {
  return (
    <footer className="bg-[#111111] text-[#F5F5F5]">
      <div className="mx-auto max-w-7xl space-y-10 px-6 py-16 lg:px-8">
        <div className="flex flex-col gap-10 border-b border-[#7A5C3E]/10 pb-10 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <p className="text-lg font-semibold uppercase tracking-[0.32em] text-[#F5F5F5]">MobzBoss</p>
            <p className="mt-4 max-w-sm text-sm leading-7 text-[#D9D0A7]">
              Elevating classic streetwear with premium materials, bold finishes, and modern vintage attitude.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-[#F5F5F5]/80">
            {links.map((link) => (
              <a key={link.href} href={link.href} className="transition hover:text-[#C9A227]">
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-[#C9A227]/80">Stay connected</p>
            <p className="mt-3 text-sm text-[#D9D0A7]">Follow our launches and exclusive events on social media.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-[#F5F5F5]/80">
            {socials.map((item) => (
              <a key={item.href} href={item.href} className="transition hover:text-[#C9A227]">
                {item.label}
              </a>
            ))}
          </div>
        </div>

        <p className="text-xs text-[#F5F5F5]/50">© {new Date().getFullYear()} MobzBoss. Crafted for elevated urban style.</p>
      </div>
    </footer>
  )
}
