import { AnimatePresence } from 'framer-motion'
import ServiceBox from '../../components/pattern/ServiceBox'
import MessageFlow from '../../components/pattern/MessageFlow'
// import DependencyArrow from '../../components/pattern/DependencyArrow' // Removed - arrows hidden
import { InfoTabs } from '../../components/viewers'
import { StepByStepControls } from '../../components/pattern'
import Button from '../../components/ui/Button'
import { useStepByStep } from '../../hooks/useStepByStep'
import { createSpeedDelay } from '../../utils/scenarioHelpers'
import { useRequestResponseState } from './useRequestResponseState'
import { REQUEST_RESPONSE_DEPENDENCIES } from './dependencies'
import { ArchitectureProvider, buildDependencyMap } from '../../contexts/ArchitectureContext'
import { type Position, gridToPosition } from '../../constants/colors'
import {
  createSimpleRequestScenario,
  createCascadeRequestScenario,
  createParallelRequestsScenario,
  createTimeoutScenario
} from './scenarios'

export interface RequestResponsePatternProps {
  animationSpeed: number
}

// Position mapping for RequestResponse pattern using grid system for better spacing
// Optimized for full-width layout - leftmost service near left edge, rightmost near right edge
// Vertical optimization: services positioned in rows 0-5 to utilize full vertical space
const POSITIONS: Record<string, Position> = {
  client: gridToPosition(1, 2),      // Far left, row 1 vertically (~18.75% from top)
  notesService: gridToPosition(5, 2), // Center-left, row 2 vertically (~28.75% from top)
  tagsService: gridToPosition(9, 4), // Far right, row 4 vertically (~48.75% from top)
  userService: gridToPosition(9, 0)  // Far right, row 0 (near top) (~6.25% from top)
}

export default function RequestResponsePattern({ animationSpeed }: RequestResponsePatternProps) {
  const state = useRequestResponseState()

  // Build dependency map for hover highlights
  const dependencyMap = buildDependencyMap(REQUEST_RESPONSE_DEPENDENCIES)

  // Step-by-step control hook
  const stepControl = useStepByStep({
    animationSpeed,
    onScenarioStart: (name: string) => {
      const newRunNumber = state.runCounter + 1
      state.setRunCounter(newRunNumber)
      state.clearLogs()
      state.setMessages([])
      state.addLog(`━━━ Run #${newRunNumber}: ${name} ━━━`, 'info')
    }
  })

  const speedDelay = createSpeedDelay(animationSpeed)

  // Scenario 1: Simple direct request
  const simulateSimpleRequest = (): void => {
    const simpleRequestSteps = createSimpleRequestScenario(state, speedDelay)
    stepControl.loadScenario('Simple Request-Response', simpleRequestSteps)
  }

  // Scenario 2: Cascade/Chain request (Client -> Notes -> Tags)
  const simulateCascadeRequest = (): void => {
    const cascadeRequestSteps = createCascadeRequestScenario(state, speedDelay)
    stepControl.loadScenario('Cascade Request (Sequential)', cascadeRequestSteps)
  }

  // Scenario 3: Parallel requests
  const simulateParallelRequests = (): void => {
    const parallelRequestsSteps = createParallelRequestsScenario(state, speedDelay)
    stepControl.loadScenario('Parallel Requests (Concurrent)', parallelRequestsSteps)
  }

  // Scenario 4: Timeout/Error handling
  const simulateTimeout = (): void => {
    const timeoutSteps = createTimeoutScenario(state, speedDelay)
    stepControl.loadScenario('Timeout & Fallback Strategy', timeoutSteps)
  }

  return (
    <ArchitectureProvider dependencyMap={dependencyMap}>
      <div className="container">
        <div className="pattern-layout">
          <div className="pattern-sidebar">
            <div className="control-panel panel">
              <h3>🎮 Control Panel</h3>
              <div className="scenarios">
                <h4>Scenarios</h4>
                <div className="button-grid">
                  <div className="scenario-btn-wrapper">
                    <Button
                      onClick={simulateSimpleRequest}
                      variant="success"
                      className="scenario-btn"
                      aria-label="Simulate simple request-response scenario"
                    >
                      <span className="scenario-btn-content">
                        <span className="scenario-btn-label">✅ Simple Request</span>
                        <span className="scenario-desc">Basic request-response</span>
                      </span>
                    </Button>
                  </div>

                  <div className="scenario-btn-wrapper">
                    <Button
                      onClick={simulateCascadeRequest}
                      variant="info"
                      className="scenario-btn"
                      aria-label="Simulate cascade request with sequential service calls"
                    >
                      <span className="scenario-btn-content">
                        <span className="scenario-btn-label">🔗 Cascade Request</span>
                        <span className="scenario-desc">Sequential service calls</span>
                      </span>
                    </Button>
                  </div>

                  <div className="scenario-btn-wrapper">
                    <Button
                      onClick={simulateParallelRequests}
                      variant="warning"
                      className="scenario-btn"
                      aria-label="Simulate parallel concurrent requests"
                    >
                      <span className="scenario-btn-content">
                        <span className="scenario-btn-label">⚡ Parallel Requests</span>
                        <span className="scenario-desc">Concurrent calls (faster)</span>
                      </span>
                    </Button>
                  </div>

                  <div className="scenario-btn-wrapper">
                    <Button
                      onClick={simulateTimeout}
                      variant="error"
                      className="scenario-btn"
                      aria-label="Simulate timeout handling with fallback strategy"
                    >
                      <span className="scenario-btn-content">
                        <span className="scenario-btn-label">⏱️ Timeout Handling</span>
                        <span className="scenario-desc">Fallback on failure</span>
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
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
              {/* Dependency arrows removed for cleaner view - focus on service positioning */}
              {/*
              {REQUEST_RESPONSE_DEPENDENCIES.map((dep, index) => (
                <DependencyArrow
                  key={`${dep.from}-${dep.to}-${index}`}
                  from={POSITIONS[dep.from]}
                  to={POSITIONS[dep.to]}
                  type={dep.type}
                  label={dep.label}
                  fromServiceId={dep.from}
                  toServiceId={dep.to}
                  fromServiceType={dep.fromServiceType}
                  toServiceType={dep.toServiceType}
                />
              ))}
              */}

              <ServiceBox
                name="Client"
                type="client"
                position={POSITIONS.client}
                icon="👤"
                serviceId="client"
                tooltip={{
                  description: "Client application that initiates HTTP requests to services",
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
                  description: "Orchestrates requests to downstream services (Tags & User Service)",
                  metadata: [
                    { label: "Type", value: "REST API" },
                    { label: "Dependencies", value: "Tags, User Service" }
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
                  description: "Manages tags and categories for notes",
                  metadata: [
                    { label: "Type", value: "REST API" },
                    { label: "Database", value: "PostgreSQL" }
                  ]
                }}
              />

              <ServiceBox
                name="User Service"
                type="service"
                position={POSITIONS.userService}
                icon="👥"
                serviceId="userService"
                tooltip={{
                  description: "Provides user metadata and authentication information",
                  metadata: [
                    { label: "Type", value: "REST API" },
                    { label: "Database", value: "PostgreSQL" }
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
                  <span>HTTP Request/Response (Sync)</span>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>

      <InfoTabs
        cacheData={{}}
        queueMessages={[]}
        logs={state.logs}
        onClear={() => {
          state.clearLogs()
          state.setMessages([])
        }}
      />
    </ArchitectureProvider>
  )
}
