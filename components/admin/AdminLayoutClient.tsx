'use client'

import { usePathname } from 'next/navigation'
import Sidebar from '@/components/admin/Sidebar'
import Topbar from '@/components/admin/Topbar'
import ProtectedRoute from '@/components/admin/ProtectedRoute'

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/admin/login'

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-[#F5F5F5]">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <Sidebar />
        <div className="flex-1">
          <Topbar />
          <div className="p-6">
            {isLoginPage ? children : <ProtectedRoute>{children}</ProtectedRoute>}
          </div>
        </div>
      </div>
    </div>
  )
}
