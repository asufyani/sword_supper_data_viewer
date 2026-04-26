import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

test('app styling uses game-inspired panels, tabs, and global palette', () => {
  const appStyles = fs.readFileSync('src/App.css', 'utf8')
  const globalStyles = fs.readFileSync('src/index.css', 'utf8')

  assert.match(globalStyles, /--game-navy:/)
  assert.match(globalStyles, /--game-panel:/)
  assert.match(globalStyles, /--game-outline:/)
  assert.match(globalStyles, /--game-danger:/)
  assert.match(globalStyles, /background:\s*linear-gradient/)
  assert.match(appStyles, /background:\s*var\(--game-navy\)/)
  assert.match(appStyles, /border-bottom:\s*4px solid var\(--game-outline\)/)
  assert.match(appStyles, /\.app-tab-header \.MuiTab-root\s*{/)
  assert.match(appStyles, /\.app-tab-header \.Mui-selected\s*{/)
  assert.match(globalStyles, /\.MuiPaper-root\s*{/)
  assert.match(globalStyles, /\.MuiTableCell-head\s*{/)
  assert.match(globalStyles, /\.rarityChip\s*{/)
})

test('abilities and help tabs render inside readable game panels', () => {
  const appSource = fs.readFileSync('src/App.tsx', 'utf8')
  const globalStyles = fs.readFileSync('src/index.css', 'utf8')

  assert.match(
    appSource,
    /<TableContainer component=\{Paper\}>\s*<AbilityTable/
  )
  assert.match(appSource, /<Paper className="help-panel">[\s\S]*<HelpPanel/)
  assert.match(globalStyles, /\.help-panel\s*{/)
  assert.match(
    globalStyles,
    /\.MuiTableBody-root \.MuiTableRow-root:nth-of-type\(even\) \.MuiTableCell-body\s*{/
  )
})

test('footer links use game button styling for the dark background', () => {
  const appSource = fs.readFileSync('src/App.tsx', 'utf8')
  const appStyles = fs.readFileSync('src/App.css', 'utf8')

  assert.match(
    appSource,
    /<Box component="footer" className="app-footer-links">/
  )
  assert.match(appStyles, /\.app-footer-links\s*{/)
  assert.match(appStyles, /\.app-footer-links a\s*{/)
  assert.match(appStyles, /background:\s*var\(--game-panel\)/)
  assert.match(appStyles, /border:\s*3px solid var\(--game-outline\)/)
  assert.match(appStyles, /\.app-footer-links a:hover\s*{/)
})

test('wide data tables opt into sticky scroll headers only where requested', () => {
  const appSource = fs.readFileSync('src/App.tsx', 'utf8')
  const appStyles = fs.readFileSync('src/App.css', 'utf8')
  const armorSource = fs.readFileSync('src/ArmorTable.tsx', 'utf8')
  const levelCostSource = fs.readFileSync('src/LevelCostTable.tsx', 'utf8')

  function wrapperFor(componentName) {
    const componentIndex = appSource.indexOf(`<${componentName}`)
    assert.notEqual(componentIndex, -1, `${componentName} should render in App`)

    const wrapperStart = appSource.lastIndexOf('<TableContainer', componentIndex)
    assert.notEqual(
      wrapperStart,
      -1,
      `${componentName} should be wrapped in a TableContainer`
    )

    return appSource.slice(wrapperStart, appSource.indexOf('>', wrapperStart))
  }

  for (const componentName of [
    'WeaponTable',
    'ArmorTable',
    'MapTable',
    'EnemyTable',
    'FoodTable',
  ]) {
    assert.match(wrapperFor(componentName), /className="sticky-data-table"/)
  }

  assert.doesNotMatch(wrapperFor('ArmorTable'), /component=\{Card\}/)
  assert.doesNotMatch(armorSource, /<TableContainer/)
  assert.doesNotMatch(
    wrapperFor('QuestsTable'),
    /className="sticky-data-table"/
  )
  assert.doesNotMatch(
    wrapperFor('AbilityTable'),
    /className="sticky-data-table"/
  )

  assert.match(armorSource, /<Table stickyHeader>/)
  assert.match(levelCostSource, /className="sticky-data-table"/)
  assert.match(appStyles, /\.sticky-data-table\s*{/)
  assert.match(appStyles, /\.MuiTableContainer-root\.sticky-data-table\s*{/)
  assert.match(appStyles, /\.sticky-data-table \.MuiTableCell-stickyHeader\s*{/)
})

test('enemy level numeric control uses the outlined text field styling', () => {
  const enemySource = fs.readFileSync('src/EnemyTable.tsx', 'utf8')
  const globalStyles = fs.readFileSync('src/index.css', 'utf8')

  assert.doesNotMatch(enemySource, /\n\s*Input,\n/)
  assert.doesNotMatch(enemySource, /<Input\b/)
  assert.match(enemySource, /<TextField[\s\S]*label="Level"/)
  assert.match(enemySource, /className="enemy-level-input"/)
  assert.match(globalStyles, /\.enemy-level-input\s*{/)
})
