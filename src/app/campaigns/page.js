'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import BasicLayout from '@/components/BasicLayout'
import { api, getToken } from '@/utils/api'

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hasToken, setHasToken] = useState(false)

  useEffect(() => {
    const token = getToken()
    setHasToken(!!token)
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUser(payload)
      } catch { /* ignore */ }
    }
  }, [])

  useEffect(() => {
    if (!hasToken) {
      setLoading(false)
      return
    }
    setLoading(true)
    api.get('/campaigns')
      .then(data => setCampaigns(data.campaigns))
      .catch(() => setCampaigns([]))
      .finally(() => setLoading(false))
  }, [hasToken])

  return (
    <BasicLayout>
      <h1>Campaigns</h1>
      <p style={{ marginBottom: '1.5rem', color: '#666' }}>Discover and support creative campaigns.</p>

      {!hasToken ? (
        <p>Please <Link href="/auth/login" style={{ color: '#1a1a2e' }}>login</Link> to browse campaigns.</p>
      ) : loading ? (
        <p>Loading...</p>
      ) : campaigns.length === 0 ? (
        <p style={{ color: '#666' }}>No campaigns available.</p>
      ) : (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.25rem'
        }}>
          {campaigns.map(c => (
            <Link
              key={c._id}
              href={`/campaigns/${c._id}`}
              style={{
                display: 'block', border: '1px solid #ddd', borderRadius: 8,
                overflow: 'hidden', textDecoration: 'none', color: 'inherit',
                transition: 'box-shadow 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              {c.image && (
                <img src={c.image} alt={c.title} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
              )}
              <div style={{ padding: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>{c.title}</h3>
                <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem', lineClamp: 2, WebkitLineClamp: 2, overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical' }}>
                  {c.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                  <span><strong>Goal:</strong> {c.goal} credits</span>
                  {user?.role !== 'supporter' && (
                    <span style={{
                      background: c.status === 'approved' ? '#5cb85c' : c.status === 'rejected' ? '#d9534f' : '#f0ad4e',
                      color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem'
                    }}>{c.status}</span>
                  )}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.5rem' }}>
                  by {c.creator?.name || 'Unknown'}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </BasicLayout>
  )
}
