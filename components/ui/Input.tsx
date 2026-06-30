"use client";

import React from 'react'

type Props = React.InputHTMLAttributes<HTMLInputElement>

export default function Input(props: Props) {
  return (
    <input
      {...props}
      className={`rounded-md border border-[#7A5C3E]/10 bg-[#111111] px-3 py-2 text-sm text-[#F5F5F5] placeholder:text-[#B2A87E] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 ${props.className ?? ''}`}
    />
  )
}
