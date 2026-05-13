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

export const MAP_PAGE_BACKGROUNDS = [
  {
    key: 'fields',
    layers: [
      { name: 'sky', width: 16, height: 800, xOffset: 0, yOffset: 0 },
      { name: 'clouds', width: 1821, height: 358, xOffset: 0, yOffset: 250 },
      { name: 'mountains', width: 1821, height: 218, xOffset: 0, yOffset: 400 },
      { name: 'sword', width: 1821, height: 612, xOffset: 0, yOffset: 50 },
      { name: 'hills', width: 1821, height: 303, xOffset: 0, yOffset: 550 },
      {
        name: 'walkable_area',
        width: 1821,
        height: 362,
        xOffset: 0,
        yOffset: 670,
      },
    ],
  },
  {
    key: 'mossy_forest',
    layers: [
      { name: 'sky', width: 1821, height: 653, xOffset: 0, yOffset: 0 },
      {
        name: 'background_trees',
        width: 1821,
        height: 717,
        xOffset: 0,
        yOffset: 0,
      },
      {
        name: 'midground_trees',
        width: 1821,
        height: 799,
        xOffset: 0,
        yOffset: 0,
      },
      {
        name: 'foreground_trees',
        width: 1821,
        height: 808,
        xOffset: 0,
        yOffset: 0,
      },
      {
        name: 'walkable_area',
        width: 1821,
        height: 358,
        xOffset: 0,
        yOffset: 675,
      },
    ],
  },
  {
    key: 'mountain_pass',
    layers: [
      { name: 'sky', width: 96, height: 898, xOffset: 0, yOffset: 0 },
      {
        name: 'mountain_far',
        width: 1821,
        height: 581,
        xOffset: 0,
        yOffset: 300,
      },
      {
        name: 'clouds_far',
        width: 1821,
        height: 433,
        xOffset: 0,
        yOffset: 50,
      },
      {
        name: 'mountain_mid',
        width: 1821,
        height: 898,
        xOffset: 0,
        yOffset: 0,
      },
      {
        name: 'clouds_mid1',
        width: 1821,
        height: 446,
        xOffset: 0,
        yOffset: 460,
      },
      {
        name: 'clouds_mid2',
        width: 1821,
        height: 578,
        xOffset: 0,
        yOffset: 200,
      },
      {
        name: 'mountain_front',
        width: 1821,
        height: 898,
        xOffset: 0,
        yOffset: 0,
      },
      {
        name: 'clouds_near',
        width: 1821,
        height: 268,
        xOffset: 0,
        yOffset: 500,
      },
      {
        name: 'walkable_area',
        width: 1821,
        height: 323,
        xOffset: 0,
        yOffset: 660,
      },
    ],
  },
  {
    key: 'ruined_path',
    layers: [
      { name: 'sky', width: 96, height: 562, xOffset: 0, yOffset: -20 },
      { name: 'clouds', width: 1821, height: 872, xOffset: 0, yOffset: 0 },
      {
        name: 'back_hills',
        width: 1821,
        height: 161,
        xOffset: 0,
        yOffset: 450,
      },
      { name: 'hills', width: 1821, height: 542, xOffset: 0, yOffset: 300 },
      { name: 'overpass', width: 1821, height: 400, xOffset: 0, yOffset: 0 },
      {
        name: 'walkable_area',
        width: 1821,
        height: 363,
        xOffset: 0,
        yOffset: 675,
      },
      { name: 'column', width: 1821, height: 822, xOffset: 0, yOffset: -40 },
    ],
  },
  {
    key: 'seaside_cliffs',
    layers: [
      { name: 'sky', width: 96, height: 898, xOffset: 0, yOffset: 0 },
      {
        name: 'cloud_far',
        width: 1821,
        height: 246,
        xOffset: 0,
        yOffset: 355,
      },
      {
        name: 'cloud_small',
        width: 1821,
        height: 152,
        xOffset: 0,
        yOffset: 510,
      },
      {
        name: 'cloud_big',
        width: 1821,
        height: 338,
        xOffset: 0,
        yOffset: 110,
      },
      { name: 'sea', width: 96, height: 290, xOffset: 0, yOffset: 507 },
      {
        name: 'rock_far',
        width: 1821,
        height: 304,
        xOffset: 0,
        yOffset: 490,
      },
      {
        name: 'rock_near1',
        width: 1821,
        height: 373,
        xOffset: 0,
        yOffset: 425,
      },
      {
        name: 'rock_near2',
        width: 1821,
        height: 468,
        xOffset: 0,
        yOffset: 330,
      },
      {
        name: 'walkable_area',
        width: 1821,
        height: 358,
        xOffset: 0,
        yOffset: 675,
      },
    ],
  },
  {
    key: 'outer_temple',
    layers: [
      { name: 'sky', width: 32, height: 512, xOffset: 0, yOffset: 0 },
      { name: 'spire', width: 1821, height: 343, xOffset: 0, yOffset: 0 },
      {
        name: 'forest_far',
        width: 1821,
        height: 396,
        xOffset: 0,
        yOffset: 0,
      },
      {
        name: 'forest_mid',
        width: 1821,
        height: 526,
        xOffset: 0,
        yOffset: 220,
      },
      {
        name: 'forest_near',
        width: 1821,
        height: 730,
        xOffset: 0,
        yOffset: 90,
      },
      { name: 'wall', width: 1821, height: 539, xOffset: 0, yOffset: 225 },
      {
        name: 'walkable_area',
        width: 1821,
        height: 376,
        xOffset: 0,
        yOffset: 670,
      },
    ],
  },
  {
    key: 'forbidden_city',
    layers: [
      { name: 'sky', width: 32, height: 851, xOffset: 0, yOffset: 0 },
      { name: 'far_back', width: 1821, height: 808, xOffset: 0, yOffset: 0 },
      {
        name: 'back_buildings',
        width: 1821,
        height: 794,
        xOffset: 0,
        yOffset: 0,
      },
      {
        name: 'mid_buildings',
        width: 1821,
        height: 774,
        xOffset: 0,
        yOffset: -40,
      },
      {
        name: 'walkable_area',
        width: 1821,
        height: 806,
        xOffset: 0,
        yOffset: 220,
      },
    ],
  },
  {
    key: 'new_eden',
    layers: [
      { name: 'sky', width: 32, height: 758, xOffset: 0, yOffset: 0 },
      {
        name: 'background',
        width: 1821,
        height: 754,
        xOffset: 0,
        yOffset: -50,
      },
      {
        name: 'midground',
        width: 1821,
        height: 843,
        xOffset: 0,
        yOffset: -50,
      },
      {
        name: 'walkable_area',
        width: 1821,
        height: 395,
        xOffset: 0,
        yOffset: 620,
      },
    ],
  },
] as const satisfies readonly PageBackground[]

