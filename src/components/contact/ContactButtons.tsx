import { Camera, Globe, Mail, MapPin, MessageCircle, Music2, Phone, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import { useI18n } from '../../lib/i18n'
import {
  facebookUrl,
  instagramUrl,
  mailUrl,
  mapsUrl,
  profileLinkHref,
  safeExternalUrl,
  telUrl,
  tiktokUrl,
  whatsappUrl,
} from '../../lib/links'
import type { ProfileLinkInput, ProfileLinkKind } from '../../types'

const linkClass =
  'inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface-2 px-3 text-base text-ink touch-manipulation hover:border-[var(--theme-accent)]/50'

type ContactButtonsProps = {
  phone?: string | null
  email?: string | null
  address?: string | null
  instagram?: string | null
  facebook?: string | null
  tiktok?: string | null
  website?: string | null
  links?: ProfileLinkInput[] | null
  /**
   * Third-party company catalog. Phone and email are ignored even if present,
   * so Paket 1 stays intact.
   */
  catalog?: boolean
}

type Action = {
  key: string
  href: string
  label: string
  external: boolean
  icon: ReactNode
}

export function ContactButtons({
  phone,
  email,
  address,
  instagram,
  facebook,
  tiktok,
  website,
  links,
  catalog = false,
}: ContactButtonsProps) {
  const { t } = useI18n()
  const actions: Action[] = []
  const hints: string[] = []

  const pushLink = (
    key: string,
    raw: string | null | undefined,
    href: string | null,
    label: string,
    external: boolean,
    icon: ReactNode,
    invalid: string,
  ) => {
    if (raw == null || raw.trim() === '') return
    if (!href) {
      hints.push(invalid)
      return
    }
    actions.push({ key, href, label, external, icon })
  }

  if (!catalog && phone != null && phone.trim()) {
    const wa = whatsappUrl(phone)
    const tel = telUrl(phone)
    if (wa && tel) {
      actions.push({
        key: 'whatsapp',
        href: wa,
        label: t('contact.whatsapp'),
        external: true,
        icon: <MessageCircle size={18} aria-hidden />,
      })
      actions.push({
        key: 'tel',
        href: tel,
        label: t('contact.call'),
        external: false,
        icon: <Phone size={18} aria-hidden />,
      })
    } else {
      hints.push(t('contact.invalidPhone'))
    }
  }

  if (!catalog) {
    pushLink('email', email, mailUrl(email), t('contact.email'), false, <Mail size={18} aria-hidden />, t('contact.invalidEmail'))
  }

  pushLink('route', address, mapsUrl(address), t('contact.route'), true, <MapPin size={18} aria-hidden />, t('contact.invalidAddress'))
  pushLink(
    'instagram',
    instagram,
    instagram ? instagramUrl(instagram) ?? profileLinkHref('instagram', instagram) : null,
    t('contact.instagram'),
    true,
    <Camera size={18} aria-hidden />,
    t('contact.invalidLink'),
  )
  pushLink(
    'facebook',
    facebook,
    facebook ? facebookUrl(facebook) ?? profileLinkHref('facebook', facebook) : null,
    t('contact.facebook'),
    true,
    <Users size={18} aria-hidden />,
    t('contact.invalidLink'),
  )
  pushLink(
    'tiktok',
    tiktok,
    tiktok ? tiktokUrl(tiktok) ?? profileLinkHref('tiktok', tiktok) : null,
    t('contact.tiktok'),
    true,
    <Music2 size={18} aria-hidden />,
    t('contact.invalidLink'),
  )
  pushLink(
    'website',
    website,
    safeExternalUrl(website),
    t('contact.website'),
    true,
    <Globe size={18} aria-hidden />,
    t('contact.invalidLink'),
  )

  if (!catalog && links) {
    links.forEach((link, index) => {
      const href = profileLinkHref(link.kind, link.input)
      const label = labelForKind(link.kind, t)
      if (!href) {
        hints.push(t('contact.invalidLink'))
        return
      }
      actions.push({
        key: `saved-${link.kind}-${index}`,
        href,
        label,
        external: true,
        icon: iconForKind(link.kind),
      })
    })
  }

  if (actions.length === 0 && hints.length === 0) return null

  return (
    <div className="space-y-2">
      {actions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => (
            <a
              key={action.key}
              href={action.href}
              className={linkClass}
              {...(action.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              {action.icon}
              {action.label}
            </a>
          ))}
        </div>
      )}
      {hints.map((hint, index) => (
        <p key={`${hint}-${index}`} role="status" className="text-sm text-amber-200">
          {hint}
        </p>
      ))}
    </div>
  )
}

function labelForKind(kind: ProfileLinkKind, t: (key: string) => string): string {
  if (kind === 'instagram') return t('contact.instagram')
  if (kind === 'facebook') return t('contact.facebook')
  if (kind === 'tiktok') return t('contact.tiktok')
  return t('contact.website')
}

function iconForKind(kind: ProfileLinkKind): ReactNode {
  if (kind === 'instagram') return <Camera size={18} aria-hidden />
  if (kind === 'facebook') return <Users size={18} aria-hidden />
  if (kind === 'tiktok') return <Music2 size={18} aria-hidden />
  return <Globe size={18} aria-hidden />
}
