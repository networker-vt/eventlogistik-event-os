import { useRef, useState } from 'react'
import { Camera, ImageIcon } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { useI18n } from '../lib/i18n'
import { explainPhotoStub, type EntdeckerExplain } from '../lib/entdecker'

export function EntdeckerPage() {
  const { t, resolved } = useI18n()
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [explain, setExplain] = useState<EntdeckerExplain | null>(null)
  const [busy, setBusy] = useState(false)

  const onFile = (f: File | undefined) => {
    if (!f) return
    setFile(f)
    setExplain(null)
    setPreview(URL.createObjectURL(f))
  }

  const run = () => {
    if (!file) return
    setBusy(true)
    window.setTimeout(() => {
      setExplain(explainPhotoStub(file, resolved))
      setBusy(false)
    }, 500)
  }

  return (
    <div className="mx-auto max-w-lg space-y-5 pb-scroll-chrome">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--theme-accent)]">
            {t('entdecker.kicker')}
          </p>
          <Badge tone="amber">Demo</Badge>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{t('entdecker.title')}</h1>
        <p className="text-sm text-muted">{t('entdecker.lead')}</p>
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
          {t('entdecker.disclaimer')}
        </p>
      </header>

      <div className="flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={() => cameraRef.current?.click()}>
          <Camera size={16} /> {t('photo.camera')}
        </Button>
        <Button variant="secondary" className="flex-1" onClick={() => galleryRef.current?.click()}>
          <ImageIcon size={16} /> {t('photo.gallery')}
        </Button>
      </div>
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => onFile(e.target.files?.[0])}
      />

      {preview && (
        <img
          src={preview}
          alt=""
          className="max-h-64 w-full rounded-2xl border border-border object-cover"
        />
      )}

      <Button onClick={run} disabled={!file || busy} className="w-full">
        {busy ? t('look.analyzing') : t('entdecker.explain')}
      </Button>

      {explain && (
        <article className="space-y-2 rounded-2xl border border-border bg-surface-2 p-4">
          <h2 className="text-lg font-semibold">{explain.title}</h2>
          <p className="text-sm text-ink-soft">{explain.body}</p>
          <ul className="flex flex-wrap gap-1.5">
            {explain.tags.map((tag) => (
              <li key={tag}>
                <Badge>{tag}</Badge>
              </li>
            ))}
          </ul>
        </article>
      )}

      <p className="text-xs text-muted">{t('entdecker.next')}</p>
    </div>
  )
}