function getBackgroundPath(background: PageBackground, layer: PageBackgroundLayer) {
  return `${import.meta.env.BASE_URL}backgrounds/${background.key}/${layer.name}.png`
}

function getLayerPosition(layer: PageBackgroundLayer) {
  const xPosition =
    layer.xOffset === 0 ? 'center' : `calc(50% + ${layer.xOffset}px)`

  return `${xPosition} ${layer.yOffset}px`
}

function getLayerRepeat(layer: PageBackgroundLayer) {
  return layer.name === 'sky' ? 'repeat' : 'repeat-x'
}

function getLayerSize(layer: PageBackgroundLayer) {
  if (layer.width < 200) return `${layer.width}px ${layer.height}px`

  return `${layer.width}px auto`
}

export function selectRandomPageBackground(
  random: () => number = Math.random
) {
  const index = Math.max(
    0,
    Math.min(
      MAP_PAGE_BACKGROUNDS.length - 1,
      Math.floor(random() * MAP_PAGE_BACKGROUNDS.length)
    )
  )

  return MAP_PAGE_BACKGROUNDS[index]
}

export function getPageBackgroundCssVariables(background: PageBackground) {
  const layers = [...background.layers].reverse()

  return {
    '--page-bg-images': layers
      .map((layer) => `url('${getBackgroundPath(background, layer)}')`)
      .join(', '),
    '--page-bg-positions': layers.map(getLayerPosition).join(', '),
    '--page-bg-repeats': layers.map(getLayerRepeat).join(', '),
    '--page-bg-sizes': layers.map(getLayerSize).join(', '),
  }
}

export function applyRandomPageBackground(
  targetDocument?: Pick<Document, 'body'>,
  random: () => number = Math.random
) {
  const selected = selectRandomPageBackground(random)
  const activeDocument =
    targetDocument ?? (typeof document === 'undefined' ? undefined : document)

  if (!activeDocument?.body) return selected

  activeDocument.body.dataset.mapBackground = selected.key

  Object.entries(getPageBackgroundCssVariables(selected)).forEach(
    ([property, value]) => {
      activeDocument.body.style.setProperty(property, value)
    }
  )

  return selected
}
