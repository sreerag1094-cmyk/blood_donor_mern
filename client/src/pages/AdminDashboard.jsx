import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'

const badge = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [donors, setDonors] = useState([])
  const [users, setUsers] = useState([])
  const [organPledges, setOrganPledges] = useState([])
  const [filter, setFilter] = useState('pending')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const [s, d, u, op] = await Promise.all([
        api.get('/admin/stats'),
        api.get(`/admin/donors${filter ? `?status=${filter}` : ''}`),
        api.get('/admin/users'),
        api.get('/organ-pledges').catch(() => []),
      ])
      setStats(s)
      setDonors(d)
      setUsers(u)
      setOrganPledges(op || [])
      setError('')
    } catch (e) {
      setError(e.message)
    }
  }, [filter])

  useEffect(() => {
    load()
  }, [load])

  const act = async (fn) => {
    try {
      await fn()
      await load()
    } catch (e) {
      setError(e.message)
    }
  }

  const cards = stats && [
    ['Registered Users', stats.users],
    ['Approved Blood Donors', stats.donors],
    ['Pending Approval', stats.pending],
    ['Organ Pledges (NOTTO)', stats.organPledges || 0],
    ['Donations Logged', stats.donations],
  ]

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-500">Manage blood donors, NOTTO organ pledges, and registered members</p>
        </div>
      </div>

      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {cards && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {cards.map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
              <p className="mt-2 text-3xl font-black text-red-600">{value}</p>
            </div>
          ))}
        </div>
      )}

      {stats?.byGroup?.length > 0 && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-base font-bold text-slate-900">Approved Donors by Blood Group</h2>
          <div className="flex flex-wrap gap-2.5">
            {stats.byGroup.map((g) => (
              <span
                key={g._id}
                className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700"
              >
                {g._id}: {g.count}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Organ Donation Pledges Table */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">NOTTO & Organ Donation Pledges</h2>
            <p className="text-xs text-slate-500">Voluntary pledges registered under national THOTA guidelines</p>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
            {organPledges.length} Pledges
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-400">
              <tr>
                <th className="py-2.5">Pledge ID</th>
                <th>Donor Name</th>
                <th>Contact</th>
                <th>Location</th>
                <th>Organs Pledged</th>
                <th>Next of Kin</th>
              </tr>
            </thead>
            <tbody>
              {organPledges.map((op) => (
                <tr key={op._id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="py-2.5 font-mono text-xs font-bold text-amber-700">{op.pledgeId}</td>
                  <td className="font-semibold text-slate-900">{op.fullName} ({op.age}y, {op.bloodGroup})</td>
                  <td>
                    <span className="text-slate-800">{op.email}</span>
                    <br />
                    <span className="text-xs text-slate-500">{op.phone}</span>
                  </td>
                  <td>{op.city}, {op.state}</td>
                  <td>
                    <span className="inline-block max-w-xs truncate text-xs text-slate-700" title={op.organsPledged?.join(', ')}>
                      {op.organsPledged?.join(', ')}
                    </span>
                  </td>
                  <td className="text-xs text-slate-600">
                    {op.emergencyContactName ? `${op.emergencyContactName} (${op.emergencyContactRelation || 'Kin'})` : '—'}
                  </td>
                </tr>
              ))}
              {organPledges.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-slate-400">
                    No organ pledges submitted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Blood Donors Table */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Blood Donor Profiles</h2>
            <p className="text-xs text-slate-500">Review, approve, or reject blood donor submissions</p>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold focus:outline-none"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="">All</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-400">
              <tr>
                <th className="py-2.5">Name</th>
                <th>Contact</th>
                <th>Group</th>
                <th>City</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {donors.map((d) => (
                <tr key={d._id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="py-2.5 font-semibold text-slate-900">{d.user?.name}</td>
                  <td>
                    {d.user?.email}
                    <br />
                    <span className="text-xs text-slate-500">{d.user?.phone}</span>
                  </td>
                  <td>
                    <span className="rounded-lg bg-red-100 px-2 py-0.5 font-bold text-red-700">
                      {d.bloodGroup}
                    </span>
                  </td>
                  <td>{d.city}</td>
                  <td>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badge[d.status]}`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="space-x-2 text-right">
                    {d.status !== 'approved' && (
                      <button
                        onClick={() =>
                          act(() => api.patch(`/admin/donors/${d._id}/status`, { status: 'approved' }))
                        }
                        className="rounded-lg bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 hover:bg-green-100"
                      >
                        Approve
                      </button>
                    )}
                    {d.status !== 'rejected' && (
                      <button
                        onClick={() =>
                          act(() => api.patch(`/admin/donors/${d._id}/status`, { status: 'rejected' }))
                        }
                        className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                      >
                        Reject
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {donors.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-slate-400">
                    No donor profiles found for this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Users Management */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-slate-900">Registered Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-400">
              <tr>
                <th className="py-2.5">Name</th>
                <th>Email</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="py-2.5 font-semibold text-slate-900">{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    {u.isBlocked ? (
                      <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700">
                        Blocked
                      </span>
                    ) : (
                      <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="space-x-2 text-right">
                    <button
                      onClick={() =>
                        act(() => api.patch(`/admin/users/${u._id}/block`, { isBlocked: !u.isBlocked }))
                      }
                      className="text-xs font-semibold text-slate-600 hover:underline"
                    >
                      {u.isBlocked ? 'Unblock' : 'Block'}
                    </button>
                    <button
                      onClick={() =>
                        window.confirm(`Delete ${u.name} and all their data?`) &&
                        act(() => api.del(`/admin/users/${u._id}`))
                      }
                      className="text-xs font-semibold text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-slate-400">
                    No users registered.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
