import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Auth({ mode = 'login' }) {
  const [currentMode, setCurrentMode] = useState(mode)
  const { login, register, logout } = useApp()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (location.pathname === '/admin-login' || location.pathname === '/admin/login') {
      setCurrentMode('admin')
    } else {
      setCurrentMode(mode)
    }
  }, [mode, location.pathname])

  const isAdmin = currentMode === 'admin'
  const isRegister = currentMode === 'register'

  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const fillDemoAdmin = () => {
    setForm({
      name: '',
      email: 'admin@blooddonor.local',
      password: 'Admin@12345',
      phone: '',
    })
    setError('')
  }

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      if (isRegister) {
        await register(form)
        navigate('/donor', { replace: true })
      } else {
        const user = await login(form.email, form.password)
        if (isAdmin) {
          if (user.role !== 'admin') {
            logout()
            throw new Error('Access Denied: This account is not an administrator. Please log in via the Donor Portal.')
          }
          navigate('/admin', { replace: true })
        } else {
          navigate(user.role === 'admin' ? '/admin' : '/donor', { replace: true })
        }
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const inputClass = 'mt-1 block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-red-500 focus:outline-none transition'

  return (
    <main className="grid-bg grid min-h-[85vh] place-items-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Role Toggle Tabs for Login */}
        {!isRegister && (
          <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl bg-white/90 p-1.5 shadow-sm backdrop-blur-md border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setCurrentMode('login')
                setError('')
              }}
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition ${
                !isAdmin
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>🩸 Donor Login</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentMode('admin')
                setError('')
              }}
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition ${
                isAdmin
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>🛡️ Admin Portal</span>
            </button>
          </div>
        )}

        {/* Card Form */}
        <form
          onSubmit={submit}
          className={`glass w-full space-y-4 rounded-3xl p-8 shadow-2xl transition border ${
            isAdmin ? 'border-slate-800 bg-white' : 'border-slate-200 bg-white/90'
          }`}
        >
          {/* Header */}
          <div className="border-b border-slate-100 pb-4">
            {isAdmin ? (
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-bold text-white">
                  <span>🛡️</span>
                  <span>ADMINISTRATOR ACCESS</span>
                </div>
                <h1 className="mt-2 text-2xl font-black text-slate-950">Admin Control Portal</h1>
                <p className="mt-1 text-xs text-slate-500">
                  Secure sign-in for platform management, donor verification & organ pledges.
                </p>
              </div>
            ) : (
              <div>
                <h1 className="text-2xl font-black text-slate-950">
                  {isRegister ? 'Become a LifeLink Donor' : 'Welcome Back, Donor'}
                </h1>
                <p className="mt-1 text-xs text-slate-500">
                  {isRegister
                    ? 'Register your profile to receive emergency donation requests.'
                    : 'Access your donor dashboard, blood requests, and logged donations.'}
                </p>
              </div>
            )}
          </div>

          {/* Quick Demo Fill button for Admin */}
          {isAdmin && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Demo Admin Credentials:</span>
                <button
                  type="button"
                  onClick={fillDemoAdmin}
                  className="rounded-lg bg-amber-600 px-2.5 py-1 font-bold text-white hover:bg-amber-700 shadow-sm transition"
                >
                  ⚡ Auto-Fill Demo
                </button>
              </div>
              <p className="mt-1 font-mono text-[11px] text-amber-800">
                admin@blooddonor.local • Admin@12345
              </p>
            </div>
          )}

          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Full Name *
                </label>
                <input
                  required
                  value={form.name}
                  onChange={set('name')}
                  placeholder="e.g. Rahul Sharma"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={set('phone')}
                  placeholder="10-digit mobile number"
                  className={inputClass}
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              {isAdmin ? 'Admin Email Address *' : 'Email Address *'}
            </label>
            <input
              required
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder={isAdmin ? 'admin@blooddonor.local' : 'you@example.com'}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Password *
            </label>
            <input
              required
              type="password"
              minLength={6}
              value={form.password}
              onChange={set('password')}
              placeholder="••••••••"
              className={inputClass}
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className={`w-full rounded-2xl py-3.5 text-sm font-bold text-white shadow-lg transition disabled:opacity-50 ${
              isAdmin
                ? 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/30'
                : 'bg-red-600 hover:bg-red-700 shadow-red-600/30'
            }`}
          >
            {busy
              ? 'Authenticating…'
              : isAdmin
                ? 'Sign in as Administrator 🛡️'
                : isRegister
                  ? 'Create Donor Account 🩸'
                  : 'Log in to Donor Portal 🩸'}
          </button>

          {/* Bottom helper links */}
          <div className="border-t border-slate-100 pt-3 text-center text-xs text-slate-600 space-y-1.5">
            {isRegister ? (
              <p>
                Already registered?{' '}
                <Link to="/login" className="font-bold text-red-600 underline">
                  Log in here
                </Link>
              </p>
            ) : isAdmin ? (
              <p>
                Not an admin?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setCurrentMode('login')
                    setError('')
                  }}
                  className="font-bold text-red-600 underline"
                >
                  Return to Donor Login
                </button>
              </p>
            ) : (
              <div className="flex items-center justify-between pt-1">
                <span>
                  New here?{' '}
                  <Link to="/register" className="font-bold text-red-600 underline">
                    Sign up
                  </Link>
                </span>
                <Link to="/admin-login" className="font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1">
                  <span>🛡️ Admin Portal</span>
                </Link>
              </div>
            )}
          </div>
        </form>
      </div>
    </main>
  )
}
