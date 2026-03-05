import { useState, useMemo, useEffect } from 'react'
import { useApartments } from './hooks/useApartments'
import { useAuth } from './hooks/useAuth'
import { useRoom } from './hooks/useRoom'
import { useRoomsList } from './hooks/useRoomsList'
import Header from './components/Header'
import FilterBar from './components/FilterBar'
import ApartmentGrid from './components/ApartmentGrid'
import ApartmentPanel from './components/ApartmentPanel'
import ApartmentDetail from './components/ApartmentDetail'
import AuthModal from './components/AuthModal'
import ShareModal from './components/ShareModal'
import RoomBanner from './components/RoomBanner'
import RoomsSection from './components/RoomsSection'

// Detect ?room= URL param
function getRoomIdFromUrl() {
  return new URLSearchParams(window.location.search).get('room')
}

function leaveRoom() {
  const url = new URL(window.location.href)
  url.searchParams.delete('room')
  window.location.href = url.toString()
}

export default function App() {
  const urlRoomId = getRoomIdFromUrl()
  const roomMode = Boolean(urlRoomId)

  // Auth
  const { user, profile, loading: authLoading, signUp, signIn, signOut } = useAuth()

  // Private tracker (localStorage)
  const {
    apartments: privateApartments,
    addApartment: privateAdd,
    updateApartment: privateUpdate,
    deleteApartment: privateDelete,
  } = useApartments()

  // Shared room (Supabase) — only active when ?room= is in URL
  const {
    room,
    apartments: roomApartments,
    loading: roomLoading,
    error: roomError,
    presentUsers,
    addApartment: roomAdd,
    updateApartment: roomUpdate,
    deleteApartment: roomDelete,
    updateAccess,
  } = useRoom(urlRoomId, user ? { ...user, profile } : null)

  // Room list (my rooms from Supabase + recently visited from localStorage)
  const { myRooms, visitedRooms, trackVisit, deleteRoom, removeFromRecent } = useRoomsList(user)

  // Track room visits and clean up dead rooms
  useEffect(() => {
    if (roomMode && room) {
      trackVisit({ id: room.id, name: room.name, access: room.access })
    }
  }, [room?.id, room?.name, room?.access])

  useEffect(() => {
    if (roomMode && roomError && urlRoomId) {
      removeFromRecent(urlRoomId)
    }
  }, [roomError])

  // Active data source
  const apartments = roomMode ? roomApartments : privateApartments
  const addApartment = roomMode ? roomAdd : privateAdd
  const updateApartment = roomMode ? roomUpdate : privateUpdate
  const deleteApartment = roomMode ? roomDelete : privateDelete

  // Can edit: always true for private tracker.
  // In room mode: optimistic (true while loading), false only if confirmed view-only.
  const canEdit = !roomMode || roomLoading || Boolean(user && (room?.access === 'edit' || user.id === room?.owner_id))

  // UI state
  const [panelOpen, setPanelOpen] = useState(false)
  const [editingApartment, setEditingApartment] = useState(null)
  const [detailApartment, setDetailApartment] = useState(null)
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('newest')
  const [showAuth, setShowAuth] = useState(false)
  const [showShare, setShowShare] = useState(false)

  function handleAdd() {
    if (roomMode && !user) { setShowAuth(true); return }
    setEditingApartment(null)
    setPanelOpen(true)
  }

  function handleEdit(apt) {
    setDetailApartment(null)
    setEditingApartment(apt)
    setPanelOpen(true)
  }

  async function handleSave(data) {
    try {
      if (editingApartment) {
        await updateApartment(editingApartment.id, data)
      } else {
        await addApartment(data)
      }
      setPanelOpen(false)
      setEditingApartment(null)
    } catch (err) {
      alert('Failed to save: ' + err.message)
    }
  }

  async function handleDelete(id) {
    try {
      await deleteApartment(id)
      if (detailApartment?.id === id) setDetailApartment(null)
    } catch (err) {
      alert('Failed to delete: ' + err.message)
    }
  }

  function handleShareClick() {
    if (!user) { setShowAuth(true); return }
    setShowShare(true)
  }

  const counts = useMemo(() =>
    apartments.reduce((acc, apt) => {
      acc[apt.status] = (acc[apt.status] || 0) + 1
      return acc
    }, {}),
  [apartments])

  const liveDetailApartment = detailApartment
    ? apartments.find(a => a.id === detailApartment.id) ?? null
    : null

  // Room mode: show login wall if not authenticated
  if (roomMode && !authLoading && !user) {
    return (
      <>
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
          <div className="text-4xl mb-4">🔗</div>
          <h1 className="text-xl font-bold text-white mb-2">You've been invited to a shared room</h1>
          <p className="text-sm text-slate-400 mb-6">Sign in or create an account to view this apartment searcher.</p>
          <button
            onClick={() => setShowAuth(true)}
            className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
          >
            Sign in / Register
          </button>
        </div>
        {showAuth && (
          <AuthModal onAuth={{ signIn, signUp }} onClose={() => setShowAuth(false)} />
        )}
      </>
    )
  }

  // Room mode: error state
  if (roomMode && !roomLoading && roomError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <div className="text-4xl mb-4">🚫</div>
        <h1 className="text-xl font-bold text-white mb-2">Room not found</h1>
        <p className="text-sm text-slate-400 mb-6">{roomError}</p>
        <button onClick={leaveRoom} className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
          ← Go to my searcher
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header
        count={apartments.length}
        onAdd={handleAdd}
        user={user}
        profile={profile}
        onSignIn={() => setShowAuth(true)}
        onSignOut={signOut}
        onShare={handleShareClick}
        roomMode={roomMode}
        canEdit={canEdit}
      />

      {roomMode && room && (
        <RoomBanner
          room={room}
          isOwner={user?.id === room.owner_id}
          onToggleAccess={updateAccess}
          onLeave={leaveRoom}
          onDelete={deleteRoom}
          presentUsers={presentUsers}
        />
      )}

      {!roomMode && (
        <RoomsSection
          myRooms={myRooms}
          visitedRooms={visitedRooms}
          onDelete={deleteRoom}
        />
      )}

      <FilterBar
        filter={filter}
        onFilterChange={setFilter}
        sort={sort}
        onSortChange={setSort}
        counts={counts}
      />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {roomMode && roomLoading ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-slate-500 text-sm">Loading room…</div>
          </div>
        ) : (
          <ApartmentGrid
            apartments={apartments}
            filter={filter}
            sort={sort}
            onEdit={canEdit ? handleEdit : null}
            onDelete={canEdit ? handleDelete : null}
            onSelect={setDetailApartment}
            canEdit={canEdit}
            roomMode={roomMode}
            onAdd={canEdit ? handleAdd : null}
          />
        )}
      </main>

      {panelOpen && canEdit && (
        <ApartmentPanel
          apartment={editingApartment}
          onSave={handleSave}
          onClose={() => { setPanelOpen(false); setEditingApartment(null) }}
        />
      )}

      {liveDetailApartment && (
        <ApartmentDetail
          apartment={liveDetailApartment}
          onEdit={canEdit ? handleEdit : null}
          onDelete={canEdit ? handleDelete : null}
          onClose={() => setDetailApartment(null)}
          canEdit={canEdit}
        />
      )}

      {showAuth && (
        <AuthModal onAuth={{ signIn, signUp }} onClose={() => setShowAuth(false)} />
      )}

      {showShare && user && (
        <ShareModal user={user} apartments={privateApartments} onClose={() => setShowShare(false)} />
      )}
    </div>
  )
}
