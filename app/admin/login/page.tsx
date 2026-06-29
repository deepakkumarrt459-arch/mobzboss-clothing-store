"use client"

import React, { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    // placeholder: no auth yet
    console.log('login', { email, password })
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b0b0b] p-6">
      <form onSubmit={submit} className="w-full max-w-md space-y-6 rounded-lg border border-[#7A5C3E]/10 bg-[#111111] p-8">
        <h2 className="text-2xl font-semibold">Admin Login</h2>
        <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button type="submit">Login</Button>
      </form>
    </main>
  )
}
