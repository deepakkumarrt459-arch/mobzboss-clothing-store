'use client'

import { useState } from 'react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useAuth } from '@/components/ui/context/AuthContext'

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      await resetPassword(email.trim())
      setMessage('Password reset email sent. Check your inbox.')
    } catch (resetError) {
      console.error('Password reset failed', resetError)
      setError('Unable to send reset email. Please verify your email address.')
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
            <h1 className="text-4xl font-semibold tracking-tight text-[#F5F5F5]">Forgot password</h1>
            <p className="max-w-xl text-sm text-[#F5F5F5]/70">Enter your email to receive a password reset link.</p>
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

            {error ? <div className="rounded-3xl border border-[#B74C4C]/40 bg-[#3B1E1E] p-4 text-sm text-[#F5F5F5]">{error}</div> : null}
            {message ? <div className="rounded-3xl border border-[#4B7A3B]/40 bg-[#203A20] p-4 text-sm text-[#F5F5F5]">{message}</div> : null}

            <Button type="submit" className="w-full py-3" disabled={loading}>
              {loading ? 'Sending email...' : 'Send reset email'}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-[#F5F5F5]/70">
            Remembered your password?{' '}
            <Link href="/login" className="text-[#C9A227] hover:text-[#ebc656]">
              Login
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
