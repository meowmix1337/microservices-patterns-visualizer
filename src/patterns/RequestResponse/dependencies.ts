import type { DependencyType } from '../../components/pattern/SimpleArrow'

export interface Dependency {
  from: string
  to: string
  type: DependencyType
  label?: string
}

export const REQUEST_RESPONSE_DEPENDENCIES: Dependency[] = [
  // Client to Notes Service (HTTP)
  {
    from: 'client',
    to: 'notesService',
    type: 'sync',
    label: 'HTTP'
  },
  // Notes Service to Tags Service (HTTP)
  {
    from: 'notesService',
    to: 'tagsService',
    type: 'sync',
    label: 'HTTP'
  },
  // Notes Service to User Service (HTTP)
  {
    from: 'notesService',
    to: 'userService',
    type: 'sync',
    label: 'HTTP'
  }
]
