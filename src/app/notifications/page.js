'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import BasicLayout from '@/components/BasicLayout'
import { api, getToken, getUser } from '@/utils/api'

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!getToken()) {
      router.replace('/auth/login')
      return
    }
  }, [router])

  const fetchNotifications = () => {
    setLoading(true)
    api.get('/notifications?limit=50')
      .then(data => {
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      })
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleMarkRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch {}
  }

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch {}
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/${id}`)
      setNotifications(prev => prev.filter(n => n._id !== id))
    } catch {}
  }

  return (
    <BasicLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>Notifications</h1>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} style={{
            padding: '0.4rem 1rem', background: '#1a1a2e', color: '#fff',
            border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.85rem'
          }}>
            Mark all as read ({unreadCount})
          </button>
        )}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : notifications.length === 0 ? (
        <p style={{ color: '#666' }}>No notifications yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {notifications.map(n => (
            <div
              key={n._id}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                padding: '1rem', borderRadius: 6,
                background: n.read ? '#fff' : '#f0f7ff',
                border: '1px solid #eee'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.9rem' }}>{n.message}</span>
                  {!n.read && (
                    <span style={{
                      background: '#e94560', color: '#fff', borderRadius: 4,
                      padding: '1px 6px', fontSize: '0.7rem'
                    }}>
                      NEW
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#999' }}>
                  {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                {!n.read && (
                  <button onClick={() => handleMarkRead(n._id)} style={actionBtn}>Mark read</button>
                )}
                <button onClick={() => handleDelete(n._id)} style={{ ...actionBtn, color: '#d9534f' }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </BasicLayout>
  )
}

const actionBtn = {
  background: 'none', border: 'none', cursor: 'pointer',
  fontSize: '0.8rem', color: '#1a1a2e', textDecoration: 'underline',
  padding: 0, whiteSpace: 'nowrap'
}
