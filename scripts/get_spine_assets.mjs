import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const SPINE_EXTENSIONS = ['png', 'skel', 'atlas']
const WEAPON_GEAR_FOLDER = 'gear/weapons/'
const execFileAsync = promisify(execFile)

export function collectSpineAssetKeys(enemiesSource) {
  const matches = enemiesSource.matchAll(/spineAssetKey:\s*'([^']+)'/g)
  return [...new Set(Array.from(matches, ([, assetKey]) => assetKey))]
}

export function collectWeaponAssetNames(itemsSource) {
  const matches = itemsSource.matchAll(/^\s{2}[\w$]+:\s*\{[\s\S]*?^\s{2}\},/gm)
  const assetNames = ['default']

  for (const [itemSource] of matches) {
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

function resolveAssetFolderUrls(baseUrl) {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl)

  if (new URL(normalizedBaseUrl).pathname.endsWith('/spine/')) {
    return {
      spineBaseUrl: normalizedBaseUrl,
      weaponGearBaseUrl: new URL(`../${WEAPON_GEAR_FOLDER}`, normalizedBaseUrl)
        .href,
    }
  }

  return {
    spineBaseUrl: new URL('spine/', normalizedBaseUrl).href,
    weaponGearBaseUrl: new URL(WEAPON_GEAR_FOLDER, normalizedBaseUrl).href,
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

async function main() {
  const [, , baseUrl] = process.argv

  if (!baseUrl) {
    console.error('Usage: node scripts/get_spine_assets.mjs <base-folder-url>')
    process.exitCode = 1
    return
  }

  const result = await syncSpineAssets({
    baseUrl,
    enemiesFile: path.resolve('src/utils/enemies.ts'),
    spineDir: path.resolve('public/spine'),
    itemsFile: path.resolve('src/utils/items.ts'),
    weaponDir: path.resolve('public/gear/weapons'),
  })

  console.log(`Asset keys: ${result.totalAssetKeys}`)
  console.log(`Weapon assets: ${result.totalWeaponAssetNames}`)
  console.log(`Downloaded: ${result.downloaded.length}`)
  console.log(`Skipped: ${result.skipped.length}`)
  console.log(`Failed: ${result.failed.length}`)

  if (result.failed.length > 0) {
    console.log(`Failed files: ${result.failed.join(', ')}`)
    process.exitCode = 1
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main()
}
