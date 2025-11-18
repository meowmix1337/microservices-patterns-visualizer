import { memo, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import * as Tooltip from '@radix-ui/react-tooltip'
import './ServiceBox.css'
import { COLORS, type Position } from '../../../constants/colors'
import { useArchitecture } from '../../../contexts/ArchitectureContext'

export type ServiceType = 'client' | 'service' | 'cache' | 'queue'
export type ServiceStatus = 'healthy' | 'down'

export interface TooltipMetadata {
  label: string
  value: string
}

export interface ServiceBoxTooltip {
  description: string
  metadata?: TooltipMetadata[]
}

export interface ServiceBoxProps {
  name: string
  type: ServiceType
  position: Position
  icon: string
  status?: ServiceStatus
  /**
   * @deprecated Use `tooltip` prop instead for better UX
   */
  details?: string
  tooltip?: ServiceBoxTooltip
  /**
   * Unique identifier for the service (used for hover highlights)
   */
  serviceId?: string
}

function ServiceBox({
  name,
  type,
  position,
  icon,
  status = 'healthy',
  details,
  tooltip,
  serviceId
}: ServiceBoxProps) {
  // Try to use architecture context if available (for hover highlights)
  let architecture: ReturnType<typeof useArchitecture> | null = null
  try {
    architecture = useArchitecture()
  } catch {
    // Context not available, that's okay
  }

  const getColor = (): string => {
    if (status === 'down') return COLORS.error
    return COLORS[type] || COLORS.default
  }

  // Handle hover for interactive highlights
  const handleMouseEnter = useCallback(() => {
    if (architecture && serviceId) {
      architecture.setHoveredService(serviceId)
    }
  }, [architecture, serviceId])

  const handleMouseLeave = useCallback(() => {
    if (architecture) {
      architecture.setHoveredService(null)
    }
  }, [architecture])

  // Determine if this service should be highlighted or dimmed
  const hoveredService = architecture?.hoveredService
  const isHovered = hoveredService === serviceId

  // Check bidirectional connections:
  // 1. Does the hovered service depend on this service? (this service is in hovered's dependencies)
  // 2. Does this service depend on the hovered service? (hovered is in this service's dependencies)
  const isConnected = !!(
    hoveredService &&
    serviceId &&
    architecture?.dependencies && (
      architecture.dependencies.get(hoveredService)?.includes(serviceId) ||
      architecture.dependencies.get(serviceId)?.includes(hoveredService)
    )
  )

  const isHighlighted = isHovered || isConnected
  const isDimmed = hoveredService && !isHighlighted

  // Build CSS classes for visual states
  const cssClasses = [
    'service-box',
    isHovered && 'hovered',
    isHighlighted && !isHovered && 'highlighted',
    isDimmed && 'dimmed'
  ].filter(Boolean).join(' ')

  const serviceBoxContent = (
    <motion.div
      className={cssClasses}
      data-type={type}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        borderColor: getColor(),
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="service-icon">{icon}</div>
      <div className="service-name">{name}</div>
      {details && <div className="service-details">{details}</div>}
      {status !== 'healthy' && (
        <motion.div
          className="status-badge"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          {status === 'down' ? '🔴 DOWN' : '⚠️'}
        </motion.div>
      )}
    </motion.div>
  )

  // If tooltip is provided, wrap with Radix UI Tooltip
  if (tooltip) {
    return (
      <Tooltip.Provider delayDuration={200}>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            {serviceBoxContent}
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              className="service-box-tooltip"
              sideOffset={8}
              side="top"
            >
              <div className="tooltip-description">{tooltip.description}</div>
              {tooltip.metadata && tooltip.metadata.length > 0 && (
                <div className="tooltip-metadata">
                  {tooltip.metadata.map((item, index) => (
                    <div key={index} className="tooltip-metadata-item">
                      <span className="tooltip-metadata-label">{item.label}:</span>
                      <span className="tooltip-metadata-value">{item.value}</span>
                    </div>
                  ))}
                </div>
              )}
              <Tooltip.Arrow className="tooltip-arrow" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
    )
  }

  return serviceBoxContent
}

export default memo(ServiceBox)
