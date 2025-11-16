import { memo } from 'react'
import { motion } from 'framer-motion'
import './DependencyArrow.css'
import { COLORS, type Position } from '../../../constants/colors'
import { useArchitecture } from '../../../contexts/ArchitectureContext'

export type DependencyType = 'sync' | 'async' | 'cache'

export interface DependencyArrowProps {
  from: Position
  to: Position
  type: DependencyType
  label?: string
  bidirectional?: boolean
  fromServiceId?: string
  toServiceId?: string
}

function DependencyArrow({
  from,
  to,
  type,
  label,
  bidirectional = false,
  fromServiceId,
  toServiceId
}: DependencyArrowProps) {
  // Try to use architecture context if available (for hover highlights)
  let architecture: ReturnType<typeof useArchitecture> | null = null
  try {
    architecture = useArchitecture()
  } catch {
    // Context not available, that's okay
  }

  // Get stroke width based on type
  const getStrokeWidth = (): number => {
    if (type === 'cache') {
      return 0.4 // Thicker for cache (in percentage units)
    }
    return 0.3 // Normal for sync and async
  }

  // Determine if this arrow should be highlighted
  const isHighlighted =
    architecture?.hoveredService &&
    (architecture.hoveredService === fromServiceId || architecture.hoveredService === toServiceId)
  const isDimmed = architecture?.hoveredService && !isHighlighted

  // Animation values based on hover state - increased visibility
  const baseOpacity = 0.85 // Increased from 0.6
  const opacity = isHighlighted ? 1.0 : isDimmed ? 0.15 : baseOpacity
  const strokeWidth = isHighlighted ? getStrokeWidth() + 0.15 : getStrokeWidth()
  const glowIntensity = isHighlighted ? 15 : 8

  // Calculate Bezier curve control points for smooth path
  const calculatePath = (): string => {
    const startX = from.x
    const startY = from.y
    const endX = to.x
    const endY = to.y

    // Calculate control points for smooth curve
    const dx = endX - startX
    const dy = endY - startY
    const distance = Math.sqrt(dx * dx + dy * dy)

    // Curvature factor (20% of distance for subtle curve)
    const curvature = distance * 0.2

    // Control points positioned perpendicular to direct line
    const midX = (startX + endX) / 2
    const midY = (startY + endY) / 2

    // Perpendicular offset for curve
    const offsetX = -dy / distance * curvature
    const offsetY = dx / distance * curvature

    const controlX = midX + offsetX
    const controlY = midY + offsetY

    // Use plain numbers with viewBox coordinate system (0-100)
    return `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`
  }

  // Calculate arrow head position and rotation
  const calculateArrowHead = (): { x: number; y: number; rotation: number } => {
    const startX = from.x
    const startY = from.y
    const endX = to.x
    const endY = to.y

    const dx = endX - startX
    const dy = endY - startY
    const angle = Math.atan2(dy, dx) * (180 / Math.PI)

    return {
      x: endX,
      y: endY,
      rotation: angle
    }
  }

  // Calculate label position (midpoint of curve)
  const calculateLabelPosition = (): { x: number; y: number } => {
    const midX = (from.x + to.x) / 2
    const midY = (from.y + to.y) / 2

    return { x: midX, y: midY }
  }

  // Get color based on dependency type
  const getColor = (): string => {
    switch (type) {
      case 'sync':
        return COLORS.http || '#3b82f6' // Blue for HTTP/sync
      case 'async':
        return COLORS.event || '#f97316' // Orange for events/async
      case 'cache':
        return COLORS.cache || '#22c55e' // Green for cache
      default:
        return '#94a3b8'
    }
  }

  // Get stroke style based on type
  const getStrokeDashArray = (): string | undefined => {
    if (type === 'async') {
      return '6 4' // Dashed line for async
    }
    return undefined // Solid line for sync and cache
  }

  const path = calculatePath()
  const arrowHead = calculateArrowHead()
  const labelPos = calculateLabelPosition()
  const color = getColor()

  // Create unique IDs for filters and markers to avoid conflicts
  const uniqueId = `${type}-${fromServiceId}-${toServiceId}`

  return (
    <>
      {/* Arrow paths layer (behind service boxes) */}
      <svg
        className="dependency-arrow"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 5,
          overflow: 'visible'
        }}
      >
        <defs>
          {/* Enhanced arrowhead with better visibility */}
          <marker
            id={`arrowhead-${uniqueId}`}
            markerWidth="12"
            markerHeight="12"
            refX="10"
            refY="6"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path
              d="M0,0 L0,12 L12,6 z"
              fill={color}
              opacity={opacity}
            />
          </marker>

          {/* Glow filter for better visibility */}
          <filter id={`glow-${uniqueId}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={glowIntensity / 10} result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Drop shadow for depth */}
          <filter id={`shadow-${uniqueId}`} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0.2" stdDeviation="0.3" floodColor={color} floodOpacity="0.6"/>
          </filter>
        </defs>

        {/* Background glow path for enhanced visibility */}
        <motion.path
          d={path}
          stroke={color}
          strokeWidth={strokeWidth + 0.2}
          strokeDasharray={getStrokeDashArray()}
          fill="none"
          opacity={opacity * 0.3}
          filter={`url(#glow-${uniqueId})`}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />

        {/* Main arrow path */}
        <motion.path
          d={path}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={getStrokeDashArray()}
          strokeLinecap="round"
          fill="none"
          markerEnd={`url(#arrowhead-${uniqueId})`}
          filter={`url(#shadow-${uniqueId})`}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />

        {/* Animated flow indicator for async dependencies */}
        {type === 'async' && (
          <motion.circle
            r="0.5"
            fill={color}
            filter={`url(#glow-${uniqueId})`}
            initial={{ offsetDistance: '0%', opacity: 0 }}
            animate={{
              offsetDistance: '100%',
              opacity: [0, opacity, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear'
            }}
            style={{
              offsetPath: `path('${path}')`,
              offsetRotate: '0deg'
            }}
          >
            <animateMotion
              dur="2s"
              repeatCount="indefinite"
              path={path}
            />
          </motion.circle>
        )}

        {bidirectional && (
          <motion.path
            d={path}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={getStrokeDashArray()}
            strokeLinecap="round"
            fill="none"
            markerStart={`url(#arrowhead-${uniqueId})`}
            filter={`url(#shadow-${uniqueId})`}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: opacity * 0.5 }}
            transition={{ duration: 0.3, ease: 'easeOut', delay: 0.2 }}
          />
        )}
      </svg>

      {/* Labels layer (above service boxes) */}
      {label && (
        <svg
          className="dependency-arrow-labels"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 15,
            overflow: 'visible'
          }}
        >
          <defs>
            {/* Glow for label background */}
            <filter id={`label-glow-${uniqueId}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="0.3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Label background for better readability */}
          <motion.rect
            x={labelPos.x - 4}
            y={labelPos.y - 1.5}
            width="8"
            height="3"
            rx="0.5"
            fill="rgba(15, 23, 42, 0.95)"
            stroke={color}
            strokeWidth="0.15"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: isHighlighted ? 0.95 : isDimmed ? 0.3 : 0.85,
              scale: isHighlighted ? 1.1 : 1
            }}
            transition={{ duration: 0.3 }}
          />

          {/* Label text with enhanced visibility */}
          <motion.text
            x={labelPos.x}
            y={labelPos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="dependency-label"
            fill={color}
            fontSize="2.5"
            fontWeight="700"
            filter={`url(#label-glow-${uniqueId})`}
            initial={{ opacity: 0 }}
            animate={{
              opacity: isHighlighted ? 1.0 : isDimmed ? 0.4 : 0.95,
              fontSize: isHighlighted ? "2.8" : "2.5"
            }}
            transition={{ duration: 0.3 }}
          >
            {label}
          </motion.text>
        </svg>
      )}
    </>
  )
}

export default memo(DependencyArrow)
