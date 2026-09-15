export function canSpeak() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function stopSpeaking() {
  if (!canSpeak()) return
  window.speechSynthesis.cancel()
}

export function speakText(text: string, lang?: string) {
  if (!canSpeak() || !text.trim()) return false
  stopSpeaking()
  const u = new SpeechSynthesisUtterance(text.trim().slice(0, 1400))
  const docLang = typeof document !== 'undefined' ? document.documentElement.lang : 'de'
  u.lang = lang || (docLang === 'de' ? 'de-DE' : docLang === 'en' ? 'en-GB' : `${docLang}-${docLang.toUpperCase()}`)
  u.rate = 1
  window.speechSynthesis.speak(u)
  return true
}

export function listingSpeech(input: {
  title: string
  city?: string
  ownerName?: string
  description?: string
  rate?: string
  industry?: string
}) {
  const parts = [
    input.title,
    input.industry,
    input.city && `Ort: ${input.city}`,
    input.ownerName && `Firma: ${input.ownerName}`,
    input.rate && `Vergütung: ${input.rate}`,
    input.description,
  ].filter(Boolean)
  return parts.join('. ')
}
