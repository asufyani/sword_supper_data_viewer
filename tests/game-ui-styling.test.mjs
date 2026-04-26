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
