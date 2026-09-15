import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Briefcase, Package, Search, X } from 'lucide-react'

type Props = {
  open: boolean
  onClose: () => void
}

const options = [
  {
    to: '/listings/new?vertical=job&kind=offer',
    label: 'Job anbieten',
    hint: 'Crew suchen · Rate & Spesen klar',
    icon: Briefcase,
    accent: 'text-cyan border-cyan/40 bg-cyan/10',
  },
  {
    to: '/listings/new?vertical=job&kind=request',
    label: 'Job-Gesuch',
    hint: 'Ich suche Arbeit / Gigs',
    icon: Search,
    accent: 'text-teal border-teal/40 bg-teal/10',
  },
  {
    to: '/listings/new',
    label: 'Marktplatz-Inserat',
    hint: 'Firma, Material, Transport, Hotel…',
    icon: Package,
    accent: 'text-amber-300 border-amber-500/40 bg-amber-500/10',
  },
]

export function CreateSheet({ open, onClose }: Props) {
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Erstellen">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Schließen"
        onClick={onClose}
      />
      <div className="absolute inset-x-0 bottom-0 safe-pb rounded-t-3xl border border-border bg-surface-2 p-4 shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Erstellen</h2>
            <p className="text-xs text-muted">Job, Gesuch oder Marktplatz-Inserat</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="tap-target flex h-10 w-10 items-center justify-center rounded-full border border-border text-neutral-400"
            aria-label="Schließen"
          >
            <X size={18} />
          </button>
        </div>
        <div className="space-y-2 pb-2">
          {options.map((opt) => (
            <button
              key={opt.to}
              type="button"
              onClick={() => {
                onClose()
                navigate(opt.to)
              }}
              className={`flex w-full min-h-14 items-center gap-3 rounded-2xl border px-4 py-3 text-left transition active:scale-[0.98] ${opt.accent}`}
            >
              <opt.icon size={22} />
              <span>
                <span className="block font-semibold text-white">{opt.label}</span>
                <span className="block text-xs text-neutral-300">{opt.hint}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
