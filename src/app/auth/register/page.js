'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BasicLayout from '@/components/BasicLayout'
import { api, setToken, setUser, getToken } from '@/utils/api'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'supporter' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (getToken()) router.replace('/dashboard')
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.post('/auth/register', form)
      setToken(data.token)
      setUser(data.user)
      router.push('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <BasicLayout>
      <h1>Register</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: 400, marginTop: '1rem' }}>
        {error && <p style={{ color: 'red', marginBottom: '0.5rem' }}>{error}</p>}
        <div style={{ marginBottom: '0.75rem' }}>
          <label>Name</label><br />
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '0.75rem' }}>
          <label>Email</label><br />
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '0.75rem' }}>
          <label>Password</label><br />
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '0.75rem' }}>
          <label>Role</label><br />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            style={{ width: '100%', padding: '0.5rem' }}
          >
            <option value="supporter">Supporter</option>
            <option value="creator">Creator</option>
          </select>
        </div>
        <button type="submit" disabled={loading} style={{ padding: '0.5rem 1.5rem' }}>
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
        <p style={{ marginTop: '0.75rem' }}>
          Already have an account? <Link href="/auth/login">Login</Link>
        </p>
      </form>
    </BasicLayout>
  )
}
