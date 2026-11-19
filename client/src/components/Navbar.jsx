import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { NOTTO_OFFICIAL_URL } from '../api'

const link = ({ isActive }) =>
  `text-sm font-medium px-3 py-2 rounded-xl transition ${isActive ? 'text-red-700 bg-red-50 font-bold' : 'text-slate-600 hover:text-red-700 hover:bg-slate-50'
  }`

export default function Navbar() {
  const { user, logout } = useApp()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="glass sticky top-0 z-40 border-b border-slate-200">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-tr from-red-600 to-rose-600 text-white shadow-md shadow-red-600/30">
            🩸
          </span>
          <div className="leading-tight">
            <span className="block text-lg font-black tracking-tight text-slate-900">
              LifeLink
            </span>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-red-600">
              Blood & Organ Connect
            </span>
          </div>
        </Link>

        {/* Desktop Nav Items */}
        <div className="hidden md:flex items-center gap-1">
          <NavLink to="/donors" className={link}>
            Find Blood Donors
          </NavLink>

          <NavLink to="/organ-donation" className={link}>
            <span className="flex items-center gap-1.5">
              <span>Organ Donation</span>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                NOTTO
              </span>
            </span>
          </NavLink>

          <a
            href="/#screener"
            className="text-sm font-medium px-3 py-2 rounded-xl transition text-slate-600 hover:text-red-700 hover:bg-slate-50 flex items-center gap-1"
          >
            <span>AI Screener</span>
            <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-700">
              AI
            </span>
          </a>

          <a
            href={NOTTO_OFFICIAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-1.5 rounded-xl border border-amber-200"
          >
            <span>🇮🇳 NOTTO Portal</span>
            <span>↗</span>
          </a>

          {user?.role === 'donor' && <NavLink to="/donor" className={link}>My Dashboard</NavLink>}
          {user?.role === 'admin' && <NavLink to="/admin" className={link}>Admin</NavLink>}

          {user ? (
            <button
              onClick={() => {
                logout()
                navigate('/')
              }}
              className="ml-2 rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Log out
            </button>
          ) : (
            <div className="ml-2 flex items-center gap-2">
              <NavLink to="/login" className={link}>
                Log in
              </NavLink>
              <Link
                to="/register"
                className="rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-red-600/20 hover:from-red-700 hover:to-rose-700"
              >
                Become a Donor
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="md:hidden flex items-center gap-2">
          <Link
            to="/organ-donation"
            className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-bold text-white"
          >
            Pledge
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white p-4 md:hidden space-y-2">
          <Link
            to="/donors"
            onClick={() => setMobileMenuOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            🩸 Find Blood Donors
          </Link>
          <Link
            to="/organ-donation"
            onClick={() => setMobileMenuOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            🫀 Organ Donation & NOTTO Pledge
          </Link>
          <a
            href={NOTTO_OFFICIAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg px-3 py-2 text-sm font-semibold text-amber-800 bg-amber-50"
          >
            🇮🇳 NOTTO Official Portal ↗
          </a>
          {user?.role === 'donor' && (
            <Link
              to="/donor"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              My Dashboard
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Admin Dashboard
            </Link>
          )}
          <div className="pt-2 border-t border-slate-100 flex gap-2">
            {user ? (
              <button
                onClick={() => {
                  logout()
                  setMobileMenuOpen(false)
                  navigate('/')
                }}
                className="w-full rounded-lg border border-slate-300 py-2 text-center text-xs font-semibold"
              >
                Log Out
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 rounded-lg border border-slate-300 py-2 text-center text-xs font-semibold"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 rounded-lg bg-red-600 py-2 text-center text-xs font-bold text-white"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
