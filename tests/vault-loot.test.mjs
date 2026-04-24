import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'

function extractBalancedObject(source, objectStart) {
  let depth = 0
  let inStr = false
  let quote = ''
  let escaped = false

  for (let i = objectStart; i < source.length; i += 1) {
    const char = source[i]

    if (inStr) {
      if (escaped) escaped = false
      else if (char === '\\') escaped = true
      else if (char === quote) {
        inStr = false
        quote = ''
      }
      continue
    }

    if (char === '"' || char === "'" || char === '`') {
      inStr = true
      quote = char
      continue
    }

    if (char === '{') depth += 1
    else if (char === '}') {
      depth -= 1
      if (depth === 0) return source.slice(objectStart, i + 1)
    }
  }

  throw new Error('Unbalanced object')
}

function loadExportObject(filePath, exportName, nextExportName) {
  const source = fs.readFileSync(filePath, 'utf8')
  const context = { result: null }

  vm.createContext(context)
  vm.runInContext(
    source
      .replace(/^import type .*$/gm, '')
      .replace(/export const /g, 'const ') + `\nresult=${exportName}`,
    context
  )

  return context.result
}

test('vault loot source stays aligned with bundled dungeon vault loot tables', () => {
  const bundle = fs.readFileSync('index-CGcaOcB4.js', 'utf8')

  const goldStart = bundle.indexOf('vaultGoldLoot=')
  const goldObjectStart = bundle.indexOf('{', goldStart)
  const bundleVaultGoldLoot = vm.runInNewContext(
    '(' + extractBalancedObject(bundle, goldObjectStart) + ')'
  )

  const resourceStart = bundle.indexOf('vaultResourceLoot=')
  const resourceObjectStart = bundle.indexOf('{', resourceStart)
  const bundleVaultResourceLoot = vm.runInNewContext(
    '(' + extractBalancedObject(bundle, resourceObjectStart) + ')'
  )

  const equipStart = bundle.indexOf('vaultEquipLoot=')
  const equipObjectStart = bundle.indexOf('{', equipStart)
  const bundleVaultEquipLoot = vm.runInNewContext(
    '(' + extractBalancedObject(bundle, equipObjectStart) + ')'
  )

  const localVaultLoot = loadExportObject('src/utils/vaultLoot.ts', 'vt')
  const localVaultLootTables = loadExportObject(
    'src/utils/vaultLoot.ts',
    'vaultLootTables'
  )

  assert.equal(
    JSON.stringify(localVaultLoot.vaultGoldLoot),
    JSON.stringify(bundleVaultGoldLoot)
  )
  assert.equal(
    JSON.stringify(localVaultLoot.vaultResourceLoot),
    JSON.stringify(bundleVaultResourceLoot)
  )
  assert.equal(
    JSON.stringify(localVaultLoot.vaultEquipLoot),
    JSON.stringify(bundleVaultEquipLoot)
  )
  assert.equal(
    JSON.stringify(Object.keys(localVaultLootTables)),
    JSON.stringify(['vaultGoldLoot', 'vaultResourceLoot', 'vaultEquipLoot'])
  )
})

test('VaultLootTable source consumes extracted vault loot data', () => {
  const source = fs.readFileSync('src/VaultLootTable.tsx', 'utf8')

  assert.match(source, /from '\.\/utils\/vaultLoot'/)
  assert.match(source, /vaultLootTables/)
  assert.match(source, /TextField/)
  assert.match(source, /Accordion/)
})
