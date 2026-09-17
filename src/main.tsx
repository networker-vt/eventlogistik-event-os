import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import { applyScheme, getScheme } from './lib/scheme'
import App from './App'
import './index.css'

applyScheme(getScheme())

registerSW({
  immediate: true,
  onOfflineReady() {
    console.info('[Orbit] Offline-Shell bereit')
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
