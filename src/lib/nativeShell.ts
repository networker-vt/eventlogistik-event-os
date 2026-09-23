import { Capacitor } from '@capacitor/core'

/**
 * Capacitor shell only. Browser and GitHub Pages never enter this path.
 * Camera permission lives in Info.plist because the web UI already opens the camera.
 */
export async function bootNativeShell(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar')
    await StatusBar.setStyle({ style: Style.Light })
  } catch {
    /* WebView still loads if the plugin is missing. */
  }
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen')
    await SplashScreen.hide()
  } catch {
    /* Config launchAutoHide covers the splash. */
  }
}
