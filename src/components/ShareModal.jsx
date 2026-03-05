import { useState } from 'react'
import { createRoom } from '../hooks/useRoom'
import { supabase } from '../lib/supabase'
import { INPUT_CLASS } from '../constants'

export default function ShareModal({ user, apartments = [], onClose }) {
  const [name, setName] = useState('')
  const [access, setAccess] = useState('edit')
  const [startMode, setStartMode] = useState(apartments.length > 0 ? 'import' : 'fresh')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [roomUrl, setRoomUrl] = useState(null)
  const [copied, setCopied] = useState(false)

  async function handleCreate(e) {
    e.preventDefault()
    if (!name.trim()) return
    setError(null)
    setLoading(true)
    try {
      const roomId = await createRoom(name.trim(), access, user.id)

      if (startMode === 'import' && apartments.length > 0) {
        const addedByName = user.profile?.display_name ?? 'Unknown'
        const rows = apartments.map(apt => ({
          id: apt.id,
          room_id: roomId,
          added_by: user.id,
          added_by_name: addedByName,
          data: apt,
        }))
        const { error: importErr } = await supabase.from('room_apartments').insert(rows)
        if (importErr) throw importErr
      }

      const url = `${window.location.origin}${window.location.pathname}?room=${roomId}`
      setRoomUrl(url)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(roomUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-sm bg-slate-950 border border-white/[0.08] rounded-2xl shadow-2xl z-50 p-6">

        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-white">Create shared room</h2>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-300 hover:bg-white/5 rounded-lg transition-colors">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {roomUrl ? (
          <div className="space-y-4">
            <div className="bg-emerald-500/10 ring-1 ring-emerald-500/20 rounded-xl p-4 text-center">
              <p className="text-sm font-medium text-emerald-400 mb-1">Room created!</p>
              <p className="text-xs text-slate-400">Share this link with your collaborators</p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={roomUrl}
                className={INPUT_CLASS + ' text-slate-400 cursor-text'}
              />
              <button
                onClick={copyLink}
                className={`px-3 py-2 text-sm font-medium rounded-lg shrink-0 transition-all ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <p className="text-xs text-slate-500 text-center">
              Access: <span className="text-slate-300">{access === 'edit' ? '✏️ Anyone with the link can edit' : '👁 View only'}</span>
            </p>

            <button onClick={onClose} className="w-full py-2.5 text-sm font-medium text-slate-400 hover:text-slate-200 border border-slate-700/50 hover:bg-white/5 rounded-lg transition-all">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Room name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder='e.g. "Chicago Apartment Search"'
                required
                className={INPUT_CLASS}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-2">Access level</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'edit', icon: '✏️', label: 'Edit', desc: 'Anyone can add & edit' },
                  { value: 'view', icon: '👁', label: 'View only', desc: 'Read-only for others' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setAccess(opt.value)}
                    className={`p-3 rounded-xl text-left border transition-all ${
                      access === opt.value
                        ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-lg mb-1">{opt.icon}</div>
                    <div className="text-xs font-medium">{opt.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {apartments.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-2">Start with</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'import', label: 'My searcher', desc: `Copy all ${apartments.length} apartment${apartments.length !== 1 ? 's' : ''}` },
                    { value: 'fresh', label: 'Fresh room', desc: 'Start with nothing' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setStartMode(opt.value)}
                      className={`p-3 rounded-xl text-left border transition-all ${
                        startMode === opt.value
                          ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-medium">{opt.label}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <p className="text-xs text-rose-400 bg-rose-500/10 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-lg transition-colors"
            >
              {loading ? (startMode === 'import' ? 'Importing…' : 'Creating…') : 'Create room & get link'}
            </button>
          </form>
        )}
      </div>
    </>
  )
}
