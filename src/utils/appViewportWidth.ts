const APP_VIEWPORT_WIDTH_PROPERTY = '--app-viewport-width'
const APP_VIEWPORT_HEIGHT_PROPERTY = '--app-viewport-height'

type ViewportWidthWindow = Pick<
  Window,
  'addEventListener' | 'document' | 'removeEventListener'
> & {
  visualViewport?: Pick<
    VisualViewport,
    'addEventListener' | 'height' | 'removeEventListener'
  > | null
}

function isUsableDimension(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

function getViewportHeight(activeWindow: ViewportWidthWindow) {
  const visualHeight = activeWindow.visualViewport?.height

  if (isUsableDimension(visualHeight)) {
    return visualHeight
  }

  return activeWindow.document.documentElement.clientHeight
}

export function syncAppViewportWidth(
  activeWindow: ViewportWidthWindow = window
) {
  const root = activeWindow.document.documentElement

  root.style.setProperty(
    APP_VIEWPORT_WIDTH_PROPERTY,
    `${root.clientWidth}px`
  )
  root.style.setProperty(
    APP_VIEWPORT_HEIGHT_PROPERTY,
    `${getViewportHeight(activeWindow)}px`
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
  activeWindow.visualViewport?.addEventListener('resize', handleResize)

  return () => {
    activeWindow.removeEventListener('resize', handleResize)
    activeWindow.visualViewport?.removeEventListener('resize', handleResize)
  }
}
