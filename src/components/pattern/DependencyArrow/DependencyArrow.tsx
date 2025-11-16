import { memo } from 'react'
import { motion } from 'framer-motion'
import './DependencyArrow.css'
import { COLORS, type Position } from '../../../constants/colors'
import { useArchitecture } from '../../../contexts/ArchitectureContext'

export type DependencyType = 'sync' | 'async' | 'cache'
export type ServiceType = 'client' | 'service' | 'cache' | 'queue'

export interface DependencyArrowProps {
  from: Position
  to: Position
  type: DependencyType
  label?: string
  bidirectional?: boolean
  fromServiceId?: string
  toServiceId?: string
  fromServiceType?: ServiceType
  toServiceType?: ServiceType
}

/**
 * Service box dimensions in percentage units (based on viewport)
 * These are approximate half-widths and half-heights for edge calculation
 */
const SERVICE_BOX_DIMENSIONS = {
  client: { halfWidth: 6.5, halfHeight: 3.5 },
  service: { halfWidth: 8.7, halfHeight: 4.0 },
  cache: { halfWidth: 7.3, halfHeight: 3.7 },
  queue: { halfWidth: 7.3, halfHeight: 3.7 },
  default: { halfWidth: 7.5, halfHeight: 3.8 }
}

function DependencyArrow({
  from,
  to,
  type,
  label,
  bidirectional = false,
  fromServiceId,
  toServiceId,
  fromServiceType = 'service',
  toServiceType = 'service'
}: DependencyArrowProps) {
  // Try to use architecture context if available (for hover highlights)
  let architecture: ReturnType<typeof useArchitecture> | null = null
  try {
    architecture = useArchitecture()
  } catch {
    // Context not available, that's okay
  }

  /**
   * Calculate edge connection points based on service box positions and sizes
   * This makes arrows start/end at box edges instead of centers
   */
  const calculateEdgePoints = (): { start: Position; end: Position } => {
    const fromDims = SERVICE_BOX_DIMENSIONS[fromServiceType] || SERVICE_BOX_DIMENSIONS.default
    const toDims = SERVICE_BOX_DIMENSIONS[toServiceType] || SERVICE_BOX_DIMENSIONS.default

    // Calculate direction vector
    const dx = to.x - from.x
    const dy = to.y - from.y

    // Determine primary direction (horizontal vs vertical)
    const isHorizontal = Math.abs(dx) > Math.abs(dy)

    let startX = from.x
    let startY = from.y
    let endX = to.x
    let endY = to.y

    if (isHorizontal) {
      // Horizontal flow - use left/right edges
      if (dx > 0) {
        // Target is to the right - use right edge of source, left edge of target
        startX = from.x + fromDims.halfWidth
        endX = to.x - toDims.halfWidth
      } else {
        // Target is to the left - use left edge of source, right edge of target
        startX = from.x - fromDims.halfWidth
        endX = to.x + toDims.halfWidth
      }
    } else {
      // Vertical flow - use top/bottom edges
      if (dy > 0) {
        // Target is below - use bottom edge of source, top edge of target
        startY = from.y + fromDims.halfHeight
        endY = to.y - toDims.halfHeight
      } else {
        // Target is above - use top edge of source, bottom edge of target
        startY = from.y - fromDims.halfHeight
        endY = to.y + toDims.halfHeight
      }
    }

    return {
      start: { x: startX, y: startY },
      end: { x: endX, y: endY }
    }
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
    // Use edge points instead of center points
    const edgePoints = calculateEdgePoints()
    const startX = edgePoints.start.x
    const startY = edgePoints.start.y
    const endX = edgePoints.end.x
    const endY = edgePoints.end.y

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
    // Use edge points for proper arrow head positioning
    const edgePoints = calculateEdgePoints()
    const startX = edgePoints.start.x
    const startY = edgePoints.start.y
    const endX = edgePoints.end.x
    const endY = edgePoints.end.y

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
    // Use edge points for more accurate label positioning
    const edgePoints = calculateEdgePoints()
    const midX = (edgePoints.start.x + edgePoints.end.x) / 2
    const midY = (edgePoints.start.y + edgePoints.end.y) / 2

    return { x: midX, y: midY }
  }

  /**
   * Calculate dynamic label background dimensions based on text length
   * Font size is 2.5 units, character width ≈ 1.5 units for bold text
   */
  const calculateLabelDimensions = (text: string): { width: number; height: number } => {
    const fontSize = 2.5
    const charWidth = 1.5 // Approximate width per character at fontSize 2.5
    const padding = 1.0 // Padding on each side

    const textWidth = text.length * charWidth
    const width = textWidth + (padding * 2)
    const height = fontSize + 0.5 // Slight vertical padding

    return { width, height }
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
  const labelDims = label ? calculateLabelDimensions(label) : { width: 0, height: 0 }
  const color = getColor()

  // Create unique IDs for filters and markers to avoid conflicts
  const uniqueId = `${type}-${fromServiceId}-${toServiceId}`

  return (
    <>
      {/* Arrow paths layer (same level as service boxes for visibility) */}
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
          zIndex: 9,
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

        {/* White outline for contrast against semi-transparent boxes */}
        <motion.path
          d={path}
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth={strokeWidth + 0.4}
          strokeDasharray={getStrokeDashArray()}
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />

        {/* Background glow path for enhanced visibility */}
        <motion.path
          d={path}
          stroke={color}
          strokeWidth={strokeWidth + 0.25}
          strokeDasharray={getStrokeDashArray()}
          fill="none"
          opacity={opacity * 0.4}
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

          {/* Label background for better readability - dynamically sized */}
          <motion.rect
            x={labelPos.x - labelDims.width / 2}
            y={labelPos.y - labelDims.height / 2}
            width={labelDims.width}
            height={labelDims.height}
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
