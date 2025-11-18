import { memo } from 'react'
import './SimpleArrow.css'
import type { Position } from '../../../constants/colors'

export type DependencyType = 'sync' | 'async' | 'cache'

export interface SimpleArrowProps {
  from: Position
  to: Position
  color?: string
  label?: string
  dashed?: boolean
}

function SimpleArrow({
  from,
  to,
  color = '#3b82f6',
  label,
  dashed = false
}: SimpleArrowProps) {
  // Calculate simple straight line path
  const path = `M ${from.x} ${from.y} L ${to.x} ${to.y}`

  // Calculate label position (midpoint)
  const labelX = (from.x + to.x) / 2
  const labelY = (from.y + to.y) / 2

  // Unique ID for arrowhead marker
  const markerId = `arrow-${from.x}-${from.y}-${to.x}-${to.y}`

  return (
    <svg
      className="simple-arrow"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        <marker
          id={markerId}
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="5"
          orient="auto"
        >
          <path d="M0,0 L0,10 L10,5 z" fill={color} />
        </marker>
      </defs>

      <path
        d={path}
        stroke={color}
        strokeWidth="0.4"
        strokeDasharray={dashed ? '2 1' : undefined}
        fill="none"
        markerEnd={`url(#${markerId})`}
        opacity="0.8"
      />

      {label && (
        <text
          x={labelX}
          y={labelY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={color}
          fontSize="2.5"
          fontWeight="600"
          className="arrow-label"
        >
          {label}
        </text>
      )}
    </svg>
  )
}

export default memo(SimpleArrow)
