'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { api } from '@/utils/api'
import { uploadImage } from '@/utils/upload'

export default function EditCampaignPage() {
  const { id } = useParams()
  const router = useRouter()
  const [form, setForm] = useState({ title: '', description: '', goal: '' })
  const [existingImage, setExistingImage] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    api.get(`/campaigns/${id}`)
      .then(data => {
        const c = data.campaign
        setForm({ title: c.title, description: c.description, goal: c.goal })
        setExistingImage(c.image || '')
      })
      .catch(err => {
        alert(err.message)
        router.push('/dashboard/creator')
      })
      .finally(() => setLoading(false))
  }, [id, router])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      let imageUrl = existingImage
      if (imageFile) {
        imageUrl = await uploadImage(imageFile)
      }

      await api.put(`/campaigns/${id}`, { ...form, goal: parseInt(form.goal), image: imageUrl })
      router.push(`/campaigns/${id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <DashboardLayout><p>Loading...</p></DashboardLayout>

  return (
    <DashboardLayout>
      <h1>Edit Campaign</h1>
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
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', marginTop: '0.5rem', borderRadius: 4 }} />
          ) : existingImage ? (
            <img src={existingImage} alt="Current" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', marginTop: '0.5rem', borderRadius: 4 }} />
          ) : null}
        </div>

        <button type="submit" disabled={saving} style={{
          padding: '0.5rem 1.5rem', background: '#1a1a2e', color: '#fff',
          border: 'none', borderRadius: 4, cursor: 'pointer'
        }}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </DashboardLayout>
  )
}
