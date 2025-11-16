import { motion, AnimatePresence } from 'framer-motion'
import ServiceBox from '../../components/pattern/ServiceBox'
import MessageFlow from '../../components/pattern/MessageFlow'
import DependencyArrow from '../../components/pattern/DependencyArrow'
import ControlPanel from '../../components/pattern/ControlPanel'
import { InfoTabs } from '../../components/viewers'
import { StepByStepControls } from '../../components/pattern'
import { useStepByStep } from '../../hooks/useStepByStep'
import { createSpeedDelay } from '../../utils/scenarioHelpers'
import { POSITIONS } from '../../constants/colors'
import { useAsyncMicroservicesState } from './useAsyncMicroservicesState'
import { ASYNC_MICROSERVICES_DEPENDENCIES } from './dependencies'
import { ArchitectureProvider, buildDependencyMap } from '../../contexts/ArchitectureContext'
import {
  createCacheHitScenario,
  createCacheMissScenario,
  createAsyncUpdateScenario,
  createServiceFailureScenario
} from './scenarios'

export interface AsyncMicroservicesPatternProps {
  animationSpeed: number
}

export default function AsyncMicroservicesPattern({ animationSpeed }: AsyncMicroservicesPatternProps) {
  const state = useAsyncMicroservicesState()

  // Build dependency map for hover highlights
  const dependencyMap = buildDependencyMap(ASYNC_MICROSERVICES_DEPENDENCIES)

  // Use the step-by-step hook
  const stepControl = useStepByStep({
    animationSpeed,
    onScenarioStart: (name: string) => {
      const newRunNumber = state.runCounter + 1
      state.setRunCounter(newRunNumber)
      state.clearLogs()
      state.setCacheData({})
      state.setQueueMessages([])
      state.setMessages([])
      state.addLog(`━━━ Run #${newRunNumber}: ${name} ━━━`, 'info')
    }
  })

  const speedDelay = createSpeedDelay(animationSpeed)

  // Cache Hit scenario - step-by-step
  const simulateCacheHit = (): void => {
    const cacheHitSteps = createCacheHitScenario(state, speedDelay)
    stepControl.loadScenario('Cache Hit (Step-by-Step Demo)', cacheHitSteps)
  }

  // Cache Miss scenario - step-by-step
  const simulateCacheMiss = (): void => {
    const cacheMissSteps = createCacheMissScenario(state, speedDelay)
    stepControl.loadScenario('Cache Miss (Slower Path)', cacheMissSteps)
  }

  const simulateAsyncUpdate = (): void => {
    const asyncUpdateSteps = createAsyncUpdateScenario(state, speedDelay)
    stepControl.loadScenario('Async Event-Driven Update', asyncUpdateSteps)
  }

  const simulateServiceFailure = (): void => {
    const serviceFailureSteps = createServiceFailureScenario(state, speedDelay)
    stepControl.loadScenario('Service Failure & Circuit Breaker', serviceFailureSteps)
  }

  return (
    <ArchitectureProvider dependencyMap={dependencyMap}>
      <div className="container">
        <div className="pattern-layout">
          <div className="pattern-sidebar">
            <ControlPanel
              onCacheHit={simulateCacheHit}
              onCacheMiss={simulateCacheMiss}
              onAsyncUpdate={simulateAsyncUpdate}
              onServiceFailure={simulateServiceFailure}
              kafkaLag={state.kafkaLag}
              setKafkaLag={state.setKafkaLag}
              redisStatus={state.redisStatus}
              setRedisStatus={state.setRedisStatus}
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
              {/* Render dependency arrows first (behind service boxes) */}
              {ASYNC_MICROSERVICES_DEPENDENCIES.map((dep, index) => (
                <DependencyArrow
                  key={`${dep.from}-${dep.to}-${index}`}
                  from={POSITIONS[dep.from as keyof typeof POSITIONS]}
                  to={POSITIONS[dep.to as keyof typeof POSITIONS]}
                  type={dep.type}
                  label={dep.label}
                  fromServiceId={dep.from}
                  toServiceId={dep.to}
                />
              ))}

              <ServiceBox
                name="Client"
                type="client"
                position={POSITIONS.client}
                icon="👤"
                serviceId="client"
                tooltip={{
                  description: "Client application that initiates requests to the Notes Service",
                  metadata: [
                    { label: "Type", value: "HTTP Client" },
                    { label: "Protocol", value: "REST" }
                  ]
                }}
              />

              <ServiceBox
                name="Notes Service"
                type="service"
                position={POSITIONS.notesService}
                icon="📝"
                serviceId="notesService"
                tooltip={{
                  description: "Main API service implementing cache-aside pattern for performance",
                  metadata: [
                    { label: "Type", value: "REST API" },
                    { label: "Cache Strategy", value: "Cache-Aside" },
                    { label: "Dependencies", value: "Redis, Tags Service, Kafka" }
                  ]
                }}
              />

              <ServiceBox
                name="Redis Cache"
                type="cache"
                position={POSITIONS.redis}
                icon="⚡"
                status={state.redisStatus}
                serviceId="redis"
                tooltip={{
                  description: "In-memory cache for ultra-fast data lookups (sub-millisecond)",
                  metadata: [
                    { label: "Type", value: "Key-Value Store" },
                    { label: "Latency", value: "<1ms" },
                    { label: "Status", value: state.redisStatus === 'healthy' ? 'Healthy' : 'Down' }
                  ]
                }}
              />

              <ServiceBox
                name="Tags Service"
                type="service"
                position={POSITIONS.tagsService}
                icon="🏷️"
                status={state.tagsServiceStatus}
                serviceId="tagsService"
                tooltip={{
                  description: "Manages tags and publishes events to Kafka for async processing",
                  metadata: [
                    { label: "Type", value: "REST API" },
                    { label: "Event Bus", value: "Kafka" },
                    { label: "Status", value: state.tagsServiceStatus === 'healthy' ? 'Healthy' : 'Down' }
                  ]
                }}
              />

              <ServiceBox
                name="Kafka"
                type="queue"
                position={POSITIONS.kafka}
                icon="📨"
                serviceId="kafka"
                tooltip={{
                  description: "Distributed message queue for asynchronous event-driven communication",
                  metadata: [
                    { label: "Type", value: "Message Queue" },
                    { label: "Consumer Lag", value: `${state.kafkaLag}s` },
                    { label: "Pattern", value: "Pub/Sub" }
                  ]
                }}
              />

              <AnimatePresence>
                {state.messages.map(msg => (
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
        cacheData={state.cacheData}
        queueMessages={state.queueMessages}
        logs={state.logs}
        onClear={() => {
          state.clearLogs()
          state.setCacheData({})
          state.setQueueMessages([])
          state.setMessages([])
        }}
      />
    </ArchitectureProvider>
  )
}
