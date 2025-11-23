import { type DependencyDefinition } from '../../contexts/ArchitectureContext'

export const CIRCUIT_BREAKER_DEPENDENCIES: DependencyDefinition[] = [
  {
    from: 'client',
    to: 'apiGateway',
  },
  {
    from: 'apiGateway',
    to: 'service',
  },
]
