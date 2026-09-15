/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  readonly VITE_APP_NAME?: string
  readonly VITE_USE_MOCK?: string
  readonly VITE_APP_URL?: string
  readonly VITE_LLM_API_KEY?: string
  readonly VITE_LLM_URL?: string
  readonly VITE_LLM_MODEL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
