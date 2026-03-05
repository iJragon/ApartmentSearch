import { useState } from 'react'

export default function RoomBanner({ room, isOwner, onToggleAccess, onLeave, onDelete }) {
  const [copied, setCopied] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleToggle() {
    setToggling(true)
    try {
      await onToggleAccess(room.access === 'edit' ? 'view' : 'edit')
    } finally {
      setToggling(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await onDelete(room.id)
      onLeave()
    } catch (err) {
      alert('Failed to delete room: ' + err.message)
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  return (
    <div className="bg-indigo-600/10 border-b border-indigo-500/20">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-indigo-400 text-sm shrink-0">🔗</span>
          <span className="text-sm font-medium text-indigo-300 truncate">{room.name}</span>
          <span className={`text-xs px-2 py-0.5 rounded-md shrink-0 ${
            room.access === 'edit'
              ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20'
              : 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20'
          }`}>
            {room.access === 'edit' ? 'Edit access' : 'View only'}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isOwner && (
            <button
              onClick={handleToggle}
              disabled={toggling}
              className="text-xs text-slate-400 hover:text-slate-200 hover:bg-white/5 px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-40"
            >
              {toggling ? '…' : room.access === 'edit' ? 'Make view-only' : 'Allow editing'}
            </button>
          )}
          <button
            onClick={copyLink}
            className={`text-xs px-2.5 py-1.5 rounded-lg transition-all ${
              copied
                ? 'bg-emerald-600/20 text-emerald-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            {copied ? 'Copied!' : 'Copy link'}
          </button>
          {isOwner && !confirmDelete && (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-xs text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 px-2.5 py-1.5 rounded-lg transition-all"
            >
              Delete room
            </button>
          )}
          {isOwner && confirmDelete && (
            <>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-40"
              >
                {deleting ? '…' : 'Confirm delete'}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-xs text-slate-500 hover:text-slate-300 hover:bg-white/5 px-2.5 py-1.5 rounded-lg transition-all"
              >
                Cancel
              </button>
            </>
          )}
          <button
            onClick={onLeave}
            className="text-xs text-slate-500 hover:text-slate-300 hover:bg-white/5 px-2.5 py-1.5 rounded-lg transition-all"
          >
            ← My searcher
          </button>
        </div>
      </div>
    </div>
  )
}
