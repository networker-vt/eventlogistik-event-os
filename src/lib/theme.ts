export type SectionTheme = 'home' | 'match' | 'mein' | 'inbox' | 'mehr'

export function themeForPath(pathname: string): SectionTheme {
  if (pathname === '/' || pathname === '') return 'home'
  if (
    pathname.startsWith('/match') ||
    pathname.startsWith('/jobs') ||
    pathname.startsWith('/prefs') ||
    pathname.startsWith('/foto')
  ) {
    return 'match'
  }
  if (
    pathname.startsWith('/mein') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/wallet') ||
    pathname.startsWith('/empfehlen') ||
    pathname.startsWith('/erfahrungen')
  ) {
    return 'mein'
  }
  if (
    pathname.startsWith('/messages') ||
    pathname.startsWith('/bookings') ||
    pathname.startsWith('/interview')
  ) {
    return 'inbox'
  }
  return 'mehr'
}
