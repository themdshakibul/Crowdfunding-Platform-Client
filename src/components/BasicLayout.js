'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getToken, clearAuth, getUser } from '@/utils/api'
import { useEffect, useState } from 'react'

export default function BasicLayout({ children }) {
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = getToken()
    if (token) {
      setUser(getUser())
    }
  }, [])

  const handleLogout = () => {
    clearAuth()
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
              <span>{user.name}</span>
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
