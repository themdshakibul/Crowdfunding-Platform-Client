'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import BasicLayout from '@/components/BasicLayout'
import { api, getToken, getUser, refreshUser, updateCredits } from '@/utils/api'

export default function CampaignDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [campaign, setCampaign] = useState(null)
  const [contributions, setContributions] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [amount, setAmount] = useState('')
  const [contributeMsg, setContributeMsg] = useState('')
  const [contributeLoading, setContributeLoading] = useState(false)

  useEffect(() => {
    const u = getUser()
    setUser(u)
  }, [])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    api.get(`/campaigns/${id}`)
      .then(data => {
        setCampaign(data.campaign)
        return data.campaign
      })
      .then(c => {
        if (user?.role === 'creator' && c.creator?._id === user?._id) {
          api.get(`/contributions/campaign/${id}`)
            .then(d => setContributions(d.contributions))
            .catch(() => {})
        }
      })
      .catch(err => {
        alert(err.message)
        router.push('/campaigns')
      })
      .finally(() => setLoading(false))
  }, [id, user?.role, user?.id, router])

  const handleContribute = async (e) => {
    e.preventDefault()
    setContributeMsg('')
    setContributeLoading(true)
    try {
      const data = await api.post('/contributions', { campaignId: id, amount: parseInt(amount) })
      updateCredits(data.credits)
      setUser(prev => ({ ...prev, credits: data.credits }))
      setContributeMsg(`Contributed ${amount} credits successfully! Remaining: ${data.credits} credits`)
      setAmount('')
    } catch (err) {
      setContributeMsg(err.message)
    } finally {
      setContributeLoading(false)
    }
  }

  if (loading) return <BasicLayout><p>Loading...</p></BasicLayout>
  if (!campaign) return null

  const isOwner = user?.role === 'creator' && campaign.creator?._id === user._id
  const isSupporter = user?.role === 'supporter'
  const isAdmin = user?.role === 'admin'

  return (
    <BasicLayout>
      <Link href="/campaigns" style={{ color: '#1a1a2e', fontSize: '0.9rem' }}>&larr; Back to Campaigns</Link>

      {campaign.image && (
        <img src={campaign.image} alt={campaign.title} style={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 8, marginTop: '1rem' }} />
      )}

      <div style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h1>{campaign.title}</h1>
          {!isSupporter && (
            <span style={{
              background: campaign.status === 'approved' ? '#5cb85c' : campaign.status === 'rejected' ? '#d9534f' : '#f0ad4e',
              color: '#fff', padding: '4px 12px', borderRadius: 4, fontSize: '0.85rem'
            }}>{campaign.status}</span>
          )}
        </div>

        <div style={{ color: '#666', fontSize: '0.9rem', margin: '0.5rem 0 1rem' }}>
          by {campaign.creator?.name || 'Unknown'} &middot; Goal: {campaign.goal} credits &middot; Created {new Date(campaign.createdAt).toLocaleDateString()}
        </div>

        <p style={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{campaign.description}</p>
      </div>

      {isSupporter && campaign.status === 'approved' && (
        <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: 8, border: '1px solid #ddd' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Contribute</h2>
          <form onSubmit={handleContribute} style={{ maxWidth: 300 }}>
            {contributeMsg && <p style={{ color: contributeMsg.includes('success') ? 'green' : 'red', marginBottom: '0.5rem' }}>{contributeMsg}</p>}
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Credits to contribute"
              required
              style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
            />
            <button type="submit" disabled={contributeLoading} style={{
              padding: '0.5rem 1.5rem', background: '#1a1a2e', color: '#fff',
              border: 'none', borderRadius: 4, cursor: 'pointer'
            }}>
              {contributeLoading ? 'Processing...' : 'Contribute'}
            </button>
          </form>
        </div>
      )}

      {isOwner && contributions.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Contributions</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem', fontWeight: 600, fontSize: '0.85rem' }}>Supporter</th>
                <th style={{ padding: '0.75rem', fontWeight: 600, fontSize: '0.85rem' }}>Amount</th>
                <th style={{ padding: '0.75rem', fontWeight: 600, fontSize: '0.85rem' }}>Status</th>
                <th style={{ padding: '0.75rem', fontWeight: 600, fontSize: '0.85rem' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {contributions.map(c => (
                <tr key={c._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>{c.supporter?.name || 'Unknown'}</td>
                  <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>{c.amount}</td>
                  <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>{c.status}</td>
                  <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isAdmin && (
        <div style={{ marginTop: '2rem' }}>
          <Link href={`/campaigns/${id}/edit`} style={{
            display: 'inline-block', padding: '0.5rem 1.25rem', background: '#1a1a2e',
            color: '#fff', borderRadius: 4, fontSize: '0.9rem'
          }}>Edit Campaign</Link>
        </div>
      )}
    </BasicLayout>
  )
}
