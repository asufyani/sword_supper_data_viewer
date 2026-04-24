import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'

function extractFunction(source, functionName) {
  const start = source.indexOf(`function ${functionName}`)
  if (start === -1) throw new Error(`Function ${functionName} not found`)

  const braceStart = source.indexOf('{', start)
  let depth = 0

  for (let i = braceStart; i < source.length; i += 1) {
    const char = source[i]
    if (char === '{') depth += 1
    else if (char === '}') {
      depth -= 1
      if (depth === 0) {
        return source.slice(start, i + 1)
      }
    }
  }

  throw new Error(`Function ${functionName} is unbalanced`)
}

function loadLevelCostUtilities() {
  const source = fs.readFileSync('src/utils/levelCosts.ts', 'utf8')
  const executableSource = source
    .replace(/export function /g, 'function ')
    .replace(/: number/g, '')

  const context = { result: {} }
  vm.createContext(context)
  vm.runInContext(
    `${executableSource}
result = { getLevelUpgradeCost, getLevelCostSoFar }`,
    context
  )

  return context.result
}

test('level costs utility stays aligned with bundle getUpgradeCost formula', () => {
  const bundle = fs.readFileSync('index-CGcaOcB4.js', 'utf8')
  const bundleFunction = extractFunction(bundle, 'getUpgradeCost')
  const bundleContext = { result: null, Math }
  vm.createContext(bundleContext)
  vm.runInContext(`${bundleFunction}; result = getUpgradeCost`, bundleContext)

  const { getLevelUpgradeCost, getLevelCostSoFar } = loadLevelCostUtilities()

  for (const level of [1, 2, 3, 4, 10, 25, 100, 250, 500]) {
    assert.equal(getLevelUpgradeCost(level), bundleContext.result(level))
  }

  assert.equal(getLevelCostSoFar(1), 0)
  assert.equal(
    getLevelCostSoFar(2),
    bundleContext.result(1)
  )
  assert.equal(
    getLevelCostSoFar(5),
    bundleContext.result(1) +
      bundleContext.result(2) +
      bundleContext.result(3) +
      bundleContext.result(4)
  )
})

test('LevelCostTable source includes sticky jump input and virtualization windowing', () => {
  const source = fs.readFileSync('src/LevelCostTable.tsx', 'utf8')

  assert.match(source, /position:\s*'sticky'/)
  assert.match(source, /jumpLevel/)
  assert.match(source, /scrollTop/)
  assert.match(source, /Math\.floor\(scrollTop \/ ROW_HEIGHT\)/)
  assert.match(source, /TOTAL_ROWS/)
  assert.match(source, /getLevelCostSoFar/)
  assert.match(source, /getLevelUpgradeCost/)
})
