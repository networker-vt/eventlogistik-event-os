const KEY = 'orbit_voice_consent_v1'

export type VoiceConsent = 'idle' | 'ask' | 'yes'

/** Explicit mic consent, shared by Prefs and Home. Nothing is stored until Allow. */
export function voiceConsentGranted(): boolean {
  try {
    return localStorage.getItem(KEY) === 'yes'
  } catch {
    return false
  }
}

export function readVoiceConsent(): VoiceConsent {
  return voiceConsentGranted() ? 'yes' : 'idle'
}

export function grantVoiceConsent() {
  try {
    localStorage.setItem(KEY, 'yes')
  } catch {
    /* ignore */
  }
}
