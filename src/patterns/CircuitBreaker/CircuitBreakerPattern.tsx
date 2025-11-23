import { AnimatePresence } from 'framer-motion'
import ServiceBox from '../../components/pattern/ServiceBox'
import MessageFlow from '../../components/pattern/MessageFlow'
import { InfoTabs } from '../../components/viewers'
import { StepByStepControls } from '../../components/pattern'
import Button from '../../components/ui/Button'
import { useStepByStep } from '../../hooks/useStepByStep'
import { createSpeedDelay } from '../../utils/scenarioHelpers'
import { useCircuitBreakerState } from './useCircuitBreakerState'
import { CIRCUIT_BREAKER_DEPENDENCIES } from './dependencies'
import { ArchitectureProvider, buildDependencyMap } from '../../contexts/ArchitectureContext'
import { type Position, gridToPosition } from '../../constants/colors'
import {
  createNormalRequestScenario,
  createFailureScenario,
  createOpenCircuitScenario,
  createRecoveryScenario
} from './scenarios'

export interface CircuitBreakerPatternProps {
  animationSpeed: number
}

const POSITIONS: Record<string, Position> = {
  client: gridToPosition(1, 2),
  apiGateway: gridToPosition(4, 2),
  service: gridToPosition(7, 2)
}

export default function CircuitBreakerPattern({ animationSpeed }: CircuitBreakerPatternProps) {
  const state = useCircuitBreakerState()
  const dependencyMap = buildDependencyMap(CIRCUIT_BREAKER_DEPENDENCIES)

  const stepControl = useStepByStep({
    animationSpeed,
    onScenarioStart: (name: string) => {
      const newRunNumber = state.runCounter + 1
      state.setRunCounter(newRunNumber)
      state.addLog(`━━━ Run #${newRunNumber}: ${name} ━━━`, 'info')
    }
  })

  const speedDelay = createSpeedDelay(animationSpeed)

  const simulateNormalRequest = () => {
    if (state.status === 'OPEN') {
        state.addLog('Cannot start Normal Request: Circuit is OPEN', 'error')
        return
    }
    const steps = createNormalRequestScenario(state)
    stepControl.loadScenario('Normal Request', steps)
  }

  const simulateFailure = () => {
    if (state.status === 'OPEN') {
        state.addLog('Cannot start Failure Request: Circuit is OPEN', 'error')
        return
    }
    const steps = createFailureScenario(state)
    stepControl.loadScenario('Failed Request', steps)
  }

  const simulateRequestWhenOpen = () => {
     if (state.status !== 'OPEN') {
        state.addLog('Circuit is not OPEN. Simulating normal request instead.', 'warning')
        // We could just run the normal request, but let's be strict for the demo
     }
     const steps = createOpenCircuitScenario(state)
     stepControl.loadScenario('Request (Circuit Open)', steps)
  }

  const simulateRecovery = () => {
      if (state.status !== 'OPEN') {
          state.addLog('Circuit is not OPEN. No recovery needed.', 'info')
          return
      }
      const steps = createRecoveryScenario(state)
      stepControl.loadScenario('Circuit Recovery', steps)
  }

  return (
    <ArchitectureProvider dependencyMap={dependencyMap}>
      <div className="container">
        <div className="pattern-layout">
          <div className="pattern-sidebar">
            <div className="control-panel panel">
              <h3>🎮 Control Panel</h3>
              
              <div className="status-card" style={{ 
                  padding: '1rem', 
                  marginBottom: '1rem', 
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)'
              }}>
                <h4 style={{ marginTop: 0 }}>Circuit Status</h4>
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                    fontWeight: 'bold',
                    color: state.status === 'CLOSED' ? 'var(--success)' : 
                           state.status === 'OPEN' ? 'var(--error)' : 'var(--warning)'
                }}>
                    <span style={{ fontSize: '1.5rem' }}>
                        {state.status === 'CLOSED' ? '🟢' : state.status === 'OPEN' ? '🔴' : '🟡'}
                    </span>
                    {state.status}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Failures: {state.failureCount} / {state.failureThreshold}
                </div>
              </div>

              <div className="scenarios">
                <h4>Scenarios</h4>
                <div className="button-grid">
                  <div className="scenario-btn-wrapper">
                    <Button
                      onClick={simulateNormalRequest}
                      variant="success"
                      className="scenario-btn"
                      disabled={state.status === 'OPEN'}
                    >
                      <span className="scenario-btn-content">
                        <span className="scenario-btn-label">✅ Success</span>
                        <span className="scenario-desc">Successful request</span>
                      </span>
                    </Button>
                  </div>

                  <div className="scenario-btn-wrapper">
                    <Button
                      onClick={simulateFailure}
                      variant="error"
                      className="scenario-btn"
                      disabled={state.status === 'OPEN'}
                    >
                      <span className="scenario-btn-content">
                        <span className="scenario-btn-label">❌ Failure</span>
                        <span className="scenario-desc">Simulate error</span>
                      </span>
                    </Button>
                  </div>

                  <div className="scenario-btn-wrapper">
                    <Button
                      onClick={simulateRequestWhenOpen}
                      variant="warning"
                      className="scenario-btn"
                      disabled={state.status !== 'OPEN'}
                    >
                      <span className="scenario-btn-content">
                        <span className="scenario-btn-label">🚫 Blocked</span>
                        <span className="scenario-desc">Request when Open</span>
                      </span>
                    </Button>
                  </div>

                  <div className="scenario-btn-wrapper">
                    <Button
                      onClick={simulateRecovery}
                      variant="info"
                      className="scenario-btn"
                      disabled={state.status !== 'OPEN'}
                    >
                      <span className="scenario-btn-content">
                        <span className="scenario-btn-label">🔄 Recover</span>
                        <span className="scenario-desc">Wait for timeout</span>
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
              <ServiceBox
                name="Client"
                type="client"
                position={POSITIONS.client}
                icon="👤"
                serviceId="client"
              />

              <ServiceBox
                name="API Gateway"
                type="gateway"
                position={POSITIONS.apiGateway}
                icon="🛡️"
                serviceId="apiGateway"
                status={state.status === 'OPEN' ? 'down' : state.status === 'HALF_OPEN' ? 'warning' : 'healthy'}
                tooltip={{
                    description: "Implements Circuit Breaker pattern",
                    metadata: [
                        { label: "State", value: state.status },
                        { label: "Failures", value: `${state.failureCount}/${state.failureThreshold}` }
                    ]
                }}
              />

              <ServiceBox
                name="Service"
                type="service"
                position={POSITIONS.service}
                icon="⚙️"
                serviceId="service"
              />

              <AnimatePresence>
                {state.messages.map(msg => (
                  <MessageFlow key={msg.id} message={msg} />
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <InfoTabs
        logs={state.logs}
        onClear={state.clearLogs}
      />
    </ArchitectureProvider>
  )
}
