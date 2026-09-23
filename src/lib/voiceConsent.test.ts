import { beforeEach, describe, expect, it } from 'vitest'
import { listenOnce } from './speech'
import { grantVoiceConsent, readVoiceConsent, voiceConsentGranted } from './voiceConsent'

describe('voice consent before SpeechRecognition', () => {
  beforeEach(() => {
    localStorage.clear()
    delete (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition
    delete (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
  })

  it('stays idle until the user allows the microphone', () => {
    expect(readVoiceConsent()).toBe('idle')
    expect(voiceConsentGranted()).toBe(false)
    grantVoiceConsent()
    expect(voiceConsentGranted()).toBe(true)
    expect(readVoiceConsent()).toBe('yes')
  })

  it('does not call rec.start until consent is stored', async () => {
    let started = 0
    class Fake {
      lang = ''
      interimResults = false
      maxAlternatives = 1
      onresult: ((ev: { results: { 0: { 0: { transcript: string } } } }) => void) | null = null
      onerror: (() => void) | null = null
      onend: (() => void) | null = null
      start() {
        started += 1
        this.onresult?.({ results: { 0: { 0: { transcript: 'Wien' } } } })
      }
      abort() {}
    }
    ;(window as unknown as { SpeechRecognition: typeof Fake }).SpeechRecognition = Fake
    expect(await listenOnce('de-DE')).toBeNull()
    expect(started).toBe(0)
    grantVoiceConsent()
    expect(await listenOnce('de-DE')).toBe('Wien')
    expect(started).toBe(1)
  })
})
