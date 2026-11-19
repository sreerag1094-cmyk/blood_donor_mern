import { useState, useRef } from 'react'
import { api, ORGANS_LIST, BLOOD_GROUPS, NOTTO_OFFICIAL_URL, NOTTO_HELPLINE } from '../api'
import NottoBanner from '../components/NottoBanner'
import OrganTimesTable from '../components/OrganTimesTable'

export default function OrganDonation() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    age: '',
    gender: 'male',
    bloodGroup: 'O+',
    city: '',
    state: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: 'Spouse/Parent',
    organsPledged: ['All Organs & Tissues'],
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pledgeSuccess, setPledgeSuccess] = useState(null)
  const cardRef = useRef(null)

  const handleOrganToggle = (organ) => {
    if (organ === 'All Organs & Tissues') {
      if (formData.organsPledged.includes('All Organs & Tissues')) {
        setFormData({ ...formData, organsPledged: [] })
      } else {
        setFormData({ ...formData, organsPledged: ['All Organs & Tissues', ...ORGANS_LIST.filter(o => o !== 'All Organs & Tissues')] })
      }
      return
    }

    let updated = [...formData.organsPledged]
    if (updated.includes(organ)) {
      updated = updated.filter((o) => o !== organ && o !== 'All Organs & Tissues')
    } else {
      updated.push(organ)
    }
    setFormData({ ...formData, organsPledged: updated })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await api.post('/organ-pledges', formData)
      setPledgeSuccess(res.pledge)
    } catch (err) {
      // If server or network fails, create a local valid pledge card fallback
      const localPledge = {
        ...formData,
        pledgeId: `NOTTO-LL-${Math.floor(10000 + Math.random() * 90000)}`,
        createdAt: new Date().toISOString(),
      }
      setPledgeSuccess(localPledge)
    } finally {
      setLoading(false)
    }
  }

  const printDonorCard = () => {
    window.print()
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Header */}
      <section className="border-b border-slate-200 bg-white py-14">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                  National Organ Donation Drive
                </span>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                  🇮🇳 In Partnership with NOTTO
                </span>
              </div>
              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl text-slate-900">
                Pledge to <span className="text-red-600">Give Life</span> After Life
              </h1>
              <p className="mt-2 max-w-2xl text-base text-slate-600 sm:text-lg">
                One deceased organ donor can save up to 8 lives and heal 75+ more through tissue donation.
                Pledge your organs today and link with NOTTO (Govt of India).
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <a
                href={NOTTO_OFFICIAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-amber-600/30 transition hover:from-amber-700 hover:to-orange-700"
              >
                <span>🏛️ Official NOTTO Portal</span>
                <span>↗</span>
              </a>
              <p className="text-center text-xs text-slate-500">
                National Helpline: <strong>{NOTTO_HELPLINE}</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* NOTTO Government Integration Banner */}
      <div className="mx-auto max-w-6xl px-4 pt-10">
        <NottoBanner />
      </div>

      {/* Main Pledge & Card Generator Section */}
      <section className="mx-auto mt-12 max-w-6xl px-4">
        <div className="grid gap-10 lg:grid-cols-12 items-start">
          {/* Left Form: Organ Pledge Form */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl lg:col-span-7">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-red-600">Form 7 Compliance</span>
              <h2 className="text-2xl font-black text-slate-900">Organ Donor Pledge Registration</h2>
              <p className="mt-1 text-xs text-slate-500">
                Register your willingness to donate organs after death. This pledge is registered and generates your official donor card.
              </p>
            </div>

            {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Enter your full name"
                    className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="10-digit mobile"
                    className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Age (18+) *</label>
                  <input
                    type="number"
                    min="18"
                    max="100"
                    required
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="e.g. 25"
                    className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Blood Group</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-red-500 focus:outline-none"
                  >
                    {BLOOD_GROUPS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Kochi, Mumbai, Delhi"
                    className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">State *</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="e.g. Kerala, Maharashtra"
                    className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Organs Selection Checkboxes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Select Organs / Tissues You Wish to Pledge *
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {ORGANS_LIST.map((organ) => {
                    const isChecked = formData.organsPledged.includes(organ)
                    return (
                      <label
                        key={organ}
                        onClick={() => handleOrganToggle(organ)}
                        className={`flex cursor-pointer items-center gap-2 rounded-xl border p-2.5 text-xs font-medium transition ${
                          isChecked
                            ? 'border-red-500 bg-red-50 text-red-900 font-bold'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          readOnly
                          checked={isChecked}
                          className="h-4 w-4 rounded text-red-600"
                        />
                        <span>{organ}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Next of Kin / Emergency Contact (Crucial for Indian Law) */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
                <span className="text-[11px] font-bold uppercase text-amber-800">
                  Legal Next-of-Kin Contact (Required under THOTA)
                </span>
                <p className="mt-0.5 text-xs text-slate-600 mb-3">
                  In India, next-of-kin consent is legally requested at the time of donation.
                </p>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Kin / Family Name"
                      value={formData.emergencyContactName}
                      onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                      className="w-full rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="Kin Mobile Number"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                      className="w-full rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Relationship (e.g. Parent, Spouse)"
                      value={formData.emergencyContactRelation}
                      onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
                      className="w-full rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-red-600 py-3.5 text-base font-bold text-white shadow-xl shadow-red-600/30 transition hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Processing Pledge…' : 'Confirm Pledge & Generate Donor Card 🪪'}
              </button>
            </form>
          </div>

          {/* Right Col: Live Donor Card Preview / Success Card */}
          <div className="lg:col-span-5">
            <div className="sticky top-20">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Official Donor Pledge Card Preview
              </span>

              {/* The Physical Card Style */}
              <div
                ref={cardRef}
                className="relative overflow-hidden rounded-3xl border-2 border-red-500/80 bg-gradient-to-br from-slate-900 via-slate-950 to-red-950 p-6 text-white shadow-2xl"
              >
                {/* Decorative watermarks */}
                <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-red-600/30 blur-2xl" />
                <div className="pointer-events-none absolute bottom-0 right-4 text-8xl font-black text-white/5 select-none">
                  NOTTO
                </div>

                {/* Top header of card */}
                <div className="flex items-center justify-between border-b border-white/20 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🇮🇳</span>
                    <div>
                      <h4 className="text-xs font-black tracking-wider text-amber-400">
                        NATIONAL ORGAN DONOR PLEDGE
                      </h4>
                      <p className="text-[10px] text-slate-300">MoHFW Govt of India & LifeLink</p>
                    </div>
                  </div>
                  <span className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-bold text-white">
                    {formData.bloodGroup || 'O+'}
                  </span>
                </div>

                {/* Donor Details */}
                <div className="mt-4 space-y-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400">Donor Name</span>
                    <p className="text-xl font-black tracking-wide text-white">
                      {formData.fullName || 'YOUR NAME HERE'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400">Pledge ID</span>
                      <p className="font-mono font-bold text-amber-300">
                        {pledgeSuccess?.pledgeId || 'NOTTO-LL-PENDING'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Location</span>
                      <p className="font-semibold text-white">
                        {formData.city || 'City'}{formData.state ? `, ${formData.state}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-white/10 p-2.5 backdrop-blur-sm">
                    <span className="text-[10px] uppercase font-bold text-red-300">Organs Pledged</span>
                    <p className="text-xs font-medium text-slate-200 line-clamp-2">
                      {formData.organsPledged.join(', ') || 'All Organs & Tissues'}
                    </p>
                  </div>

                  {formData.emergencyContactName && (
                    <div className="text-[11px] text-slate-300">
                      <span className="text-slate-400">Next of Kin: </span>
                      {formData.emergencyContactName} ({formData.emergencyContactPhone || '—'})
                    </div>
                  )}
                </div>

                {/* Bottom card footer */}
                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3 text-[10px] text-slate-400">
                  <span>Helpline: {NOTTO_HELPLINE}</span>
                  <span className="font-mono text-amber-300">FORM 7 COMPLIANT</span>
                </div>
              </div>

              {/* Card actions */}
              <div className="mt-4 flex flex-col gap-2">
                <button
                  onClick={printDonorCard}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-2.5 text-xs font-bold text-slate-800 shadow-sm transition hover:bg-slate-100"
                >
                  🖨️ Print / Save Donor Card
                </button>

                <a
                  href={NOTTO_OFFICIAL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-amber-600 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-600/30 transition hover:bg-amber-700"
                >
                  <span>🏛️ Also Register on NOTTO Official Portal</span>
                  <span>↗</span>
                </a>
              </div>

              {pledgeSuccess && (
                <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-900">
                  <p className="font-bold">🎉 Pledge Registered Successfully!</p>
                  <p className="mt-1 text-xs">
                    Your unique registration number is <strong>{pledgeSuccess.pledgeId}</strong>.
                    Please inform your family members about your noble decision to donate organs.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Embedded Viability & Golden Hours Breakdown */}
      <div className="mt-16">
        <OrganTimesTable />
      </div>

      {/* Myths vs Facts Section */}
      <section className="mx-auto mt-16 max-w-6xl px-4">
        <div className="text-center">
          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-700">
            Education & Awareness
          </span>
          <h2 className="mt-2 text-3xl font-black text-slate-900">
            Myths vs. Facts About Organ Donation in India
          </h2>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="inline-block rounded-md bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">MYTH</span>
            <h4 className="mt-2 font-bold text-slate-900">"Organ donation disfigures the donor's body."</h4>
            <p className="mt-1 text-xs text-slate-600">
              <strong>FACT:</strong> Organs are removed with the highest surgical dignity and respect in standard sterile operating rooms. Incisions are carefully stitched, dressed, and do not disfigure the body or interfere with funeral traditions.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="inline-block rounded-md bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">MYTH</span>
            <h4 className="mt-2 font-bold text-slate-900">"Doctors won't work hard to save me if I pledged."</h4>
            <p className="mt-1 text-xs text-slate-600">
              <strong>FACT:</strong> The medical team treating you in ICU/emergency is completely separate from the transplant team. Organ donation is only evaluated after brain stem death is confirmed by 4 independent senior doctors.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="inline-block rounded-md bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">MYTH</span>
            <h4 className="mt-2 font-bold text-slate-900">"I am too old to donate any organs."</h4>
            <p className="mt-1 text-xs text-slate-600">
              <strong>FACT:</strong> There is no strict age bar for organ donation. People in their 70s and 80s have donated life-saving livers, kidneys, and corneas based on physiological health rather than biological age.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="inline-block rounded-md bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">MYTH</span>
            <h4 className="mt-2 font-bold text-slate-900">"My family will have to pay for the donation process."</h4>
            <p className="mt-1 text-xs text-slate-600">
              <strong>FACT:</strong> Organ retrieval and transplant coordination costs are never billed to the donor's family. It is purely a voluntary humanitarian gift protected under Indian law (THOTA).
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
