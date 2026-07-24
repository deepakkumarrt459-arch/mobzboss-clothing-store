'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../ui/context/AuthContext'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, role, loading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) {
      return
    }

    if (!user) {
      router.replace('/admin/login')
      return
    }

    if (role !== 'admin') {
      const signOutAndRedirect = async () => {
        try {
          await logout()
        } catch (error) {
          console.error('Failed to sign out non-admin user', error)
        }

        router.replace('/admin/login?error=access-denied')
      }

      void signOutAndRedirect()
    }
  }, [loading, user, role, logout, router])

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#0b0b0b] text-[#F5F5F5]">Loading...</div>
  }

  if (!user || role !== 'admin') {
    return null
  }

  return <>{children}</>
}
