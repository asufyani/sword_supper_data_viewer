import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const SPINE_EXTENSIONS = ['png', 'skel', 'atlas']

export function collectSpineAssetKeys(enemiesSource) {
  const matches = enemiesSource.matchAll(/spineAssetKey:\s*'([^']+)'/g)
  return [...new Set(Array.from(matches, ([, assetKey]) => assetKey))]
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

export async function syncSpineAssets({ baseUrl, enemiesFile, spineDir }) {
  const enemiesSource = await fs.readFile(enemiesFile, 'utf8')
  const assetKeys = collectSpineAssetKeys(enemiesSource)
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl)

  await fs.mkdir(spineDir, { recursive: true })

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

      try {
        const response = await fetch(new URL(fileName, normalizedBaseUrl))

        if (!response.ok) {
          failed.push(fileName)
          continue
        }

        const bytes = new Uint8Array(await response.arrayBuffer())
        await fs.writeFile(targetPath, bytes)
        downloaded.push(fileName)
      } catch {
        failed.push(fileName)
      }
    }
  }

  return {
    totalAssetKeys: assetKeys.length,
    downloaded: downloaded.sort(),
    skipped: skipped.sort(),
    failed: failed.sort(),
  }
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
  })

  console.log(`Asset keys: ${result.totalAssetKeys}`)
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
