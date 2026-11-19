import { NOTTO_OFFICIAL_URL, NOTTO_HELPLINE } from '../api'
import { Link } from 'react-router-dom'

export default function NottoBanner({ compact = false }) {
  if (compact) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-600 text-lg font-bold text-white shadow">
              🇮🇳
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Official Government of India Registry
              </p>
              <h4 className="text-sm font-bold text-slate-900">
                NOTTO — National Organ & Tissue Transplant Organization
              </h4>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={NOTTO_OFFICIAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-amber-600/20 transition hover:bg-amber-700"
            >
              <span>Submit Official Pledge</span>
              <span>↗</span>
            </a>
            <Link
              to="/organ-donation"
              className="rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-amber-200/80 bg-gradient-to-br from-amber-50 via-orange-50/60 to-white p-6 sm:p-10 shadow-lg">
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-amber-200/30 blur-2xl" />

      <div className="relative grid gap-8 lg:grid-cols-12 items-center">
        {/* Left Col: NOTTO Info */}
        <div className="space-y-4 lg:col-span-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
              <span>🇮🇳</span> Government of India Initiative
            </span>
            <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
              Ministry of Health & Family Welfare (MoHFW)
            </span>
          </div>

          <h2 className="text-2xl font-black tracking-tight sm:text-3xl text-slate-950">
            Connected with NOTTO — National Organ & Tissue Transplant Organization
          </h2>

          <p className="text-sm leading-relaxed text-slate-700 sm:text-base">
            Under the Transplantation of Human Organs and Tissues Act (THOTA), NOTTO serves as the apex national body coordinating organ harvesting, storage, allocation, and donor registry in India.
            You can pledge organs directly on our platform and register officially on the Government of India National Organ Donor Register.
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 pt-2">
            <div className="rounded-2xl border border-amber-200/60 bg-white/80 p-3 shadow-sm backdrop-blur-sm">
              <span className="text-[11px] font-bold uppercase text-amber-800">Toll-Free Helpline</span>
              <p className="mt-0.5 text-sm font-extrabold text-slate-900">{NOTTO_HELPLINE}</p>
              <p className="text-[11px] text-slate-500">24x7 National Support</p>
            </div>

            <div className="rounded-2xl border border-amber-200/60 bg-white/80 p-3 shadow-sm backdrop-blur-sm">
              <span className="text-[11px] font-bold uppercase text-amber-800">Legal Pledge</span>
              <p className="mt-0.5 text-sm font-extrabold text-slate-900">Form 7 / Pledge Card</p>
              <p className="text-[11px] text-slate-500">Official THOTA Compliance</p>
            </div>

            <div className="rounded-2xl border border-amber-200/60 bg-white/80 p-3 shadow-sm backdrop-blur-sm">
              <span className="text-[11px] font-bold uppercase text-amber-800">National Impact</span>
              <p className="mt-0.5 text-sm font-extrabold text-slate-900">1 Donor = 8 Lives</p>
              <p className="text-[11px] text-slate-500">Plus 75+ healed via tissues</p>
            </div>
          </div>
        </div>

        {/* Right Col: Call to action card */}
        <div className="rounded-3xl border border-amber-200 bg-white p-6 shadow-md lg:col-span-4">
          <div className="text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-amber-500 text-2xl text-white shadow-md shadow-amber-500/30">
              🪪
            </div>
            <h3 className="mt-3 text-lg font-bold text-slate-900">Pledge on NOTTO Official Portal</h3>
            <p className="mt-1 text-xs text-slate-600">
              Takes less than 2 minutes. Receive your Government of India Official Donor Card instantly.
            </p>
          </div>

          <div className="mt-5 space-y-2.5">
            <a
              href={NOTTO_OFFICIAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 py-3 text-center text-sm font-bold text-white shadow-md shadow-amber-600/30 transition hover:from-amber-700 hover:to-orange-700"
            >
              <span>Open NOTTO Pledge Portal</span>
              <span>↗</span>
            </a>

            <Link
              to="/organ-donation"
              className="block w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 text-center text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Pledge on LifeLink & Generate Card
            </Link>
          </div>

          <p className="mt-3 text-center text-[11px] text-slate-500">
            *Indian Law requires notifying your next-of-kin about your pledge decision.
          </p>
        </div>
      </div>
    </section>
  )
}
