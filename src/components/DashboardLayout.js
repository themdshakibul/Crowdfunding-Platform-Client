'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { removeToken, getToken } from '@/utils/api'
import { useEffect, useState } from 'react'

export default function DashboardLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [role, setRole] = useState(null)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.replace('/auth/login')
      return
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      setRole(payload.role)
    } catch {
      router.replace('/auth/login')
    }
  }, [router])

  const handleLogout = () => {
    removeToken()
    router.push('/')
  }

  const navItems = [
    { href: '/dashboard', label: 'Overview', roles: ['supporter', 'creator', 'admin'] },
    { href: '/campaigns', label: 'Campaigns', roles: ['supporter', 'creator', 'admin'] },
    { href: '/credits', label: 'Buy Credits', roles: ['supporter'] },
    { href: '/notifications', label: 'Notifications', roles: ['supporter', 'creator', 'admin'] },
  ]

  const adminItems = [
    { href: '/dashboard/admin', label: 'Manage Campaigns', roles: ['admin'] },
    { href: '/dashboard/admin', label: 'Withdrawals', roles: ['admin'] },
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
        <nav>
          {allItems
            .filter(item => item.roles.includes(role))
            .map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={pathname === item.href ? 'active' : ''}
              >
                {item.label}
              </Link>
            ))}
        </nav>
        <button onClick={handleLogout}>Logout</button>
      </aside>
      <main>{children}</main>
    </div>
  )
}
