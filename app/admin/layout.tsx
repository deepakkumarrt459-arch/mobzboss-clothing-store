import React from 'react'
import Sidebar from '@/components/admin/Sidebar'
import Topbar from '@/components/admin/Topbar'

export const metadata = {
  title: 'MobzBoss Admin',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0b0b0b] text-[#F5F5F5]">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <Sidebar />
        <div className="flex-1">
          <Topbar />
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  )
}
