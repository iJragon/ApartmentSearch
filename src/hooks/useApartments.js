import { useState, useEffect } from 'react'

const STORAGE_KEY = 'apartment-tracker-data'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveToStorage(apartments) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apartments))
}

export function useApartments() {
  const [apartments, setApartments] = useState(() => loadFromStorage())

  useEffect(() => {
    saveToStorage(apartments)
  }, [apartments])

  function addApartment(data) {
    const now = new Date().toISOString()
    const apartment = {
      id: generateId(),
      name: '',
      address: '',
      rent: '',
      bedrooms: '',
      bathrooms: '',
      sqft: '',
      amenities: [],
      pros: [],
      cons: [],
      notes: '',
      status: 'considering',
      rating: 0,
      listingUrl: '',
      moveInDate: '',
      leaseLength: '',
      contact: '',
      createdAt: now,
      updatedAt: now,
      ...data,
    }
    setApartments(prev => [apartment, ...prev])
    return apartment
  }

  function updateApartment(id, changes) {
    setApartments(prev =>
      prev.map(a =>
        a.id === id ? { ...a, ...changes, updatedAt: new Date().toISOString() } : a
      )
    )
  }

  function deleteApartment(id) {
    setApartments(prev => prev.filter(a => a.id !== id))
  }

  function exportData() {
    const json = JSON.stringify(apartments, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `apartment-searcher-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function importData(file, mode = 'merge') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = e => {
        try {
          const imported = JSON.parse(e.target.result)
          if (!Array.isArray(imported)) throw new Error('Invalid file format')
          if (mode === 'replace') {
            setApartments(imported)
          } else {
            // merge: skip duplicates by id
            setApartments(prev => {
              const existingIds = new Set(prev.map(a => a.id))
              const newOnes = imported.filter(a => !existingIds.has(a.id))
              return [...newOnes, ...prev]
            })
          }
          resolve(imported.length)
        } catch (err) {
          reject(err)
        }
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }

  return {
    apartments,
    addApartment,
    updateApartment,
    deleteApartment,
    exportData,
    importData,
  }
}
