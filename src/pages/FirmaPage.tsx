import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, FileText, Gift, MapPin, Plus, Trash2 } from 'lucide-react'
import { ListingCard } from '../components/listings/ListingCard'
import { RoleSwitcher } from '../components/role/RoleSwitcher'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Input, Select, Textarea } from '../components/ui/Input'
import { COMPANY_SIZES, COUNTRIES, INDUSTRIES, LANGUAGES, type Industry } from '../data/industries'
import { useAuth } from '../lib/auth'
import { isFlagOn } from '../lib/flags'
import {
  addChip,
  addCompanyDoc,
  companyCompleteness,
  completeCompany,
  getCompany,
  removeChip,
  removeCompanyDoc,
  saveCompany,
  subscribeCompany,
  type CompanyDocKind,
} from '../lib/company'
import { useI18n } from '../lib/i18n'
import { isCompanySide, savePrefs, getPrefs } from '../lib/prefs'
import { store } from '../lib/store'
import { cn, formatDate } from '../lib/utils'
import { useStoreVersion } from '../hooks/useStore'

export function FirmaPage() {
  useStoreVersion()
  const { t } = useI18n()
  const { user, profile, loginDemo, updateProfile } = useAuth()
  const navigate = useNavigate()
  const [company, setCompany] = useState(getCompany)
  const [offerDraft, setOfferDraft] = useState('')
  const [seekDraft, setSeekDraft] = useState('')
  const [hireDraft, setHireDraft] = useState('')
  const [partnerDraft, setPartnerDraft] = useState('')
  const [locDraft, setLocDraft] = useState('')
  const [docKind, setDocKind] = useState<CompanyDocKind>('portfolio')
  const complete = companyCompleteness(company)

  useEffect(() => subscribeCompany(() => setCompany(getCompany())), [])

  const mine = useMemo(() => {
    if (!user) return []
    return store.listListingsForOwner(user.id).filter((l) => l.status === 'active')
  }, [user, company.updatedAt])

  const ensureUser = () => {
    if (user) return user
    loginDemo('user-b2b-1')
    return { id: 'user-b2b-1', name: 'Northline Ops', email: '', role: 'company' as const }
  }

  const finishOnboarding = () => {
    const next = completeCompany({
      firmName: company.firmName.trim() || profile?.companyName || 'Demo Firma',
    })
    const prefs = getPrefs()
    if (!isCompanySide(prefs.side)) savePrefs({ side: 'employer', completed: true })
    else savePrefs({ completed: true })
    const actor = ensureUser()
    updateProfile({
      companyName: next.firmName,
      role: actor.role === 'freelancer' ? 'company' : actor.role,
      bio: next.bio || profile?.bio,
      city: next.locations[0] || profile?.city,
    })
    setCompany(next)
  }

  return (
    <div className="mx-auto max-w-lg space-y-5 pb-scroll-chrome">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--theme-accent)]">
          {t('firma.kicker')}
        </p>
        <h1 className="text-2xl font-bold tracking-tight">{t('firma.title')}</h1>
        <p className="text-sm text-muted">{t('firma.lead')}</p>
        {isFlagOn('credits') && (
        <Link
          to="/wallet#gift"
          className="inline-flex min-h-10 items-center gap-1.5 text-sm text-violet-200 hover:underline"
        >
          <Gift size={16} /> {t('gift.nudgeFirma')}
        </Link>
        )}
      </header>

      <RoleSwitcher />

      <section className="rounded-2xl border border-[var(--theme-accent)]/30 bg-[var(--theme-accent)]/10 p-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">{t('firma.completeness')}</h2>
            <p className="text-xs text-muted">{complete.parts.filter((p) => p.ok).length}/5</p>
          </div>
          <p className="text-3xl font-bold tabular-nums text-[var(--theme-accent)]">{complete.score}%</p>
        </div>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {complete.parts.map((p) => (
            <li key={p.label}>
              <Badge tone={p.ok ? 'teal' : 'default'}>
                {p.ok ? '✓' : '·'} {p.label}
              </Badge>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3 rounded-2xl border border-border bg-surface-2 p-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Building2 size={18} className="text-[var(--theme-accent)]" /> {t('firma.profile')}
        </h2>
        <Input
          label={t('firma.firmName')}
          value={company.firmName}
          onChange={(e) => saveCompany({ firmName: e.target.value })}
          placeholder="Northline Ops B.V."
        />
        <Select
          label={t('firma.industry')}
          value={company.industry}
          onChange={(e) => {
            const industry = e.target.value as Industry | ''
            const industries = industry
              ? Array.from(new Set([...company.industries, industry]))
              : company.industries
            saveCompany({ industry, industries })
          }}
        >
          <option value="">{t('create.industryAny')}</option>
          {INDUSTRIES.map((ind) => (
            <option key={ind} value={ind}>
              {ind}
            </option>
          ))}
        </Select>
        <Select
          label={t('firma.size')}
          value={company.size}
          onChange={(e) => saveCompany({ size: e.target.value })}
        >
          {COMPANY_SIZES.map((sz) => (
            <option key={sz} value={sz}>
              {sz}
            </option>
          ))}
        </Select>
        <Textarea
          label={t('firma.bio')}
          value={company.bio}
          onChange={(e) => saveCompany({ bio: e.target.value })}
          placeholder={t('firma.bioPh')}
        />
        <Input
          label={t('firma.website')}
          value={company.website}
          onChange={(e) => saveCompany({ website: e.target.value })}
          placeholder="https://…"
        />
      </section>

      <section className="space-y-3 rounded-2xl border border-border bg-surface-2 p-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <MapPin size={18} className="text-[var(--theme-accent)]" /> {t('firma.locations')}
        </h2>
        <ChipEditor
          values={company.locations}
          draft={locDraft}
          setDraft={setLocDraft}
          onAdd={() => {
            addChip('locations', locDraft)
            setLocDraft('')
          }}
          onRemove={(v) => removeChip('locations', v)}
          placeholder="Berlin, Amsterdam…"
        />
        <p className="text-xs text-muted">{t('firma.countries')}</p>
        <div className="flex flex-wrap gap-1.5">
          {COUNTRIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                const cur = company.countries
                saveCompany({
                  countries: cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c],
                })
              }}
              className={cn(
                'min-h-9 rounded-full border px-3 text-xs',
                company.countries.includes(c)
                  ? 'border-[var(--theme-accent)] bg-[var(--theme-accent)]/15'
                  : 'border-border',
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted">{t('firma.languages')}</p>
        <div className="flex flex-wrap gap-1.5">
          {LANGUAGES.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => {
                const cur = company.languages
                saveCompany({
                  languages: cur.includes(l) ? cur.filter((x) => x !== l) : [...cur, l],
                })
              }}
              className={cn(
                'min-h-9 rounded-full border px-3 text-xs',
                company.languages.includes(l)
                  ? 'border-[var(--theme-accent)] bg-[var(--theme-accent)]/15'
                  : 'border-border',
              )}
            >
              {l}
            </button>
          ))}
        </div>
        <label className="block text-sm">
          {t('firma.radius')}
          <div className="mt-2 flex items-center gap-3">
            <input
              type="range"
              min={5}
              max={500}
              step={5}
              value={company.radiusKm}
              onChange={(e) => {
                const radiusKm = Number(e.target.value)
                saveCompany({ radiusKm })
                savePrefs({ employer: { ...getPrefs().employer, radiusKm } })
              }}
              className="h-11 flex-1 accent-[var(--theme-accent)]"
            />
            <span className="min-w-16 text-right font-bold tabular-nums">{company.radiusKm} km</span>
          </div>
        </label>
      </section>

      <section className="space-y-3 rounded-2xl border border-border bg-surface-2 p-4">
        <h2 className="text-lg font-semibold">{t('firma.offerSeek')}</h2>
        <p className="text-xs text-muted">{t('firma.offerSeekHint')}</p>
        <p className="text-sm font-medium">{t('firma.offers')}</p>
        <ChipEditor
          values={company.offers}
          draft={offerDraft}
          setDraft={setOfferDraft}
          onAdd={() => {
            addChip('offers', offerDraft)
            setOfferDraft('')
          }}
          onRemove={(v) => removeChip('offers', v)}
          placeholder={t('firma.offersPh')}
        />
        <p className="text-sm font-medium">{t('firma.seeks')}</p>
        <ChipEditor
          values={company.seeks}
          draft={seekDraft}
          setDraft={setSeekDraft}
          onAdd={() => {
            addChip('seeks', seekDraft)
            setSeekDraft('')
          }}
          onRemove={(v) => removeChip('seeks', v)}
          placeholder={t('firma.seeksPh')}
        />
      </section>

      <section className="space-y-3 rounded-2xl border border-border bg-surface-2 p-4">
        <h2 className="text-lg font-semibold">{t('firma.hiring')}</h2>
        <ChipEditor
          values={company.hiringNeeds}
          draft={hireDraft}
          setDraft={setHireDraft}
          onAdd={() => {
            addChip('hiringNeeds', hireDraft)
            const prefs = getPrefs()
            savePrefs({
              employer: {
                ...prefs.employer,
                rolesHiring: Array.from(new Set([...prefs.employer.rolesHiring, hireDraft.trim()])),
              },
            })
            setHireDraft('')
          }}
          onRemove={(v) => removeChip('hiringNeeds', v)}
          placeholder={t('firma.hiringPh')}
        />
        <p className="text-sm font-medium">{t('firma.partners')}</p>
        <ChipEditor
          values={company.partnershipInterests}
          draft={partnerDraft}
          setDraft={setPartnerDraft}
          onAdd={() => {
            addChip('partnershipInterests', partnerDraft)
            setPartnerDraft('')
          }}
          onRemove={(v) => removeChip('partnershipInterests', v)}
          placeholder={t('firma.partnersPh')}
        />
      </section>

      <section className="space-y-3 rounded-2xl border border-border bg-surface-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">{t('firma.listings')}</h2>
          <Button size="sm" onClick={() => navigate('/listings/new?intent=service')}>
            <Plus size={14} /> {t('nav.create')}
          </Button>
        </div>
        <p className="text-xs text-muted">{t('firma.listingsHint')}</p>
        {mine.length === 0 ? (
          <p className="text-sm text-muted">{t('firma.listingsEmpty')}</p>
        ) : (
          <ul className="space-y-3">
            {mine.map((l) => (
              <li key={l.id} className="space-y-2">
                <ListingCard listing={l} />
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="inline-flex min-h-10 items-center gap-1 text-xs text-rose-300"
                    onClick={() => store.archiveListing(l.id)}
                  >
                    <Trash2 size={12} /> {t('firma.archive')}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3 rounded-2xl border border-border bg-surface-2 p-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <FileText size={18} className="text-[var(--theme-accent)]" /> {t('firma.docs')}
        </h2>
        <p className="text-xs text-muted">{t('firma.docsHint')}</p>
        <div className="flex flex-wrap gap-2">
          {(['portfolio', 'deck', 'certificate'] as CompanyDocKind[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setDocKind(k)}
              className={cn(
                'min-h-10 rounded-full border px-3 text-xs',
                docKind === k ? 'border-[var(--theme-accent)] bg-[var(--theme-accent)]/15' : 'border-border',
              )}
            >
              {t(`firma.doc.${k}`)}
            </button>
          ))}
        </div>
        <label className="flex min-h-12 cursor-pointer items-center justify-center rounded-xl border border-dashed border-border bg-black/20 px-3 py-3 text-sm text-neutral-300">
          <input
            type="file"
            accept="image/*,.pdf"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void addCompanyDoc(f, docKind)
              e.target.value = ''
            }}
          />
          {t('firma.docPick')}
        </label>
        <ul className="space-y-2">
          {company.docs.map((d) => (
            <li
              key={d.id}
              className="flex items-center justify-between gap-2 rounded-xl border border-border/70 bg-black/20 px-3 py-2 text-sm"
            >
              <span className="truncate">
                {d.name}{' '}
                <span className="text-xs text-muted">
                  · {d.kind} · {formatDate(d.addedAt.slice(0, 10))}
                </span>
              </span>
              <button type="button" className="text-xs text-rose-300" onClick={() => removeCompanyDoc(d.id)}>
                ×
              </button>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap gap-2">
        <Button onClick={finishOnboarding}>{t('firma.save')}</Button>
        <Button variant="secondary" onClick={() => navigate('/match')}>
          {t('home.ctaMatch')}
        </Button>
      </div>
      <p className="text-xs text-muted">{t('firma.demoLimit')}</p>
    </div>
  )
}

function ChipEditor({
  values,
  draft,
  setDraft,
  onAdd,
  onRemove,
  placeholder,
}: {
  values: string[]
  draft: string
  setDraft: (v: string) => void
  onAdd: () => void
  onRemove: (v: string) => void
  placeholder: string
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {values.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onRemove(v)}
            className="min-h-9 rounded-full border border-[var(--theme-accent)]/40 bg-[var(--theme-accent)]/10 px-3 text-xs"
          >
            {v} ×
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              onAdd()
            }
          }}
        />
        <Button type="button" variant="secondary" onClick={onAdd}>
          +
        </Button>
      </div>
    </div>
  )
}
