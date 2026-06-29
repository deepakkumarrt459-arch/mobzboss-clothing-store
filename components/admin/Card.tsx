import React from 'react'

type Props = {
  title: string
  value: string | number
}

export default function Card({ title, value }: Props) {
  return (
    <div className="rounded-lg border border-[#7A5C3E]/10 bg-[#0f0f0f] p-6">
      <div className="text-sm text-[#D9D0A7]">{title}</div>
      <div className="mt-2 text-2xl font-semibold text-[#F5F5F5]">{value}</div>
    </div>
  )
}
