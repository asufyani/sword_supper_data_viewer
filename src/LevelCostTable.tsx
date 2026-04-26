import { Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material'
import { useEffect, useMemo, useRef, useState } from 'react'
import { getLevelCostSoFar, getLevelUpgradeCost } from './utils/levelCosts'

const ROW_HEIGHT = 44
const OVERSCAN = 10
const TOTAL_ROWS = 1000
const VIEWPORT_HEIGHT = 700

type LevelRow = {
  level: number
  costSoFar: number
  costToNextLevel: number
}

function formatNumber(value: number) {
  return new Intl.NumberFormat().format(value)
}

export default function LevelCostTable() {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const [jumpLevel, setJumpLevel] = useState('1')
  const [scrollTop, setScrollTop] = useState(0)

  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN)
  const visibleCount = Math.ceil(VIEWPORT_HEIGHT / ROW_HEIGHT) + OVERSCAN * 2
  const endIndex = Math.min(TOTAL_ROWS, startIndex + visibleCount)

  const visibleRows = useMemo<LevelRow[]>(() => {
    const rows: LevelRow[] = []

    for (let index = startIndex; index < endIndex; index += 1) {
      const level = index + 1
      rows.push({
        level,
        costSoFar: getLevelCostSoFar(level),
        costToNextLevel: getLevelUpgradeCost(level),
      })
    }

    return rows
  }, [endIndex, startIndex])

  useEffect(() => {
    const targetLevel = Number.parseInt(jumpLevel, 10)

    if (!Number.isFinite(targetLevel) || targetLevel < 1 || !scrollRef.current) {
      return
    }

    const boundedLevel = Math.min(TOTAL_ROWS, targetLevel)
    scrollRef.current.scrollTop = (boundedLevel - 1) * ROW_HEIGHT
  }, [jumpLevel])

  return (
    <Paper sx={{ overflow: 'hidden' }}>
      <Stack
        spacing={2}
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 2,
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
        }}
      >
        <Typography variant="h6">Level Costs</Typography>
        <TextField
          label="Jump to level"
          type="number"
          value={jumpLevel}
          onChange={(event) => {
            setJumpLevel(event.target.value)
          }}
          inputProps={{ min: 1, max: TOTAL_ROWS }}
          sx={{ maxWidth: 240 }}
        />
      </Stack>

      <div
        className="sticky-data-table"
        ref={scrollRef}
        onScroll={(event) => {
          setScrollTop(event.currentTarget.scrollTop)
        }}
        style={{
          overflow: 'auto',
          maxHeight: `${VIEWPORT_HEIGHT}px`,
        }}
      >
        <Table stickyHeader sx={{ tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow>
              <TableCell>Current Level</TableCell>
              <TableCell align="right">Cost So Far</TableCell>
              <TableCell align="right">Cost To Next Level</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow sx={{ height: startIndex * ROW_HEIGHT }}>
              <TableCell colSpan={3} sx={{ p: 0, border: 0 }} />
            </TableRow>
            {visibleRows.map((row) => (
              <TableRow key={row.level} sx={{ height: ROW_HEIGHT }}>
                <TableCell>{formatNumber(row.level)}</TableCell>
                <TableCell align="right">{formatNumber(row.costSoFar)}</TableCell>
                <TableCell align="right">
                  {formatNumber(row.costToNextLevel)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow sx={{ height: (TOTAL_ROWS - endIndex) * ROW_HEIGHT }}>
              <TableCell colSpan={3} sx={{ p: 0, border: 0 }} />
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </Paper>
  )
}
