import type { DependencyType } from '../../components/pattern/SimpleArrow'

export interface Dependency {
  from: string
  to: string
  type: DependencyType
  label?: string
}

export const PUBSUB_DEPENDENCIES: Dependency[] = [
  // Publishers to Broker
  {
    from: 'orderService',
    to: 'broker',
    type: 'async',
    label: 'Publish Orders'
  },
  {
    from: 'inventoryService',
    to: 'broker',
    type: 'async',
    label: 'Publish Inventory'
  },
  // Broker to Subscribers
  {
    from: 'broker',
    to: 'emailService',
    type: 'async',
    label: 'Order Events'
  },
  {
    from: 'broker',
    to: 'analyticsService',
    type: 'async',
    label: 'All Events'
  },
  {
    from: 'broker',
    to: 'notificationService',
    type: 'async',
    label: 'Order Events'
  }
]
