'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../ui/context/AuthContext'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/admin/login')
    }
  }, [loading, user, router])

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#0b0b0b] text-[#F5F5F5]">Loading...</div>
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
