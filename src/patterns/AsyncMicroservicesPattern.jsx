import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ServiceBox from '../components/ServiceBox'
import MessageFlow from '../components/MessageFlow'
import ControlPanel from '../components/ControlPanel'
import InfoTabs from '../components/InfoTabs'
import ScenarioInfoPanel from '../components/ScenarioInfoPanel'
import { useLogs } from '../hooks/useLogs'
import { delay } from '../utils/delay'
import { POSITIONS } from '../constants/colors'

export default function AsyncMicroservicesPattern({ animationSpeed }) {
  const [messages, setMessages] = useState([])
  const [cacheData, setCacheData] = useState({})
  const [queueMessages, setQueueMessages] = useState([])
  const { logs, addLog, clearLogs } = useLogs()
  const [kafkaLag, setKafkaLag] = useState(0)
  const [redisStatus, setRedisStatus] = useState('healthy')
  const [tagsServiceStatus, setTagsServiceStatus] = useState('healthy')
  const [runCounter, setRunCounter] = useState(0)
  const [activeServices, setActiveServices] = useState({})
  const [currentScenario, setCurrentScenario] = useState(null)

  const speedDelay = (ms) => delay(ms / animationSpeed)

  const setServiceActive = (service, activityType) => {
    setActiveServices(prev => ({ ...prev, [service]: activityType }))
  }

  const clearServiceActive = (service) => {
    setActiveServices(prev => {
      const updated = { ...prev }
      delete updated[service]
      return updated
    })
  }

  const clearAllActiveServices = () => {
    setActiveServices({})
  }

  const scenarios = {
    cacheHit: {
      icon: '⚡',
      title: 'Cache Hit Scenario',
      description: 'Demonstrates the cache-aside pattern with a successful cache hit, avoiding a synchronous call to the Tags service.',
      keyPoints: [
        'Redis cache checked first for sub-millisecond response',
        'Tags service call avoided when cache hit occurs',
        'Significant latency reduction (10ms vs 150ms)',
      ]
    },
    cacheMiss: {
      icon: '🔄',
      title: 'Cache Miss & Sync Call',
      description: 'Shows what happens when data isn\'t cached - Notes service makes a synchronous HTTP call to Tags service, then updates the cache.',
      keyPoints: [
        'Cache miss triggers fallback to Tags service',
        'Synchronous HTTP call adds latency (~150ms)',
        'Cache updated after fetching from source',
      ]
    },
    asyncUpdate: {
      icon: '📨',
      title: 'Async Event Processing',
      description: 'Event-driven pattern: Tags service publishes to Kafka immediately, Notes service consumes asynchronously with configurable lag.',
      keyPoints: [
        'Tags service responds instantly without waiting',
        'Event published to Kafka for async processing',
        'Notes service consumes and updates cache independently',
        'Consumer lag simulates real-world event processing',
      ]
    },
    serviceFailure: {
      icon: '⚠️',
      title: 'Graceful Degradation',
      description: 'Resilience pattern demonstrating circuit breaker behavior when Tags service is down.',
      keyPoints: [
        'Tags service failure detected via timeout',
        'Circuit breaker opens to prevent cascade',
        'Graceful degradation returns partial data',
        'System remains available despite failure',
      ]
    }
  }

  const startNewRun = (scenarioName, scenarioKey) => {
    const newRunNumber = runCounter + 1
    setRunCounter(newRunNumber)
    clearLogs()
    setCacheData({})
    setQueueMessages([])
    setMessages([])
    clearAllActiveServices()
    setCurrentScenario(scenarios[scenarioKey] || null)
    addLog(`━━━ Run #${newRunNumber}: ${scenarioName} ━━━`, 'info')
  }

  const simulateCacheHit = async () => {
    startNewRun('Cache Hit', 'cacheHit')
    await speedDelay(300)
    addLog('GET /notes request received', 'request')

    setServiceActive('client', 'sending')
    setServiceActive('notesService', 'receiving')
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
    clearServiceActive('client')
    clearServiceActive('notesService')

    // Check if Redis is down
    if (redisStatus === 'down') {
      addLog('⚠️ Redis is DOWN! Skipping cache, calling Tags service directly', 'warning')

      await speedDelay(500)
      addLog('Calling Tags service (SYNC)...', 'info')

      const syncCallMsg = {
        id: Date.now(),
        from: 'notes-service',
        to: 'tags-service',
        type: 'http',
        label: 'GET /tags?noteId=123',
        path: [POSITIONS.notesService, POSITIONS.tagsService]
      }
      setMessages(prev => [...prev, syncCallMsg])

      await speedDelay(800)
      addLog('Tags service responded (25ms)', 'info')

      const syncResponseMsg = {
        id: Date.now(),
        from: 'tags-service',
        to: 'notes-service',
        type: 'http',
        label: '["work", "urgent"]',
        path: [POSITIONS.tagsService, POSITIONS.notesService],
        success: true
      }
      setMessages(prev => [...prev, syncResponseMsg])

      await speedDelay(500)
      addLog('Response sent (Latency: 150ms - no cache available)', 'success')

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
      setMessages([])
      return
    }

    addLog('Checking Redis cache...', 'info')

    setServiceActive('notesService', 'sending')
    setServiceActive('redis', 'receiving')
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
    clearServiceActive('notesService')
    addLog('✅ Cache HIT! Retrieved tags from Redis', 'success')

    setServiceActive('redis', 'sending')
    setServiceActive('notesService', 'receiving')
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
    clearServiceActive('redis')
    clearServiceActive('notesService')
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
    setMessages([])
  }

  const simulateCacheMiss = async () => {
    startNewRun('Cache Miss', 'cacheMiss')
    await speedDelay(300)
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

    // Check if Redis is down
    if (redisStatus === 'down') {
      addLog('⚠️ Redis is DOWN! Falling back to Tags service', 'warning')

      await speedDelay(500)
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
      addLog('⚠️ Cannot cache - Redis unavailable. Response sent (Latency: 150ms)', 'warning')

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
      setMessages([])
      return
    }

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
    setMessages([])
  }

  const simulateAsyncUpdate = async () => {
    startNewRun('Async Event', 'asyncUpdate')
    await speedDelay(300)
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

    setQueueMessages(prev => prev.filter(m => m.id !== newQueueMsg.id))

    await speedDelay(500)

    // Check if Redis is down
    if (redisStatus === 'down') {
      addLog('⚠️ Redis is DOWN! Cannot update cache from event', 'warning')
      await speedDelay(1000)
      setMessages([])
      return
    }

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
    addLog('✅ Cache synchronized!', 'success')

    await speedDelay(1000)
    setMessages([])
  }

  const simulateServiceFailure = async () => {
    startNewRun('Service Failure', 'serviceFailure')
    await speedDelay(300)
    setTagsServiceStatus('down')
    addLog('⚠️ Tags service is DOWN!', 'error')

    await speedDelay(500)
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
    addLog('Checking Redis cache...', 'info')

    const cacheCheckMsg = {
      id: Date.now(),
      from: 'notes-service',
      to: 'redis',
      type: 'cache',
      label: 'GET tags:note:999',
      path: [POSITIONS.notesService, POSITIONS.redis]
    }
    setMessages(prev => [...prev, cacheCheckMsg])

    await speedDelay(500)
    addLog('Cache MISS - attempting Tags service...', 'warning')

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
    addLog('Calling Tags service...', 'info')

    const syncCallMsg = {
      id: Date.now(),
      from: 'notes-service',
      to: 'tags-service',
      type: 'http',
      label: 'GET /tags?noteId=999',
      path: [POSITIONS.notesService, POSITIONS.tagsService]
    }
    setMessages(prev => [...prev, syncCallMsg])

    await speedDelay(1000)
    addLog('❌ Tags service timeout! Circuit breaker OPEN', 'error')
    addLog('Graceful degradation: returning notes without tags', 'warning')

    const responseMsg = {
      id: Date.now(),
      from: 'notes-service',
      to: 'client',
      type: 'http',
      label: '200 OK (partial)',
      path: [POSITIONS.notesService, POSITIONS.client],
      success: true
    }
    setMessages(prev => [...prev, responseMsg])

    await speedDelay(1500)
    setMessages([])
    setTagsServiceStatus('healthy')
    addLog('Tags service recovered', 'success')
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
            <ScenarioInfoPanel scenario={currentScenario} />

            <div className="architecture">
              <ServiceBox
                name="Client"
                type="client"
                position={POSITIONS.client}
                icon="👤"
                isActive={activeServices.client}
                activityType={activeServices.client}
              />

              <ServiceBox
                name="Notes Service"
                type="service"
                position={POSITIONS.notesService}
                icon="📝"
                details="Main API service with cache-aside pattern"
                isActive={activeServices.notesService}
                activityType={activeServices.notesService}
                isConsumer={true}
              />

              <ServiceBox
                name="Redis Cache"
                type="cache"
                position={POSITIONS.redis}
                icon="⚡"
                status={redisStatus}
                details="Sub-millisecond lookups"
                isActive={activeServices.redis}
                activityType={activeServices.redis}
              />

              <ServiceBox
                name="Tags Service"
                type="service"
                position={POSITIONS.tagsService}
                icon="🏷️"
                status={tagsServiceStatus}
                details="Manages tags and publishes events"
                isActive={activeServices.tagsService}
                activityType={activeServices.tagsService}
              />

              <ServiceBox
                name="Kafka"
                type="queue"
                position={POSITIONS.kafka}
                icon="📨"
                details={`Consumer lag: ${kafkaLag}s`}
                isActive={activeServices.kafka}
                activityType={activeServices.kafka}
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
