import BasicLayout from '@/components/BasicLayout'

export default function Home() {
  return (
    <BasicLayout>
      <h1>Welcome to Crowdfunding</h1>
      <p>Support creative campaigns and bring ideas to life.</p>
      <a href="/campaigns">Browse Campaigns</a>
      <a href="/auth/register">Get Started</a>
    </BasicLayout>
  )
}
