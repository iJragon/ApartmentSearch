import { useRef } from 'react'

export default function Header({ count, onAdd, onExport, onImport, user, profile, onSignIn, onSignOut, onShare, roomMode, canEdit }) {
  const fileInputRef = useRef(null)

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (file) { onImport(file); e.target.value = '' }
  }

  return (
    <header className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-semibold text-white tracking-tight">🏠 Apartment Searcher</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {roomMode ? 'Shared room' : `${count} apartment${count !== 1 ? 's' : ''} saved`}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {!roomMode && (
            <>
              <button
                onClick={onExport}
                disabled={count === 0}
                className="px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Export
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg transition-all"
              >
                Import
              </button>
              <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileChange} className="hidden" />
            </>
          )}

          {user ? (
            <>
              {!roomMode && (
                <button
                  onClick={onShare}
                  className="px-3 py-1.5 text-sm text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 ring-1 ring-indigo-500/20 rounded-lg transition-all"
                >
                  Share
                </button>
              )}
              <div className="flex items-center gap-2 pl-2 border-l border-white/[0.06]">
                <span className="text-xs text-slate-400 hidden sm:block truncate max-w-[120px]">
                  {profile?.display_name ?? user.email}
                </span>
                <button
                  onClick={onSignOut}
                  className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-300 hover:bg-white/5 rounded-lg transition-all"
                >
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={onSignIn}
              className="px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 ring-1 ring-white/10 rounded-lg transition-all"
            >
              Sign in
            </button>
          )}

          {canEdit && (
            <button
              onClick={onAdd}
              className="px-4 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
            >
              + Add
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
