/** Demo vs prod. Pages stay demo until VITE_ORBIT_MODE=prod. */
export const ORBIT_MODE = (import.meta.env.VITE_ORBIT_MODE || 'demo').toLowerCase()
export const isDemo = ORBIT_MODE !== 'prod'
export const isProd = ORBIT_MODE === 'prod'
export const useMock = import.meta.env.VITE_USE_MOCK !== 'false'
