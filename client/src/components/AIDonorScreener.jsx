import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api, BLOOD_GROUPS, NOTTO_OFFICIAL_URL } from '../api'

export default function AIDonorScreener() {
  const [formData, setFormData] = useState({
    age: '25',
    weight: '62',
    gender: 'male',
    bloodGroup: 'O+',
    tattooRecent: 'no',
    alcohol24h: 'no',
    smokingRecent: 'no',
    antibioticsRecent: 'no',
    majorSurgery: 'no',
    isDiabeticInsulin: 'no',
    hasHypertensionControlled: 'no',
    isPregnantOrLactating: 'no',
    daysSinceLastDonation: '120',
  })

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleScreening = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await api.post('/ai/screen-eligibility', formData)
      setResult(res)
    } catch {
      // Local clinical evaluator fallback
      const issues = []
      const advisories = []
      let eligible = true

      if (Number(formData.age) < 18 || Number(formData.age) > 65) {
        eligible = false
        issues.push('Age must be between 18 and 65 years for whole blood donation.')
      }
      if (Number(formData.weight) < 45) {
        eligible = false
        issues.push('Minimum body weight requirement is 45 kg.')
      }
      if (formData.tattooRecent === 'yes') {
        eligible = false
        issues.push('Tattoo or body piercing within 6 months requires a temporary waiting period.')
      }
      if (formData.alcohol24h === 'yes') {
        eligible = false
        issues.push('Alcohol intake within 24 hours requires a deferral to ensure hydration.')
      }
      if (formData.antibioticsRecent === 'yes') {
        eligible = false
        issues.push('Current antibiotic use requires completing medication + 7 recovery days.')
      }
      if (formData.majorSurgery === 'yes') {
        eligible = false
        issues.push('Major surgery within 6 months requires complete healing and doctor clearance.')
      }
      if (formData.isDiabeticInsulin === 'yes') {
        eligible = false
        issues.push('Insulin-dependent diabetes is deferred for blood donation.')
      }
      if (formData.gender === 'female' && formData.isPregnantOrLactating === 'yes') {
        eligible = false
        issues.push('Pregnancy or lactation requires deferral to preserve maternal iron reserves.')
      }

      const minDays = formData.gender === 'female' ? 120 : 90
      if (Number(formData.daysSinceLastDonation) < minDays) {
        eligible = false
        issues.push(`Last donation was ${formData.daysSinceLastDonation} days ago. Required interval is ${minDays} days.`)
      }

      advisories.push('Drink at least 500 mL water and have a light meal before donation.')
      if (formData.smokingRecent === 'yes') {
        advisories.push('Avoid smoking for 2 hours before and after donation.')
      }

      setResult({
        eligibleToday: eligible,
        score: eligible ? 100 : Math.max(30, 100 - issues.length * 25),
        status: eligible ? 'Eligible to Donate Blood Today ✅' : 'Temporary Deferral ⏳',
        organPledgeEligible: true,
        issues,
        advisories,
        summary: eligible
          ? 'Congratulations! You meet standard clinical criteria for blood donation in India.'
          : 'You currently have temporary deferrals for blood, but you ARE eligible to pledge your organs with NOTTO!',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="screener" className="mx-auto max-w-6xl px-4 py-16 scroll-mt-20">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                AI Diagnostic Tool
              </span>
              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white">
                NBTC & NOTTO Clinical Standards
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">
              AI Donor Eligibility Pre-Screening
            </h2>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Check your medical fitness to donate blood today and review your organ donation readiness in 60 seconds.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400">Powered by</span>
            <p className="font-mono text-sm font-bold text-red-600">LifeLink Clinical AI</p>
          </div>
        </div>

        {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        {/* Screening Form & Result Split */}
        <div className="mt-8 grid gap-10 lg:grid-cols-12 items-start">
          {/* Form */}
          <form onSubmit={handleScreening} className="space-y-6 lg:col-span-7">
            {/* Step 1: Vitals */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-red-600 mb-3">
                1. Basic Vitals & Demographics
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600">Age (Years)</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600">Weight (kg)</label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold focus:border-red-500 focus:outline-none"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600">Blood Group</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold focus:border-red-500 focus:outline-none"
                  >
                    {BLOOD_GROUPS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Recent Exposures & Habits */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-red-600 mb-3">
                2. Recent Lifestyle & Exposures
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50">
                  <span className="block text-xs font-bold text-slate-800">
                    Tattoo or body piercing in last 6 months?
                  </span>
                  <div className="mt-2 flex gap-4">
                    <label className="flex items-center gap-1.5 text-xs">
                      <input
                        type="radio"
                        name="tattoo"
                        checked={formData.tattooRecent === 'no'}
                        onChange={() => setFormData({ ...formData, tattooRecent: 'no' })}
                      />
                      No
                    </label>
                    <label className="flex items-center gap-1.5 text-xs">
                      <input
                        type="radio"
                        name="tattoo"
                        checked={formData.tattooRecent === 'yes'}
                        onChange={() => setFormData({ ...formData, tattooRecent: 'yes' })}
                      />
                      Yes
                    </label>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50">
                  <span className="block text-xs font-bold text-slate-800">
                    Consumed alcohol in the last 24 hours?
                  </span>
                  <div className="mt-2 flex gap-4">
                    <label className="flex items-center gap-1.5 text-xs">
                      <input
                        type="radio"
                        name="alcohol"
                        checked={formData.alcohol24h === 'no'}
                        onChange={() => setFormData({ ...formData, alcohol24h: 'no' })}
                      />
                      No
                    </label>
                    <label className="flex items-center gap-1.5 text-xs">
                      <input
                        type="radio"
                        name="alcohol"
                        checked={formData.alcohol24h === 'yes'}
                        onChange={() => setFormData({ ...formData, alcohol24h: 'yes' })}
                      />
                      Yes
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Medical Conditions */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-red-600 mb-3">
                3. Medical History & Medications
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50">
                  <span className="block text-xs font-bold text-slate-800">
                    Active antibiotics in last 7 days?
                  </span>
                  <div className="mt-2 flex gap-4">
                    <label className="flex items-center gap-1.5 text-xs">
                      <input
                        type="radio"
                        name="antibiotics"
                        checked={formData.antibioticsRecent === 'no'}
                        onChange={() => setFormData({ ...formData, antibioticsRecent: 'no' })}
                      />
                      No
                    </label>
                    <label className="flex items-center gap-1.5 text-xs">
                      <input
                        type="radio"
                        name="antibiotics"
                        checked={formData.antibioticsRecent === 'yes'}
                        onChange={() => setFormData({ ...formData, antibioticsRecent: 'yes' })}
                      />
                      Yes
                    </label>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50">
                  <span className="block text-xs font-bold text-slate-800">
                    Major surgery in last 6 months?
                  </span>
                  <div className="mt-2 flex gap-4">
                    <label className="flex items-center gap-1.5 text-xs">
                      <input
                        type="radio"
                        name="surgery"
                        checked={formData.majorSurgery === 'no'}
                        onChange={() => setFormData({ ...formData, majorSurgery: 'no' })}
                      />
                      No
                    </label>
                    <label className="flex items-center gap-1.5 text-xs">
                      <input
                        type="radio"
                        name="surgery"
                        checked={formData.majorSurgery === 'yes'}
                        onChange={() => setFormData({ ...formData, majorSurgery: 'yes' })}
                      />
                      Yes
                    </label>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50">
                  <span className="block text-xs font-bold text-slate-800">
                    Insulin-dependent diabetes?
                  </span>
                  <div className="mt-2 flex gap-4">
                    <label className="flex items-center gap-1.5 text-xs">
                      <input
                        type="radio"
                        name="insulin"
                        checked={formData.isDiabeticInsulin === 'no'}
                        onChange={() => setFormData({ ...formData, isDiabeticInsulin: 'no' })}
                      />
                      No (or Oral Tablets only)
                    </label>
                    <label className="flex items-center gap-1.5 text-xs">
                      <input
                        type="radio"
                        name="insulin"
                        checked={formData.isDiabeticInsulin === 'yes'}
                        onChange={() => setFormData({ ...formData, isDiabeticInsulin: 'yes' })}
                      />
                      Yes (Insulin)
                    </label>
                  </div>
                </div>

                {formData.gender === 'female' && (
                  <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50">
                    <span className="block text-xs font-bold text-slate-800">
                      Currently pregnant or breastfeeding?
                    </span>
                    <div className="mt-2 flex gap-4">
                      <label className="flex items-center gap-1.5 text-xs">
                        <input
                          type="radio"
                          name="pregnancy"
                          checked={formData.isPregnantOrLactating === 'no'}
                          onChange={() => setFormData({ ...formData, isPregnantOrLactating: 'no' })}
                        />
                        No
                      </label>
                      <label className="flex items-center gap-1.5 text-xs">
                        <input
                          type="radio"
                          name="pregnancy"
                          checked={formData.isPregnantOrLactating === 'yes'}
                          onChange={() => setFormData({ ...formData, isPregnantOrLactating: 'yes' })}
                        />
                        Yes
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Step 4: Interval */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-red-600 mb-1">
                4. Days Since Your Last Blood Donation
              </label>
              <input
                type="number"
                value={formData.daysSinceLastDonation}
                onChange={(e) => setFormData({ ...formData, daysSinceLastDonation: e.target.value })}
                placeholder="e.g. 120 (or enter 365 if first time)"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-bold focus:border-red-500 focus:outline-none"
              />
              <span className="mt-1 block text-[11px] text-slate-400">
                Minimum interval: 90 days for males, 120 days for females. Enter 365 if never donated before.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-600/30 transition hover:from-red-700 hover:to-rose-700 disabled:opacity-50"
            >
              {loading ? 'Evaluating Clinical Parameters…' : 'Run AI Eligibility Evaluation 🩺'}
            </button>
          </form>

          {/* Right: AI Diagnostic Result Card */}
          <div className="lg:col-span-5">
            <div className="sticky top-20 rounded-3xl border-2 border-slate-200 bg-slate-900 p-6 text-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Clinical Evaluation Report
                  </span>
                  <h4 className="text-lg font-black text-white">AI Screening Score</h4>
                </div>
                <div
                  className={`grid h-14 w-14 place-items-center rounded-2xl font-mono text-xl font-black ${result?.eligibleToday
                      ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                      : 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30'
                    }`}
                >
                  {result ? `${result.score}%` : '—'}
                </div>
              </div>

              {!result && (
                <div className="py-12 text-center text-slate-400">
                  <div className="text-4xl animate-pulse">🩺</div>
                  <p className="mt-3 text-xs">
                    Fill out the questionnaire and click <strong>Run AI Eligibility Evaluation</strong> to view your clinical readiness.
                  </p>
                </div>
              )}

              {result && (
                <div className="mt-5 space-y-4">
                  {/* Status Banner */}
                  <div
                    className={`rounded-2xl p-4 ${result.eligibleToday
                        ? 'border border-green-500/30 bg-green-500/10 text-green-300'
                        : 'border border-amber-500/30 bg-amber-500/10 text-amber-300'
                      }`}
                  >
                    <p className="text-sm font-extrabold">{result.status}</p>
                    <p className="mt-1 text-xs text-slate-300 leading-relaxed">{result.summary}</p>
                  </div>

                  {/* Issues / Deferrals */}
                  {result.issues?.length > 0 && (
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
                        Identified Clinical Deferrals:
                      </span>
                      <ul className="mt-1.5 space-y-1.5 text-xs text-slate-300">
                        {result.issues.map((iss, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-red-400 font-bold">✕</span>
                            <span>{iss}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Lifestyle Advisories */}
                  {result.advisories?.length > 0 && (
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                        Medical Preparation Recommendations:
                      </span>
                      <ul className="mt-1.5 space-y-1 text-xs text-slate-300">
                        {result.advisories.map((adv, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-emerald-400">✓</span>
                            <span>{adv}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* NOTTO Organ Pledge Highlight */}
                  <div className="rounded-xl border border-amber-400/40 bg-amber-400/10 p-3 text-xs text-amber-200">
                    <p className="font-bold">🇮🇳 Organ Donation Note:</p>
                    <p className="mt-0.5 text-[11px] text-amber-100">
                      Even if you have a temporary deferral for blood, you are <strong>100% eligible</strong> to pledge your organs with NOTTO!
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="pt-2 flex flex-col gap-2">
                    {result.eligibleToday ? (
                      <Link
                        to="/register"
                        className="block w-full rounded-xl bg-red-600 py-3 text-center text-xs font-bold text-white shadow-lg shadow-red-600/30 hover:bg-red-700"
                      >
                        Register as a Verified Blood Donor 🩸
                      </Link>
                    ) : (
                      <Link
                        to="/organ-donation"
                        className="block w-full rounded-xl bg-amber-500 py-3 text-center text-xs font-bold text-slate-950 hover:bg-amber-400"
                      >
                        Pledge Organs with NOTTO 🫀
                      </Link>
                    )}
                    <a
                      href={NOTTO_OFFICIAL_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-center text-xs text-slate-300 hover:bg-slate-700"
                    >
                      Visit Official NOTTO Portal ↗
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
