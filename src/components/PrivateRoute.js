'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getToken } from '@/utils/api'

export default function PrivateRoute({ children, allowedRoles }) {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.replace('/auth/login')
      return
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (allowedRoles && !allowedRoles.includes(payload.role)) {
        router.replace('/')
        return
      }
      setAuthorized(true)
    } catch {
      router.replace('/auth/login')
    }
  }, [router, allowedRoles])

  if (!authorized) return null

  return children
}
