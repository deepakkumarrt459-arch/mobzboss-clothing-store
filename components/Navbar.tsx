"use client";

import { useState } from 'react'
import Link from 'next/link'
import CartButton from './cartcomponents/CartButton'
import CartDrawer from './cartcomponents/CartDrawer'
import { useAuth } from './ui/context/AuthContext'
import { useWishlist } from '@/hooks/useWishlist'

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
  const { user, logout } = useAuth()
  const { wishlistIds } = useWishlist()

  return (
    <header className="sticky top-0 z-50 border-b border-[#7A5C3E]/10 bg-[#111111]/95 text-[#F5F5F5] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4 md:px-8">
        <Link href="#home" className="text-lg font-semibold uppercase tracking-[0.32em] text-[#F5F5F5]">
          MOBZBOSS
        </Link>

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
            className={`absolute inset-x-6 top-full mt-3 space-y-4 rounded-[2rem] border border-[#7A5C3E]/15 bg-[#111111]/98 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 md:static md:inset-auto md:mt-0 md:flex md:space-y-0 md:space-x-8 md:border-0 md:bg-transparent md:p-0 md:shadow-none ${
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
            {user ? (
              <>
                <li>
                  <Link
                    href="/account"
                    className="block rounded-full px-4 py-2 text-sm font-medium text-[#F5F5F5] transition hover:bg-[#2B2B2B] hover:text-[#C9A227] md:px-0 md:py-0"
                    onClick={() => setMenuOpen(false)}
                  >
                    Account
                  </Link>
                </li>
                <li>
                  <Link
                    href="/orders"
                    className="block rounded-full px-4 py-2 text-sm font-medium text-[#F5F5F5] transition hover:bg-[#2B2B2B] hover:text-[#C9A227] md:px-0 md:py-0"
                    onClick={() => setMenuOpen(false)}
                  >
                    Orders
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      logout()
                      setMenuOpen(false)
                    }}
                    className="block w-full rounded-full px-4 py-2 text-left text-sm font-medium text-[#F5F5F5] transition hover:bg-[#2B2B2B] hover:text-[#C9A227] md:px-0 md:py-0"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    href="/login"
                    className="block rounded-full px-4 py-2 text-sm font-medium text-[#F5F5F5] transition hover:bg-[#2B2B2B] hover:text-[#C9A227] md:px-0 md:py-0"
                    onClick={() => setMenuOpen(false)}
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/signup"
                    className="block rounded-full px-4 py-2 text-sm font-medium text-[#C9A227] transition hover:bg-[#2B2B2B] hover:text-[#ebc656] md:px-0 md:py-0"
                    onClick={() => setMenuOpen(false)}
                  >
                    Signup
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/wishlist" className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#F5F5F5]/10 bg-[#2B2B2B]/95 text-[#F5F5F5] transition hover:border-[#C9A227] hover:text-[#C9A227]" aria-label="Open wishlist">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21s-6.4-4.35-8.2-7.12C2.3 11.9 2.6 9.3 4.5 8c1.3-.9 3-.8 4.2.2L12 9.4l3.3-1.2c1.2-1 2.9-1.1 4.2-.2 1.9 1.3 2.2 3.9.7 5.88C18.4 16.65 12 21 12 21Z" />
            </svg>
            {wishlistIds.length > 0 ? (
              <span className="pointer-events-none absolute -top-1 -right-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[#C9A227] px-1.5 text-xs font-semibold text-[#111111]">
                {wishlistIds.length}
              </span>
            ) : null}
          </Link>
          <CartButton />

          <Link
            href="#contact"
            className="hidden rounded-full border border-[#C9A227] bg-[#C9A227]/10 px-6 py-2 text-sm font-semibold text-[#C9A227] transition hover:bg-[#C9A227] hover:text-[#111111] md:inline-flex"
          >
            Book a Fitting
          </Link>
        </div>
        <CartDrawer />
      </div>
    </header>
  )
}
