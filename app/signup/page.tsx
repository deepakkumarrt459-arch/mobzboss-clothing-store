'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useAuth } from '@/components/ui/context/AuthContext'
import { createUser as createUserProfile } from '@/services/userService'

export default function SignupPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setError('')
    setSuccess('')
  }, [name, email, password, confirmPassword])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (!name.trim()) {
      setError('Please enter your full name.')
      return
    }

    setLoading(true)

    try {
      const user = await register(name.trim(), email.trim(), password)
      await createUserProfile({
        id: user.uid,
        name: name.trim(),
        email: user.email ?? email.trim(),
      })
      setSuccess('Account created successfully. Redirecting to login...')
      setTimeout(() => {
        router.push('/login')
      }, 1200)
    } catch (signupError) {
      console.error('Signup failed', signupError)
      setError('Unable to create account. Please check your information and try again.')
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
            <h1 className="text-4xl font-semibold tracking-tight text-[#F5F5F5]">Create your account</h1>
            <p className="max-w-xl text-sm text-[#F5F5F5]/70">Join MobzBoss with your full name and email to track orders and manage your profile.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <label className="block space-y-2 text-sm text-[#F5F5F5]">
              <span>Full Name</span>
              <Input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your full name"
                required
              />
            </label>

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
                placeholder="Create a password"
                required
              />
            </label>

            <label className="block space-y-2 text-sm text-[#F5F5F5]">
              <span>Confirm Password</span>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Re-enter your password"
                required
              />
            </label>

            {error ? <div className="rounded-3xl border border-[#B74C4C]/40 bg-[#3B1E1E] p-4 text-sm text-[#F5F5F5]">{error}</div> : null}
            {success ? <div className="rounded-3xl border border-[#4B7A3B]/40 bg-[#203A20] p-4 text-sm text-[#F5F5F5]">{success}</div> : null}

            <Button type="submit" className="w-full py-3" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-[#F5F5F5]/70">
            Already have an account?{' '}
            <Link href="/login" className="text-[#C9A227] hover:text-[#ebc656]">
              Login
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
