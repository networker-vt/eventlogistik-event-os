import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Sparkles } from 'lucide-react'
import {
  COMPANY_SIZES,
  COUNTRIES,
  INDUSTRIES,
  JOB_TYPES,
  LANGUAGES,
  ORBIT_TAGLINE_DE,
  WORK_MODES,
  type Industry,
  type JobType,
  type WorkMode,
} from '../data/industries'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { CITIES } from '../data/constants'
import {
  completePrefs,
  getPrefs,
  savePrefs,
  type EmployerPrefs,
  type PrefsSide,
  type SeekerPrefs,
} from '../lib/prefs'
import { cn } from '../lib/utils'

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1.5 text-xs font-medium transition',
        active
          ? 'border-cyan bg-cyan/15 text-cyan'
          : 'border-border bg-surface-2 text-neutral-300 hover:border-cyan/40',
      )}
    >
      {children}
    </button>
  )
}

function toggle<T extends string>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]
}

export function PrefsPage() {
  const navigate = useNavigate()
  const initial = useMemo(() => getPrefs(), [])
  const [side, setSide] = useState<PrefsSide>(initial.side)
  const [step, setStep] = useState(0)
  const [seeker, setSeeker] = useState<SeekerPrefs>(initial.seeker)
  const [employer, setEmployer] = useState<EmployerPrefs>(initial.employer)
  const [skillDraft, setSkillDraft] = useState('')

  const seekerSteps = ['Seite', 'Ort & Sprache', 'Branche & Typ', 'Gehalt & Skills']
  const employerSteps = ['Seite', 'Ort & Sprache', 'Rollen & Größe', 'Must-haves']
  const steps = side === 'seeker' ? seekerSteps : employerSteps

  const finish = () => {
    savePrefs({ side, seeker, employer })
    completePrefs(side)
    navigate('/match')
  }

  const addSkill = () => {
    const s = skillDraft.trim()
    if (!s) return
    if (side === 'seeker') {
      if (!seeker.mustHaveSkills.includes(s))
        setSeeker({ ...seeker, mustHaveSkills: [...seeker.mustHaveSkills, s] })
    } else if (!employer.mustHaveSkills.includes(s)) {
      setEmployer({ ...employer, mustHaveSkills: [...employer.mustHaveSkills, s] })
    }
    setSkillDraft('')
  }

  return (
    <div className="mx-auto max-w-lg space-y-5 pb-scroll-chrome">
      <header className="space-y-2">
        <p className="inline-flex items-center gap-2 rounded-full border border-cyan/35 bg-cyan/10 px-3 py-1 text-xs font-medium text-cyan">
          <Sparkles size={14} /> Preference-first
        </p>
        <h1 className="text-2xl font-bold tracking-tight">Dein Orbit einrichten</h1>
        <p className="text-sm text-muted">{ORBIT_TAGLINE_DE}</p>
        <p className="text-xs text-neutral-400">
          Hard-Filter vor dem Feed — weniger Spam, mehr passende Karten.
        </p>
      </header>

      <div className="flex gap-1">
        {steps.map((label, i) => (
          <div
            key={label}
            className={cn(
              'h-1.5 flex-1 rounded-full',
              i <= step ? 'bg-cyan' : 'bg-surface-3',
            )}
            title={label}
          />
        ))}
      </div>
      <p className="text-xs text-muted">
        Schritt {step + 1}/{steps.length}: {steps[step]}
      </p>

      {step === 0 && (
        <section className="grid gap-3 sm:grid-cols-2">
          {(
            [
              {
                id: 'seeker' as const,
                title: 'Ich suche Arbeit',
                hint: 'Jobs & Gigs nach Prefs matchen',
              },
              {
                id: 'employer' as const,
                title: 'Ich stelle ein',
                hint: 'Kandidaten nach Must-haves swipen',
              },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSide(opt.id)}
              className={cn(
                'rounded-2xl border p-4 text-left transition',
                side === opt.id
                  ? 'border-cyan bg-cyan/10'
                  : 'border-border bg-surface-2 hover:border-cyan/40',
              )}
            >
              <div className="font-semibold text-white">{opt.title}</div>
              <p className="mt-1 text-xs text-muted">{opt.hint}</p>
              {side === opt.id && <Check size={16} className="mt-2 text-cyan" />}
            </button>
          ))}
        </section>
      )}

      {step === 1 && (
        <section className="space-y-4">
          <div>
            <h2 className="mb-2 text-sm font-semibold">Länder</h2>
            <div className="flex flex-wrap gap-2">
              {COUNTRIES.map((c) => (
                <Chip
                  key={c}
                  active={(side === 'seeker' ? seeker.countries : employer.countries).includes(c)}
                  onClick={() =>
                    side === 'seeker'
                      ? setSeeker({ ...seeker, countries: toggle(seeker.countries, c) })
                      : setEmployer({ ...employer, countries: toggle(employer.countries, c) })
                  }
                >
                  {c}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <h2 className="mb-2 text-sm font-semibold">Sprachen</h2>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((l) => (
                <Chip
                  key={l}
                  active={(side === 'seeker' ? seeker.languages : employer.languages).includes(l)}
                  onClick={() =>
                    side === 'seeker'
                      ? setSeeker({ ...seeker, languages: toggle(seeker.languages, l) })
                      : setEmployer({ ...employer, languages: toggle(employer.languages, l) })
                  }
                >
                  {l}
                </Chip>
              ))}
            </div>
          </div>
          {side === 'seeker' && (
            <div>
              <h2 className="mb-2 text-sm font-semibold">Städte (optional)</h2>
              <div className="flex flex-wrap gap-2">
                {CITIES.map((c) => (
                  <Chip
                    key={c}
                    active={seeker.cities.includes(c)}
                    onClick={() => setSeeker({ ...seeker, cities: toggle(seeker.cities, c) })}
                  >
                    {c}
                  </Chip>
                ))}
              </div>
              <label className="mt-3 block text-xs text-muted">
                Radius km
                <Input
                  type="number"
                  className="mt-1"
                  value={seeker.radiusKm}
                  onChange={(e) =>
                    setSeeker({ ...seeker, radiusKm: Number(e.target.value) || 0 })
                  }
                />
              </label>
            </div>
          )}
        </section>
      )}

      {step === 2 && side === 'seeker' && (
        <section className="space-y-4">
          <div>
            <h2 className="mb-2 text-sm font-semibold">Branchen</h2>
            <div className="flex flex-wrap gap-2">
              {INDUSTRIES.map((ind) => (
                <Chip
                  key={ind}
                  active={seeker.industries.includes(ind)}
                  onClick={() =>
                    setSeeker({
                      ...seeker,
                      industries: toggle(seeker.industries, ind as Industry),
                    })
                  }
                >
                  {ind}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <h2 className="mb-2 text-sm font-semibold">Job-Typen</h2>
            <div className="flex flex-wrap gap-2">
              {JOB_TYPES.map((jt) => (
                <Chip
                  key={jt}
                  active={seeker.jobTypes.includes(jt)}
                  onClick={() =>
                    setSeeker({ ...seeker, jobTypes: toggle(seeker.jobTypes, jt as JobType) })
                  }
                >
                  {jt}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <h2 className="mb-2 text-sm font-semibold">Arbeitsmodus</h2>
            <div className="flex flex-wrap gap-2">
              {WORK_MODES.map((m) => (
                <Chip
                  key={m.id}
                  active={seeker.workModes.includes(m.id)}
                  onClick={() =>
                    setSeeker({
                      ...seeker,
                      workModes: toggle(seeker.workModes, m.id as WorkMode),
                    })
                  }
                >
                  {m.label}
                </Chip>
              ))}
            </div>
          </div>
        </section>
      )}

      {step === 2 && side === 'employer' && (
        <section className="space-y-4">
          <div>
            <h2 className="mb-2 text-sm font-semibold">Branchen</h2>
            <div className="flex flex-wrap gap-2">
              {INDUSTRIES.map((ind) => (
                <Chip
                  key={ind}
                  active={employer.industries.includes(ind)}
                  onClick={() =>
                    setEmployer({
                      ...employer,
                      industries: toggle(employer.industries, ind as Industry),
                    })
                  }
                >
                  {ind}
                </Chip>
              ))}
            </div>
          </div>
          <label className="block text-sm font-semibold">
            Rollen (Komma-getrennt)
            <Input
              className="mt-1"
              placeholder="z. B. Pflegekraft, Lagerhelfer, React Dev"
              value={employer.rolesHiring.join(', ')}
              onChange={(e) =>
                setEmployer({
                  ...employer,
                  rolesHiring: e.target.value
                    .split(',')
                    .map((x) => x.trim())
                    .filter(Boolean),
                })
              }
            />
          </label>
          <div>
            <h2 className="mb-2 text-sm font-semibold">Unternehmensgröße</h2>
            <div className="flex flex-wrap gap-2">
              {COMPANY_SIZES.map((sz) => (
                <Chip
                  key={sz}
                  active={employer.companySize === sz}
                  onClick={() => setEmployer({ ...employer, companySize: sz })}
                >
                  {sz}
                </Chip>
              ))}
            </div>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-4">
          {side === 'seeker' && (
            <label className="block text-sm font-semibold">
              Gehalt Minimum (€ / Monat, grob)
              <Input
                type="number"
                className="mt-1"
                value={seeker.salaryMin || ''}
                placeholder="z. B. 2500"
                onChange={(e) =>
                  setSeeker({ ...seeker, salaryMin: Number(e.target.value) || 0 })
                }
              />
            </label>
          )}
          <div>
            <h2 className="mb-2 text-sm font-semibold">Must-have Skills</h2>
            <div className="flex gap-2">
              <Input
                value={skillDraft}
                onChange={(e) => setSkillDraft(e.target.value)}
                placeholder="Skill hinzufügen"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <Button type="button" variant="secondary" onClick={addSkill}>
                +
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {(side === 'seeker' ? seeker.mustHaveSkills : employer.mustHaveSkills).map((sk) => (
                <Chip
                  key={sk}
                  active
                  onClick={() =>
                    side === 'seeker'
                      ? setSeeker({
                          ...seeker,
                          mustHaveSkills: seeker.mustHaveSkills.filter((x) => x !== sk),
                        })
                      : setEmployer({
                          ...employer,
                          mustHaveSkills: employer.mustHaveSkills.filter((x) => x !== sk),
                        })
                  }
                >
                  {sk} ×
                </Chip>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="flex gap-2 pt-2">
        {step > 0 && (
          <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
            Zurück
          </Button>
        )}
        <div className="flex-1" />
        {step < steps.length - 1 ? (
          <Button onClick={() => setStep((s) => s + 1)}>Weiter</Button>
        ) : (
          <Button onClick={finish}>Prefs speichern → Match</Button>
        )}
      </div>
    </div>
  )
}
