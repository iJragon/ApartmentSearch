export const AMENITIES = [
  { key: 'parking', label: 'Parking' },
  { key: 'gym', label: 'Gym' },
  { key: 'pool', label: 'Pool' },
  { key: 'laundry_in_unit', label: 'In-Unit Laundry' },
  { key: 'laundry_shared', label: 'Shared Laundry' },
  { key: 'pet_friendly', label: 'Pet Friendly' },
  { key: 'dishwasher', label: 'Dishwasher' },
  { key: 'ac', label: 'A/C' },
  { key: 'balcony', label: 'Balcony / Patio' },
  { key: 'utilities_included', label: 'Utilities Included' },
  { key: 'furnished', label: 'Furnished' },
  { key: 'ev_charging', label: 'EV Charging' },
  { key: 'walk_in_closet', label: 'Walk-in Closet' },
]

export const STATUS_CONFIG = {
  considering: {
    label: 'Considering',
    bgClass: 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20',
    dotClass: 'bg-blue-400',
  },
  visited: {
    label: 'Visited',
    bgClass: 'bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20',
    dotClass: 'bg-violet-400',
  },
  top_pick: {
    label: 'Top Pick',
    bgClass: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20',
    dotClass: 'bg-emerald-400',
  },
  rejected: {
    label: 'Rejected',
    bgClass: 'bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20',
    dotClass: 'bg-rose-400',
  },
}

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'rating_desc', label: 'Rating: High → Low' },
]

export const INPUT_CLASS = [
  'w-full px-3 py-2.5 rounded-lg text-sm',
  'bg-slate-800/60 border border-slate-700/60',
  'text-slate-100 placeholder:text-slate-500',
  'focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/40',
  'transition-colors',
].join(' ')
