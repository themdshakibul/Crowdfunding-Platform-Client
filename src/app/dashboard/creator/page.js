'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import { api, getUser } from '@/utils/api'

export default function CreatorDashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [campaigns, setCampaigns] = useState([])
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [contributions, setContributions] = useState([])
  const [loading, setLoading] = useState(true)
  const [withdrawCredits, setWithdrawCredits] = useState('')
  const [withdrawMsg, setWithdrawMsg] = useState('')
  const [withdrawLoading, setWithdrawLoading] = useState(false)

  useEffect(() => {
    const u = getUser()
    if (!u) return router.replace('/auth/login')
    setUser(u)
  }, [router])

  useEffect(() => {
    if (!user) return
    setLoading(true)
    api.get('/campaigns')
      .then(data => setCampaigns(data.campaigns))
      .catch(() => setCampaigns([]))
      .finally(() => setLoading(false))
  }, [user])

  const loadContributions = async (campaignId) => {
    setSelectedCampaign(campaignId)
    try {
      const data = await api.get(`/contributions/campaign/${campaignId}`)
      setContributions(data.contributions)
    } catch {
      setContributions([])
    }
  }

  const handleContributionStatus = async (contributionId, status) => {
    try {
      await api.patch(`/contributions/${contributionId}/status`, { status })
      loadContributions(selectedCampaign)
    } catch (err) {
      alert(err.message)
    }
  }

  const handleWithdraw = async (e) => {
    e.preventDefault()
    setWithdrawMsg('')
    setWithdrawLoading(true)
    try {
      const data = await api.post('/credits/withdraw', { credits: parseInt(withdrawCredits) })
      setUser({ ...user, credits: data.credits })
      setWithdrawCredits('')
      setWithdrawMsg('Withdrawal request submitted successfully!')
    } catch (err) {
      setWithdrawMsg(err.message)
    } finally {
      setWithdrawLoading(false)
    }
  }

  if (!user) return null

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>My Campaigns</h1>
        <div style={{ background: '#e8f5e9', padding: '0.5rem 1rem', borderRadius: 6 }}>
          <strong>Credits:</strong> {user.credits}
        </div>
      </div>

      <Link href="/campaigns/create" style={{
        display: 'inline-block', background: '#1a1a2e', color: '#fff',
        padding: '0.5rem 1.25rem', borderRadius: 4, marginBottom: '1rem', fontSize: '0.9rem'
      }}>
        + Create Campaign
      </Link>

      {loading ? (
        <p>Loading...</p>
      ) : campaigns.length === 0 ? (
        <p style={{ color: '#666' }}>No campaigns yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
          {campaigns.map(c => (
            <div key={c._id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '1rem', border: '1px solid #ddd', borderRadius: 6
            }}>
              <div>
                <strong>{c.title}</strong>
                <span style={{
                  marginLeft: '0.75rem', background: c.status === 'approved' ? '#5cb85c' : c.status === 'rejected' ? '#d9534f' : '#f0ad4e',
                  color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem'
                }}>{c.status}</span>
                <div style={{ fontSize: '0.85rem', color: '#666', marginTop: 4 }}>Goal: {c.goal} credits</div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => loadContributions(c._id)} style={smBtn}>Contributions</button>
                <Link href={`/campaigns/${c._id}/edit`} style={{ ...smBtn, textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}>Edit</Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCampaign && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Contribution Requests</h2>
          {contributions.length === 0 ? (
            <p style={{ color: '#666' }}>No contributions yet.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
                  <th style={thStyle}>Supporter</th>
                  <th style={thStyle}>Amount</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Action</th>
                </tr>
              </thead>
              <tbody>
                {contributions.map(c => (
                  <tr key={c._id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={tdStyle}>{c.supporter?.name || 'Unknown'}</td>
                    <td style={tdStyle}>{c.amount}</td>
                    <td style={tdStyle}>{c.status}</td>
                    <td style={tdStyle}>
                      {c.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleContributionStatus(c._id, 'approved')} style={{ ...smBtn, background: '#5cb85c', color: '#fff' }}>Approve</button>
                          <button onClick={() => handleContributionStatus(c._id, 'rejected')} style={{ ...smBtn, background: '#d9534f', color: '#fff' }}>Reject</button>
                        </div>
                      ) : (
                        <span style={{ color: '#666', fontSize: '0.85rem' }}>{c.status}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <div style={{ borderTop: '1px solid #ddd', paddingTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Request Withdrawal</h2>
        <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.75rem' }}>
          Minimum: 200 credits (20 credits = $1). Rate: 20 credits = $1
        </p>
        <form onSubmit={handleWithdraw} style={{ maxWidth: 300 }}>
          {withdrawMsg && <p style={{ color: withdrawMsg.includes('success') ? 'green' : 'red', marginBottom: '0.5rem' }}>{withdrawMsg}</p>}
          <input
            type="number"
            min="200"
            value={withdrawCredits}
            onChange={(e) => setWithdrawCredits(e.target.value)}
            placeholder="Credits to withdraw"
            required
            style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
          />
          <button type="submit" disabled={withdrawLoading} style={{
            padding: '0.5rem 1.25rem', background: '#1a1a2e', color: '#fff',
            border: 'none', borderRadius: 4, cursor: 'pointer'
          }}>
            {withdrawLoading ? 'Submitting...' : 'Request Withdrawal'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  )
}

const thStyle = { padding: '0.75rem', fontWeight: 600, fontSize: '0.85rem' }
const tdStyle = { padding: '0.75rem', fontSize: '0.85rem' }
const smBtn = {
  padding: '0.3rem 0.75rem', background: '#1a1a2e', color: '#fff',
  border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem'
}
