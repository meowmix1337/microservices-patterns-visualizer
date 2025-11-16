import type { DependencyType, ServiceType } from '../../components/pattern/DependencyArrow'

export interface DependencyDefinition {
  from: string
  to: string
  type: DependencyType
  label?: string
  fromServiceType?: ServiceType
  toServiceType?: ServiceType
}

export const REQUEST_RESPONSE_DEPENDENCIES: DependencyDefinition[] = [
  // Client to Notes Service (HTTP)
  {
    from: 'client',
    to: 'notesService',
    type: 'sync',
    label: 'HTTP',
    fromServiceType: 'client',
    toServiceType: 'service'
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
  // Notes Service to User Service (HTTP)
  {
    from: 'notesService',
    to: 'userService',
    type: 'sync',
    label: 'HTTP',
    fromServiceType: 'service',
    toServiceType: 'service'
  }
]
