'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { api } from '@/utils/api'
import { uploadImage } from '@/utils/upload'

export default function CreateCampaignPage() {
  const router = useRouter()
  const [form, setForm] = useState({ title: '', description: '', goal: '' })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      let imageUrl = ''
      if (imageFile) {
        imageUrl = await uploadImage(imageFile)
      }

      await api.post('/campaigns', { ...form, goal: parseInt(form.goal), image: imageUrl })
      router.push('/dashboard/creator')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <h1>Create Campaign</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: 500, marginTop: '1rem' }}>
        {error && <p style={{ color: 'red', marginBottom: '0.5rem' }}>{error}</p>}

        <div style={{ marginBottom: '0.75rem' }}>
          <label>Title</label><br />
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <label>Description</label><br />
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
            rows={5}
            style={{ width: '100%', padding: '0.5rem', resize: 'vertical' }}
          />
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <label>Goal (credits)</label><br />
          <input
            type="number"
            min="1"
            value={form.goal}
            onChange={(e) => setForm({ ...form, goal: e.target.value })}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <label>Image</label><br />
          <input type="file" accept="image/*" onChange={handleImageChange} style={{ width: '100%' }} />
          {imagePreview && (
            <img src={imagePreview} alt="Preview" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', marginTop: '0.5rem', borderRadius: 4 }} />
          )}
        </div>

        <button type="submit" disabled={loading} style={{
          padding: '0.5rem 1.5rem', background: '#1a1a2e', color: '#fff',
          border: 'none', borderRadius: 4, cursor: 'pointer'
        }}>
          {loading ? 'Creating...' : 'Create Campaign'}
        </button>
      </form>
    </DashboardLayout>
  )
}
