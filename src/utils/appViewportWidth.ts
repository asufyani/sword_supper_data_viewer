const APP_VIEWPORT_WIDTH_PROPERTY = '--app-viewport-width'

type ViewportWidthWindow = Pick<
  Window,
  'addEventListener' | 'document' | 'removeEventListener'
>

export function syncAppViewportWidth(
  activeWindow: ViewportWidthWindow = window
) {
  const root = activeWindow.document.documentElement

  root.style.setProperty(
    APP_VIEWPORT_WIDTH_PROPERTY,
    `${root.clientWidth}px`
  )
}

export function installAppViewportWidthSync(
  activeWindow: ViewportWidthWindow = window
) {
  const handleResize = () => {
    syncAppViewportWidth(activeWindow)
  }

  handleResize()
  activeWindow.addEventListener('resize', handleResize)

  return () => {
    activeWindow.removeEventListener('resize', handleResize)
  }
}
