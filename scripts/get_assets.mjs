import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const ITEM_ICON_FOLDER = 'ui/item-icons/'
const MAP_BACKGROUND_MANIFEST_FOLDER = 'data/environments/'
const SPINE_EXTENSIONS = ['png', 'skel', 'atlas']
const SPINE_FOLDER = 'spine/'
const WEAPON_GEAR_FOLDER = 'gear/weapons/'
const execFileAsync = promisify(execFile)

export function collectAssetNames(itemsSource) {
  const matches = itemsSource.matchAll(/assetName:\s*'([^']+)'/g)
  return [...new Set(Array.from(matches, ([, assetName]) => assetName))]
}

export function collectMapKeys(itemsSource) {
  const matches = itemsSource.matchAll(/assetName:\s*'map_([^']+)'/g)
  return [...new Set(Array.from(matches, ([, mapKey]) => mapKey))]
}

export function collectSpineAssetKeys(enemiesSource) {
  const matches = enemiesSource.matchAll(/spineAssetKey:\s*'([^']+)'/g)
  return [...new Set(Array.from(matches, ([, assetKey]) => assetKey))]
}

export function collectWeaponAssetNames(itemsSource) {
  const itemStarts = Array.from(
    itemsSource.matchAll(/^\s{2}[\w$]+:\s*\{/gm),
    (match) => match.index
  )
  const assetNames = ['default']

  for (const [index, itemStart] of itemStarts.entries()) {
    const nextItemStart = itemStarts[index + 1] ?? itemsSource.length
    const itemSource = itemsSource.slice(itemStart, nextItemStart)

    if (!/equipSlots:\s*\[[^\]]*'Weapon'[^\]]*\]/.test(itemSource)) {
      continue
    }

    const assetNameMatch = itemSource.match(/assetName:\s*'([^']+)'/)
    if (assetNameMatch) {
      assetNames.push(assetNameMatch[1])
    }
  }

  return [...new Set(assetNames)]
}

function normalizeBaseUrl(baseUrl) {
  return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
}

function resolveAssetsBaseUrl(baseUrl) {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl)
  const { pathname } = new URL(normalizedBaseUrl)

  if (pathname.endsWith(`/${ITEM_ICON_FOLDER}`)) {
    return new URL('../../', normalizedBaseUrl).href
  }

  if (pathname.endsWith(`/${SPINE_FOLDER}`)) {
    return new URL('../', normalizedBaseUrl).href
  }

  if (pathname.endsWith(`/${WEAPON_GEAR_FOLDER}`)) {
    return new URL('../../', normalizedBaseUrl).href
  }

  return normalizedBaseUrl
}

