import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

export function collectAssetNames(itemsSource) {
  const matches = itemsSource.matchAll(/assetName:\s*'([^']+)'/g)
  return [...new Set(Array.from(matches, ([, assetName]) => assetName))]
}

function normalizeBaseUrl(baseUrl) {
  return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

export async function syncItemAssets({ baseUrl, itemsFile, iconsDir }) {
  const itemsSource = await fs.readFile(itemsFile, 'utf8')
  const assetNames = collectAssetNames(itemsSource)
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl)

  await fs.mkdir(iconsDir, { recursive: true })

  const downloaded = []
  const skipped = []
  const failed = []

  for (const assetName of assetNames) {
    const targetPath = path.join(iconsDir, `${assetName}.png`)

    if (await fileExists(targetPath)) {
      skipped.push(assetName)
      continue
    }

    try {
      const response = await fetch(new URL(`${assetName}.png`, normalizedBaseUrl))

      if (!response.ok) {
        failed.push(assetName)
        continue
      }

      const bytes = new Uint8Array(await response.arrayBuffer())
      await fs.writeFile(targetPath, bytes)
      downloaded.push(assetName)
    } catch {
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

async function main() {
  const [, , baseUrl] = process.argv

  if (!baseUrl) {
    console.error('Usage: node scripts/get_item_assets.mjs <base-folder-url>')
    process.exitCode = 1
    return
  }

  const result = await syncItemAssets({
    baseUrl,
    itemsFile: path.resolve('src/utils/items.ts'),
    iconsDir: path.resolve('public/itemIcons'),
  })

  console.log(`Asset names: ${result.totalAssetNames}`)
  console.log(`Downloaded: ${result.downloaded.length}`)
  console.log(`Skipped: ${result.skipped.length}`)
  console.log(`Failed: ${result.failed.length}`)

  if (result.failed.length > 0) {
    console.log(`Failed assets: ${result.failed.join(', ')}`)
    process.exitCode = 1
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main()
}
