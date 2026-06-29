"use client"

import { useState } from 'react'

type NavItem = {
  label: string
  href: string
}

const navItems: NavItem[] = [
  { label: 'Home', href: '#home' },
  { label: 'Collections', href: '#collections' },
  { label: 'Trending', href: '#trending' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-[#7A5C3E]/10 bg-[#111111]/95 text-[#F5F5F5] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 md:px-8">
        <a href="#home" className="text-lg font-semibold uppercase tracking-[0.32em] text-[#F5F5F5]">
          MOBZBOSS
        </a>

        <button
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#F5F5F5]/10 bg-[#2B2B2B]/95 text-[#F5F5F5] transition hover:border-[#C9A227] hover:text-[#C9A227] md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h16" />
              <path d="M4 12h16" />
              <path d="M4 17h16" />
            </svg>
          )}
        </button>

        <nav className="flex-1 md:flex md:items-center md:justify-center">
          <ul
            className={`absolute inset-x-6 top-full mt-3 space-y-4 rounded-[2rem] border border-[#7A5C3E]/15 bg-[#111111]/98 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 md:static md:inset-auto md:mt-0 md:flex md:space-y-0 md:space-x-10 md:border-0 md:bg-transparent md:p-0 md:shadow-none ${
              menuOpen ? 'block' : 'hidden'
            } md:block`}
          >
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="block rounded-full px-4 py-2 text-sm font-medium text-[#F5F5F5] transition hover:bg-[#2B2B2B] hover:text-[#C9A227] md:px-0 md:py-0"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <a
          href="#contact"
          className="hidden rounded-full border border-[#C9A227] bg-[#C9A227]/10 px-6 py-2 text-sm font-semibold text-[#C9A227] transition hover:bg-[#C9A227] hover:text-[#111111] md:inline-flex"
        >
          Book a Fitting
        </a>
      </div>
    </header>
  )
}
