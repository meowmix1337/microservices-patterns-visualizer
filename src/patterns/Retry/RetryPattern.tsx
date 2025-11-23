import { AnimatePresence } from 'framer-motion'
import ServiceBox from '../../components/pattern/ServiceBox'
import MessageFlow from '../../components/pattern/MessageFlow'
import { InfoTabs } from '../../components/viewers'
import { StepByStepControls } from '../../components/pattern'
import Button from '../../components/ui/Button'
import { useStepByStep } from '../../hooks/useStepByStep'
import { useRetryState } from './useRetryState'
import { RETRY_DEPENDENCIES } from './dependencies'
import { ArchitectureProvider, buildDependencyMap } from '../../contexts/ArchitectureContext'
import { type Position, gridToPosition } from '../../constants/colors'
import {
  createNormalRequestScenario,
  createTransientFailureScenario,
  createPersistentFailureScenario
} from './scenarios'

export interface RetryPatternProps {
  animationSpeed: number
}

const POSITIONS: Record<string, Position> = {
  client: gridToPosition(2, 4),
  service: gridToPosition(6, 4)
}

export default function RetryPattern({ animationSpeed }: RetryPatternProps) {
  const state = useRetryState()
  const dependencyMap = buildDependencyMap(RETRY_DEPENDENCIES)

  const stepControl = useStepByStep({
    animationSpeed,
    onScenarioStart: (name: string) => {
      const newRunNumber = state.runCounter + 1
      state.setRunCounter(newRunNumber)
      state.addLog(`━━━ Run #${newRunNumber}: ${name} ━━━`, 'info')
    }
  })

  const simulateNormalRequest = () => {
    const steps = createNormalRequestScenario(state)
    stepControl.loadScenario('Normal Request', steps)
  }

  const simulateTransientFailure = () => {
    const steps = createTransientFailureScenario(state)
    stepControl.loadScenario('Transient Failure', steps)
  }

  const simulatePersistentFailure = () => {
    const steps = createPersistentFailureScenario(state)
    stepControl.loadScenario('Persistent Failure', steps)
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
                <h4 style={{ marginTop: 0 }}>Retry Status</h4>
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                    fontWeight: 'bold',
                    color: state.status === 'SUCCESS' ? 'var(--success)' : 
                           state.status === 'FAILED' ? 'var(--error)' : 
                           state.status === 'WAITING' ? 'var(--warning)' : 'var(--text-primary)'
                }}>
                    <span style={{ fontSize: '1.5rem' }}>
                        {state.status === 'SUCCESS' ? '✅' : 
                         state.status === 'FAILED' ? '❌' : 
                         state.status === 'WAITING' ? '⏳' : 
                         state.status === 'ATTEMPTING' ? '🔄' : '⚪'}
                    </span>
                    {state.status}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Attempt: {state.attemptCount} / {state.maxRetries}
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
                    >
                      <span className="scenario-btn-content">
                        <span className="scenario-btn-label">✅ Success</span>
                        <span className="scenario-desc">Normal Request</span>
                      </span>
                    </Button>
                  </div>

                  <div className="scenario-btn-wrapper">
                    <Button
                      onClick={simulateTransientFailure}
                      variant="warning"
                      className="scenario-btn"
                    >
                      <span className="scenario-btn-content">
                        <span className="scenario-btn-label">⚠️ Transient</span>
                        <span className="scenario-desc">Succeeds after retry</span>
                      </span>
                    </Button>
                  </div>

                  <div className="scenario-btn-wrapper">
                    <Button
                      onClick={simulatePersistentFailure}
                      variant="error"
                      className="scenario-btn"
                    >
                      <span className="scenario-btn-content">
                        <span className="scenario-btn-label">❌ Persistent</span>
                        <span className="scenario-desc">Fails after max retries</span>
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
                name="Service"
                type="service"
                position={POSITIONS.service}
                icon="⚙️"
                serviceId="service"
                status={state.status === 'FAILED' ? 'down' : 'healthy'}
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
