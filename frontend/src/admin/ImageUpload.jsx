import { useState } from 'react'
import { uploadImage } from '../lib/api'

// Image upload field. Shows recommended size, uploads on select, stores the
// returned URL. No URL text entry — upload only.
export default function ImageUpload({ value, onChange }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function onPick(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setBusy(true)
    try {
      const url = await uploadImage(file)
      onChange(url)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
      e.target.value = '' // allow re-selecting the same file
    }
  }

  return (
    <div className="mt-1">
      <div className="flex items-start gap-4">
        <div className="grid h-24 w-40 shrink-0 place-items-center overflow-hidden rounded-md border border-ink/15 bg-paper">
          {value ? (
            <img src={value} alt="Course thumbnail" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-ink-muted">No image</span>
          )}
        </div>
        <div>
          <label className="btn-outline cursor-pointer">
            {busy ? 'Uploading…' : value ? 'Replace image' : 'Upload image'}
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onPick} disabled={busy} className="hidden" />
          </label>
          {value && (
            <button type="button" onClick={() => onChange('')} className="ml-3 text-sm text-red-600 hover:underline">
              Remove
            </button>
          )}
          <p className="mt-2 text-xs text-ink-muted">
            Recommended: <strong>1280 × 720 px</strong> (16:9). JPG, PNG or WebP. Max 2 MB.
          </p>
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  )
}
