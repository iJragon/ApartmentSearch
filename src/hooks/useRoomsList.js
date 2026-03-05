import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const STORAGE_KEY = 'apartment-tracker-recent-rooms'
const MAX_RECENT = 20

function getStored() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') }
  catch { return [] }
}

function setStored(rooms) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms))
}

export function useRoomsList(user) {
  const [myRooms, setMyRooms] = useState([])
  const [recentRooms, setRecentRooms] = useState(getStored)

  useEffect(() => {
    if (!user) { setMyRooms([]); return }
    supabase
      .from('rooms')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setMyRooms(data ?? []))
  }, [user?.id])

  function trackVisit(room) {
    const next = [
      { id: room.id, name: room.name, access: room.access, lastVisited: new Date().toISOString() },
      ...getStored().filter(r => r.id !== room.id),
    ].slice(0, MAX_RECENT)
    setStored(next)
    setRecentRooms(next)
  }

  async function deleteRoom(id) {
    const { error } = await supabase.from('rooms').delete().eq('id', id)
    if (error) throw error
    setMyRooms(prev => prev.filter(r => r.id !== id))
    removeFromRecent(id)
  }

  function removeFromRecent(id) {
    const next = getStored().filter(r => r.id !== id)
    setStored(next)
    setRecentRooms(next)
  }

  const myRoomIds = new Set(myRooms.map(r => r.id))
  const visitedRooms = recentRooms.filter(r => !myRoomIds.has(r.id))

  return { myRooms, visitedRooms, trackVisit, deleteRoom, removeFromRecent }
}
