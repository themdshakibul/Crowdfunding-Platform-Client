const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY || ''

export async function uploadImage(file) {
  if (!IMGBB_API_KEY) {
    throw new Error('imgBB API key not configured')
  }

  const formData = new FormData()
  formData.append('image', file)
  formData.append('key', IMGBB_API_KEY)

  const res = await fetch('https://api.imgbb.com/1/upload', {
    method: 'POST',
    body: formData
  })

  const data = await res.json()

  if (!data.success) {
    throw new Error(data.error?.message || 'Image upload failed')
  }

  return data.data.url
}
