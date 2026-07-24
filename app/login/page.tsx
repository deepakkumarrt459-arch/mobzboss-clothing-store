'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useAuth } from '@/components/ui/context/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const getNextParam = () => {
    if (typeof window === 'undefined') return null
    return new URLSearchParams(window.location.search).get('next')
  }
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email.trim(), password, rememberMe)
      const next = getNextParam() || '/account'
      router.push(next)
    } catch (authError) {
      console.error('Login failed', authError)
      setError('Unable to login. Please check your email and password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#090909] text-[#F5F5F5]">
      <div className="mx-auto flex min-h-screen max-w-4xl items-center px-6 py-12">
        <div className="w-full rounded-[2rem] border border-[#C9A227]/15 bg-[#101010]/90 p-10 shadow-2xl shadow-[#000000]/40 backdrop-blur-xl sm:px-14">
          <div className="mb-8 space-y-3">
            <p className="text-sm uppercase tracking-[0.3em] text-[#C9A227]">MobzBoss</p>
            <h1 className="text-4xl font-semibold tracking-tight text-[#F5F5F5]">Welcome back</h1>
            <p className="max-w-xl text-sm text-[#F5F5F5]/70">Sign in to access your account, review orders, and manage your profile.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <label className="block space-y-2 text-sm text-[#F5F5F5]">
              <span>Email</span>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
            </label>

            <label className="block space-y-2 text-sm text-[#F5F5F5]">
              <span>Password</span>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
              />
            </label>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <label className="inline-flex items-center gap-2 text-sm text-[#F5F5F5]/80">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-4 w-4 rounded border-[#C9A227] bg-[#111111] text-[#C9A227] focus:ring-[#C9A227]"
                />
                Remember me
              </label>

              <Link href="/forgot-password" className="text-sm text-[#C9A227] hover:text-[#ebc656]">
                Forgot password?
              </Link>
            </div>

            {error ? <div className="rounded-3xl border border-[#B74C4C]/40 bg-[#3B1E1E] p-4 text-sm text-[#F5F5F5]">{error}</div> : null}

            <Button type="submit" className="w-full py-3" disabled={loading}>
              {loading ? 'Signing in…' : 'Login'}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-[#F5F5F5]/70">
            New to MobzBoss?{' '}
            <Link href="/signup" className="text-[#C9A227] hover:text-[#ebc656]">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
