import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'

const empty = { requesterName: '', requesterPhone: '', requesterEmail: '', hospital: '', city: '', message: '' }

export default function DonorProfile() {
  const { id } = useParams()
  const [donor, setDonor] = useState(null)
  const [error, setError] = useState('')
  const [form, setForm] = useState(empty)
  const [sent, setSent] = useState(false)
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api.get(`/donors/${id}`).then(setDonor).catch((e) => setError(e.message))
  }, [id])

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setFormError('')
    try {
      await api.post('/requests', { donorId: id, ...form })
      setSent(true); setForm(empty)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (error) return <main className="mx-auto max-w-3xl px-4 py-16 text-center"><p className="text-red-700">{error}</p><Link to="/donors" className="mt-4 inline-block text-red-600 underline">Back to donors</Link></main>
  if (!donor) return <main className="mx-auto max-w-3xl px-4 py-16 text-slate-500">Loading…</main>

  const input = 'mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2'

  return (
    <main className="mx-auto grid max-w-5xl gap-6 px-4 py-10 md:grid-cols-2">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-red-600 text-xl font-bold text-white">{donor.bloodGroup}</span>
          <div>
            <h1 className="text-2xl font-bold">{donor.user?.name}</h1>
            <p className="text-slate-500">{donor.city}{donor.state ? `, ${donor.state}` : ''}</p>
          </div>
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div><dt className="text-slate-500">Age</dt><dd className="font-medium">{donor.age}</dd></div>
          <div><dt className="text-slate-500">Gender</dt><dd className="font-medium capitalize">{donor.gender}</dd></div>
          <div><dt className="text-slate-500">Last donated</dt><dd className="font-medium">{donor.lastDonationDate ? new Date(donor.lastDonationDate).toLocaleDateString() : '—'}</dd></div>
          <div><dt className="text-slate-500">Status</dt><dd className={`font-medium ${donor.available ? 'text-green-700' : 'text-slate-500'}`}>{donor.available ? 'Available' : 'Unavailable'}</dd></div>
        </dl>
        {donor.bio && <p className="mt-6 text-slate-700">{donor.bio}</p>}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Request blood</h2>
        <p className="text-sm text-slate-500">The donor will see your details and can accept or decline.</p>
        {sent ? (
          <p className="mt-4 rounded-lg bg-green-50 p-4 text-green-700">Request sent. The donor will contact you if they accept.</p>
        ) : !donor.available ? (
          <p className="mt-4 rounded-lg bg-slate-100 p-4 text-slate-600">This donor is currently unavailable.</p>
        ) : (
          <form onSubmit={submit} className="mt-4 space-y-3">
            <label className="block text-sm font-medium">Your name<input required value={form.requesterName} onChange={set('requesterName')} className={input} /></label>
            <label className="block text-sm font-medium">Phone<input required value={form.requesterPhone} onChange={set('requesterPhone')} className={input} /></label>
            <label className="block text-sm font-medium">Email (optional)<input type="email" value={form.requesterEmail} onChange={set('requesterEmail')} className={input} /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-medium">Hospital<input required value={form.hospital} onChange={set('hospital')} className={input} /></label>
              <label className="block text-sm font-medium">City<input required value={form.city} onChange={set('city')} className={input} /></label>
            </div>
            <label className="block text-sm font-medium">Message<textarea rows={3} maxLength={500} value={form.message} onChange={set('message')} className={input} /></label>
            {formError && <p className="text-sm text-red-700">{formError}</p>}
            <button disabled={busy} className="w-full rounded-lg bg-red-600 py-2.5 font-semibold text-white hover:bg-red-700 disabled:opacity-60">
              {busy ? 'Sending…' : 'Send request'}
            </button>
          </form>
        )}
      </section>
    </main>
  )
}
