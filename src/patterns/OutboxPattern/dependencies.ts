import type { DependencyType } from '../../components/pattern/SimpleArrow'

export interface Dependency {
  from: string
  to: string
  type: DependencyType
  label?: string
}

export const OUTBOX_DEPENDENCIES: Dependency[] = [
  // Client to Order Service (HTTP)
  {
    from: 'client',
    to: 'orderService',
    type: 'sync',
    label: 'Create Order'
  },
  // Order Service to Database (Save)
  {
    from: 'orderService',
    to: 'database',
    type: 'sync',
    label: 'Save + Outbox'
  },
  // Outbox Publisher to Database (Poll)
  {
    from: 'outboxPublisher',
    to: 'database',
    type: 'sync',
    label: 'Poll'
  },
  // Outbox Publisher to Kafka (Publish)
  {
    from: 'outboxPublisher',
    to: 'kafka',
    type: 'async',
    label: 'Publish'
  },
  // Kafka to Inventory (Consume)
  {
    from: 'kafka',
    to: 'inventory',
    type: 'async',
    label: 'Order Event'
  }
]
