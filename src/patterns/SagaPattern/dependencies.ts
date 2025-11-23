import type { ServiceDependency } from '../../contexts/ArchitectureContext'

/**
 * Saga Pattern Service Dependencies
 * Defines the dependency relationships between services for hover highlighting
 */
export const SAGA_DEPENDENCIES: ServiceDependency[] = [
  {
    serviceId: 'orchestrator',
    dependsOn: ['orderService', 'paymentService', 'inventoryService', 'shippingService'],
    description: 'Orchestrates the saga workflow and manages compensating transactions'
  },
  {
    serviceId: 'orderService',
    dependsOn: [],
    description: 'Creates and manages order lifecycle'
  },
  {
    serviceId: 'paymentService',
    dependsOn: [],
    description: 'Processes payments and handles refunds'
  },
  {
    serviceId: 'inventoryService',
    dependsOn: [],
    description: 'Reserves and releases inventory'
  },
  {
    serviceId: 'shippingService',
    dependsOn: [],
    description: 'Arranges shipping and handles cancellations'
  }
]
