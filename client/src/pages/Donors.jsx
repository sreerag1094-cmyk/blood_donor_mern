import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, BLOOD_GROUPS } from '../api'

export default function Donors() {
  const [filters, setFilters] = useState({ bloodGroup: '', city: '', available: false })
  const [donors, setDonors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams()
    if (filters.bloodGroup) params.set('bloodGroup', filters.bloodGroup)
    if (filters.city.trim()) params.set('city', filters.city.trim())
    if (filters.available) params.set('available', 'true')

    setLoading(true)
    const t = setTimeout(() => {
      api.get(`/donors?${params}`)
        .then((d) => { setDonors(d); setError('') })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false))
    }, 250)
    return () => clearTimeout(t)
  }, [filters])

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Find a donor</h1>

      <div className="mt-6 flex flex-wrap items-end gap-4 rounded-2xl border border-slate-200 bg-white p-4">
        <label className="text-sm font-medium">
          Blood group
          <select value={filters.bloodGroup} onChange={(e) => setFilters({ ...filters, bloodGroup: e.target.value })}
            className="mt-1 block w-36 rounded-lg border border-slate-300 px-3 py-2">
            <option value="">Any</option>
            {BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium">
          City
          <input value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            placeholder="e.g. Kochi" className="mt-1 block w-56 rounded-lg border border-slate-300 px-3 py-2" />
        </label>
        <label className="flex items-center gap-2 pb-2 text-sm font-medium">
          <input type="checkbox" checked={filters.available} onChange={(e) => setFilters({ ...filters, available: e.target.checked })} />
          Available now
        </label>
      </div>

      {error && <p className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {loading && <p className="mt-6 text-slate-500">Loading…</p>}
      {!loading && !error && donors.length === 0 && <p className="mt-6 text-slate-500">No donors match your search.</p>}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {donors.map((d) => (
          <Link key={d._id} to={`/donors/${d._id}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold">{d.user?.name}</h2>
                <p className="text-sm text-slate-500">{d.city}{d.state ? `, ${d.state}` : ''}</p>
              </div>
              <span className="grid h-12 w-12 place-items-center rounded-full bg-red-600 font-bold text-white">{d.bloodGroup}</span>
            </div>
            <p className={`mt-4 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${d.available ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
              {d.available ? 'Available' : 'Unavailable'}
            </p>
          </Link>
        ))}
      </div>
    </main>
  )
}
