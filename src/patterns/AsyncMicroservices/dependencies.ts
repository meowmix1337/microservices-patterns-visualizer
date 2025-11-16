import type { DependencyType, ServiceType } from '../../components/pattern/DependencyArrow'

export interface DependencyDefinition {
  from: string
  to: string
  type: DependencyType
  label?: string
  fromServiceType?: ServiceType
  toServiceType?: ServiceType
}

export const ASYNC_MICROSERVICES_DEPENDENCIES: DependencyDefinition[] = [
  // Client to Notes Service (HTTP)
  {
    from: 'client',
    to: 'notesService',
    type: 'sync',
    label: 'HTTP',
    fromServiceType: 'client',
    toServiceType: 'service'
  },
  // Notes Service to Redis (Cache)
  {
    from: 'notesService',
    to: 'redis',
    type: 'cache',
    label: 'Cache',
    fromServiceType: 'service',
    toServiceType: 'cache'
  },
  // Notes Service to Tags Service (HTTP)
  {
    from: 'notesService',
    to: 'tagsService',
    type: 'sync',
    label: 'HTTP',
    fromServiceType: 'service',
    toServiceType: 'service'
  },
  // Tags Service to Kafka (Publish Events)
  {
    from: 'tagsService',
    to: 'kafka',
    type: 'async',
    label: 'Publish',
    fromServiceType: 'service',
    toServiceType: 'queue'
  },
  // Kafka to Notes Service (Consume Events)
  {
    from: 'kafka',
    to: 'notesService',
    type: 'async',
    label: 'Consume',
    fromServiceType: 'queue',
    toServiceType: 'service'
  }
]
