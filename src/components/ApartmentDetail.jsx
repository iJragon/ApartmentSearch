import { AMENITIES, STATUS_CONFIG } from '../constants'

function Stars({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} className={`text-lg ${n <= rating ? 'text-amber-400' : 'text-slate-700'}`}>★</span>
      ))}
    </div>
  )
}

function StatBox({ label, value, accent }) {
  return (
    <div className={`rounded-xl p-3.5 ${accent ? 'bg-indigo-500/10 ring-1 ring-indigo-500/20' : 'bg-slate-800/60'}`}>
      <p className={`text-xs font-medium mb-1 ${accent ? 'text-indigo-400' : 'text-slate-500'}`}>{label}</p>
      <p className={`text-xl font-bold ${accent ? 'text-white' : 'text-slate-200'}`}>{value}</p>
    </div>
  )
}

export default function ApartmentDetail({ apartment, onEdit, onDelete, onClose, canEdit = true }) {
  if (!apartment) return null

  const status = STATUS_CONFIG[apartment.status] ?? STATUS_CONFIG.considering
  const amenityLabels = AMENITIES.filter(a => apartment.amenities?.includes(a.key))

  function handleDelete() {
    if (window.confirm(`Delete "${apartment.name || 'this apartment'}"? This can't be undone.`)) {
      onDelete(apartment.id)
      onClose()
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />

      <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:max-h-[88vh] bg-slate-950 border border-white/[0.08] rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-6 py-5 border-b border-white/[0.06] shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-md ${status.bgClass} mb-2`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`} />
                {status.label}
              </span>
              <h2 className="text-xl font-bold text-white leading-tight">
                {apartment.name || 'Unnamed Apartment'}
              </h2>
              {apartment.address && (
                <p className="text-sm text-slate-500 mt-0.5">{apartment.address}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-300 hover:bg-white/5 rounded-lg transition-colors shrink-0"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Stats grid */}
          {(apartment.rent || apartment.bedrooms || apartment.bathrooms || apartment.sqft) && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {apartment.rent && (
                <StatBox label="Monthly Rent" value={`$${Number(apartment.rent).toLocaleString()}`} accent />
              )}
              {apartment.bedrooms && <StatBox label="Beds" value={apartment.bedrooms} />}
              {apartment.bathrooms && <StatBox label="Baths" value={apartment.bathrooms} />}
              {apartment.sqft && <StatBox label="Sq Ft" value={Number(apartment.sqft).toLocaleString()} />}
            </div>
          )}

          {/* Rating */}
          {apartment.rating > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest mb-2">Rating</p>
              <Stars rating={apartment.rating} />
            </div>
          )}

          {/* Lease / contact */}
          {(apartment.leaseLength || apartment.moveInDate || apartment.contact) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {apartment.leaseLength && (
                <div>
                  <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest mb-1">Lease</p>
                  <p className="text-sm text-slate-300">{apartment.leaseLength}</p>
                </div>
              )}
              {apartment.moveInDate && (
                <div>
                  <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest mb-1">Move-in</p>
                  <p className="text-sm text-slate-300">
                    {new Date(apartment.moveInDate + 'T00:00:00').toLocaleDateString()}
                  </p>
                </div>
              )}
              {apartment.contact && (
                <div className="col-span-full">
                  <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest mb-1">Contact</p>
                  <p className="text-sm text-slate-300">{apartment.contact}</p>
                </div>
              )}
            </div>
          )}

          {/* Listing link */}
          {apartment.listingUrl && (
            <div>
              <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest mb-1">Listing</p>
              <a
                href={apartment.listingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-400 hover:text-indigo-300 hover:underline break-all transition-colors"
              >
                {apartment.listingUrl}
              </a>
            </div>
          )}

          {/* Pros & Cons */}
          {(apartment.pros?.length > 0 || apartment.cons?.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {apartment.pros?.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold text-emerald-500/80 uppercase tracking-widest mb-2">Pros</p>
                  <ul className="space-y-1.5">
                    {apartment.pros.map((pro, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="text-emerald-500 mt-0.5 shrink-0 text-xs">✓</span>
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {apartment.cons?.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold text-rose-500/80 uppercase tracking-widest mb-2">Cons</p>
                  <ul className="space-y-1.5">
                    {apartment.cons.map((con, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="text-rose-500 mt-0.5 shrink-0 text-xs">✕</span>
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Amenities */}
          {amenityLabels.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest mb-2">Amenities</p>
              <div className="flex flex-wrap gap-1.5">
                {amenityLabels.map(a => (
                  <span key={a.key} className="px-2.5 py-1 text-xs bg-slate-800/80 text-slate-400 rounded-md">
                    {a.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {apartment.notes && (
            <div>
              <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest mb-2">Notes</p>
              <p className="text-sm text-slate-400 whitespace-pre-wrap leading-relaxed">{apartment.notes}</p>
            </div>
          )}

          {/* Tour */}
          <div>
            <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest mb-2">Tour</p>
            {apartment.toured ? (
              <>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 ring-1 ring-emerald-500/20 px-2 py-1 rounded-md mb-2">
                  ✓ Toured
                </span>
                {apartment.tourNotes && (
                  <p className="text-sm text-slate-400 whitespace-pre-wrap leading-relaxed mt-2">{apartment.tourNotes}</p>
                )}
              </>
            ) : (
              <span className="text-xs text-slate-600">Not yet toured</span>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.06] flex justify-between items-center shrink-0">
          {canEdit ? (
            <>
              <button
                onClick={handleDelete}
                className="px-3 py-2 text-sm text-rose-500/70 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
              >
                Delete
              </button>
              <button
                onClick={() => onEdit(apartment)}
                className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
              >
                Edit
              </button>
            </>
          ) : (
            <div className="w-full flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 border border-slate-700/50 hover:bg-white/5 rounded-lg transition-all"
              >
                Close
              </button>
            </div>
          )}
        </div>

      </div>
    </>
  )
}
