import { useEffect, useState } from 'react'
import AdminLayout from './AdminLayout'
import { admin } from '../lib/api'

const inr = (paise) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format((paise || 0) / 100)

export default function Purchases() {
  const [rows, setRows] = useState([])
  const [onlyPaid, setOnlyPaid] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [note, setNote] = useState('')

  async function load() {
    setLoading(true)
    try {
      const d = await admin.purchases(onlyPaid)
      setRows(d.purchases)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [onlyPaid]) // eslint-disable-line

  async function resend(id) {
    setNote('')
    try {
      await admin.resendReceipt(id)
      setNote('Receipt + recording link re-sent.')
    } catch (e) {
      setNote('Could not resend: ' + e.message)
    }
  }

  // Flip the invite-sent flag and optimistically update the row.
  async function toggleInvite(p) {
    const next = !p.invite_sent
    setRows((rs) => rs.map((r) => (r.id === p.id ? { ...r, invite_sent: next } : r)))
    try {
      await admin.setInviteSent(p.id, next)
    } catch (e) {
      // revert on failure
      setRows((rs) => rs.map((r) => (r.id === p.id ? { ...r, invite_sent: p.invite_sent } : r)))
      setNote('Could not update invite status: ' + e.message)
    }
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-ink">Purchases</h1>
          <p className="mt-1 text-sm text-ink-muted">Everyone who has bought a course. Use this to confirm who should have Zoom access.</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-ink-muted">
          <input type="checkbox" checked={onlyPaid} onChange={(e) => setOnlyPaid(e.target.checked)} />
          Paid only
        </label>
      </div>

      {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {note && <p className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">{note}</p>}

      <div className="card mt-5 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="px-4 py-3">Buyer</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Invite</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-ink-muted">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-ink-muted">No purchases yet.</td></tr>
            ) : rows.map((p) => (
              <tr key={p.id} className="align-top hover:bg-navy-50/40">
                <td className="px-4 py-3">
                  <div className="font-medium text-ink">{p.buyer_name || '—'}</div>
                  <div className="text-xs text-ink-muted">{p.buyer_address}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-ink">{p.buyer_email}</div>
                  <div className="text-xs text-ink-muted">{p.buyer_phone}</div>
                </td>
                <td className="px-4 py-3 text-ink">{p.course_title}</td>
                <td className="px-4 py-3 font-medium text-ink">{inr(p.amount_paise)}</td>
                <td className="px-4 py-3">
                  <span className={`badge ${p.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>{p.status}</span>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleInvite(p)}
                    title="Click to toggle whether the Zoom invite has been sent"
                    className="inline-flex items-center gap-2"
                  >
                    <span
                      className={`relative h-5 w-9 shrink-0 rounded-full transition ${p.invite_sent ? 'bg-green-500' : 'bg-ink/20'}`}
                    >
                      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${p.invite_sent ? 'left-[18px]' : 'left-0.5'}`} />
                    </span>
                    <span className={`text-xs font-semibold ${p.invite_sent ? 'text-green-700' : 'text-ink-muted'}`}>
                      {p.invite_sent ? 'Sent' : 'Not sent'}
                    </span>
                  </button>
                </td>
                <td className="px-4 py-3 text-xs text-ink-muted">
                  {new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-4 py-3 text-right">
                  {p.status === 'paid' && (
                    <button onClick={() => resend(p.id)} className="text-gold-dark hover:underline">Resend receipt</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-ink-muted">
        Tip: "Resend receipt" re-emails the payment receipt and the Zoom recording link to the buyer.
      </p>
    </AdminLayout>
  )
}
