/**
 * Pattern Registry
 * Central registry for all communication patterns
 */

export const PATTERN_CATEGORIES = {
  ASYNC: 'async',
  SYNC: 'sync',
  HYBRID: 'hybrid',
  RESILIENCE: 'resilience',
} as const

export type PatternCategory = typeof PATTERN_CATEGORIES[keyof typeof PATTERN_CATEGORIES]

export type PatternDifficulty = 'beginner' | 'intermediate' | 'advanced'

export interface Pattern {
  id: string
  name: string
  category: PatternCategory
  description: string
  icon: string
  color: string
  difficulty: PatternDifficulty
  tags: string[]
  benefits: string[]
  tradeoffs: string[]
  useCases: string[]
}

export const patterns: Pattern[] = [
  {
    id: 'async-microservices',
    name: 'Async Microservices',
    category: PATTERN_CATEGORIES.ASYNC,
    description: 'Event-driven architecture with cache-aside pattern',
    icon: '🔄',
    color: '#3b82f6',
    difficulty: 'intermediate',
    tags: ['kafka', 'redis', 'events', 'cache'],
    benefits: [
      'Services remain loosely coupled and can evolve independently',
      'Improved system resilience - services don\'t wait for each other',
      'Better scalability through asynchronous processing',
      'Reduced latency for end users (fire-and-forget operations)',
    ],
    tradeoffs: [
      'Eventual consistency - data may be temporarily out of sync',
      'More complex debugging and distributed tracing requirements',
      'Need to handle message ordering and idempotency',
      'Infrastructure overhead (message brokers, monitoring)',
    ],
    useCases: [
      'High-throughput systems where immediate consistency isn\'t critical',
      'Event-driven architectures with complex workflows',
      'Systems requiring audit trails and event replay capabilities',
      'Microservices that need to decouple write and read operations',
    ],
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
    benefits: [
      'Simple to understand and implement - follows traditional programming model',
      'Immediate consistency and predictable response times',
      'Easy debugging with clear request-response flow',
      'Built-in error handling and timeout mechanisms',
    ],
    tradeoffs: [
      'Tight coupling between services reduces independence',
      'Cascading failures when downstream services are slow or unavailable',
      'Lower throughput due to blocking I/O operations',
      'Increased latency with deep service dependency chains',
    ],
    useCases: [
      'User-facing APIs requiring immediate feedback',
      'Simple CRUD operations where consistency is critical',
      'Services with shallow dependency graphs',
      'Systems where request latency is more important than throughput',
    ],
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
    benefits: [
      'Maintains data consistency across distributed services without 2PC',
      'Services remain decoupled and autonomous',
      'Better scalability than traditional distributed transactions',
      'Clear rollback strategy through compensating transactions',
    ],
    tradeoffs: [
      'Complex implementation requiring careful orchestration',
      'Eventual consistency instead of immediate consistency',
      'Need to design and implement compensating actions for every step',
      'Challenging to debug and monitor across multiple services',
    ],
    useCases: [
      'E-commerce order processing spanning multiple services',
      'Multi-step workflows requiring distributed transactions',
      'Systems that can\'t use 2-phase commit protocols',
      'Long-running business processes with multiple participants',
    ],
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
    benefits: [
      'Optimized read and write models for different performance needs',
      'Scalability through independent scaling of reads and writes',
      'Better security through command/query separation',
      'Flexibility to use different data stores for reads vs writes',
    ],
    tradeoffs: [
      'Increased system complexity with separate models to maintain',
      'Eventual consistency between command and query sides',
      'Additional infrastructure for synchronizing models',
      'Steeper learning curve for development teams',
    ],
    useCases: [
      'Systems with drastically different read/write patterns',
      'High-performance applications requiring optimized queries',
      'Domain-driven design with complex business logic',
      'Applications needing multiple read representations of data',
    ],
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
    benefits: [
      'Prevents cascading failures across distributed systems',
      'Fast failure detection with automatic recovery attempts',
      'Reduces resource exhaustion from repeated failed calls',
      'Provides graceful degradation opportunities',
    ],
    tradeoffs: [
      'Adds complexity to service communication logic',
      'Requires careful tuning of thresholds and timeouts',
      'May hide underlying issues if not properly monitored',
      'Need fallback strategies for when circuit is open',
    ],
    useCases: [
      'External API integrations that may be unreliable',
      'Microservices architectures with deep dependency chains',
      'Systems requiring high availability despite partial failures',
      'Services with rate limits or quota restrictions',
    ],
  },
  {
    id: 'event-sourcing',
    name: 'Event Sourcing',
    category: PATTERN_CATEGORIES.ASYNC,
    description: 'Store state changes as a sequence of events for complete audit trail',
    icon: '📝',
    color: '#06b6d4',
    difficulty: 'advanced',
    tags: ['events', 'event-store', 'audit', 'sourcing', 'replay'],
    benefits: [
      'Complete audit trail of all state changes over time',
      'Ability to replay events and rebuild state at any point',
      'Natural fit for event-driven architectures',
      'Supports temporal queries and time-travel debugging',
    ],
    tradeoffs: [
      'Increased storage requirements for event history',
      'More complex query patterns - need to replay events',
      'Versioning and schema evolution challenges',
      'Eventual consistency in derived read models',
    ],
    useCases: [
      'Financial systems requiring complete audit trails',
      'Systems needing to replay or reprocess historical data',
      'Applications with complex state machines',
      'Domains where understanding "how we got here" is critical',
    ],
  },
  {
    id: 'pub-sub',
    name: 'Pub/Sub Messaging',
    category: PATTERN_CATEGORIES.ASYNC,
    description: 'Publisher-subscriber pattern for decoupled message broadcasting',
    icon: '📡',
    color: '#f97316',
    difficulty: 'intermediate',
    tags: ['pub-sub', 'messaging', 'topics', 'subscribers', 'kafka'],
    benefits: [
      'Complete decoupling between publishers and subscribers',
      'Easy to add new subscribers without affecting publishers',
      'Supports fan-out scenarios for broadcasting to multiple consumers',
      'Dynamic subscription management at runtime',
    ],
    tradeoffs: [
      'No guarantee subscribers are active or processing messages',
      'Message ordering challenges with multiple subscribers',
      'Potential for duplicate message processing',
      'Infrastructure complexity with message brokers',
    ],
    useCases: [
      'Broadcasting notifications to multiple interested parties',
      'Real-time data streaming and analytics pipelines',
      'Event-driven microservices architectures',
      'Systems requiring dynamic subscription management',
    ],
  },
  {
    id: 'retry-pattern',
    name: 'Retry Pattern',
    category: PATTERN_CATEGORIES.RESILIENCE,
    description: 'Automatic retry with exponential backoff for transient failures',
    icon: '🔁',
    color: '#eab308',
    difficulty: 'intermediate',
    tags: ['retry', 'resilience', 'backoff', 'fault-tolerance'],
    benefits: [
      'Handles transient failures automatically without manual intervention',
      'Exponential backoff prevents overwhelming failing services',
      'Improves overall system reliability and user experience',
      'Configurable retry policies for different scenarios',
    ],
    tradeoffs: [
      'Can mask underlying issues if not properly monitored',
      'Increased latency during retry attempts',
      'Risk of duplicate operations if not idempotent',
      'Need to define appropriate timeout and retry limits',
    ],
    useCases: [
      'Network calls to external APIs prone to transient errors',
      'Database operations during high contention periods',
      'Distributed systems with occasional network partitions',
      'Cloud services with rate limiting or quota restrictions',
    ],
  },
  {
    id: 'outbox-pattern',
    name: 'Outbox Pattern',
    category: PATTERN_CATEGORIES.ASYNC,
    description: 'Ensure reliable message delivery with transactional outbox',
    icon: '📤',
    color: '#ec4899',
    difficulty: 'intermediate',
    tags: ['outbox', 'transactional', 'reliability', 'messaging'],
    benefits: [
      'Guarantees message delivery without distributed transactions',
      'Maintains consistency between database and message broker',
      'Prevents message loss in case of failures',
      'Simple to implement with existing database transactions',
    ],
    tradeoffs: [
      'Additional database table and polling infrastructure required',
      'Slight delay in message delivery due to polling',
      'Need to handle duplicate messages (at-least-once delivery)',
      'Increased database load from outbox table operations',
    ],
    useCases: [
      'Publishing events reliably as part of database transactions',
      'Ensuring message delivery when direct broker writes may fail',
      'Microservices needing guaranteed event publication',
      'Systems requiring exactly-once processing semantics',
    ],
  },
  {
    id: 'cache-strategies',
    name: 'Cache Strategies',
    category: PATTERN_CATEGORIES.HYBRID,
    description: 'Caching patterns: cache-aside, write-through, write-behind, and refresh-ahead',
    icon: '⚡',
    color: '#14b8a6',
    difficulty: 'intermediate',
    tags: ['cache', 'redis', 'cache-aside', 'write-through', 'write-behind'],
    benefits: [
      'Dramatically reduced latency for frequently accessed data',
      'Lower database load through request reduction',
      'Improved application scalability and throughput',
      'Multiple strategies for different consistency requirements',
    ],
    tradeoffs: [
      'Cache invalidation complexity ("hardest problem in CS")',
      'Potential stale data with cache-aside pattern',
      'Additional infrastructure and operational overhead',
      'Memory constraints limiting cache size',
    ],
    useCases: [
      'Read-heavy applications with predictable access patterns',
      'Systems requiring sub-millisecond response times',
      'Applications with expensive database queries or computations',
      'APIs serving frequently requested static or semi-static data',
    ],
  },
]

export const getPatternById = (id: string): Pattern | undefined => {
  return patterns.find(p => p.id === id)
}

export const getPatternsByCategory = (category: PatternCategory): Pattern[] => {
  return patterns.filter(p => p.category === category)
}
