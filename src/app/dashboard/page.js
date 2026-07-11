'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import { api, getUser } from '@/utils/api'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({})

  useEffect(() => {
    const u = getUser()
    if (!u) return router.replace('/auth/login')
    setUser(u)

    if (u.role === 'admin') {
      api.get('/campaigns').then(d => setStats(s => ({ ...s, campaigns: d.campaigns.length }))).catch(() => {})
      api.get('/credits/withdrawals').then(d => setStats(s => ({ ...s, withdrawals: d.withdrawals.filter(w => w.status === 'pending').length }))).catch(() => {})
    }
    if (u.role === 'creator') {
      api.get('/campaigns').then(d => setStats(s => ({ ...s, campaigns: d.campaigns.length }))).catch(() => {})
    }
    if (u.role === 'supporter') {
      api.get('/contributions/mine').then(d => setStats(s => ({ ...s, contributions: d.total }))).catch(() => {})
    }
  }, [router])

  if (!user) return null

  return (
    <DashboardLayout>
      <h1>Welcome, {user.name}</h1>
      <p style={{ marginBottom: '1.5rem', color: '#666' }}>{user.email} &middot; {user.role} &middot; {user.credits} credits</p>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {user.role === 'supporter' && (
          <>
            <Card title="Credits" value={user.credits} />
            <Card title="Contributions" value={stats.contributions ?? '...'} />
            <Link href="/campaigns" style={cardLinkStyle}>Browse Campaigns</Link>
            <Link href="/credits" style={cardLinkStyle}>Buy Credits</Link>
          </>
        )}
        {user.role === 'creator' && (
          <>
            <Card title="Credits" value={user.credits} />
            <Card title="Campaigns" value={stats.campaigns ?? '...'} />
            <Link href="/campaigns/create" style={cardLinkStyle}>Create Campaign</Link>
            <Link href="/dashboard/creator" style={cardLinkStyle}>Manage Campaigns</Link>
          </>
        )}
        {user.role === 'admin' && (
          <>
            <Card title="Total Users" value={stats.campaigns ?? '...'} />
            <Card title="Pending Withdrawals" value={stats.withdrawals ?? '...'} />
            <Link href="/dashboard/admin" style={cardLinkStyle}>Admin Panel</Link>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

function Card({ title, value }) {
  return (
    <div style={{
      background: '#f5f5f5', borderRadius: 8, padding: '1.25rem', minWidth: 160,
      textAlign: 'center', border: '1px solid #ddd'
    }}>
      <div style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>{value}</div>
      <div style={{ fontSize: '0.85rem', color: '#666', marginTop: 4 }}>{title}</div>
    </div>
  )
}

const cardLinkStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: '#1a1a2e', color: '#fff', borderRadius: 8, padding: '1.25rem',
  minWidth: 160, textAlign: 'center', fontSize: '0.9rem'
}
