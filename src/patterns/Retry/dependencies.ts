import { type DependencyDefinition } from '../../contexts/ArchitectureContext'

export const RETRY_DEPENDENCIES: DependencyDefinition[] = [
  {
    from: 'client',
    to: 'service',
  }
]
