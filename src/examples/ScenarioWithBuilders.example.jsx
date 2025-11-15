/**
 * EXAMPLE: Using Step Builders for Even Cleaner Scenario Definitions
 *
 * This example shows how to use the createStepBuilder helper to create
 * scenarios with less boilerplate and more reusable patterns.
 *
 * Perfect for scenarios with common patterns like:
 * - HTTP requests
 * - Cache operations
 * - Event publishing
 * - Service responses
 */

import { useState } from 'react'
import { useLogs } from '../hooks/useLogs'
import { useStepByStep } from '../hooks/useStepByStep'
import { createStepBuilder, createSpeedDelay, createScenario } from '../utils/scenarioHelpers'
import { POSITIONS } from '../constants/colors'

export default function ScenarioWithBuilders({ animationSpeed }) {
  const [messages, setMessages] = useState([])
  const { addLog, clearLogs } = useLogs()
  const speedDelay = createSpeedDelay(animationSpeed)

  const stepControl = useStepByStep({
    animationSpeed,
    onScenarioStart: (name) => {
      clearLogs()
      setMessages([])
      addLog(`Starting: ${name}`, 'info')
    }
  })

  // Create a step builder with our context
  const builder = createStepBuilder({
    addLog,
    setMessages,
    delay: speedDelay,
    positions: POSITIONS
  })

  /**
   * EXAMPLE 1: Cache Hit using builders
   *
   * Notice how much cleaner this is compared to manual step creation!
   * The builders handle common patterns automatically.
   */
  const cacheHitScenarioWithBuilders = createScenario({
    name: 'Cache Hit (Using Builders)',
    description: 'Demonstrates cache-aside pattern with step builders',
    steps: [
      // Step 1: Initial request
      builder.requestStep({
        from: 'client',
        to: 'notes-service',
        label: 'GET /notes',
        explanation: 'Client initiates a GET request to fetch notes from the Notes Service',
        logMessage: 'GET /notes request received'
      }),

      // Step 2: Cache check
      builder.cacheCheckStep({
        service: 'notes-service',
        cache: 'redis',
        key: 'tags:note:123',
        explanation: 'Notes Service checks Redis cache first (cache-aside pattern) - much faster than service call'
      }),

      // Step 3: Cache hit
      builder.cacheHitStep({
        cache: 'redis',
        service: 'notes-service',
        value: '["work", "urgent"]',
        explanation: 'Cache HIT! Redis returns cached tags instantly (~1ms). No Tags Service call needed, saving ~150ms'
      }),

      // Step 4: Response
      builder.responseStep({
        from: 'notes-service',
        to: 'client',
        label: '200 OK',
        explanation: 'Notes Service sends complete response with ultra-low latency (total: ~1.2ms)',
        logMessage: 'Response sent (Latency: 1.2ms)'
      }),

      // Step 5: Cleanup
      builder.cleanupStep({
        explanation: 'Scenario complete! Cache-aside pattern reduced latency from 150ms to 1.2ms - a 125x improvement'
      })
    ]
  })

  /**
   * EXAMPLE 2: Cache Miss using builders
   */
  const cacheMissScenarioWithBuilders = createScenario({
    name: 'Cache Miss (Using Builders)',
    description: 'Shows fallback to service call when cache misses',
    steps: [
      builder.requestStep({
        from: 'client',
        to: 'notes-service',
        label: 'GET /notes',
        explanation: 'Client sends GET request for notes',
        logMessage: 'GET /notes request received'
      }),

      builder.cacheCheckStep({
        service: 'notes-service',
        cache: 'redis',
        key: 'tags:note:456',
        explanation: 'Notes Service checks Redis cache for tags'
      }),

      builder.cacheMissStep({
        cache: 'redis',
        service: 'notes-service',
        explanation: 'Cache MISS! Data not in Redis. Must fetch from Tags Service (slower path)'
      }),

      builder.requestStep({
        from: 'notes-service',
        to: 'tags-service',
        label: 'GET /tags?noteId=456',
        explanation: 'Notes Service makes synchronous HTTP call to Tags Service',
        duration: 2500, // Slightly longer to show network delay
        logMessage: 'Calling Tags service (SYNC)...'
      }),

      builder.responseStep({
        from: 'tags-service',
        to: 'notes-service',
        label: '["important", "review"]',
        explanation: 'Tags Service responds with tag data (~25ms network latency)',
        logMessage: 'Tags service responded (25ms)'
      }),

      // Custom step for cache update (not in standard builder patterns)
      builder.customStep({
        explanation: 'Notes Service updates Redis cache for future requests (write-through pattern)',
        duration: 2000,
        action: async () => {
          addLog('Updating Redis cache...', 'info')

          const updateCacheMsg = {
            id: Date.now(),
            from: 'notes-service',
            to: 'redis',
            type: 'cache',
            label: 'SET tags:note:456',
            path: [POSITIONS.notesService, POSITIONS.redis]
          }

          setMessages(prev => [...prev, updateCacheMsg])
          await speedDelay(500)
        }
      }),

      builder.responseStep({
        from: 'notes-service',
        to: 'client',
        label: '200 OK',
        explanation: 'Response sent to client (latency: ~150ms - slower than cache hit, but data now cached)',
        logMessage: 'Response sent (Latency: 150ms)'
      }),

      builder.cleanupStep({
        explanation: 'Complete! Next request for this note will hit cache and be much faster'
      })
    ]
  })

  /**
   * EXAMPLE 3: Event-driven update using builders
   */
  const asyncUpdateScenarioWithBuilders = createScenario({
    name: 'Async Event Update (Using Builders)',
    description: 'Demonstrates event-driven architecture with Kafka',
    steps: [
      builder.requestStep({
        from: 'client',
        to: 'tags-service',
        label: 'POST /tags',
        explanation: 'Client creates a new tag via Tags Service',
        logMessage: 'Tag created in Tags service'
      }),

      builder.publishEventStep({
        from: 'tags-service',
        to: 'kafka',
        eventName: 'TAG_CREATED',
        explanation: 'Tags Service publishes TAG_CREATED event to Kafka (fire-and-forget, no waiting)'
      }),

      builder.responseStep({
        from: 'tags-service',
        to: 'client',
        label: '201 Created',
        explanation: 'Tags Service responds immediately without waiting - key benefit of async architecture!',
        logMessage: '✅ Response sent immediately (no waiting!)'
      }),

      builder.customStep({
        explanation: 'Notes Service consumes event from Kafka and processes it asynchronously',
        duration: 3000,
        action: async () => {
          await speedDelay(1000)
          addLog('Notes service consuming TAG_CREATED event...', 'info')

          const consumeMsg = {
            id: Date.now(),
            from: 'kafka',
            to: 'notes-service',
            type: 'event',
            label: 'TAG_CREATED event',
            path: [POSITIONS.kafka, POSITIONS.notesService]
          }

          setMessages(prev => [...prev, consumeMsg])
          await speedDelay(500)
        }
      }),

      builder.customStep({
        explanation: 'Notes Service updates Redis cache based on event (eventual consistency)',
        duration: 2000,
        action: async () => {
          addLog('Updating Redis cache from event...', 'info')

          const updateMsg = {
            id: Date.now(),
            from: 'notes-service',
            to: 'redis',
            type: 'cache',
            label: 'UPDATE tags:note:789',
            path: [POSITIONS.notesService, POSITIONS.redis]
          }

          setMessages(prev => [...prev, updateMsg])
          await speedDelay(500)
          addLog('✅ Cache synchronized!', 'success')
        }
      }),

      builder.cleanupStep({
        explanation: 'Complete! This demonstrates eventual consistency in event-driven systems'
      })
    ]
  })

  /**
   * Scenario launcher functions
   */
  const runCacheHit = () => {
    stepControl.loadScenario(
      cacheHitScenarioWithBuilders.name,
      cacheHitScenarioWithBuilders.steps,
      { autoPlay: false } // User can manually step through
    )
  }

  const runCacheMiss = () => {
    stepControl.loadScenario(
      cacheMissScenarioWithBuilders.name,
      cacheMissScenarioWithBuilders.steps,
      { autoPlay: true } // Auto-play through this scenario
    )
  }

  const runAsyncUpdate = () => {
    stepControl.loadScenario(
      asyncUpdateScenarioWithBuilders.name,
      asyncUpdateScenarioWithBuilders.steps
    )
  }

  // Component render would go here...
  // This is just an example of the scenario definition patterns
}

/**
 * KEY TAKEAWAYS:
 *
 * 1. Step Builders eliminate boilerplate
 *    - Common patterns (requests, cache ops) are one-liners
 *    - Still have customStep() for special cases
 *
 * 2. createScenario provides structure
 *    - Self-documenting with name and description
 *    - Easy to validate and debug
 *
 * 3. Separation of concerns
 *    - Scenario definitions are pure data
 *    - Hook handles all execution logic
 *    - Component just renders and coordinates
 *
 * 4. Easy to extend
 *    - Add new builder methods for new patterns
 *    - Share scenarios across different visualizations
 *    - Test scenarios in isolation
 */
