import { describe, it, expect } from 'vitest'
import {
  getServiceBoundingBox,
  detectOverlaps,
  validateNoOverlaps,
  type ServiceConfig
} from '../positionValidation'

describe('positionValidation', () => {
  describe('getServiceBoundingBox', () => {
    it('should calculate bounding box for client service', () => {
      const service: ServiceConfig = {
        name: 'Test Client',
        type: 'client',
        position: { x: 50, y: 50 }
      }

      const box = getServiceBoundingBox(service)

      expect(box.centerX).toBe(50)
      expect(box.centerY).toBe(50)
      expect(box.left).toBeLessThan(box.centerX)
      expect(box.right).toBeGreaterThan(box.centerX)
      expect(box.top).toBeLessThan(box.centerY)
      expect(box.bottom).toBeGreaterThan(box.centerY)
    })

    it('should have larger bounding box for service type than client type', () => {
      const client: ServiceConfig = {
        name: 'Client',
        type: 'client',
        position: { x: 50, y: 50 }
      }

      const service: ServiceConfig = {
        name: 'Service',
        type: 'service',
        position: { x: 50, y: 50 }
      }

      const clientBox = getServiceBoundingBox(client)
      const serviceBox = getServiceBoundingBox(service)

      const clientWidth = clientBox.right - clientBox.left
      const serviceWidth = serviceBox.right - serviceBox.left

      expect(serviceWidth).toBeGreaterThan(clientWidth)
    })
  })

  describe('detectOverlaps', () => {
    it('should detect no overlaps when services are far apart', () => {
      const services: ServiceConfig[] = [
        { name: 'Client', type: 'client', position: { x: 15, y: 30 } },
        { name: 'Service', type: 'service', position: { x: 75, y: 30 } }
      ]

      const overlaps = detectOverlaps(services)

      expect(overlaps).toHaveLength(0)
    })

    it('should detect overlaps when services are too close', () => {
      const services: ServiceConfig[] = [
        { name: 'Service 1', type: 'service', position: { x: 50, y: 50 } },
        { name: 'Service 2', type: 'service', position: { x: 52, y: 50 } }
      ]

      const overlaps = detectOverlaps(services)

      expect(overlaps.length).toBeGreaterThan(0)
      expect(overlaps[0].service1).toBe('Service 1')
      expect(overlaps[0].service2).toBe('Service 2')
      expect(overlaps[0].overlapArea).toBeGreaterThan(0)
    })

    it('should handle multiple services without overlaps', () => {
      const services: ServiceConfig[] = [
        { name: 'Client', type: 'client', position: { x: 10, y: 50 } },
        { name: 'Notes Service', type: 'service', position: { x: 25, y: 50 } },
        { name: 'Redis', type: 'cache', position: { x: 50, y: 35 } },
        { name: 'Tags Service', type: 'service', position: { x: 75, y: 50 } },
        { name: 'Kafka', type: 'queue', position: { x: 50, y: 65 } }
      ]

      const overlaps = detectOverlaps(services)

      expect(overlaps).toHaveLength(0)
    })
  })

  describe('validateNoOverlaps', () => {
    it('should not throw when no overlaps exist', () => {
      const services: ServiceConfig[] = [
        { name: 'Client', type: 'client', position: { x: 15, y: 30 } },
        { name: 'Service', type: 'service', position: { x: 75, y: 30 } }
      ]

      expect(() => validateNoOverlaps(services)).not.toThrow()
    })

    it('should throw when overlaps exist', () => {
      const services: ServiceConfig[] = [
        { name: 'Service 1', type: 'service', position: { x: 50, y: 50 } },
        { name: 'Service 2', type: 'service', position: { x: 51, y: 50 } }
      ]

      expect(() => validateNoOverlaps(services)).toThrow(/Service overlaps detected/)
    })
  })

  describe('RequestResponse pattern validation', () => {
    it('should have no overlaps in RequestResponse pattern', () => {
      const services: ServiceConfig[] = [
        { name: 'Client', type: 'client', position: { x: 15, y: 30 } },
        { name: 'Notes Service', type: 'service', position: { x: 45, y: 30 } },
        { name: 'Tags Service', type: 'service', position: { x: 75, y: 50 } },
        { name: 'User Service', type: 'service', position: { x: 75, y: 10 } }
      ]

      const overlaps = detectOverlaps(services)

      expect(overlaps).toHaveLength(0)
    })
  })

  describe('AsyncMicroservices pattern validation', () => {
    it('should have no overlaps in AsyncMicroservices pattern', () => {
      const services: ServiceConfig[] = [
        { name: 'Client', type: 'client', position: { x: 10, y: 50 } },
        { name: 'Notes Service', type: 'service', position: { x: 25, y: 50 } },
        { name: 'Redis Cache', type: 'cache', position: { x: 50, y: 35 } },
        { name: 'Tags Service', type: 'service', position: { x: 75, y: 50 } },
        { name: 'Kafka', type: 'queue', position: { x: 50, y: 65 } }
      ]

      const overlaps = detectOverlaps(services)

      expect(overlaps).toHaveLength(0)
    })
  })
})
