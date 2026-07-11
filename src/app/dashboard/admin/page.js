'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { api, getUser } from '@/utils/api'

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [tab, setTab] = useState('campaigns')
  const [campaigns, setCampaigns] = useState([])
  const [users, setUsers] = useState([])
  const [withdrawals, setWithdrawals] = useState([])
  const [campLoading, setCampLoading] = useState(true)
  const [userLoading, setUserLoading] = useState(true)
  const [withLoading, setWithLoading] = useState(true)

  useEffect(() => {
    const u = getUser()
    if (!u) return router.replace('/auth/login')
    setUser(u)
  }, [router])

  useEffect(() => {
    if (!user || tab !== 'campaigns') return
    setCampLoading(true)
    api.get('/campaigns').then(d => setCampaigns(d.campaigns)).catch(() => setCampaigns([])).finally(() => setCampLoading(false))
  }, [user, tab])

  useEffect(() => {
    if (!user || tab !== 'users') return
    setUserLoading(true)
    api.get('/users').then(d => setUsers(d.users)).catch(() => setUsers([])).finally(() => setUserLoading(false))
  }, [user, tab])

  useEffect(() => {
    if (!user || tab !== 'withdrawals') return
    setWithLoading(true)
    api.get('/credits/withdrawals').then(d => setWithdrawals(d.withdrawals)).catch(() => setWithdrawals([])).finally(() => setWithLoading(false))
  }, [user, tab])

  const handleCampaignStatus = async (id, status) => {
    try {
      await api.patch(`/campaigns/${id}/status`, { status })
      setCampaigns(prev => prev.map(c => c._id === id ? { ...c, status } : c))
    } catch (err) {
      alert(err.message)
    }
  }

  const handleUserRole = async (id, role) => {
    try {
      await api.patch(`/users/${id}/role`, { role })
      setUsers(prev => prev.map(u => u._id === id ? { ...u, role } : u))
    } catch (err) {
      alert(err.message)
    }
  }

  const handleWithdrawal = async (id, status) => {
    try {
      await api.patch(`/credits/withdrawals/${id}`, { status })
      setWithdrawals(prev => prev.map(w => w._id === id ? { ...w, status } : w))
    } catch (err) {
      alert(err.message)
    }
  }

  if (!user) return null

  return (
    <DashboardLayout>
      <h1>Admin Panel</h1>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem' }}>
        {['campaigns', 'users', 'withdrawals'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '0.5rem 1.25rem', background: tab === t ? '#1a1a2e' : '#f5f5f5',
              color: tab === t ? '#fff' : '#333', border: 'none', borderRadius: 4,
              cursor: 'pointer', textTransform: 'capitalize'
            }}
          >
            {t === 'withdrawals' ? 'Withdrawals' : t}
          </button>
        ))}
      </div>

      {tab === 'campaigns' && (
        <>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Campaign Approvals</h2>
          {campLoading ? <p>Loading...</p> : campaigns.length === 0 ? <p style={{ color: '#666' }}>No campaigns.</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
                  <th style={thStyle}>Title</th>
                  <th style={thStyle}>Creator</th>
                  <th style={thStyle}>Goal</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Action</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map(c => (
                  <tr key={c._id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={tdStyle}>{c.title}</td>
                    <td style={tdStyle}>{c.creator?.name || 'Unknown'}</td>
                    <td style={tdStyle}>{c.goal}</td>
                    <td style={tdStyle}>
                      <span style={{
                        background: c.status === 'approved' ? '#5cb85c' : c.status === 'rejected' ? '#d9534f' : '#f0ad4e',
                        color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem'
                      }}>{c.status}</span>
                    </td>
                    <td style={tdStyle}>
                      {c.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleCampaignStatus(c._id, 'approved')} style={{ ...smBtn, background: '#5cb85c' }}>Approve</button>
                          <button onClick={() => handleCampaignStatus(c._id, 'rejected')} style={{ ...smBtn, background: '#d9534f' }}>Reject</button>
                        </div>
                      ) : (
                        <span style={{ color: '#666', fontSize: '0.85rem' }}>--</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {tab === 'users' && (
        <>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>User Management</h2>
          {userLoading ? <p>Loading...</p> : users.length === 0 ? <p style={{ color: '#666' }}>No users.</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Role</th>
                  <th style={thStyle}>Credits</th>
                  <th style={thStyle}>Change Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={tdStyle}>{u.name}</td>
                    <td style={tdStyle}>{u.email}</td>
                    <td style={tdStyle}>{u.role}</td>
                    <td style={tdStyle}>{u.credits}</td>
                    <td style={tdStyle}>
                      <select
                        value={u.role}
                        onChange={(e) => handleUserRole(u._id, e.target.value)}
                        style={{ padding: '0.25rem', fontSize: '0.8rem' }}
                      >
                        <option value="supporter">Supporter</option>
                        <option value="creator">Creator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {tab === 'withdrawals' && (
        <>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Withdrawal Queue</h2>
          {withLoading ? <p>Loading...</p> : withdrawals.length === 0 ? <p style={{ color: '#666' }}>No withdrawal requests.</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
                  <th style={thStyle}>Creator</th>
                  <th style={thStyle}>Credits</th>
                  <th style={thStyle}>Amount ($)</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Action</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map(w => (
                  <tr key={w._id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={tdStyle}>{w.creator?.name || 'Unknown'}</td>
                    <td style={tdStyle}>{w.credits}</td>
                    <td style={tdStyle}>${w.amount}</td>
                    <td style={tdStyle}>
                      <span style={{
                        background: w.status === 'approved' ? '#5cb85c' : w.status === 'rejected' ? '#d9534f' : '#f0ad4e',
                        color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem'
                      }}>{w.status}</span>
                    </td>
                    <td style={tdStyle}>
                      {w.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleWithdrawal(w._id, 'approved')} style={{ ...smBtn, background: '#5cb85c' }}>Approve</button>
                          <button onClick={() => handleWithdrawal(w._id, 'rejected')} style={{ ...smBtn, background: '#d9534f' }}>Reject</button>
                        </div>
                      ) : (
                        <span style={{ color: '#666', fontSize: '0.85rem' }}>--</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </DashboardLayout>
  )
}

const thStyle = { padding: '0.75rem', fontWeight: 600, fontSize: '0.85rem' }
const tdStyle = { padding: '0.75rem', fontSize: '0.85rem' }
const smBtn = {
  padding: '0.3rem 0.75rem', color: '#fff',
  border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem'
}
