import { useState } from 'react'

function openRoom(id) {
  const url = new URL(window.location.href)
  url.searchParams.set('room', id)
  window.location.href = url.toString()
}

function TrashIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  )
}

function RoomCard({ room, isOwner, onDelete }) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      await onDelete(room.id)
    } catch (err) {
      alert('Failed to delete: ' + err.message)
      setDeleting(false)
      setConfirming(false)
    }
  }

  return (
    <div className="bg-slate-900 border border-white/[0.06] rounded-xl p-3.5 flex flex-col gap-2.5 w-44">
      <div className="min-w-0">
        <p className="text-sm font-medium text-white truncate">{room.name}</p>
        <span className={`text-xs ${room.access === 'edit' ? 'text-emerald-400' : 'text-amber-400'}`}>
          {room.access === 'edit' ? 'Edit access' : 'View only'}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => openRoom(room.id)}
          className="flex-1 py-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg transition-all"
        >
          Open
        </button>

        {isOwner && !confirming && (
          <button
            onClick={() => setConfirming(true)}
            className="p-1.5 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
            title="Delete room"
          >
            <TrashIcon />
          </button>
        )}

        {confirming && (
          <>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="py-1 px-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-all disabled:opacity-40"
            >
              {deleting ? '…' : 'Delete'}
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="py-1 px-1.5 text-xs text-slate-500 hover:text-slate-300 hover:bg-white/5 rounded-lg transition-all"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function RoomsSection({ myRooms, visitedRooms, onDelete }) {
  if (myRooms.length === 0 && visitedRooms.length === 0) return null

  return (
    <div className="max-w-6xl mx-auto px-4 pt-5 pb-1 space-y-5">
      {myRooms.length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2.5">My Rooms</p>
          <div className="flex gap-3 flex-wrap">
            {myRooms.map(room => (
              <RoomCard key={room.id} room={room} isOwner={true} onDelete={onDelete} />
            ))}
          </div>
        </div>
      )}

      {visitedRooms.length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2.5">Recently Visited</p>
          <div className="flex gap-3 flex-wrap">
            {visitedRooms.map(room => (
              <RoomCard key={room.id} room={room} isOwner={false} onDelete={onDelete} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
