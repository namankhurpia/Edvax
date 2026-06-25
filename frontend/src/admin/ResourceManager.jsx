import { useEffect, useState } from 'react'
import AdminLayout from './AdminLayout'
import ChapterEditor from './ChapterEditor'
import ImageUpload from './ImageUpload'

// Generic CRUD manager. Config supplies the title, API funcs, table columns and form fields.
export default function ResourceManager({ title, listKey, fields, columns, api, emptyItem }) {
  const [items, setItems] = useState([])
  const [editing, setEditing] = useState(null) // null = list view; object = form
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const d = await api.list()
      setItems(d[listKey])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, []) // eslint-disable-line

  async function save(e) {
    e.preventDefault()
    setError('')
    try {
      const payload = coerce(editing, fields)
      if (editing.id) await api.update(editing.id, payload)
      else await api.create(payload)
      setEditing(null)
      load()
    } catch (e) {
      setError(e.details ? `${e.message}: ${JSON.stringify(e.details)}` : e.message)
    }
  }

  async function remove(id) {
    if (!confirm('Delete this item? This cannot be undone.')) return
    try { await api.remove(id); load() } catch (e) { setError(e.message) }
  }

  // Open the edit form with the FULL record. The list rows only carry a few
  // columns, so fetch the complete record (body, summary, cover, etc.) first.
  async function openEdit(row) {
    setError('')
    if (api.getOne) {
      try {
        const full = await api.getOne(row.id)
        setEditing({ ...emptyItem, ...full })
        return
      } catch (e) {
        setError(`Could not load item for editing: ${e.message}`)
        return
      }
    }
    setEditing({ ...emptyItem, ...row })
  }

  if (editing) {
    return (
      <AdminLayout>
        <button onClick={() => setEditing(null)} className="text-sm font-medium text-gold-dark hover:underline">← Back to {title}</button>
        <h1 className="mt-3 font-serif text-2xl font-bold text-ink">{editing.id ? 'Edit' : 'New'} {title.replace(/s$/, '')}</h1>
        {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <form onSubmit={save} className="card mt-5 max-w-2xl space-y-4 p-6">
          {fields.map((f) => (
            <div key={f.name}>
              <label className="text-sm font-medium text-ink">{f.label}</label>
              {f.type === 'image' ? (
                <ImageUpload value={editing[f.name] || ''} onChange={(v) => setEditing({ ...editing, [f.name]: v })} />
              ) : f.type === 'chapters' ? (
                <div className="mt-1">
                  <ChapterEditor value={editing[f.name] || []} onChange={(v) => setEditing({ ...editing, [f.name]: v })} />
                </div>
              ) : f.type === 'textarea' ? (
                <textarea rows={f.rows || 4} value={editing[f.name] ?? ''} onChange={(e) => setEditing({ ...editing, [f.name]: e.target.value })}
                  className="mt-1 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-gold focus:outline-none" />
              ) : f.type === 'select' ? (
                <select value={editing[f.name] ?? f.options[0]} onChange={(e) => setEditing({ ...editing, [f.name]: e.target.value })}
                  className="mt-1 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-gold focus:outline-none">
                  {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input type={f.type === 'number' ? 'number' : 'text'} value={editing[f.name] ?? ''} onChange={(e) => setEditing({ ...editing, [f.name]: e.target.value })}
                  className="mt-1 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-gold focus:outline-none" />
              )}
              {f.hint && <p className="mt-1 text-xs text-ink-muted">{f.hint}</p>}
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button className="btn-primary">Save</button>
            <button type="button" onClick={() => setEditing(null)} className="btn-outline">Cancel</button>
          </div>
        </form>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-ink">{title}</h1>
        <button onClick={() => setEditing({ ...emptyItem })} className="btn-primary">+ New</button>
      </div>
      {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <div className="card mt-5 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink-muted">
            <tr>{columns.map((c) => <th key={c.key} className="px-5 py-3">{c.label}</th>)}<th className="px-5 py-3 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {loading ? (
              <tr><td colSpan={columns.length + 1} className="px-5 py-8 text-center text-ink-muted">Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={columns.length + 1} className="px-5 py-8 text-center text-ink-muted">No items yet.</td></tr>
            ) : items.map((it) => (
              <tr key={it.id} className="hover:bg-navy-50/40">
                {columns.map((c) => (
                  <td key={c.key} className="px-5 py-3">
                    {c.key === 'status' ? (
                      <span className={`badge ${it[c.key] === 'published' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>{it[c.key]}</span>
                    ) : c.render ? c.render(it) : it[c.key]}
                  </td>
                ))}
                <td className="px-5 py-3 text-right">
                  <button onClick={() => openEdit(it)} className="text-gold-dark hover:underline">Edit</button>
                  <button onClick={() => remove(it.id)} className="ml-4 text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}

// Convert number-typed fields back to numbers before sending.
function coerce(item, fields) {
  const out = { ...item }
  for (const f of fields) {
    if (f.type === 'number') out[f.name] = Number(out[f.name] || 0)
  }
  delete out.created_at
  delete out.updated_at
  delete out.slug
  delete out.published_at
  delete out.has_zoom
  delete out.id
  return out
}
