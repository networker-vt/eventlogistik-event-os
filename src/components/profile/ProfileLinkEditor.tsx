import { useState } from 'react'
import { Button } from '../ui/Button'
import { Input, Select } from '../ui/Input'
import { useI18n } from '../../lib/i18n'
import { profileLinkHref } from '../../lib/links'
import type { ProfileLinkInput, ProfileLinkKind } from '../../types'

const KINDS: ProfileLinkKind[] = ['instagram', 'facebook', 'tiktok', 'website']

const anchorClass =
  'inline-flex min-h-11 min-w-11 items-center text-base text-[var(--theme-accent)] underline touch-manipulation'

export function ProfileLinkEditor({
  links,
  onChange,
}: {
  links: ProfileLinkInput[]
  onChange: (links: ProfileLinkInput[]) => void
}) {
  const { t } = useI18n()
  const [kind, setKind] = useState<ProfileLinkKind>('instagram')
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const add = () => {
    const trimmed = input.trim()
    const href = profileLinkHref(kind, trimmed)
    if (!href) {
      setError(t('profile.linkInvalid'))
      return
    }
    if (links.some((link) => link.kind === kind && link.input.trim() === trimmed)) {
      setError(t('profile.linkDuplicate'))
      return
    }
    onChange([...links, { kind, input: trimmed }])
    setInput('')
    setError(null)
  }

  return (
    <section className="space-y-3" aria-labelledby="profile-link-heading">
      <div>
        <h2 id="profile-link-heading" className="font-semibold">
          {t('profile.addLink')}
        </h2>
        <p className="mt-1 text-sm text-muted">{t('profile.linkHint')}</p>
      </div>
      {links.length > 0 && (
        <ul className="space-y-2">
          {links.map((link, index) => {
            const href = profileLinkHref(link.kind, link.input)
            return (
              <li key={`${link.kind}-${link.input}-${index}`} className="flex flex-wrap items-center gap-2">
                {href ? (
                  <a href={href} target="_blank" rel="noopener noreferrer" className={anchorClass}>
                    {t(`contact.${link.kind}`)}: {link.input}
                  </a>
                ) : (
                  <p role="status" className="text-sm text-amber-200">
                    {t('profile.linkInvalid')}
                  </p>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  className="min-w-11"
                  aria-label={t('profile.removeLink')}
                  onClick={() => onChange(links.filter((_, item) => item !== index))}
                >
                  {t('profile.removeLink')}
                </Button>
              </li>
            )
          })}
        </ul>
      )}
      <Select
        label={t('profile.linkKind')}
        value={kind}
        onChange={(event) => setKind(event.target.value as ProfileLinkKind)}
      >
        {KINDS.map((item) => (
          <option key={item} value={item}>
            {t(`contact.${item}`)}
          </option>
        ))}
      </Select>
      <Input
        label={t('profile.addLink')}
        value={input}
        placeholder={t('profile.linkPlaceholder')}
        onChange={(event) => {
          setInput(event.target.value)
          if (error) setError(null)
        }}
      />
      <Button type="button" onClick={add} className="min-w-11">
        {t('profile.addLink')}
      </Button>
      {error && (
        <p role="status" className="text-sm text-amber-200">
          {error}
        </p>
      )}
    </section>
  )
}
