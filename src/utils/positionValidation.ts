import type { Position, ServiceType } from '../components/pattern/ServiceBox/ServiceBox'

/**
 * Configuration for service dimensions based on type
 * These values match the CSS sizing defined in ServiceBox.css
 */
const SERVICE_DIMENSIONS: Record<ServiceType, { width: number; height: number }> = {
  client: { width: 120, height: 90 },
  service: { width: 160, height: 110 },
  cache: { width: 135, height: 100 },
  queue: { width: 135, height: 100 }
}

/**
 * Represents a bounding box for a service
 */
export interface BoundingBox {
  left: number
  right: number
  top: number
  bottom: number
  centerX: number
  centerY: number
}

/**
 * Configuration for a service including its type, name, and position
 */
export interface ServiceConfig {
  name: string
  type: ServiceType
  position: Position
}

/**
 * Represents an overlap between two services
 */
export interface Overlap {
  service1: string
  service2: string
  box1: BoundingBox
  box2: BoundingBox
  overlapArea: number
}

/**
 * Calculates the bounding box for a service based on its position and type
 * @param service - Service configuration
 * @returns Bounding box with coordinates as percentages
 */
export function getServiceBoundingBox(service: ServiceConfig): BoundingBox {
  const dimensions = SERVICE_DIMENSIONS[service.type]

  // Convert pixel dimensions to approximate percentage
  // Assuming a typical container width of 1200px for percentage calculation
  const containerWidth = 1200
  const containerHeight = 800

  const widthPercent = (dimensions.width / containerWidth) * 100
  const heightPercent = (dimensions.height / containerHeight) * 100

  // Services are positioned by their center point
  const halfWidth = widthPercent / 2
  const halfHeight = heightPercent / 2

  return {
    left: service.position.x - halfWidth,
    right: service.position.x + halfWidth,
    top: service.position.y - halfHeight,
    bottom: service.position.y + halfHeight,
    centerX: service.position.x,
    centerY: service.position.y
  }
}

/**
 * Checks if two bounding boxes overlap
 * @param box1 - First bounding box
 * @param box2 - Second bounding box
 * @returns True if boxes overlap, false otherwise
 */
function boxesOverlap(box1: BoundingBox, box2: BoundingBox): boolean {
  return !(
    box1.right < box2.left ||
    box1.left > box2.right ||
    box1.bottom < box2.top ||
    box1.top > box2.bottom
  )
}

/**
 * Calculates the area of overlap between two bounding boxes
 * @param box1 - First bounding box
 * @param box2 - Second bounding box
 * @returns Area of overlap (0 if no overlap)
 */
function calculateOverlapArea(box1: BoundingBox, box2: BoundingBox): number {
  if (!boxesOverlap(box1, box2)) {
    return 0
  }

  const overlapWidth = Math.min(box1.right, box2.right) - Math.max(box1.left, box2.left)
  const overlapHeight = Math.min(box1.bottom, box2.bottom) - Math.max(box1.top, box2.top)

  return overlapWidth * overlapHeight
}

/**
 * Detects overlaps between multiple services
 * @param services - Array of service configurations
 * @returns Array of overlaps found
 */
export function detectOverlaps(services: ServiceConfig[]): Overlap[] {
  const overlaps: Overlap[] = []

  // Check each pair of services
  for (let i = 0; i < services.length; i++) {
    for (let j = i + 1; j < services.length; j++) {
      const box1 = getServiceBoundingBox(services[i])
      const box2 = getServiceBoundingBox(services[j])

      if (boxesOverlap(box1, box2)) {
        const overlapArea = calculateOverlapArea(box1, box2)
        overlaps.push({
          service1: services[i].name,
          service2: services[j].name,
          box1,
          box2,
          overlapArea
        })
      }
    }
  }

  return overlaps
}

/**
 * Validates that a pattern has no overlapping services
 * @param services - Array of service configurations
 * @throws Error if overlaps are detected
 */
export function validateNoOverlaps(services: ServiceConfig[]): void {
  const overlaps = detectOverlaps(services)

  if (overlaps.length > 0) {
    const overlapMessages = overlaps.map(
      overlap => `  - "${overlap.service1}" and "${overlap.service2}" (overlap area: ${overlap.overlapArea.toFixed(2)}%)`
    )

    throw new Error(
      `Service overlaps detected:\n${overlapMessages.join('\n')}\n\nPlease adjust service positions to prevent overlaps.`
    )
  }
}

/**
 * Gets the minimum safe distance between two service types
 * @param type1 - First service type
 * @param type2 - Second service type
 * @returns Minimum safe distance in percentage points
 */
export function getMinimumSafeDistance(type1: ServiceType, type2: ServiceType): number {
  const box1 = SERVICE_DIMENSIONS[type1]
  const box2 = SERVICE_DIMENSIONS[type2]

  // Calculate required distance (half-widths + padding)
  const containerWidth = 1200
  const padding = 20 // pixels

  const distance1 = (box1.width / 2 + padding) / containerWidth * 100
  const distance2 = (box2.width / 2 + padding) / containerWidth * 100

  return distance1 + distance2
}
