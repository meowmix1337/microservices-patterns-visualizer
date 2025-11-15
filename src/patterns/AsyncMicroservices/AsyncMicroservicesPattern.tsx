import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ServiceBox, { type ServiceStatus } from '../../components/pattern/ServiceBox'
import MessageFlow, { type MessageFlowData } from '../../components/pattern/MessageFlow'
import ControlPanel, { type RedisStatus } from '../../components/pattern/ControlPanel'
import { InfoTabs } from '../../components/viewers'
import { StepByStepControls } from '../../components/pattern'
import { useLogs } from '../../hooks/useLogs'
import { useStepByStep } from '../../hooks/useStepByStep'
import { createSpeedDelay } from '../../utils/scenarioHelpers'
import { POSITIONS, type Position } from '../../constants/colors'
import type { Step } from '../../hooks/useStepByStep.d'
import type { CacheData } from '../../components/viewers/CacheViewer'
import type { QueueMessage } from '../../components/viewers/QueueViewer'

export interface AsyncMicroservicesPatternProps {
  animationSpeed: number
}

export default function AsyncMicroservicesPattern({ animationSpeed }: AsyncMicroservicesPatternProps) {
  const [messages, setMessages] = useState<MessageFlowData[]>([])
  const [cacheData, setCacheData] = useState<CacheData>({})
  const [queueMessages, setQueueMessages] = useState<QueueMessage[]>([])
  const { logs, addLog, clearLogs } = useLogs()
  const [kafkaLag, setKafkaLag] = useState<number>(0)
  const [redisStatus, setRedisStatus] = useState<RedisStatus>('healthy')
  const [tagsServiceStatus, setTagsServiceStatus] = useState<ServiceStatus>('healthy')
  const [runCounter, setRunCounter] = useState<number>(0)

  // Use the step-by-step hook
  const stepControl = useStepByStep({
    animationSpeed,
    onScenarioStart: (name: string) => {
      const newRunNumber = runCounter + 1
      setRunCounter(newRunNumber)
      clearLogs()
      setCacheData({})
      setQueueMessages([])
      setMessages([])
      addLog(`━━━ Run #${newRunNumber}: ${name} ━━━`, 'info')
    }
  })

  const speedDelay = createSpeedDelay(animationSpeed)

  // Cache Hit scenario - step-by-step
  const simulateCacheHit = (): void => {

    const cacheHitSteps: Step[] = [
      {
        explanation: "Client initiates a GET request to fetch notes from the Notes Service",
        duration: 2000,
        action: async () => {
          addLog('GET /notes request received', 'request')
          const msg: MessageFlowData = {
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
        explanation: "Notes Service checks Redis cache first (cache-aside pattern) - this is much faster than calling another service",
        duration: 2000,
        action: async () => {
          addLog('Checking Redis cache...', 'info')
          const cacheCheckMsg: MessageFlowData = {
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
        explanation: "Cache HIT! Redis returns the cached tags instantly (~1ms). No need to call Tags Service, saving ~150ms",
        duration: 2000,
        action: async () => {
          addLog('✅ Cache HIT! Retrieved tags from Redis', 'success')
          const cacheHitMsg: MessageFlowData = {
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
        explanation: "Notes Service sends the complete response back to client with ultra-low latency (total: ~1.2ms)",
        duration: 2000,
        action: async () => {
          addLog('Response sent (Latency: 1.2ms)', 'success')
          const responseMsg: MessageFlowData = {
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
        explanation: "Scenario complete! The cache-aside pattern reduced latency from 150ms to 1.2ms - a 125x improvement",
        duration: 2000,
        action: async () => {
          await speedDelay(500)
          setMessages([])
        }
      }
    ]

    // Load scenario using the hook
    stepControl.loadScenario('Cache Hit (Step-by-Step Demo)', cacheHitSteps)
  }

  // Cache Miss scenario - step-by-step
  const simulateCacheMiss = (): void => {
    const cacheMissSteps: Step[] = [
      {
        explanation: "Client sends GET request to Notes Service for note data",
        duration: 2000,
        action: async () => {
          addLog('GET /notes request received', 'request')
          const msg: MessageFlowData = {
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
        explanation: "Notes Service checks Redis cache first (cache-aside pattern)",
        duration: 2000,
        action: async () => {
          addLog('Checking Redis cache...', 'info')
          const cacheCheckMsg: MessageFlowData = {
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
        explanation: "Cache MISS! Data not in Redis. Must fetch from Tags Service synchronously, adding latency",
        duration: 2000,
        action: async () => {
          addLog('❌ Cache MISS! Need to fetch from Tags service', 'warning')
          const cacheMissMsg: MessageFlowData = {
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
        explanation: "Notes Service makes synchronous HTTP call to Tags Service (blocks until response)",
        duration: 2000,
        action: async () => {
          addLog('Calling Tags service (SYNC)...', 'info')
          const syncCallMsg: MessageFlowData = {
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
        explanation: "Tags Service responds with tag data (~25ms). Now Notes Service can continue",
        duration: 2000,
        action: async () => {
          addLog('Tags service responded (25ms)', 'info')
          const syncResponseMsg: MessageFlowData = {
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
        explanation: "Notes Service updates Redis cache (cache-aside write) so future requests will be faster",
        duration: 2000,
        action: async () => {
          addLog('Updating Redis cache...', 'info')
          const updateCacheMsg: MessageFlowData = {
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
        explanation: "Final response sent to client. Total latency: 150ms (much slower than cache hit's 1.2ms!)",
        duration: 2000,
        action: async () => {
          addLog('Response sent (Latency: 150ms)', 'success')
          const responseMsg: MessageFlowData = {
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
        explanation: "Cache Miss complete! Notice how cache-aside pattern trades first request latency for subsequent speed",
        duration: 2000,
        action: async () => {
          await speedDelay(500)
          setMessages([])
        }
      }
    ]

    stepControl.loadScenario('Cache Miss (Slower Path)', cacheMissSteps)
  }

  const simulateAsyncUpdate = (): void => {
    // Store the newQueueMsg in a closure so we can reference it across steps
    let newQueueMsg: QueueMessage | null = null

    const asyncUpdateSteps: Step[] = [
      {
        explanation: "Client sends POST request to create a new tag in Tags Service",
        duration: 2000,
        action: async () => {
          addLog('Tag created in Tags service', 'request')
          const tagCreateMsg: MessageFlowData = {
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
        explanation: "Tags Service writes the tag to its database, then publishes TAG_CREATED event to Kafka (fire-and-forget)",
        duration: 2500,
        action: async () => {
          addLog('Writing tag to database...', 'info')
          await speedDelay(300)

          addLog('Publishing event to Kafka (ASYNC)...', 'info')
          const kafkaPublishMsg: MessageFlowData = {
            id: Date.now(),
            from: 'tags-service',
            to: 'kafka',
            type: 'event',
            label: 'TAG_CREATED event',
            path: [POSITIONS.tagsService, POSITIONS.kafka]
          }
          setMessages(prev => [...prev, kafkaPublishMsg])

          // Create queue message
          newQueueMsg = {
            id: Date.now(),
            event: 'TAG_CREATED',
            noteId: 'note:789',
            tag: 'new-tag',
            timestamp: new Date().toLocaleTimeString()
          }
          setQueueMessages(prev => [...prev, newQueueMsg!])
          await speedDelay(500)
        }
      },
      {
        explanation: "Tags Service responds immediately to client without waiting for event processing - ultra-low latency!",
        duration: 2000,
        action: async () => {
          addLog('✅ Response sent immediately (no waiting!)', 'success')
          const responseMsg: MessageFlowData = {
            id: Date.now(),
            from: 'tags-service',
            to: 'client',
            type: 'http',
            label: '201 Created',
            path: [POSITIONS.tagsService, POSITIONS.client],
            success: true
          }
          setMessages(prev => [...prev, responseMsg])
          await speedDelay(500)
        }
      },
      {
        explanation: `Kafka consumer lag simulation (${kafkaLag}s) - this represents real-world async processing delay`,
        duration: kafkaLag * 1000 + 1000,
        action: async () => {
          addLog(`Waiting for Notes Service to consume event (lag: ${kafkaLag}s)...`, 'info')
          await speedDelay(kafkaLag * 1000)
        }
      },
      {
        explanation: "Notes Service consumes TAG_CREATED event from Kafka and processes it asynchronously",
        duration: 2000,
        action: async () => {
          addLog(`Notes service consuming event (lag: ${kafkaLag}s)...`, 'info')
          const kafkaConsumeMsg: MessageFlowData = {
            id: Date.now(),
            from: 'kafka',
            to: 'notes-service',
            type: 'event',
            label: 'TAG_CREATED event',
            path: [POSITIONS.kafka, POSITIONS.notesService]
          }
          setMessages(prev => [...prev, kafkaConsumeMsg])

          // Remove from queue
          if (newQueueMsg) {
            setQueueMessages(prev => prev.filter(m => m.id !== newQueueMsg!.id))
          }
          await speedDelay(500)
        }
      },
      {
        explanation: "Notes Service updates Redis cache from the consumed event to keep data synchronized across services",
        duration: 2000,
        action: async () => {
          // Check if Redis is down
          if (redisStatus === 'down') {
            addLog('⚠️ Redis is DOWN! Cannot update cache from event', 'warning')
            await speedDelay(500)
            return
          }

          addLog('Updating Redis cache from event...', 'info')
          const updateCacheMsg: MessageFlowData = {
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
            'note:789': [...(Array.isArray(prev['note:789']) ? prev['note:789'] as string[] : []), 'new-tag']
          }))
          await speedDelay(500)
        }
      },
      {
        explanation: "Event-driven update complete! Notice how client got instant response while cache sync happened asynchronously",
        duration: 2000,
        action: async () => {
          if (redisStatus !== 'down') {
            addLog('✅ Cache synchronized!', 'success')
          }
          await speedDelay(500)
          setMessages([])
        }
      }
    ]

    stepControl.loadScenario('Async Event-Driven Update', asyncUpdateSteps)
  }

  const simulateServiceFailure = (): void => {
    const serviceFailureSteps: Step[] = [
      {
        explanation: "Tags Service goes DOWN! This simulates a real service outage scenario",
        duration: 2000,
        action: async () => {
          setTagsServiceStatus('down')
          addLog('⚠️ Tags service is DOWN!', 'error')
          await speedDelay(500)
        }
      },
      {
        explanation: "Client sends GET request for notes despite the Tags Service being down",
        duration: 2000,
        action: async () => {
          addLog('GET /notes request received', 'request')
          const msg: MessageFlowData = {
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
        explanation: "Notes Service tries Redis cache first (cache-aside pattern) - this provides resilience!",
        duration: 2000,
        action: async () => {
          addLog('Checking Redis cache...', 'info')
          const cacheCheckMsg: MessageFlowData = {
            id: Date.now(),
            from: 'notes-service',
            to: 'redis',
            type: 'cache',
            label: 'GET tags:note:999',
            path: [POSITIONS.notesService, POSITIONS.redis]
          }
          setMessages(prev => [...prev, cacheCheckMsg])
          await speedDelay(500)
        }
      },
      {
        explanation: "Cache MISS! The requested data isn't cached, so we must call the downstream service",
        duration: 2000,
        action: async () => {
          addLog('Cache MISS - attempting Tags service...', 'warning')
          const cacheMissMsg: MessageFlowData = {
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
        explanation: "Notes Service attempts to call Tags Service (which is down) - this will timeout",
        duration: 2000,
        action: async () => {
          addLog('Calling Tags service...', 'info')
          const syncCallMsg: MessageFlowData = {
            id: Date.now(),
            from: 'notes-service',
            to: 'tags-service',
            type: 'http',
            label: 'GET /tags?noteId=999',
            path: [POSITIONS.notesService, POSITIONS.tagsService]
          }
          setMessages(prev => [...prev, syncCallMsg])
          await speedDelay(500)
        }
      },
      {
        explanation: "Request timeout! Circuit breaker pattern kicks in to prevent cascading failures",
        duration: 2500,
        action: async () => {
          addLog('❌ Tags service timeout! Circuit breaker OPEN', 'error')
          await speedDelay(500)
        }
      },
      {
        explanation: "Graceful degradation: Notes Service returns partial data without tags rather than failing completely",
        duration: 2000,
        action: async () => {
          addLog('Graceful degradation: returning notes without tags', 'warning')
          const responseMsg: MessageFlowData = {
            id: Date.now(),
            from: 'notes-service',
            to: 'client',
            type: 'http',
            label: '200 OK (partial)',
            path: [POSITIONS.notesService, POSITIONS.client],
            success: true
          }
          setMessages(prev => [...prev, responseMsg])
          await speedDelay(500)
        }
      },
      {
        explanation: "Scenario complete! Tags Service recovers. Notice how the system degraded gracefully instead of failing entirely",
        duration: 2000,
        action: async () => {
          await speedDelay(500)
          setMessages([])
          setTagsServiceStatus('healthy')
          addLog('Tags service recovered', 'success')
          await speedDelay(500)
        }
      }
    ]

    stepControl.loadScenario('Service Failure & Circuit Breaker', serviceFailureSteps)
  }

  return (
    <>
      <div className="container">
        <div className="pattern-layout">
          <div className="pattern-sidebar">
            <ControlPanel
              onCacheHit={simulateCacheHit}
              onCacheMiss={simulateCacheMiss}
              onAsyncUpdate={simulateAsyncUpdate}
              onServiceFailure={simulateServiceFailure}
              kafkaLag={kafkaLag}
              setKafkaLag={setKafkaLag}
              redisStatus={redisStatus}
              setRedisStatus={setRedisStatus}
            />
          </div>

          <div className="pattern-main">
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
