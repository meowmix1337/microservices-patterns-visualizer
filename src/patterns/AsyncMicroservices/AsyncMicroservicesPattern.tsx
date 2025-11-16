import { motion, AnimatePresence } from 'framer-motion'
import ServiceBox from '../../components/pattern/ServiceBox'
import MessageFlow from '../../components/pattern/MessageFlow'
import ControlPanel from '../../components/pattern/ControlPanel'
import { InfoTabs } from '../../components/viewers'
import { StepByStepControls } from '../../components/pattern'
import { useStepByStep } from '../../hooks/useStepByStep'
import { createSpeedDelay } from '../../utils/scenarioHelpers'
import { POSITIONS } from '../../constants/colors'
import { useAsyncMicroservicesState } from './useAsyncMicroservicesState'
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
    <>
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
                status={state.redisStatus}
                details="Sub-millisecond lookups"
              />

              <ServiceBox
                name="Tags Service"
                type="service"
                position={POSITIONS.tagsService}
                icon="🏷️"
                status={state.tagsServiceStatus}
                details="Manages tags and publishes events"
              />

              <ServiceBox
                name="Kafka"
                type="queue"
                position={POSITIONS.kafka}
                icon="📨"
                details={`Consumer lag: ${state.kafkaLag}s`}
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
    </>
  )
}
