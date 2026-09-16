/** Demo vs prod. Pages stay demo until VITE_APP_MODE=prod (alias: VITE_ORBIT_MODE). */
export type AppMode = 'demo' | 'prod'

function readMode(): AppMode {
  const raw = (
    import.meta.env.VITE_APP_MODE ||
    import.meta.env.VITE_ORBIT_MODE ||
    'demo'
  )
    .toString()
    .toLowerCase()
    .trim()
  return raw === 'prod' ? 'prod' : 'demo'
}

export const APP_MODE: AppMode = readMode()
export const ORBIT_MODE = APP_MODE
export const isDemo = APP_MODE !== 'prod'
export const isProd = APP_MODE === 'prod'
export const useMock = import.meta.env.VITE_USE_MOCK !== 'false'
