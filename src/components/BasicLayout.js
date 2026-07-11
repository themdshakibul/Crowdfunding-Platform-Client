'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getToken, removeToken } from '@/utils/api'
import { useEffect, useState } from 'react'

export default function BasicLayout({ children }) {
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = getToken()
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUser(payload)
      } catch {
        setUser(null)
      }
    }
  }, [])

  const handleLogout = () => {
    removeToken()
    setUser(null)
    router.push('/')
  }

  return (
    <>
      <nav>
        <Link href="/">Crowdfunding</Link>
        <div>
          <Link href="/campaigns">Campaigns</Link>
          {user ? (
            <>
              <Link href="/dashboard">Dashboard</Link>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link href="/auth/login">Login</Link>
              <Link href="/auth/register">Register</Link>
            </>
          )}
        </div>
      </nav>
      <main>{children}</main>
      <footer>&copy; {new Date().getFullYear()} Crowdfunding Platform</footer>
    </>
  )
}
