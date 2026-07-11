'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { api, getUser } from '@/utils/api'

const STATUS_COLORS = {
  pending: '#f0ad4e',
  approved: '#5cb85c',
  rejected: '#d9534f'
}

export default function SupporterDashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [contributions, setContributions] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const u = getUser()
    if (!u) return router.replace('/auth/login')
    setUser(u)
  }, [router])

  useEffect(() => {
    if (!user) return
    setLoading(true)
    api.get(`/contributions/mine?page=${page}&limit=10`)
      .then(data => {
        setContributions(data.contributions)
        setTotalPages(data.totalPages)
      })
      .catch(() => setContributions([]))
      .finally(() => setLoading(false))
  }, [user, page])

  if (!user) return null

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>My Contributions</h1>
        <div style={{ background: '#e8f5e9', padding: '0.5rem 1rem', borderRadius: 6 }}>
          <strong>Credits:</strong> {user.credits}
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : contributions.length === 0 ? (
        <p style={{ color: '#666' }}>No contributions yet. <a href="/campaigns" style={{ color: '#1a1a2e' }}>Browse campaigns</a></p>
      ) : (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
                <th style={thStyle}>Campaign</th>
                <th style={thStyle}>Amount</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Date</th>
              </tr>
            </thead>
            <tbody>
              {contributions.map(c => (
                <tr key={c._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={tdStyle}>{c.campaign?.title || 'Unknown'}</td>
                  <td style={tdStyle}>{c.amount}</td>
                  <td style={tdStyle}>
                    <span style={{
                      background: STATUS_COLORS[c.status],
                      color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: '0.8rem'
                    }}>
                      {c.status}
                    </span>
                  </td>
                  <td style={tdStyle}>{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={btnStyle}>Previous</button>
            <span style={{ padding: '0.5rem' }}>Page {page} of {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} style={btnStyle}>Next</button>
          </div>
        </>
      )}
    </DashboardLayout>
  )
}

const thStyle = { padding: '0.75rem', fontWeight: 600, fontSize: '0.9rem' }
const tdStyle = { padding: '0.75rem', fontSize: '0.9rem' }
const btnStyle = {
  padding: '0.4rem 1rem', background: '#1a1a2e', color: '#fff',
  border: 'none', borderRadius: 4, cursor: 'pointer'
}
