import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ORGAN_TIME_WINDOWS, NOTTO_OFFICIAL_URL } from '../api'

export default function OrganTimesTable() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [activeOrgan, setActiveOrgan] = useState(ORGAN_TIME_WINDOWS[0])

  const categories = ['All', 'Solid Organ', 'Tissue', 'Blood Component']

  const filtered =
    selectedCategory === 'All'
      ? ORGAN_TIME_WINDOWS
      : ORGAN_TIME_WINDOWS.filter((item) => item.category === selectedCategory)

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div>
          <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-red-700">
            Medical Viability Guide
          </span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900">
            Organ & Blood Viability Timelines
          </h2>
          <p className="mt-1 text-slate-600">
            Preservation golden hours, critical storage conditions, and lives impacted by each gift.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${selectedCategory === cat
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="mt-8 grid gap-6 lg:grid-cols-12">
        {/* Left: Quick Organ Cards List */}
        <div className="space-y-3 lg:col-span-7">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveOrgan(item)}
              className={`cursor-pointer rounded-2xl border p-4 transition ${activeOrgan.id === item.id
                  ? 'border-red-500 bg-red-50/40 ring-2 ring-red-500/20 shadow-md'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-tr ${item.color} text-xl text-white shadow-sm`}>
                    {item.id === 'heart' && '🫀'}
                    {item.id === 'lungs' && '🫁'}
                    {item.id === 'liver' && '🧬'}
                    {item.id === 'kidneys' && '🩺'}
                    {item.id === 'pancreas' && '🧪'}
                    {item.id === 'intestines' && '🧻'}
                    {item.id === 'corneas' && '👁️'}
                    {item.id === 'skin-tissues' && '🩹'}
                    {item.id === 'blood-rbc' && '🩸'}
                    {item.id === 'platelets' && '💉'}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{item.name}</h3>
                    <span className="text-xs font-medium text-slate-500">{item.category}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block rounded-lg bg-slate-900 px-2.5 py-1 font-mono text-xs font-bold text-white">
                    ⏱ {item.windowHours}
                  </span>
                  <div className="mt-0.5 text-[11px] font-medium text-red-600">
                    {item.urgency}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Active Organ Deep Dive Card */}
        <div className="lg:col-span-5">
          <div className="sticky top-20 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                  {activeOrgan.category}
                </span>
                <h3 className="mt-2 text-2xl font-black text-slate-900">{activeOrgan.name}</h3>
              </div>
              <div className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${activeOrgan.color} text-3xl text-white shadow-lg`}>
                {activeOrgan.id === 'heart' && '🫀'}
                {activeOrgan.id === 'lungs' && '🫁'}
                {activeOrgan.id === 'liver' && '🧬'}
                {activeOrgan.id === 'kidneys' && '🩺'}
                {activeOrgan.id === 'pancreas' && '🧪'}
                {activeOrgan.id === 'intestines' && '🧻'}
                {activeOrgan.id === 'corneas' && '👁️'}
                {activeOrgan.id === 'skin-tissues' && '🩹'}
                {activeOrgan.id === 'blood-rbc' && '🩸'}
                {activeOrgan.id === 'platelets' && '💉'}
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-slate-900 p-4 text-white">
                <span className="text-xs uppercase tracking-wider text-slate-400">Preservation Window</span>
                <p className="mt-1 font-mono text-2xl font-extrabold text-red-400">
                  {activeOrgan.windowHours}
                </p>
                <p className="mt-1 text-xs text-slate-300">
                  Preserved at {activeOrgan.temperature}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Clinical Significance</h4>
                <p className="mt-1 text-sm leading-relaxed text-slate-700">
                  {activeOrgan.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[11px] text-slate-500">Lives Saved / Impact</p>
                  <p className="mt-0.5 font-bold text-slate-900">{activeOrgan.livesSaved}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[11px] text-slate-500">Urgency Level</p>
                  <p className="mt-0.5 font-bold text-red-600">{activeOrgan.urgency}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  to="/organ-donation"
                  className="block w-full rounded-xl bg-red-600 py-3 text-center text-sm font-bold text-white shadow-lg shadow-red-600/30 transition hover:bg-red-700"
                >
                  Pledge {activeOrgan.name} Donation
                </Link>
                <a
                  href={NOTTO_OFFICIAL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full rounded-xl border border-amber-300 bg-amber-50 py-2.5 text-center text-xs font-semibold text-amber-900 hover:bg-amber-100"
                >
                  🏛️ Submit NOTTO Govt Registry Pledge ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