function resolveAssetFolderUrls(baseUrl) {
  const assetsBaseUrl = resolveAssetsBaseUrl(baseUrl)

  return {
    assetsBaseUrl,
    environmentManifestBaseUrl: new URL(
      MAP_BACKGROUND_MANIFEST_FOLDER,
      assetsBaseUrl
    ).href,
    itemIconBaseUrl: new URL(ITEM_ICON_FOLDER, assetsBaseUrl).href,
    spineBaseUrl: new URL(SPINE_FOLDER, assetsBaseUrl).href,
    weaponGearBaseUrl: new URL(WEAPON_GEAR_FOLDER, assetsBaseUrl).href,
  }
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function downloadAsset(url, targetPath) {
  try {
    const response = await fetch(url)

    if (!response.ok) {
      return false
    }

    const bytes = new Uint8Array(await response.arrayBuffer())
    await fs.writeFile(targetPath, bytes)
    return true
  } catch {
    try {
      await execFileAsync('curl', [
        '--fail',
        '--silent',
        '--show-error',
        '--location',
        url,
        '--output',
        targetPath,
      ])
      return true
    } catch {
      return false
    }
  }
}

function prefixItemIconFile(assetName) {
  return `itemIcons/${assetName}.png`
}

function prefixSpineAssetFile(fileName) {
  return fileName.startsWith('weapons/')
    ? `gear/${fileName}`
    : `spine/${fileName}`
}

function getLayerName(layerKey) {
  const normalizedLayerKey = layerKey.endsWith('.png')
    ? layerKey.slice(0, -'.png'.length)
    : layerKey

  return path.posix.basename(normalizedLayerKey)
}

function resolveLayerAssetUrl(assetsBaseUrl, layerKey) {
  const layerPath = layerKey.endsWith('.png') ? layerKey : `${layerKey}.png`
  const assetPath = layerPath.startsWith('assets/')
    ? layerPath.slice('assets/'.length)
    : layerPath

  return new URL(assetPath, assetsBaseUrl).href
}

function isEnvironmentManifest(value) {
  return (
    value &&
    typeof value === 'object' &&
    Array.isArray(value.layers) &&
    value.layers.every(
      (layer) =>
        layer &&
        typeof layer === 'object' &&
        typeof layer.key === 'string' &&
        typeof layer.width === 'number' &&
        typeof layer.height === 'number' &&
        typeof layer.xOffset === 'number' &&
        typeof layer.yOffset === 'number'
    )
  )
}

async function downloadEnvironmentManifest(url, targetPath) {
  const tempPath = `${targetPath}.tmp`

  try {
    const downloaded = await downloadAsset(url, tempPath)

    if (!downloaded) {
      return { ok: false }
    }

    const source = await fs.readFile(tempPath, 'utf8')
    const manifest = JSON.parse(source)

    if (!isEnvironmentManifest(manifest)) {
      return { ok: false }
    }

    const normalizedSource = `${JSON.stringify(manifest, null, 2)}\n`

    if (
      (await fileExists(targetPath)) &&
      (await fs.readFile(targetPath, 'utf8')) === normalizedSource
    ) {
      return { ok: true, manifest, skipped: true }
    }

    await fs.writeFile(targetPath, normalizedSource)
    return { ok: true, manifest, downloaded: true }
  } catch {
    return { ok: false }
  } finally {
    await fs.rm(tempPath, { force: true })
  }
}

export async function syncMapBackgroundAssets({
  baseUrl,
  itemsFile,
  backgroundsDir,
  mapBackgroundsDir,
}) {
  const itemsSource = await fs.readFile(itemsFile, 'utf8')
  const mapKeys = collectMapKeys(itemsSource)
  const { assetsBaseUrl, environmentManifestBaseUrl } =
    resolveAssetFolderUrls(baseUrl)

  await fs.mkdir(backgroundsDir, { recursive: true })
  await fs.mkdir(mapBackgroundsDir, { recursive: true })

  const downloaded = []
  const skipped = []
  const failed = []

  for (const mapKey of mapKeys) {
    const manifestFileName = `${mapKey}.json`
    const manifestResultName = `pageBackgrounds/${manifestFileName}`
    const manifestPath = path.join(mapBackgroundsDir, manifestFileName)
    const manifestResult = await downloadEnvironmentManifest(
      new URL(manifestFileName, environmentManifestBaseUrl).href,
      manifestPath
    )

    if (!manifestResult.ok) {
      failed.push(manifestResultName)
      continue
    }

    if (manifestResult.downloaded) {
      downloaded.push(manifestResultName)
    } else {
      skipped.push(manifestResultName)
    }

    const mapBackgroundDir = path.join(backgroundsDir, mapKey)
    await fs.mkdir(mapBackgroundDir, { recursive: true })

    for (const layer of manifestResult.manifest.layers) {
      const fileName = `${getLayerName(layer.key)}.png`
      const targetPath = path.join(mapBackgroundDir, fileName)
      const resultName = `backgrounds/${mapKey}/${fileName}`

      if (await fileExists(targetPath)) {
        skipped.push(resultName)
        continue
      }

      const downloadedAsset = await downloadAsset(
        resolveLayerAssetUrl(assetsBaseUrl, layer.key),
        targetPath
      )

      if (downloadedAsset) {
        downloaded.push(resultName)
      } else {
        failed.push(resultName)
      }
    }
  }

  return {
    totalMapKeys: mapKeys.length,
    downloaded: downloaded.sort(),
    skipped: skipped.sort(),
    failed: failed.sort(),
  }
}

export async function syncItemAssets({ baseUrl, itemsFile, iconsDir }) {
  const itemsSource = await fs.readFile(itemsFile, 'utf8')
  const assetNames = collectAssetNames(itemsSource)
  const { itemIconBaseUrl } = resolveAssetFolderUrls(baseUrl)

  await fs.mkdir(iconsDir, { recursive: true })

  const downloaded = []
  const skipped = []
  const failed = []

  for (const assetName of assetNames) {
    const fileName = `${assetName}.png`
    const targetPath = path.join(iconsDir, fileName)

    if (await fileExists(targetPath)) {
      skipped.push(assetName)
      continue
    }

    const downloadedAsset = await downloadAsset(
      new URL(fileName, itemIconBaseUrl).href,
      targetPath
    )

    if (downloadedAsset) {
      downloaded.push(assetName)
    } else {
      failed.push(assetName)
    }
  }

  return {
    totalAssetNames: assetNames.length,
    downloaded: downloaded.sort(),
    skipped: skipped.sort(),
    failed: failed.sort(),
  }
}

export async function syncSpineAssets({
  baseUrl,
  enemiesFile,
  spineDir,
  itemsFile,
  weaponDir,
}) {
  const enemiesSource = await fs.readFile(enemiesFile, 'utf8')
  const assetKeys = collectSpineAssetKeys(enemiesSource)
  const weaponAssetNames =
    itemsFile && weaponDir
      ? collectWeaponAssetNames(await fs.readFile(itemsFile, 'utf8'))
      : []
  const { spineBaseUrl, weaponGearBaseUrl } = resolveAssetFolderUrls(baseUrl)

  await fs.mkdir(spineDir, { recursive: true })
  if (weaponDir) {
    await fs.mkdir(weaponDir, { recursive: true })
  }

  const downloaded = []
  const skipped = []
  const failed = []

  for (const assetKey of assetKeys) {
    for (const extension of SPINE_EXTENSIONS) {
      const fileName = `${assetKey}.${extension}`
      const targetPath = path.join(spineDir, fileName)

      if (await fileExists(targetPath)) {
        skipped.push(fileName)
        continue
      }

      const downloadedAsset = await downloadAsset(
        new URL(fileName, spineBaseUrl).href,
        targetPath
      )

      if (downloadedAsset) {
        downloaded.push(fileName)
      } else {
        failed.push(fileName)
      }
    }
  }

  for (const assetName of weaponAssetNames) {
    const fileName = `${assetName}.png`
    const targetPath = path.join(weaponDir, fileName)
    const resultName = `weapons/${fileName}`

    if (await fileExists(targetPath)) {
      skipped.push(resultName)
      continue
    }

    const downloadedAsset = await downloadAsset(
      new URL(fileName, weaponGearBaseUrl).href,
      targetPath
    )

    if (downloadedAsset) {
      downloaded.push(resultName)
    } else {
      failed.push(resultName)
    }
  }

  const result = {
    totalAssetKeys: assetKeys.length,
    downloaded: downloaded.sort(),
    skipped: skipped.sort(),
    failed: failed.sort(),
  }

  if (itemsFile && weaponDir) {
    result.totalWeaponAssetNames = weaponAssetNames.length
  }

  return result
}

export async function syncAssets({
  baseUrl,
  enemiesFile,
  itemsFile,
  iconsDir,
  spineDir,
  weaponDir,
  backgroundsDir,
  mapBackgroundsDir,
}) {
  const itemResult = await syncItemAssets({
    baseUrl,
    itemsFile,
    iconsDir,
  })
  const spineResult = await syncSpineAssets({
    baseUrl,
    enemiesFile,
    spineDir,
    itemsFile,
    weaponDir,
  })
  const mapBackgroundResult =
    backgroundsDir && mapBackgroundsDir
      ? await syncMapBackgroundAssets({
          baseUrl,
          itemsFile,
          backgroundsDir,
          mapBackgroundsDir,
        })
      : null

  const result = {
    totalItemAssetNames: itemResult.totalAssetNames,
    totalSpineAssetKeys: spineResult.totalAssetKeys,
    totalWeaponAssetNames: spineResult.totalWeaponAssetNames,
    downloaded: [
      ...itemResult.downloaded.map(prefixItemIconFile),
      ...spineResult.downloaded.map(prefixSpineAssetFile),
      ...(mapBackgroundResult?.downloaded ?? []),
    ].sort(),
    skipped: [
      ...itemResult.skipped.map(prefixItemIconFile),
      ...spineResult.skipped.map(prefixSpineAssetFile),
      ...(mapBackgroundResult?.skipped ?? []),
    ].sort(),
    failed: [
      ...itemResult.failed.map(prefixItemIconFile),
      ...spineResult.failed.map(prefixSpineAssetFile),
      ...(mapBackgroundResult?.failed ?? []),
    ].sort(),
  }

  if (mapBackgroundResult) {
    result.totalMapKeys = mapBackgroundResult.totalMapKeys
  }

  return result
}

async function main() {
  const [, , baseUrl] = process.argv

  if (!baseUrl) {
    console.error('Usage: node scripts/get_assets.mjs <assets-base-url>')
    process.exitCode = 1
    return
  }

  const result = await syncAssets({
    baseUrl,
    enemiesFile: path.resolve('src/utils/enemies.ts'),
    itemsFile: path.resolve('src/utils/items.ts'),
    iconsDir: path.resolve('public/itemIcons'),
    spineDir: path.resolve('public/spine'),
    weaponDir: path.resolve('public/gear/weapons'),
    backgroundsDir: path.resolve('public/backgrounds'),
    mapBackgroundsDir: path.resolve('src/utils/pageBackgrounds'),
  })

  console.log(`Item assets: ${result.totalItemAssetNames}`)
  console.log(`Spine asset keys: ${result.totalSpineAssetKeys}`)
  console.log(`Weapon assets: ${result.totalWeaponAssetNames}`)
  console.log(`Map backgrounds: ${result.totalMapKeys}`)
  console.log(`Downloaded: ${result.downloaded.length}`)
  console.log(`Skipped: ${result.skipped.length}`)
  console.log(`Failed: ${result.failed.length}`)

  if (result.failed.length > 0) {
    console.log(`Failed files: ${result.failed.join(', ')}`)
    process.exitCode = 1
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await main()
}
