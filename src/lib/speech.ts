import { voiceConsentGranted } from './voiceConsent'

export function canListen(): boolean {
  if (typeof window === 'undefined') return false
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRecognitionLike
    webkitSpeechRecognition?: new () => SpeechRecognitionLike
  }
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition)
}

interface SpeechRecognitionLike {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  onresult: ((ev: { results: { 0: { 0: { transcript: string } } } }) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start: () => void
  abort: () => void
}

export function listenOnce(lang: string): Promise<string | null> {
  return new Promise((resolve) => {
    if (!voiceConsentGranted()) {
      resolve(null)
      return
    }
    const w = window as Window & {
      SpeechRecognition?: new () => SpeechRecognitionLike
      webkitSpeechRecognition?: new () => SpeechRecognitionLike
    }
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition
    if (!Ctor) {
      resolve(null)
      return
    }
    const rec = new Ctor()
    rec.lang = lang
    rec.interimResults = false
    rec.maxAlternatives = 1
    rec.onresult = (ev) => {
      resolve(ev.results[0][0].transcript)
    }
    rec.onerror = () => resolve(null)
    rec.onend = () => {
      /* ignore */
    }
    try {
      rec.start()
    } catch {
      resolve(null)
    }
  })
}
