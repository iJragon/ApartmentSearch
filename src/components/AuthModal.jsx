import { useState } from 'react'
import { INPUT_CLASS } from '../constants'

function validateUsername(u) {
  if (u.length < 3) return 'Username must be at least 3 characters'
  if (u.length > 20) return 'Username must be 20 characters or less'
  if (!/^[a-zA-Z0-9_]+$/.test(u)) return 'Letters, numbers, and underscores only'
  return null
}

export default function AuthModal({ onAuth, onClose }) {
  const [tab, setTab] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    const trimmed = username.trim()
    if (tab === 'register' && !trimmed.includes('@')) {
      const validationError = validateUsername(trimmed)
      if (validationError) { setError(validationError); return }
    }
    setLoading(true)
    try {
      if (tab === 'login') {
        await onAuth.signIn(trimmed, password)
      } else {
        await onAuth.signUp(trimmed, password)
      }
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-sm bg-slate-950 border border-white/[0.08] rounded-2xl shadow-2xl z-50 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-white">
            {tab === 'login' ? 'Sign in' : 'Create account'}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-300 hover:bg-white/5 rounded-lg transition-colors">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="flex gap-1 p-1 bg-slate-900 rounded-lg mb-5">
          {['login', 'register'].map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(null) }}
              className={`flex-1 py-1.5 text-sm rounded-md transition-all ${
                tab === t ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {t === 'login' ? 'Log in' : 'Register'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder={tab === 'login' ? 'Username or email' : 'Username'}
            required
            autoComplete="username"
            className={INPUT_CLASS}
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            required
            minLength={6}
            autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
            className={INPUT_CLASS}
          />

          {tab === 'register' && (
            <p className="text-xs text-slate-600">Letters, numbers, and underscores only. 3-20 characters.</p>
          )}

          {error && (
            <p className="text-xs text-rose-400 bg-rose-500/10 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg transition-colors mt-1"
          >
            {loading ? 'Please wait…' : tab === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>
      </div>
    </>
  )
}
