"use client"

import React from 'react'
import Link from 'next/link'

const items = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Products', href: '/admin/products' },
]

export default function Sidebar() {
  return (
    <aside className="hidden w-64 flex-col gap-6 bg-[#0f0f0f] p-6 text-[#F5F5F5] md:flex">
      <div className="mb-4 text-lg font-semibold tracking-[0.18em]">Admin</div>
      <nav className="flex flex-col gap-2">
        {items.map((it) => (
          <Link key={it.href} href={it.href} className="rounded-md px-3 py-2 text-sm hover:bg-[#111111]">
            {it.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
