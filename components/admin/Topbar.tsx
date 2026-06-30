"use client";

import React from 'react'

export default function Topbar() {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#7A5C3E]/10 px-4 py-3">
      <div className="text-lg font-semibold text-[#F5F5F5]">MobzBoss Admin</div>
      <div className="flex items-center gap-3">
        <div className="hidden text-sm text-[#D9D0A7] md:block">administrator@mobzboss.com</div>
        <div className="h-8 w-8 rounded-full bg-[#2B2B2B]" />
      </div>
    </div>
  )
}
