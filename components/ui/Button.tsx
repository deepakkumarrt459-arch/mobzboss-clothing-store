"use client"

import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' }

export default function Button({ variant = 'primary', className = '', ...props }: Props) {
  const base = 'rounded-md px-4 py-2 text-sm font-semibold transition'
  const variantClass =
    variant === 'primary'
      ? 'bg-[#C9A227] text-[#111111] hover:bg-[#b69323]'
      : 'border border-[#7A5C3E]/10 text-[#F5F5F5] hover:bg-[#1A1A1A]'

  return <button {...props} className={`${base} ${variantClass} ${className}`} />
}
