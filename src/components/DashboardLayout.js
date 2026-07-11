'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { clearAuth, getToken, getUser } from '@/utils/api'
import { useEffect, useState } from 'react'
import NotificationBell from './NotificationBell'

export default function DashboardLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [role, setRole] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.replace('/auth/login')
      return
    }
    const u = getUser()
    if (u) {
      setUser(u)
      setRole(u.role)
    } else {
      router.replace('/auth/login')
    }
  }, [router])

  const handleLogout = () => {
    clearAuth()
    router.push('/')
  }

  const isActive = (href) => {
    const base = href.split('?')[0]
    return pathname === base
  }

  const navItems = [
    { href: '/dashboard', label: 'Overview', roles: ['supporter', 'creator', 'admin'] },
    { href: '/campaigns', label: 'Campaigns', roles: ['supporter', 'creator', 'admin'] },
    { href: '/credits', label: 'Buy Credits', roles: ['supporter'] },
    { href: '/notifications', label: 'Notifications', roles: ['supporter', 'creator', 'admin'] },
  ]

  const adminItems = [
    { href: '/dashboard/admin?tab=campaigns', label: 'Campaign Approvals', roles: ['admin'] },
    { href: '/dashboard/admin?tab=users', label: 'Users', roles: ['admin'] },
    { href: '/dashboard/admin?tab=withdrawals', label: 'Withdrawals', roles: ['admin'] },
  ]

  const creatorItems = [
    { href: '/dashboard/creator', label: 'My Campaigns', roles: ['creator'] },
  ]

  const supporterItems = [
    { href: '/dashboard/supporter', label: 'My Contributions', roles: ['supporter'] },
  ]

  const allItems = [...navItems, ...adminItems, ...creatorItems, ...supporterItems]

  return (
    <div>
      <aside>
        <h2>Dashboard</h2>
        {user && <p style={{ marginBottom: '1rem', fontSize: '0.9rem', opacity: 0.8 }}>{user.name}</p>}
        <nav>
          {allItems
            .filter(item => item.roles.includes(role))
            .map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={isActive(item.href) ? 'active' : ''}
              >
                {item.label}
              </Link>
            ))}
        </nav>
        <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
          <NotificationBell />
        </div>
        <button onClick={handleLogout}>Logout</button>
      </aside>
      <main>{children}</main>
    </div>
  )
}
