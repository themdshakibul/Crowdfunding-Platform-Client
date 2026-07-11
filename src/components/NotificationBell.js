'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { api, getToken } from '@/utils/api'

export default function NotificationBell() {
  const router = useRouter()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const bellRef = useRef(null)

  useEffect(() => {
    if (!getToken()) return
    const fetch = () => {
      api.get('/notifications?limit=5')
        .then(data => {
          setNotifications(data.notifications)
          setUnreadCount(data.unreadCount)
        })
        .catch(() => {})
    }
    fetch()
    const interval = setInterval(fetch, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!open) return
    const handleClick = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [open])

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch {}
  }

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch {}
  }

  return (
    <div ref={bellRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: 'none', border: 'none', color: '#fff', cursor: 'pointer',
          fontSize: '1.2rem', position: 'relative', padding: '4px 8px'
        }}
        aria-label="Notifications"
      >
        &#128276;
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: -2, right: -2,
            background: '#e94560', color: '#fff', borderRadius: '50%',
            width: 18, height: 18, fontSize: '0.7rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, zIndex: 1000,
          background: '#fff', border: '1px solid #ddd', borderRadius: 8,
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)', minWidth: 320,
          maxHeight: 400, overflowY: 'auto', color: '#333'
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '0.75rem 1rem', borderBottom: '1px solid #eee'
          }}>
            <strong style={{ fontSize: '0.9rem' }}>Notifications</strong>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {unreadCount > 0 && (
                <button onClick={markAllRead} style={linkBtnStyle}>Mark all read</button>
              )}
              <button onClick={() => { setOpen(false); router.push('/notifications') }} style={linkBtnStyle}>
                View all
              </button>
            </div>
          </div>
          {notifications.length === 0 ? (
            <p style={{ padding: '1rem', textAlign: 'center', color: '#999', fontSize: '0.85rem' }}>
              No notifications
            </p>
          ) : (
            notifications.map(n => (
              <div
                key={n._id}
                onClick={() => !n.read && markAsRead(n._id)}
                style={{
                  padding: '0.75rem 1rem', borderBottom: '1px solid #f5f5f5',
                  cursor: n.read ? 'default' : 'pointer',
                  background: n.read ? '#fff' : '#f0f7ff',
                  fontSize: '0.85rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <span style={{ flex: 1 }}>{n.message}</span>
                  {!n.read && <span style={{ color: '#e94560', fontSize: '0.75rem' }}>new</span>}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#999', marginTop: 4 }}>
                  {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

const linkBtnStyle = {
  background: 'none', border: 'none', color: '#1a1a2e', cursor: 'pointer',
  fontSize: '0.8rem', textDecoration: 'underline', padding: 0
}
