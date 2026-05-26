export type PageBackgroundLayer = {
  name: string
  width: number
  height: number
  xOffset: number
  yOffset: number
}

export type PageBackground = {
  key: string
  layers: readonly PageBackgroundLayer[]
}

type PageBackgroundDocument = Pick<Document, 'body'> &
  Partial<Pick<Document, 'defaultView' | 'documentElement'>>

type PageBackgroundWindow = Pick<
  Window,
  'addEventListener' | 'removeEventListener'
> & {
  visualViewport?: Pick<
    VisualViewport,
    'addEventListener' | 'height' | 'removeEventListener'
  > | null
}

type EnvironmentManifestLayer = {
  key: string
  width: number
  height: number
  xOffset: number
  yOffset: number
}

type EnvironmentManifest = {
  layers: readonly EnvironmentManifestLayer[]
}

const mapBackgroundManifestModules = import.meta.glob<EnvironmentManifest>(
  './pageBackgrounds/*.json',
  { eager: true, import: 'default' }
)

const MAP_PAGE_BACKGROUND_ORDER = [
  'fields',
  'mossy_forest',
  'mountain_pass',
  'ruined_path',
  'seaside_cliffs',
  'outer_temple',
  'forbidden_city',
  'new_eden',
  'castle_road',
  'weapons_market',
  'ancient_battlefield',
  'haunted_forest',
  'winter_festival',
] as const

function getMapKeyFromManifestPath(manifestPath: string) {
  const fileName = manifestPath.split('/').pop() ?? manifestPath
  return fileName.replace(/\.json$/, '')
}

function getLayerName(layerKey: string) {
  const normalizedLayerKey = layerKey.endsWith('.png')
    ? layerKey.slice(0, -'.png'.length)
    : layerKey
  const segments = normalizedLayerKey.split('/')

  return segments.at(-1) ?? normalizedLayerKey
}

function getMapSortIndex(mapKey: string) {
  const orderIndex = MAP_PAGE_BACKGROUND_ORDER.indexOf(
    mapKey as (typeof MAP_PAGE_BACKGROUND_ORDER)[number]
  )

  return orderIndex === -1 ? MAP_PAGE_BACKGROUND_ORDER.length : orderIndex
}

function comparePageBackgrounds(first: PageBackground, second: PageBackground) {
  const firstIndex = getMapSortIndex(first.key)
  const secondIndex = getMapSortIndex(second.key)

  if (firstIndex !== secondIndex) {
    return firstIndex - secondIndex
  }

  return first.key.localeCompare(second.key)
}

export const MAP_PAGE_BACKGROUNDS: readonly PageBackground[] = Object.entries(
  mapBackgroundManifestModules
)
  .map(([manifestPath, manifest]) => ({
    key: getMapKeyFromManifestPath(manifestPath),
    layers: manifest.layers.map((layer) => ({
      name: getLayerName(layer.key),
      width: layer.width,
      height: layer.height,
      xOffset: layer.xOffset,
      yOffset: layer.yOffset,
    })),
  }))
  .sort(comparePageBackgrounds)

function getBackgroundPath(
  background: PageBackground,
  layer: PageBackgroundLayer
) {
  return `${import.meta.env.BASE_URL}backgrounds/${background.key}/${layer.name}.png`
}

function formatPixels(value: number) {
  return `${Number.parseFloat(value.toFixed(3))}px`
}

function isUsableDimension(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

export function getPageBackgroundSceneHeight(background: PageBackground) {
  return Math.max(
    ...background.layers.map((layer) => layer.yOffset + layer.height)
  )
}

function getPageBackgroundScale(
  background: PageBackground,
  viewportHeight?: number
) {
  if (!isUsableDimension(viewportHeight)) {
    return 1
  }

  return Math.max(1, viewportHeight / getPageBackgroundSceneHeight(background))
}

function getDocumentViewportHeight(activeDocument: PageBackgroundDocument) {
  const visualHeight = activeDocument.defaultView?.visualViewport?.height

  if (isUsableDimension(visualHeight)) {
    return visualHeight
  }

  const clientHeight = activeDocument.documentElement?.clientHeight

  if (isUsableDimension(clientHeight)) {
    return clientHeight
  }

  return undefined
}

function getLayerPosition(layer: PageBackgroundLayer, scale = 1) {
  const xPosition =
    layer.xOffset === 0 ? 'center' : `calc(50% + ${layer.xOffset}px)`

  return `${xPosition} ${formatPixels(layer.yOffset * scale)}`
}

function getLayerRepeat(layer: PageBackgroundLayer) {
  return layer.name === 'sky' ? 'repeat' : 'repeat-x'
}

function getLayerSize(layer: PageBackgroundLayer, scale = 1) {
  if (layer.width < 200) {
    return `${formatPixels(layer.width)} ${formatPixels(layer.height * scale)}`
  }

  return `${formatPixels(layer.width * scale)} auto`
}

export function selectRandomPageBackground(random: () => number = Math.random) {
  const index = Math.max(
    0,
    Math.min(
      MAP_PAGE_BACKGROUNDS.length - 1,
      Math.floor(random() * MAP_PAGE_BACKGROUNDS.length)
    )
  )

  return MAP_PAGE_BACKGROUNDS[index]
}

export function getPageBackgroundCssVariables(
  background: PageBackground,
  viewportHeight?: number
) {
  const layers = [...background.layers].reverse()
  const scale = getPageBackgroundScale(background, viewportHeight)

  return {
    '--page-bg-images': layers
      .map((layer) => `url('${getBackgroundPath(background, layer)}')`)
      .join(', '),
    '--page-bg-positions': layers
      .map((layer) => getLayerPosition(layer, scale))
      .join(', '),
    '--page-bg-repeats': layers.map(getLayerRepeat).join(', '),
    '--page-bg-sizes': layers
      .map((layer) => getLayerSize(layer, scale))
      .join(', '),
  }
}

export function applyPageBackground(
  background: PageBackground,
  targetDocument?: PageBackgroundDocument
) {
  const activeDocument =
    targetDocument ?? (typeof document === 'undefined' ? undefined : document)

  if (!activeDocument?.body) return

  activeDocument.body.dataset.mapBackground = background.key

  Object.entries(
    getPageBackgroundCssVariables(
      background,
      getDocumentViewportHeight(activeDocument)
    )
  ).forEach(([property, value]) => {
    activeDocument.body.style.setProperty(property, value)
  })
}

export function installPageBackgroundScaleSync(
  background: PageBackground,
  targetDocument?: PageBackgroundDocument
) {
  const activeDocument =
    targetDocument ?? (typeof document === 'undefined' ? undefined : document)

  if (!activeDocument?.body) return () => {}

  const activeWindow: PageBackgroundWindow | undefined =
    activeDocument.defaultView ??
    (typeof window === 'undefined' ? undefined : window)
  const handleResize = () => {
    applyPageBackground(background, activeDocument)
  }

  handleResize()
  activeWindow?.addEventListener('resize', handleResize)
  activeWindow?.visualViewport?.addEventListener('resize', handleResize)

  return () => {
    activeWindow?.removeEventListener('resize', handleResize)
    activeWindow?.visualViewport?.removeEventListener('resize', handleResize)
  }
}

export function applyRandomPageBackground(
  targetDocument?: PageBackgroundDocument,
  random: () => number = Math.random
) {
  const selected = selectRandomPageBackground(random)

  applyPageBackground(selected, targetDocument)

  return selected
}
