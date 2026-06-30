'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useAuth } from '@/components/ui/context/AuthContext'
import { useUser } from '@/hooks/useUser'
import { updateUser } from '@/services/userService'

export default function AccountPage() {
  const router = useRouter()
  const { user, loading: authLoading, logout } = useAuth()
  const { profile, loading: profileLoading, refresh } = useUser()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login')
    }
  }, [authLoading, router, user])

  useEffect(() => {
    if (profile) {
      setName(profile.name)
      setPhone(profile.phone)
      setAddress(profile.address)
    }
  }, [profile])

  const handleSave = async () => {
    if (!profile) return
    setError('')
    setMessage('')
    setSaving(true)

    try {
      await updateUser(profile.id, {
        name: name.trim() || profile.name,
        phone: phone.trim(),
        address: address.trim(),
      })
      setEditing(false)
      setMessage('Profile updated successfully.')
      await refresh()
    } catch (saveError) {
      console.error('Failed to update profile', saveError)
      setError('Unable to save profile. Please try again later.')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || profileLoading) {
    return <div className="min-h-screen bg-[#090909] px-6 py-24 text-[#F5F5F5]">Loading profile...</div>
  }

  if (!user || !profile) {
    return null
  }

  return (
    <main className="min-h-screen bg-[#090909] text-[#F5F5F5]">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="rounded-[2rem] border border-[#C9A227]/15 bg-[#101010]/90 p-10 shadow-2xl shadow-[#000000]/40">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[#C9A227]">Account</p>
              <h1 className="mt-3 text-4xl font-semibold text-[#F5F5F5]">Your profile</h1>
              <p className="mt-2 text-sm text-[#F5F5F5]/70">Manage your name, contact details, and account settings.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="ghost" onClick={logout}>
                Logout
              </Button>
              <Button variant="ghost" onClick={() => setEditing((current) => !current)}>
                {editing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>
          </div>

          <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
            <section className="rounded-3xl border border-[#7A5C3E]/10 bg-[#0b0b0b] p-8">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#1a1a1a] text-3xl font-semibold text-[#C9A227]">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm text-[#F5F5F5]/70">Profile</p>
                  <p className="text-2xl font-semibold text-[#F5F5F5]">{profile.name}</p>
                </div>
              </div>
              <div className="space-y-4 text-sm text-[#F5F5F5]/80">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[#C9A227]">Email</p>
                  <p className="mt-2">{profile.email}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[#C9A227]">Phone</p>
                  <p className="mt-2">{profile.phone || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[#C9A227]">Address</p>
                  <p className="mt-2">{profile.address || 'Not set'}</p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-[#7A5C3E]/10 bg-[#0b0b0b] p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-[#F5F5F5]">Profile details</h2>
                  <p className="text-sm text-[#F5F5F5]/70">Update your customer information and save changes.</p>
                </div>
              </div>

              {error ? <div className="mb-6 rounded-3xl border border-[#B74C4C]/40 bg-[#3B1E1E] p-4 text-sm text-[#F5F5F5]">{error}</div> : null}
              {message ? <div className="mb-6 rounded-3xl border border-[#4B7A3B]/40 bg-[#203A20] p-4 text-sm text-[#F5F5F5]">{message}</div> : null}

              <div className="space-y-6">
                <label className="block space-y-2 text-sm text-[#F5F5F5]">
                  <span>Name</span>
                  <Input value={name} onChange={(event) => setName(event.target.value)} required />
                </label>

                <label className="block space-y-2 text-sm text-[#F5F5F5]">
                  <span>Phone</span>
                  <Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Phone number" />
                </label>

                <label className="block space-y-2 text-sm text-[#F5F5F5]">
                  <span>Address</span>
                  <textarea
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    placeholder="Street, city, postal code"
                    className="min-h-[120px] w-full rounded-md border border-[#7A5C3E]/10 bg-[#111111] px-3 py-3 text-sm text-[#F5F5F5] placeholder:text-[#B2A87E] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30"
                  />
                </label>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button type="button" onClick={handleSave} disabled={saving || !editing}>
                  {saving ? 'Saving...' : 'Save changes'}
                </Button>
                <Button type="button" variant="ghost" onClick={() => router.push('/orders')}>
                  View orders
                </Button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
