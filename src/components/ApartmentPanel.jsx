import { useState, useEffect } from 'react'
import { AMENITIES, STATUS_CONFIG, INPUT_CLASS } from '../constants'

const DEFAULTS = {
  name: '', address: '', rent: '', bedrooms: '', bathrooms: '',
  sqft: '', amenities: [], pros: [], cons: [], notes: '',
  status: 'considering', rating: 0, listingUrl: '',
  moveInDate: '', leaseLength: '', contact: '',
  toured: false, tourNotes: '',
}

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n === value ? 0 : n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="text-xl leading-none transition-transform hover:scale-110 focus:outline-none"
        >
          <span className={(hovered || value) >= n ? 'text-amber-400' : 'text-slate-700'}>★</span>
        </button>
      ))}
    </div>
  )
}

function ListBuilder({ items, onChange, placeholder, inputValue, onInputChange }) {
  function add() {
    const val = inputValue.trim()
    if (val) { onChange([...items, val]); onInputChange('') }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={e => onInputChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder={placeholder}
          className={INPUT_CLASS}
        />
        <button
          type="button"
          onClick={add}
          disabled={!inputValue.trim()}
          className="px-3 py-2 text-sm text-slate-400 bg-slate-800/60 border border-slate-700/60 rounded-lg hover:text-slate-200 disabled:opacity-30 transition-colors shrink-0"
        >
          Add
        </button>
      </div>
      {items.length > 0 && (
        <ul className="space-y-1">
          {items.map((item, i) => (
            <li key={i} className="flex items-center justify-between px-3 py-2 bg-slate-800/40 rounded-lg text-sm text-slate-300">
              <span>{item}</span>
              <button
                type="button"
                onClick={() => onChange(items.filter((_, j) => j !== i))}
                className="text-slate-600 hover:text-rose-400 ml-3 text-base leading-none transition-colors shrink-0"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section className="space-y-3">
      <h3 className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest">{title}</h3>
      {children}
    </section>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

export default function ApartmentPanel({ apartment, onSave, onClose }) {
  const [form, setForm] = useState(DEFAULTS)
  const [prosInput, setProsInput] = useState('')
  const [consInput, setConsInput] = useState('')
  const isNew = !apartment

  useEffect(() => {
    setForm(apartment ? { ...DEFAULTS, ...apartment } : DEFAULTS)
    setProsInput('')
    setConsInput('')
  }, [apartment])

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  function toggleAmenity(key) {
    const curr = form.amenities ?? []
    set('amenities', curr.includes(key) ? curr.filter(a => a !== key) : [...curr, key])
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-20 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-slate-950 border-l border-white/[0.07] z-30 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] shrink-0">
          <h2 className="text-base font-semibold text-white">
            {isNew ? 'Add Apartment' : 'Edit Apartment'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-300 hover:bg-white/5 rounded-lg transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={e => {
            e.preventDefault()
            const finalForm = { ...form }
            if (prosInput.trim()) finalForm.pros = [...(form.pros ?? []), prosInput.trim()]
            if (consInput.trim()) finalForm.cons = [...(form.cons ?? []), consInput.trim()]
            onSave(finalForm)
          }}
          className="flex-1 overflow-y-auto"
        >
          <div className="px-6 py-6 space-y-7">

            <Section title="Basic Info">
              <Field label="Nickname / Name">
                <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                  placeholder='e.g. "The Downtown One"' className={INPUT_CLASS} />
              </Field>
              <Field label="Address">
                <input type="text" value={form.address} onChange={e => set('address', e.target.value)}
                  placeholder="123 Main St, City, ST" className={INPUT_CLASS} />
              </Field>
              <Field label="Listing URL">
                <input type="url" value={form.listingUrl} onChange={e => set('listingUrl', e.target.value)}
                  placeholder="https://..." className={INPUT_CLASS} />
              </Field>
            </Section>

            <Section title="Details">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Monthly Rent ($)">
                  <input type="number" value={form.rent} onChange={e => set('rent', e.target.value)}
                    placeholder="1800" min="0" className={INPUT_CLASS} />
                </Field>
                <Field label="Sq Ft">
                  <input type="number" value={form.sqft} onChange={e => set('sqft', e.target.value)}
                    placeholder="850" min="0" className={INPUT_CLASS} />
                </Field>
                <Field label="Bedrooms">
                  <input type="number" value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)}
                    placeholder="2" min="0" step="0.5" className={INPUT_CLASS} />
                </Field>
                <Field label="Bathrooms">
                  <input type="number" value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)}
                    placeholder="1" min="0" step="0.5" className={INPUT_CLASS} />
                </Field>
                <Field label="Move-in Date">
                  <input type="date" value={form.moveInDate} onChange={e => set('moveInDate', e.target.value)}
                    className={INPUT_CLASS} />
                </Field>
                <Field label="Lease Length">
                  <input type="text" value={form.leaseLength} onChange={e => set('leaseLength', e.target.value)}
                    placeholder="12 months" className={INPUT_CLASS} />
                </Field>
              </div>
              <Field label="Contact">
                <input type="text" value={form.contact} onChange={e => set('contact', e.target.value)}
                  placeholder="Landlord name, phone, email..." className={INPUT_CLASS} />
              </Field>
            </Section>

            <Section title="Status & Rating">
              <Field label="Status">
                <select value={form.status} onChange={e => set('status', e.target.value)}
                  className={INPUT_CLASS + ' cursor-pointer'}>
                  {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                    <option key={key} value={key} className="bg-slate-900">{label}</option>
                  ))}
                </select>
              </Field>
              <div>
                <p className="text-xs font-medium text-slate-500 mb-2">Rating</p>
                <StarPicker value={form.rating} onChange={v => set('rating', v)} />
              </div>
            </Section>

            <Section title="Amenities">
              <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
                {AMENITIES.map(a => (
                  <label key={a.key} className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={form.amenities?.includes(a.key) ?? false}
                      onChange={() => toggleAmenity(a.key)}
                      className="w-3.5 h-3.5 accent-indigo-500 rounded shrink-0"
                    />
                    <span className="text-sm text-slate-500 group-hover:text-slate-300 transition-colors">
                      {a.label}
                    </span>
                  </label>
                ))}
              </div>
            </Section>

            <Section title="Pros">
              <ListBuilder items={form.pros} onChange={v => set('pros', v)}
                placeholder="What do you like about it?" inputValue={prosInput} onInputChange={setProsInput} />
            </Section>

            <Section title="Cons">
              <ListBuilder items={form.cons} onChange={v => set('cons', v)}
                placeholder="Any concerns or downsides?" inputValue={consInput} onInputChange={setConsInput} />
            </Section>

            <Section title="Notes">
              <textarea
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
                placeholder="Anything else worth remembering..."
                rows={4}
                className={INPUT_CLASS + ' resize-none'}
              />
            </Section>

            <Section title="Tour">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.toured ?? false}
                  onChange={e => set('toured', e.target.checked)}
                  className="w-4 h-4 accent-indigo-500 rounded shrink-0"
                />
                <span className="text-sm text-slate-300">I've toured this apartment</span>
              </label>
              {form.toured && (
                <textarea
                  value={form.tourNotes}
                  onChange={e => set('tourNotes', e.target.value)}
                  placeholder="How did it feel? Anything that stood out — good or bad?"
                  rows={4}
                  className={INPUT_CLASS + ' resize-none mt-2'}
                />
              )}
            </Section>

          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/[0.06] flex gap-3 bg-slate-950 shrink-0">
            <button
              type="submit"
              className="flex-1 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
            >
              {isNew ? 'Add Apartment' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-slate-700/50 rounded-lg transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
