"use client";

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useAuth } from '@/components/ui/context/AuthContext'
import { getUser } from '@/services/userService'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [accessDenied, setAccessDenied] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const params = new URLSearchParams(window.location.search)
    setAccessDenied(params.get('error') === 'access-denied')
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const user = await login(email.trim(), password)
      const profile = await getUser(user.uid)

      if (!profile || profile.role !== 'admin') {
        await logout()
        setError('Access Denied. Admins only.')
        return
      }

      router.push('/admin/dashboard')
    } catch (authError) {
      setError('Invalid email or password. Please try again.')
      console.error('Login failed', authError)
    } finally {
      setLoading(false)
    }
  }

  const displayError = error || (accessDenied ? 'Access Denied. Admins only.' : '')

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b0b0b] p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6 rounded-3xl border border-[#7A5C3E]/10 bg-[#111111] p-8 shadow-xl">
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold text-[#F5F5F5]">Admin Login</h2>
          <p className="text-sm text-[#F5F5F5]/70">Sign in to manage products, orders, and store settings.</p>
        </div>

        {displayError ? <div className="rounded-xl bg-[#5B1E1E] p-3 text-sm text-[#F5F5F5]">{displayError}</div> : null}

        <div className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Signing in…' : 'Login'}
        </Button>
      </form>
    </main>
  )
}
