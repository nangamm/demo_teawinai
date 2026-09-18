export function buildImageUrl(path) {
  const API_BASE = import.meta.env.VITE_API_BASE_URL
    || (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/i, '') : 'http://localhost:5001')

  if (!path) return ''

  try {
    if (path.startsWith('/images/')) return path
    if (path.startsWith('/uploads/')) return new URL(path, API_BASE).toString()

    const isAbsolute = /^https?:\/\//i.test(path)
    if (isAbsolute) {
      const url = new URL(path)
      if (url.hostname.includes('cloudinary.com')) {
        const filename = url.pathname.split('/').pop()
        if (filename) return `/images/${filename}`
      }
      return path
    }
    return new URL(path, API_BASE).toString()
  } catch (err) {
    return `${API_BASE}/${path}`
  }
}
