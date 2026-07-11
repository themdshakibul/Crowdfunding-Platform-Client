import Link from 'next/link'
import BasicLayout from '@/components/BasicLayout'

export default function Home() {
  return (
    <BasicLayout>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: 'calc(100vh - 200px)', textAlign: 'center', padding: '2rem'
      }}>
        <h1 className="animate-fade-in" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: '1rem' }}>
          Bring Your Ideas to Life
        </h1>
        <p className="animate-slide-up animate-delay-1" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', color: '#666', maxWidth: 600, marginBottom: '2rem', lineHeight: 1.6 }}>
          A crowdfunding platform where creators launch campaigns and supporters help make them a reality. Every contribution counts.
        </p>
        <div className="animate-slide-up animate-delay-2" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/campaigns" className="hero-cta">Browse Campaigns</Link>
          <Link href="/auth/register" className="hero-cta secondary">Get Started</Link>
        </div>
        <div className="animate-slide-up animate-delay-3" style={{
          display: 'flex', gap: '3rem', marginTop: '4rem',
          flexWrap: 'wrap', justifyContent: 'center'
        }}>
          <div className="animate-float">
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a1a2e' }}>50+</div>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>Active Campaigns</div>
          </div>
          <div className="animate-float" style={{ animationDelay: '0.5s' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a1a2e' }}>1K+</div>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>Supporters</div>
          </div>
          <div className="animate-float" style={{ animationDelay: '1s' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a1a2e' }}>$5K+</div>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>Raised</div>
          </div>
        </div>
      </div>
    </BasicLayout>
  )
}
