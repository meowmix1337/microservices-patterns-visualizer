/**
 * Pattern Registry
 * Central registry for all communication patterns
 */

export const PATTERN_CATEGORIES = {
  ASYNC: 'async',
  SYNC: 'sync',
  HYBRID: 'hybrid',
  RESILIENCE: 'resilience',
}

export const patterns = [
  {
    id: 'async-microservices',
    name: 'Async Microservices',
    category: PATTERN_CATEGORIES.ASYNC,
    description: 'Event-driven architecture with cache-aside pattern',
    icon: '🔄',
    color: '#3b82f6',
    difficulty: 'intermediate',
    tags: ['kafka', 'redis', 'events', 'cache'],
  },
  {
    id: 'request-response',
    name: 'Request-Response',
    category: PATTERN_CATEGORIES.SYNC,
    description: 'Synchronous HTTP patterns: cascade, parallel, and timeout handling',
    icon: '↔️',
    color: '#10b981',
    difficulty: 'beginner',
    tags: ['http', 'rest', 'sync', 'cascade', 'parallel'],
  },
  {
    id: 'saga-pattern',
    name: 'Saga Pattern',
    category: PATTERN_CATEGORIES.ASYNC,
    description: 'Distributed transaction management with compensating actions',
    icon: '🔀',
    color: '#f59e0b',
    difficulty: 'advanced',
    tags: ['saga', 'transactions', 'choreography'],
  },
  {
    id: 'cqrs',
    name: 'CQRS',
    category: PATTERN_CATEGORIES.HYBRID,
    description: 'Command Query Responsibility Segregation pattern',
    icon: '📊',
    color: '#8b5cf6',
    difficulty: 'advanced',
    tags: ['cqrs', 'read-model', 'write-model'],
  },
  {
    id: 'circuit-breaker',
    name: 'Circuit Breaker',
    category: PATTERN_CATEGORIES.RESILIENCE,
    description: 'Prevent cascading failures with circuit breaker pattern',
    icon: '🔌',
    color: '#ef4444',
    difficulty: 'intermediate',
    tags: ['resilience', 'fault-tolerance'],
  },
]

export const getPatternById = (id) => {
  return patterns.find(p => p.id === id)
}

export const getPatternsByCategory = (category) => {
  return patterns.filter(p => p.category === category)
}
