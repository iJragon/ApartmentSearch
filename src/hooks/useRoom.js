import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function generateRoomId() {
  return Math.random().toString(36).slice(2, 10)
}

function rowToApartment(row) {
  return { ...row.data, id: row.id, addedBy: row.added_by_name }
}

export function useRoom(roomId, user) {
  const [room, setRoom] = useState(null)
  const [apartments, setApartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const channelRef = useRef(null)

  useEffect(() => {
    if (!roomId) return
    setLoading(true)
    setError(null)

    Promise.all([fetchRoom(), fetchApartments()]).then(() => setLoading(false))
    subscribeToRoom()

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current)
    }
  }, [roomId])

  async function fetchRoom() {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single()

    if (error || !data) {
      setError('Room not found or no longer available.')
      return
    }
    setRoom(data)
  }

  async function fetchApartments() {
    const { data, error } = await supabase
      .from('room_apartments')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setApartments(data.map(rowToApartment))
    }
  }

  function subscribeToRoom() {
    const channel = supabase
      .channel(`room:${roomId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'room_apartments',
      }, ({ new: row }) => {
        setApartments(prev =>
          prev.some(a => a.id === row.id) ? prev : [rowToApartment(row), ...prev]
        )
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'room_apartments',
      }, ({ new: row }) => {
        setApartments(prev => prev.map(a => a.id === row.id ? rowToApartment(row) : a))
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'room_apartments',
      }, ({ old: row }) => {
        setApartments(prev => prev.filter(a => a.id !== row.id))
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'rooms',
      }, ({ new: row }) => {
        if (row.id !== roomId) return
        setRoom(row)
      })
      .subscribe()

    channelRef.current = channel
  }

  async function addApartment(data) {
    if (!user) throw new Error('Must be logged in')
    const now = new Date().toISOString()
    const id = generateId()
    const apartment = {
      id, name: '', address: '', rent: '', bedrooms: '', bathrooms: '',
      sqft: '', amenities: [], pros: [], cons: [], notes: '',
      status: 'considering', rating: 0, listingUrl: '',
      moveInDate: '', leaseLength: '', contact: '',
      createdAt: now, updatedAt: now,
      ...data,
    }
    const addedBy = user.profile?.display_name ?? 'Unknown'

    // Optimistic update — show immediately for the person who added it
    setApartments(prev => [{ ...apartment, addedBy }, ...prev])

    const { error } = await supabase.from('room_apartments').insert({
      id,
      room_id: roomId,
      added_by: user.id,
      added_by_name: addedBy,
      data: apartment,
    })

    if (error) {
      // Roll back optimistic update on failure
      setApartments(prev => prev.filter(a => a.id !== id))
      throw error
    }
  }

  async function updateApartment(id, changes) {
    if (!user) throw new Error('Must be logged in')
    const existing = apartments.find(a => a.id === id)
    if (!existing) return

    const { addedBy, ...rest } = existing
    const updated = { ...rest, ...changes, updatedAt: new Date().toISOString() }

    // Optimistic update
    setApartments(prev => prev.map(a => a.id === id ? { ...updated, addedBy } : a))

    const { error } = await supabase
      .from('room_apartments')
      .update({ data: updated, updated_at: updated.updatedAt })
      .eq('id', id)

    if (error) {
      // Roll back
      setApartments(prev => prev.map(a => a.id === id ? existing : a))
      throw error
    }
  }

  async function deleteApartment(id) {
    if (!user) throw new Error('Must be logged in')
    const existing = apartments.find(a => a.id === id)

    // Optimistic update
    setApartments(prev => prev.filter(a => a.id !== id))

    const { error } = await supabase.from('room_apartments').delete().eq('id', id)

    if (error) {
      // Roll back
      setApartments(prev => existing ? [existing, ...prev] : prev)
      throw error
    }
  }

  async function updateAccess(access) {
    if (!user || room?.owner_id !== user.id) throw new Error('Only the room owner can change access')

    // Optimistic update
    setRoom(prev => ({ ...prev, access }))

    const { error } = await supabase.from('rooms').update({ access }).eq('id', roomId)

    if (error) {
      // Roll back
      setRoom(prev => ({ ...prev, access: access === 'edit' ? 'view' : 'edit' }))
      throw error
    }
  }

  return { room, apartments, loading, error, addApartment, updateApartment, deleteApartment, updateAccess }
}

export async function createRoom(name, access, userId) {
  const id = generateRoomId()
  const { error } = await supabase.from('rooms').insert({ id, name, owner_id: userId, access })
  if (error) throw error
  return id
}
