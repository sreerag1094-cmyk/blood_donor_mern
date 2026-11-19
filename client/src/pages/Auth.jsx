import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Auth({ mode = 'login' }) {
  const isRegister = mode === 'register'
  const { login, register } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      const user = isRegister ? await register(form) : await login(form.email, form.password)
      navigate(user.role === 'admin' ? '/admin' : '/donor', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const input = 'mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2'

  return (
    <main className="grid-bg grid min-h-[80vh] place-items-center px-4">
      <form onSubmit={submit} className="glass w-full max-w-md space-y-4 rounded-2xl p-8 shadow-lg">
        <h1 className="text-2xl font-bold">{isRegister ? 'Become a donor' : 'Welcome back'}</h1>
        {isRegister && (
          <>
            <label className="block text-sm font-medium">Full name<input required value={form.name} onChange={set('name')} className={input} /></label>
            <label className="block text-sm font-medium">Phone<input value={form.phone} onChange={set('phone')} className={input} /></label>
          </>
        )}
        <label className="block text-sm font-medium">Email<input required type="email" value={form.email} onChange={set('email')} className={input} /></label>
        <label className="block text-sm font-medium">Password<input required type="password" minLength={6} value={form.password} onChange={set('password')} className={input} /></label>
        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <button disabled={busy} className="w-full rounded-lg bg-red-600 py-2.5 font-semibold text-white hover:bg-red-700 disabled:opacity-60">
          {busy ? 'Please wait…' : isRegister ? 'Create account' : 'Log in'}
        </button>
        <p className="text-center text-sm text-slate-600">
          {isRegister ? <>Already registered? <Link to="/login" className="text-red-600 underline">Log in</Link></> : <>New here? <Link to="/register" className="text-red-600 underline">Create an account</Link></>}
        </p>
      </form>
    </main>
  )
}
