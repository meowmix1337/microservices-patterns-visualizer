import { memo } from 'react'
import './GridOverlay.css'
import { GRID_CONFIG } from '../../constants/colors'

/**
 * GridOverlay - Development-only component to visualize the grid system
 * Only renders when NODE_ENV is 'development'
 */
function GridOverlay() {
  // Only show in development mode
  const isDevelopment = import.meta.env.DEV

  if (!isDevelopment) {
    return null
  }

  const { columns, rows, marginX, marginY } = GRID_CONFIG

  // Calculate grid dimensions
  const gridWidth = 100 - 2 * marginX
  const gridHeight = 100 - 2 * marginY
  const cellWidth = gridWidth / columns
  const cellHeight = gridHeight / rows

  // Generate vertical grid lines
  const verticalLines = Array.from({ length: columns + 1 }, (_, i) => {
    const x = marginX + i * cellWidth
    return (
      <line
        key={`v-${i}`}
        x1={`${x}%`}
        y1={`${marginY}%`}
        x2={`${x}%`}
        y2={`${100 - marginY}%`}
        className="grid-line"
      />
    )
  })

  // Generate horizontal grid lines
  const horizontalLines = Array.from({ length: rows + 1 }, (_, i) => {
    const y = marginY + i * cellHeight
    return (
      <line
        key={`h-${i}`}
        x1={`${marginX}%`}
        y1={`${y}%`}
        x2={`${100 - marginX}%`}
        y2={`${y}%`}
        className="grid-line"
      />
    )
  })

  // Generate cell labels (col, row)
  const cellLabels = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const x = marginX + (col + 0.5) * cellWidth
      const y = marginY + (row + 0.5) * cellHeight
      cellLabels.push(
        <text
          key={`label-${col}-${row}`}
          x={`${x}%`}
          y={`${y}%`}
          className="grid-label"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {col},{row}
        </text>
      )
    }
  }

  return (
    <svg className="grid-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <pattern id="grid-pattern" width={cellWidth} height={cellHeight} patternUnits="userSpaceOnUse">
          <rect width={cellWidth} height={cellHeight} fill="none" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="0.5" />
        </pattern>
      </defs>

      {/* Grid lines */}
      <g className="grid-lines">
        {verticalLines}
        {horizontalLines}
      </g>

      {/* Cell labels */}
      <g className="grid-labels">
        {cellLabels}
      </g>

      {/* Grid info overlay */}
      <text x="2%" y="3%" className="grid-info" fontSize="3" fill="rgba(59, 130, 246, 0.8)">
        Grid: {columns}×{rows} | Margins: {marginX}%/{marginY}%
      </text>
    </svg>
  )
}

export default memo(GridOverlay)
