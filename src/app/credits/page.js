'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import BasicLayout from '@/components/BasicLayout'
import { api, getToken, refreshUser, getUser } from '@/utils/api'

const PACKAGES = [
  { id: '100', credits: 100, price: 10, label: 'Starter' },
  { id: '300', credits: 300, price: 25, label: 'Popular' },
  { id: '800', credits: 800, price: 60, label: 'Pro' },
  { id: '1500', credits: 1500, price: 110, label: 'Premium' },
]

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_KEY || 'pk_test_placeholder'
)

function CheckoutForm({ credits, clientSecret, onDone }) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setProcessing(true)
    setError('')

    const { error: submitError } = await elements.submit()
    if (submitError) {
      setError(submitError.message)
      setProcessing(false)
      return
    }

    const { paymentIntent, error: confirmError } = await stripe.confirmPayment({
      elements,
      clientSecret,
      redirect: 'if_required',
    })

    if (confirmError) {
      setError(confirmError.message)
      setProcessing(false)
      return
    }

    if (paymentIntent.status === 'succeeded') {
      try {
        const data = await api.post('/credits/confirm', { paymentIntentId: paymentIntent.id })
        refreshUser()
        onDone(data.added, data.credits)
      } catch (err) {
        setError(err.message)
      }
    }
    setProcessing(false)
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, marginTop: '1rem' }}>
      <p style={{ marginBottom: '1rem' }}>
        Pay ${credits === '100' ? 10 : credits === '300' ? 25 : credits === '800' ? 60 : 110} to get <strong>{credits} credits</strong>
      </p>
      <PaymentElement />
      {error && <p style={{ color: 'red', marginTop: '0.5rem' }}>{error}</p>}
      <button type="submit" disabled={!stripe || processing} style={{
        marginTop: '1rem', padding: '0.6rem 1.5rem', background: '#1a1a2e',
        color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer'
      }}>
        {processing ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  )
}

export default function CreditsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [selected, setSelected] = useState(null)
  const [clientSecret, setClientSecret] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.replace('/auth/login')
      return
    }
    const u = getUser()
    setUser(u)
    refreshUser().then(setUser)
  }, [router])

  const handleSelect = async (pkg) => {
    setSelected(pkg)
    setClientSecret('')
    setMessage('')
    try {
      const data = await api.post('/credits/purchase', { packageId: pkg.id })
      setClientSecret(data.clientSecret)
    } catch (err) {
      setMessage(err.message)
    }
  }

  const handlePaymentDone = (added, totalCredits) => {
    setMessage(`Successfully added ${added} credits! Your balance: ${totalCredits} credits`)
    setSelected(null)
    setClientSecret('')
    setUser(prev => ({ ...prev, credits: totalCredits }))
  }

  return (
    <BasicLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>Buy Credits</h1>
        {user && (
          <div style={{ background: '#e8f5e9', padding: '0.5rem 1rem', borderRadius: 6 }}>
            <strong>Balance:</strong> {user.credits} credits
          </div>
        )}
      </div>

      {message && (
        <p style={{
          padding: '0.75rem', borderRadius: 6, marginBottom: '1rem',
          background: message.includes('Success') ? '#e8f5e9' : '#fce4ec',
          color: message.includes('Success') ? '#2e7d32' : '#c62828'
        }}>{message}</p>
      )}

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '1rem', marginBottom: '2rem'
      }}>
        {PACKAGES.map(pkg => (
          <button
            key={pkg.id}
            onClick={() => handleSelect(pkg)}
            style={{
              padding: '1.5rem', border: selected?.id === pkg.id ? '2px solid #1a1a2e' : '1px solid #ddd',
              borderRadius: 8, background: selected?.id === pkg.id ? '#f0f0ff' : '#fff',
              cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s'
            }}
          >
            <div style={{ fontSize: '0.85rem', color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>
              {pkg.label}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>
              {pkg.credits}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>credits</div>
            <div style={{
              marginTop: '1rem', padding: '0.4rem', background: '#1a1a2e',
              color: '#fff', borderRadius: 4, fontSize: '0.9rem'
            }}>
              ${pkg.price}
            </div>
          </button>
        ))}
      </div>

      {clientSecret && (
        <div style={{ borderTop: '1px solid #ddd', paddingTop: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Complete Payment</h2>
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm credits={selected.id} clientSecret={clientSecret} onDone={handlePaymentDone} />
          </Elements>
        </div>
      )}
    </BasicLayout>
  )
}
