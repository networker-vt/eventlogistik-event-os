import { Capacitor } from '@capacitor/core'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import { bootNativeShell } from './lib/nativeShell'
import { applyScheme, getScheme } from './lib/scheme'
import App from './App'
import './index.css'

applyScheme(getScheme())

if (!Capacitor.isNativePlatform()) {
  registerSW({
    immediate: true,
    onOfflineReady() {
      console.info('[Orbit] Offline-Shell bereit')
    },
  })
}

void bootNativeShell()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
