import { useCallback, useEffect, useState } from 'react'
import { api, BLOOD_GROUPS } from '../api'
import { useApp } from '../context/AppContext'

const blank = { bloodGroup: 'O+', age: 25, gender: 'male', city: '', state: '', bio: '' }
const badge = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  accepted: 'bg-green-100 text-green-700',
  declined: 'bg-slate-100 text-slate-600',
  completed: 'bg-blue-100 text-blue-700',
}
const input = 'mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2'

export default function DonorDashboard() {
  const { user } = useApp()
  const [donor, setDonor] = useState(null)
  const [form, setForm] = useState(blank)
  const [requests, setRequests] = useState([])
  const [donations, setDonations] = useState([])
  const [donation, setDonation] = useState({ donationDate: '', location: '', units: 1 })
  const [msg, setMsg] = useState({ type: '', text: '' })

  const load = useCallback(async () => {
    try {
      const [d, r, h] = await Promise.all([api.get('/donors/me'), api.get('/requests/mine'), api.get('/donations/mine')])
      setDonor(d); setRequests(r); setDonations(h)
      if (d) setForm({ bloodGroup: d.bloodGroup, age: d.age, gender: d.gender, city: d.city, state: d.state || '', bio: d.bio || '' })
    } catch (e) {
      setMsg({ type: 'error', text: e.message })
    }
  }, [])

  useEffect(() => { load() }, [load])

  const run = async (fn, okText) => {
    try { await fn(); setMsg({ type: 'ok', text: okText }); await load() }
    catch (e) { setMsg({ type: 'error', text: e.message }) }
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Hello, {user.name}</h1>
          {donor && <span className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${badge[donor.status]}`}>Profile {donor.status}</span>}
        </div>
        {donor && (
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={donor.available}
              onChange={(e) => run(() => api.patch('/donors/me/availability', { available: e.target.checked }), 'Availability updated')} />
            I am available to donate
          </label>
        )}
      </div>

      {msg.text && <p className={`rounded-lg p-3 text-sm ${msg.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{msg.text}</p>}
      {donor?.status === 'pending' && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Your profile is waiting for admin approval and is not visible in search yet.</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold">{donor ? 'Edit donor profile' : 'Create your donor profile'}</h2>
          <form onSubmit={(e) => { e.preventDefault(); run(() => api.put('/donors/me', { ...form, age: Number(form.age) }), 'Profile saved') }} className="mt-4 grid grid-cols-2 gap-3">
            <label className="text-sm font-medium">Blood group
              <select value={form.bloodGroup} onChange={set('bloodGroup')} className={input}>{BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}</select>
            </label>
            <label className="text-sm font-medium">Age<input type="number" min={18} max={65} required value={form.age} onChange={set('age')} className={input} /></label>
            <label className="text-sm font-medium">Gender
              <select value={form.gender} onChange={set('gender')} className={input}><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select>
            </label>
            <label className="text-sm font-medium">City<input required value={form.city} onChange={set('city')} className={input} /></label>
            <label className="col-span-2 text-sm font-medium">State<input value={form.state} onChange={set('state')} className={input} /></label>
            <label className="col-span-2 text-sm font-medium">About you<textarea rows={3} maxLength={300} value={form.bio} onChange={set('bio')} className={input} /></label>
            <button className="col-span-2 rounded-lg bg-red-600 py-2.5 font-semibold text-white hover:bg-red-700">Save profile</button>
            {donor && <p className="col-span-2 text-xs text-slate-500">Changing blood group or city sends your profile back for approval.</p>}
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Incoming requests</h2>
          {requests.length === 0 && <p className="mt-3 text-sm text-slate-500">No requests yet.</p>}
          <ul className="mt-3 space-y-3">
            {requests.map((r) => (
              <li key={r._id} className="rounded-xl border border-slate-200 p-4 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{r.requesterName} · {r.requesterPhone}</p>
                    <p className="text-slate-500">{r.hospital}, {r.city}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badge[r.status]}`}>{r.status}</span>
                </div>
                {r.message && <p className="mt-2 text-slate-700">{r.message}</p>}
                <div className="mt-3 flex gap-2">
                  {r.status === 'pending' && <>
                    <button onClick={() => run(() => api.patch(`/requests/${r._id}`, { status: 'accepted' }), 'Request accepted')} className="rounded-lg bg-green-600 px-3 py-1.5 text-white">Accept</button>
                    <button onClick={() => run(() => api.patch(`/requests/${r._id}`, { status: 'declined' }), 'Request declined')} className="rounded-lg border border-slate-300 px-3 py-1.5">Decline</button>
                  </>}
                  {r.status === 'accepted' && <button onClick={() => run(() => api.patch(`/requests/${r._id}`, { status: 'completed' }), 'Marked completed')} className="rounded-lg bg-blue-600 px-3 py-1.5 text-white">Mark completed</button>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {donor && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Donation history</h2>
          <form onSubmit={(e) => { e.preventDefault(); run(async () => { await api.post('/donations/mine', { ...donation, units: Number(donation.units) }); setDonation({ donationDate: '', location: '', units: 1 }) }, 'Donation recorded') }}
            className="mt-4 flex flex-wrap items-end gap-3">
            <label className="text-sm font-medium">Date<input type="date" required value={donation.donationDate} onChange={(e) => setDonation({ ...donation, donationDate: e.target.value })} className={input} /></label>
            <label className="text-sm font-medium">Location<input required value={donation.location} onChange={(e) => setDonation({ ...donation, location: e.target.value })} className={input} /></label>
            <label className="text-sm font-medium">Units<input type="number" min={1} max={2} value={donation.units} onChange={(e) => setDonation({ ...donation, units: e.target.value })} className={`${input} w-20`} /></label>
            <button className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700">Add</button>
          </form>
          <table className="mt-4 w-full text-left text-sm">
            <thead className="text-slate-500"><tr><th className="py-2">Date</th><th>Location</th><th>Units</th><th /></tr></thead>
            <tbody>
              {donations.map((d) => (
                <tr key={d._id} className="border-t border-slate-100">
                  <td className="py-2">{new Date(d.donationDate).toLocaleDateString()}</td>
                  <td>{d.location}</td><td>{d.units}</td>
                  <td className="text-right"><button onClick={() => run(() => api.del(`/donations/${d._id}`), 'Donation removed')} className="text-red-600 hover:underline">Remove</button></td>
                </tr>
              ))}
              {donations.length === 0 && <tr><td colSpan={4} className="py-3 text-slate-500">No donations recorded.</td></tr>}
            </tbody>
          </table>
        </section>
      )}
    </main>
  )
}
