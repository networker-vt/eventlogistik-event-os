import { Lightbulb } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

export function IdeenFab() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  if (pathname === '/ideen') return null
  return (
    <button
      type="button"
      onClick={() => navigate('/ideen')}
      aria-label="Ideen-Box öffnen — Feedback, Bugs, Features"
      className="bottom-fab glow-cyan-soft fixed right-4 z-40 inline-flex min-h-12 items-center gap-2 rounded-full border border-cyan/40 bg-surface-2/95 px-3.5 py-2 text-sm font-semibold text-cyan shadow-xl backdrop-blur touch-manipulation md:bottom-6"
    >
      <Lightbulb size={18} aria-hidden />
      <span className="hidden sm:inline">Ideen-Box</span>
    </button>
  )
}
