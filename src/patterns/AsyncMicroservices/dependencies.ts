import type { DependencyType } from '../../components/pattern/DependencyArrow'

export interface DependencyDefinition {
  from: string
  to: string
  type: DependencyType
  label?: string
}

export const ASYNC_MICROSERVICES_DEPENDENCIES: DependencyDefinition[] = [
  // Client to Notes Service (HTTP)
  {
    from: 'client',
    to: 'notesService',
    type: 'sync',
    label: 'HTTP'
  },
  // Notes Service to Redis (Cache)
  {
    from: 'notesService',
    to: 'redis',
    type: 'cache',
    label: 'Cache'
  },
  // Notes Service to Tags Service (HTTP)
  {
    from: 'notesService',
    to: 'tagsService',
    type: 'sync',
    label: 'HTTP'
  },
  // Tags Service to Kafka (Publish Events)
  {
    from: 'tagsService',
    to: 'kafka',
    type: 'async',
    label: 'Publish'
  },
  // Kafka to Notes Service (Consume Events)
  {
    from: 'kafka',
    to: 'notesService',
    type: 'async',
    label: 'Consume'
  }
]
