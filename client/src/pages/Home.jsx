import { useState } from 'react'
import { Link } from 'react-router-dom'
import DonationImportanceVideo from '../components/DonationImportanceVideo'
import NottoBanner from '../components/NottoBanner'
import OrganTimesTable from '../components/OrganTimesTable'
import AIDonorScreener from '../components/AIDonorScreener'
import { NOTTO_OFFICIAL_URL, NOTTO_HELPLINE } from '../api'

const bloodSteps = [
  ['Register as Donor', 'Sign up and create your verified blood donor profile.'],
  ['Get Admin Verified', 'Our medical team verifies your eligibility and blood group.'],
  ['Answer Emergencies', 'Receive immediate SMS/calls from patients during critical trauma.'],
]

const organSteps = [
  ['Make the Pledge', 'Submit your digital pledge choosing organs/tissues to donate.'],
  ['Receive Donor Card', 'Get your instant Form-7 compliant National Organ Donor Card.'],
  ['Inform Your Family', 'Tell next-of-kin so your noble wish is respected and fulfilled.'],
]

export default function Home() {
  const [activeTab, setActiveTab] = useState('organ')

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top NOTTO Alert Bar */}
      <div className="bg-amber-600 px-4 py-2 text-center text-xs font-semibold text-white">
        <span>🇮🇳 Connected with NOTTO — National Organ & Tissue Transplant Organization (MoHFW, Govt of India) • 24x7 Helpline: </span>
        <a href={`tel:${NOTTO_HELPLINE}`} className="underline font-bold ml-1">{NOTTO_HELPLINE}</a>
        <a href={NOTTO_OFFICIAL_URL} target="_blank" rel="noopener noreferrer" className="ml-3 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold text-white hover:bg-white/30">
          Official NOTTO Portal ↗
        </a>
      </div>

      {/* Hero Section */}
      <section className="grid-bg border-b border-slate-200/80">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white/80 px-4 py-1.5 text-xs font-bold text-red-700 shadow-sm backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-red-600 animate-ping" />
            Blood & Organ Donation Network
          </div>

          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl text-slate-950">
            One Life Leaves a Legacy. <br />
            <span className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 bg-clip-text text-transparent">
              Donate Blood. Pledge Organs.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-slate-600 sm:text-lg">
            Connect directly with verified blood donors in real-time, explore critical organ preservation golden hours, and officially pledge organs with NOTTO (Government of India).
          </p>

          {/* Call to Actions */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/organ-donation"
              className="rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 px-6 py-3.5 font-bold text-white shadow-xl shadow-red-600/30 transition hover:from-red-700 hover:to-rose-700"
            >
              Pledge Organs (NOTTO) 🫀
            </Link>

            <Link
              to="/donors"
              className="rounded-2xl bg-slate-900 px-6 py-3.5 font-bold text-white shadow-lg transition hover:bg-slate-800"
            >
              Find Blood Donors 🩸
            </Link>

            <a
              href="#screener"
              className="rounded-2xl border border-red-200 bg-white px-6 py-3.5 font-bold text-red-700 hover:bg-red-50 transition shadow-sm"
            >
              AI Eligibility Screener 🩺
            </a>

            <Link
              to="/register"
              className="rounded-2xl border border-slate-300 bg-white px-6 py-3.5 font-semibold text-slate-700 hover:bg-slate-100"
            >
              Register
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-4 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur-md sm:grid-cols-4">
            <div>
              <p className="font-mono text-3xl font-black text-red-600">8 Lives</p>
              <p className="mt-1 text-xs text-slate-500">Saved by 1 Deceased Donor</p>
            </div>
            <div>
              <p className="font-mono text-3xl font-black text-amber-600">4 – 6 Hrs</p>
              <p className="mt-1 text-xs text-slate-500">Heart Viability Window</p>
            </div>
            <div>
              <p className="font-mono text-3xl font-black text-emerald-600">5 Days</p>
              <p className="mt-1 text-xs text-slate-500">Platelet Perishability</p>
            </div>
            <div>
              <p className="font-mono text-3xl font-black text-blue-600">100% Free</p>
              <p className="mt-1 text-xs text-slate-500">Humanitarian & Non-profit</p>
            </div>
          </div>
        </div>
      </section>

      {/* Cinematic Showcase Video Section */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 text-center">
          <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
            Must Watch Educational Showcase
          </span>
          <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
            The Golden Hours: Why Time Decides Life
          </h2>
          <p className="mt-2 text-slate-600">
            Interactive medical video demonstrating organ viability windows (Heart, Lungs, Kidneys, Liver, Corneas) and blood perishability.
          </p>
        </div>

        {/* Video Player Component */}
        <DonationImportanceVideo />
      </section>

      {/* Official NOTTO Government of India Integration Banner */}
      <section className="mx-auto max-w-6xl px-4 py-6">
        <NottoBanner />
      </section>

      {/* Medical Viability Timeline & Organ Times Table */}
      <OrganTimesTable />

      {/* AI Donor Eligibility Pre-Screening Tool */}
      <AIDonorScreener />

      {/* Dual How It Works Section */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-black text-slate-950">How You Can Save a Life</h2>
          <p className="mt-2 text-slate-600">Choose between blood donation and organ pledge workflows</p>

          <div className="mt-6 inline-flex rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
            <button
              onClick={() => setActiveTab('organ')}
              className={`rounded-xl px-5 py-2 text-xs font-bold transition ${
                activeTab === 'organ'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🫀 Organ Donation (NOTTO)
            </button>
            <button
              onClick={() => setActiveTab('blood')}
              className={`rounded-xl px-5 py-2 text-xs font-bold transition ${
                activeTab === 'blood'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🩸 Blood Donation
            </button>
          </div>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {(activeTab === 'organ' ? organSteps : bloodSteps).map(([title, text], i) => (
            <div key={title} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:shadow-md">
              <div className="mb-4 grid h-10 w-10 place-items-center rounded-2xl bg-red-600 font-extrabold text-white shadow-md shadow-red-600/30">
                {i + 1}
              </div>
              <h3 className="text-lg font-bold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          {activeTab === 'organ' ? (
            <Link
              to="/organ-donation"
              className="inline-block rounded-2xl bg-red-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-600/30 hover:bg-red-700"
            >
              Start Organ Pledge Registration &rarr;
            </Link>
          ) : (
            <Link
              to="/donors"
              className="inline-block rounded-2xl bg-red-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-600/30 hover:bg-red-700"
            >
              Search Blood Donors Near You &rarr;
            </Link>
          )}
        </div>
      </section>

      {/* Emergency Helpline Banner */}
      <section className="border-t border-slate-200 bg-slate-900 py-12 text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-red-400">24x7 Emergency Support</span>
            <h3 className="mt-1 text-2xl font-black">Facing an Emergency Blood or Organ Need?</h3>
            <p className="mt-1 text-sm text-slate-400">
              National Organ Helpline: <strong className="text-white">{NOTTO_HELPLINE}</strong> • Ambulance: <strong className="text-white">108 / 102</strong>
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={`tel:${NOTTO_HELPLINE}`}
              className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-400"
            >
              📞 Call NOTTO Helpline
            </a>
            <Link
              to="/donors"
              className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-700"
            >
              Search Blood Units
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
