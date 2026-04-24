import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

test('app uses a shared item popover provider and RarityChip no longer mounts its own Popover', () => {
  const appSource = fs.readFileSync('src/App.tsx', 'utf8')
  const chipSource = fs.readFileSync('src/RarityChip.tsx', 'utf8')
  const popoverSource = fs.readFileSync('src/ItemDetailsPopover.tsx', 'utf8')

  assert.match(appSource, /ItemDetailsPopoverProvider/)
  assert.match(chipSource, /useItemDetailsPopover/)
  assert.doesNotMatch(chipSource, /import Popover from '@mui\/material\/Popover'/)
  assert.match(popoverSource, /boxShadow:/)
  assert.match(popoverSource, /linear-gradient/)
})
