/**
 * EXAMPLE: Refactored AsyncMicroservicesPattern using useStepByStep hook
 *
 * This file demonstrates how to convert the existing AsyncMicroservicesPattern
 * component to use the new reusable step-by-step execution system.
 *
 * Key improvements:
 * 1. All step execution logic moved to useStepByStep hook
 * 2. Scenarios defined using helper functions for clarity
 * 3. Cleaner component code focused on rendering
 * 4. Easy to add new scenarios with consistent patterns
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ServiceBox from '../components/pattern/ServiceBox'
import MessageFlow from '../components/pattern/MessageFlow'
import ControlPanel from '../components/pattern/ControlPanel'
import InfoTabs from '../components/viewers/InfoTabs'
import StepByStepControls from '../components/pattern/StepByStepControls'
import { useLogs } from '../hooks/useLogs'
import { useStepByStep } from '../hooks/useStepByStep'
import { createSpeedDelay } from '../utils/scenarioHelpers'
import { POSITIONS } from '../constants/colors'

export default function AsyncMicroservicesRefactored({ animationSpeed }) {
  // State management
  const [messages, setMessages] = useState([])
  const [cacheData, setCacheData] = useState({})
  const [queueMessages, setQueueMessages] = useState([])
  const { logs, addLog, clearLogs } = useLogs()
  const [kafkaLag, setKafkaLag] = useState(0)
  const [redisStatus, setRedisStatus] = useState('healthy')
  const [tagsServiceStatus, setTagsServiceStatus] = useState('healthy')
  const [runCounter, setRunCounter] = useState(0)

  // Create speed-aware delay function
  const speedDelay = createSpeedDelay(animationSpeed)

  // Initialize step-by-step control
  const stepControl = useStepByStep({
    animationSpeed,
    onScenarioStart: (name) => {
      const newRunNumber = runCounter + 1
      setRunCounter(newRunNumber)
      addLog(`━━━ Run #${newRunNumber}: ${name} ━━━`, 'info')
    },
    onScenarioComplete: () => {
      console.log('Scenario completed!')
    }
  })

  /**
   * Common cleanup before starting a new scenario
   */
  const resetVisualization = () => {
    clearLogs()
    setCacheData({})
    setQueueMessages([])
    setMessages([])
  }

  /**
   * SCENARIO 1: Cache Hit - Fast Path
   *
   * Demonstrates the cache-aside pattern with a cache hit.
   * This shows the optimal path with ultra-low latency.
   */
  const simulateCacheHit = () => {
    resetVisualization()

    // Define all steps for this scenario
    const cacheHitSteps = [
      {
        explanation: 'Client initiates a GET request to fetch notes from the Notes Service',
        duration: 2000,
        action: async () => {
          addLog('GET /notes request received', 'request')
          const msg = {
            id: Date.now(),
            from: 'client',
            to: 'notes-service',
            type: 'http',
            label: 'GET /notes',
            path: [POSITIONS.client, POSITIONS.notesService]
          }
          setMessages([msg])
          await speedDelay(500)
        }
      },
      {
        explanation: 'Notes Service checks Redis cache first (cache-aside pattern) - this is much faster than calling another service',
        duration: 2000,
        action: async () => {
          addLog('Checking Redis cache...', 'info')
          const cacheCheckMsg = {
            id: Date.now(),
            from: 'notes-service',
            to: 'redis',
            type: 'cache',
            label: 'GET tags:note:123',
            path: [POSITIONS.notesService, POSITIONS.redis]
          }
          setMessages(prev => [...prev, cacheCheckMsg])
          await speedDelay(500)
        }
      },
      {
        explanation: 'Cache HIT! Redis returns the cached tags instantly (~1ms). No need to call Tags Service, saving ~150ms',
        duration: 2000,
        action: async () => {
          addLog('✅ Cache HIT! Retrieved tags from Redis', 'success')
          const cacheHitMsg = {
            id: Date.now(),
            from: 'redis',
            to: 'notes-service',
            type: 'cache',
            label: '["work", "urgent"]',
            path: [POSITIONS.redis, POSITIONS.notesService],
            success: true
          }
          setMessages(prev => [...prev, cacheHitMsg])
          await speedDelay(500)
        }
      },
      {
        explanation: 'Notes Service sends the complete response back to client with ultra-low latency (total: ~1.2ms)',
        duration: 2000,
        action: async () => {
          addLog('Response sent (Latency: 1.2ms)', 'success')
          const responseMsg = {
            id: Date.now(),
            from: 'notes-service',
            to: 'client',
            type: 'http',
            label: '200 OK',
            path: [POSITIONS.notesService, POSITIONS.client],
            success: true
          }
          setMessages(prev => [...prev, responseMsg])
          await speedDelay(1000)
        }
      },
      {
        explanation: 'Scenario complete! The cache-aside pattern reduced latency from 150ms to 1.2ms - a 125x improvement',
        duration: 2000,
        action: async () => {
          await speedDelay(500)
          setMessages([])
        }
      }
    ]

    // Load and start the scenario
    stepControl.loadScenario('Cache Hit (Step-by-Step Demo)', cacheHitSteps)
  }

  /**
   * SCENARIO 2: Cache Miss - Slow Path
   *
   * Demonstrates what happens when data is not in cache.
   * Shows fallback to synchronous service call and cache population.
   */
  const simulateCacheMiss = () => {
    resetVisualization()

    const cacheMissSteps = [
      {
        explanation: 'Client sends GET request for notes',
        duration: 2000,
        action: async () => {
          addLog('GET /notes request received', 'request')
          const msg = {
            id: Date.now(),
            from: 'client',
            to: 'notes-service',
            type: 'http',
            label: 'GET /notes',
            path: [POSITIONS.client, POSITIONS.notesService]
          }
          setMessages([msg])
          await speedDelay(500)
        }
      },
      {
        explanation: 'Notes Service checks Redis cache for tags',
        duration: 2000,
        action: async () => {
          addLog('Checking Redis cache...', 'info')
          const cacheCheckMsg = {
            id: Date.now(),
            from: 'notes-service',
            to: 'redis',
            type: 'cache',
            label: 'GET tags:note:456',
            path: [POSITIONS.notesService, POSITIONS.redis]
          }
          setMessages(prev => [...prev, cacheCheckMsg])
          await speedDelay(500)
        }
      },
      {
        explanation: 'Cache MISS! Data not found in Redis. Must fetch from Tags Service (slower)',
        duration: 2000,
        action: async () => {
          addLog('❌ Cache MISS! Need to fetch from Tags service', 'warning')
          const cacheMissMsg = {
            id: Date.now(),
            from: 'redis',
            to: 'notes-service',
            type: 'cache',
            label: 'null',
            path: [POSITIONS.redis, POSITIONS.notesService],
            success: false
          }
          setMessages(prev => [...prev, cacheMissMsg])
          await speedDelay(500)
        }
      },
      {
        explanation: 'Notes Service makes synchronous HTTP call to Tags Service',
        duration: 2000,
        action: async () => {
          addLog('Calling Tags service (SYNC)...', 'info')
          const syncCallMsg = {
            id: Date.now(),
            from: 'notes-service',
            to: 'tags-service',
            type: 'http',
            label: 'GET /tags?noteId=456',
            path: [POSITIONS.notesService, POSITIONS.tagsService]
          }
          setMessages(prev => [...prev, syncCallMsg])
          await speedDelay(800)
        }
      },
      {
        explanation: 'Tags Service responds with tag data (~25ms latency)',
        duration: 2000,
        action: async () => {
          addLog('Tags service responded (25ms)', 'info')
          const syncResponseMsg = {
            id: Date.now(),
            from: 'tags-service',
            to: 'notes-service',
            type: 'http',
            label: '["important", "review"]',
            path: [POSITIONS.tagsService, POSITIONS.notesService],
            success: true
          }
          setMessages(prev => [...prev, syncResponseMsg])
          await speedDelay(500)
        }
      },
      {
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
          setCacheData(prev => ({ ...prev, 'note:456': ['important', 'review'] }))
          await speedDelay(500)
        }
      },
      {
        explanation: 'Response sent to client (total latency: ~150ms - slower than cache hit but data is now cached)',
        duration: 2000,
        action: async () => {
          addLog('Response sent (Latency: 150ms)', 'success')
          const responseMsg = {
            id: Date.now(),
            from: 'notes-service',
            to: 'client',
            type: 'http',
            label: '200 OK',
            path: [POSITIONS.notesService, POSITIONS.client],
            success: true
          }
          setMessages(prev => [...prev, responseMsg])
          await speedDelay(1000)
        }
      },
      {
        explanation: 'Scenario complete! Next request for this note will hit the cache and be much faster',
        duration: 2000,
        action: async () => {
          await speedDelay(500)
          setMessages([])
        }
      }
    ]

    stepControl.loadScenario('Cache Miss (Slow Path)', cacheMissSteps)
  }

  /**
   * SCENARIO 3: Async Event-Driven Update
   *
   * Shows event-driven architecture with Kafka.
   * Demonstrates decoupling and eventual consistency.
   */
  const simulateAsyncUpdate = () => {
    resetVisualization()

    const asyncUpdateSteps = [
      {
        explanation: 'Client creates a new tag via Tags Service',
        duration: 2000,
        action: async () => {
          addLog('Tag created in Tags service', 'request')
          const tagCreateMsg = {
            id: Date.now(),
            from: 'client',
            to: 'tags-service',
            type: 'http',
            label: 'POST /tags',
            path: [POSITIONS.client, POSITIONS.tagsService]
          }
          setMessages([tagCreateMsg])
          await speedDelay(500)
        }
      },
      {
        explanation: 'Tags Service writes to database and publishes TAG_CREATED event to Kafka (fire-and-forget)',
        duration: 2000,
        action: async () => {
          addLog('Writing tag to database...', 'info')
          await speedDelay(500)
          addLog('Publishing event to Kafka (ASYNC)...', 'info')

          const kafkaPublishMsg = {
            id: Date.now(),
            from: 'tags-service',
            to: 'kafka',
            type: 'event',
            label: 'TAG_CREATED event',
            path: [POSITIONS.tagsService, POSITIONS.kafka]
          }
          setMessages(prev => [...prev, kafkaPublishMsg])

          const newQueueMsg = {
            id: Date.now(),
            event: 'TAG_CREATED',
            noteId: 'note:789',
            tag: 'new-tag',
            timestamp: new Date().toLocaleTimeString()
          }
          setQueueMessages(prev => [...prev, newQueueMsg])
          await speedDelay(500)
        }
      },
      {
        explanation: 'Tags Service responds immediately without waiting for event processing - this is the key benefit of async!',
        duration: 2000,
        action: async () => {
          addLog('✅ Response sent immediately (no waiting!)', 'success')
          const responseMsg = {
            id: Date.now(),
            from: 'tags-service',
            to: 'client',
            type: 'http',
            label: '201 Created',
            path: [POSITIONS.tagsService, POSITIONS.client],
            success: true
          }
          setMessages(prev => [...prev, responseMsg])
          await speedDelay(kafkaLag * 1000 + 500)
        }
      },
      {
        explanation: `Notes Service consumes the TAG_CREATED event from Kafka (with ${kafkaLag}s lag)`,
        duration: 2000,
        action: async () => {
          addLog(`Notes service consuming event (lag: ${kafkaLag}s)...`, 'info')
          const kafkaConsumeMsg = {
            id: Date.now(),
            from: 'kafka',
            to: 'notes-service',
            type: 'event',
            label: 'TAG_CREATED event',
            path: [POSITIONS.kafka, POSITIONS.notesService]
          }
          setMessages(prev => [...prev, kafkaConsumeMsg])
          setQueueMessages(prev => prev.slice(1))
          await speedDelay(500)
        }
      },
      {
        explanation: 'Notes Service updates its Redis cache based on the event (eventual consistency)',
        duration: 2000,
        action: async () => {
          addLog('Updating Redis cache from event...', 'info')
          const updateCacheMsg = {
            id: Date.now(),
            from: 'notes-service',
            to: 'redis',
            type: 'cache',
            label: 'UPDATE tags:note:789',
            path: [POSITIONS.notesService, POSITIONS.redis]
          }
          setMessages(prev => [...prev, updateCacheMsg])
          setCacheData(prev => ({
            ...prev,
            'note:789': [...(prev['note:789'] || []), 'new-tag']
          }))
          await speedDelay(500)
        }
      },
      {
        explanation: 'Cache synchronized! Future requests will see the new tag. This demonstrates eventual consistency.',
        duration: 2000,
        action: async () => {
          addLog('✅ Cache synchronized!', 'success')
          await speedDelay(1000)
          setMessages([])
        }
      }
    ]

    stepControl.loadScenario('Async Event-Driven Update', asyncUpdateSteps)
  }

  // The remaining scenarios (simulateServiceFailure) would follow the same pattern

  return (
    <>
      <div className="container">
        <div className="pattern-layout">
          <div className="pattern-sidebar">
            <ControlPanel
              onCacheHit={simulateCacheHit}
              onCacheMiss={simulateCacheMiss}
              onAsyncUpdate={simulateAsyncUpdate}
              onServiceFailure={() => {}} // TODO: Convert to step-by-step
              kafkaLag={kafkaLag}
              setKafkaLag={setKafkaLag}
              redisStatus={redisStatus}
              setRedisStatus={setRedisStatus}
            />
          </div>

          <div className="pattern-main">
            {/*
              Notice how clean this is now!
              All the step logic is in the hook, we just pass the interface through
            */}
            <StepByStepControls
              currentStep={stepControl.currentStep}
              totalSteps={stepControl.totalSteps}
              stepExplanation={stepControl.stepExplanation}
              onNext={stepControl.goToNextStep}
              onPrevious={stepControl.goToPreviousStep}
              onToggleAutoPlay={stepControl.toggleAutoPlay}
              isAutoPlaying={stepControl.isAutoPlaying}
              isRunning={stepControl.isRunning}
            />

            <div className="architecture">
              <ServiceBox
                name="Client"
                type="client"
                position={POSITIONS.client}
                icon="👤"
              />

              <ServiceBox
                name="Notes Service"
                type="service"
                position={POSITIONS.notesService}
                icon="📝"
                details="Main API service with cache-aside pattern"
              />

              <ServiceBox
                name="Redis Cache"
                type="cache"
                position={POSITIONS.redis}
                icon="⚡"
                status={redisStatus}
                details="Sub-millisecond lookups"
              />

              <ServiceBox
                name="Tags Service"
                type="service"
                position={POSITIONS.tagsService}
                icon="🏷️"
                status={tagsServiceStatus}
                details="Manages tags and publishes events"
              />

              <ServiceBox
                name="Kafka"
                type="queue"
                position={POSITIONS.kafka}
                icon="📨"
                details={`Consumer lag: ${kafkaLag}s`}
              />

              <AnimatePresence>
                {messages.map(msg => (
                  <MessageFlow key={msg.id} message={msg} />
                ))}
              </AnimatePresence>
            </div>

            <footer className="footer">
              <div className="legend">
                <div className="legend-item">
                  <span className="legend-color http"></span>
                  <span>HTTP Request (Sync)</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color event"></span>
                  <span>Kafka Event (Async)</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color cache"></span>
                  <span>Cache Operation</span>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>

      <InfoTabs
        cacheData={cacheData}
        queueMessages={queueMessages}
        logs={logs}
        onClear={() => {
          clearLogs()
          setCacheData({})
          setQueueMessages([])
          setMessages([])
        }}
      />
    </>
  )
}
