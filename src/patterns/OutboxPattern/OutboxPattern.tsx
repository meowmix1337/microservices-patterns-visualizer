import ServiceBox from '../../components/pattern/ServiceBox'
import MessageFlow from '../../components/pattern/MessageFlow'
import { InfoTabs } from '../../components/viewers'
import { StepByStepControls } from '../../components/pattern'
import { Button } from '../../components/ui'
import { Select, type SelectOption } from '../../components/ui/Input'
import { useStepByStep } from '../../hooks/useStepByStep'
import { createSpeedDelay } from '../../utils/scenarioHelpers'
import { type Position, gridToPosition } from '../../constants/colors'
import { useOutboxPatternState, type KafkaStatus } from './useOutboxPatternState'
import { OUTBOX_DEPENDENCIES } from './dependencies'
import { ArchitectureProvider, buildDependencyMap } from '../../contexts/ArchitectureContext'
import { createHappyPathScenario, createKafkaDownScenario } from './scenarios'

export interface OutboxPatternProps {
  animationSpeed: number
}

// Position mapping for Outbox pattern using grid system
const POSITIONS: Record<string, Position> = {
  client: gridToPosition(0, 2),
  orderService: gridToPosition(4, 0),
  database: gridToPosition(4, 2),
  outboxPublisher: gridToPosition(4, 4),
  kafka: gridToPosition(7, 4),
  inventory: gridToPosition(9, 2)
}

export default function OutboxPattern({ animationSpeed }: OutboxPatternProps) {
  const state = useOutboxPatternState()

  // Build dependency map for hover highlights
  const dependencyMap = buildDependencyMap(OUTBOX_DEPENDENCIES)

  // Use the step-by-step hook
  const stepControl = useStepByStep({
    animationSpeed,
    onScenarioStart: (name: string) => {
      const newRunNumber = state.runCounter + 1
      state.setRunCounter(newRunNumber)
      state.clearLogs()
      state.clearOutboxEntries()
      state.setMessages([])
      state.addLog(`━━━ Run #${newRunNumber}: ${name} ━━━`, 'info')
    }
  })

  const speedDelay = createSpeedDelay(animationSpeed)

  // Kafka status options for the Select component
  const kafkaStatusOptions: SelectOption<KafkaStatus>[] = [
    { value: 'up', label: 'Online', icon: '✅' },
    { value: 'down', label: 'Offline', icon: '❌' }
  ]

  const handleKafkaStatusChange = (value: KafkaStatus): void => {
    state.setKafkaStatus(value)
  }

  const simulateHappyPath = (): void => {
    const happyPathSteps = createHappyPathScenario(state, speedDelay, POSITIONS)
    stepControl.loadScenario('Happy Path - Reliable Delivery', happyPathSteps)
  }

  const simulateKafkaDown = (): void => {
    const kafkaDownSteps = createKafkaDownScenario(state, speedDelay, POSITIONS)
    stepControl.loadScenario('Kafka Down - Resilience Demo', kafkaDownSteps)
  }

  const handleClearAll = () => {
    state.clearLogs()
    state.clearOutboxEntries()
    state.setMessages([])
  }

  return (
    <ArchitectureProvider dependencyMap={dependencyMap}>
      <div className="container">
        <div className="pattern-layout">
          <div className="pattern-sidebar">
            <div className="control-panel panel">
              <h3>📤 Outbox Pattern</h3>

              <div className="scenarios">
                <h4>Scenarios</h4>
                <div className="button-grid">
                  <Button onClick={simulateHappyPath} variant="success" size="medium">
                    ✅ Happy Path
                  </Button>
                  <Button onClick={simulateKafkaDown} variant="error" size="medium">
                    🛡️ Kafka Down
                  </Button>
                </div>
              </div>

              <div className="settings">
                <h4>Settings</h4>
                <div className="setting-item">
                  <Select
                    label="Kafka Status"
                    value={state.kafkaStatus}
                    onChange={handleKafkaStatusChange}
                    options={kafkaStatusOptions}
                    aria-label="Set Kafka message broker status"
                  />
                </div>
              </div>

              <div className="stats-section">
                <h4>Statistics</h4>
                <div className="stat-item">
                  <span className="stat-label">Orders Created:</span>
                  <span className="stat-value">{state.orderCount}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Outbox Entries:</span>
                  <span className="stat-value">{state.outboxEntries.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Published:</span>
                  <span className="stat-value">
                    {state.outboxEntries.filter(e => e.status === 'published').length}
                  </span>
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
              {/* Service boxes */}
              <ServiceBox
                position={POSITIONS.client}
                type="client"
                name="Client"
                icon="👤"
                serviceId="client"
                tooltip={{
                  description: "User application initiating order requests",
                  metadata: [
                    { label: "Type", value: "HTTP Client" },
                    { label: "Protocol", value: "REST" }
                  ]
                }}
              />
              <ServiceBox
                position={POSITIONS.orderService}
                type="service"
                name="Order Service"
                icon="📝"
                serviceId="orderService"
                tooltip={{
                  description: "Service handling order creation with transactional outbox pattern",
                  metadata: [
                    { label: "Type", value: "REST API" },
                    { label: "Pattern", value: "Transactional Outbox" },
                    { label: "Database", value: "Postgres/MySQL" }
                  ]
                }}
              />
              <ServiceBox
                position={POSITIONS.database}
                type="cache"
                name="Database"
                icon="💾"
                serviceId="database"
                details="Orders + Outbox"
                tooltip={{
                  description: "Stores orders and outbox events in a single atomic transaction",
                  metadata: [
                    { label: "Tables", value: "orders, outbox" },
                    { label: "Transaction", value: "ACID Compliant" },
                    { label: "Pattern", value: "Dual Write Prevention" }
                  ]
                }}
              />
              <ServiceBox
                position={POSITIONS.outboxPublisher}
                type="service"
                name="Outbox Publisher"
                icon="📤"
                serviceId="outboxPublisher"
                details="Background Process"
                tooltip={{
                  description: "Background process that polls outbox table and publishes events to Kafka",
                  metadata: [
                    { label: "Type", value: "Background Worker" },
                    { label: "Pattern", value: "Polling Publisher" },
                    { label: "Polling Interval", value: "1-5 seconds" }
                  ]
                }}
              />
              <ServiceBox
                position={POSITIONS.kafka}
                type="queue"
                name="Kafka"
                icon="📨"
                serviceId="kafka"
                status={state.kafkaStatus === 'down' ? 'down' : 'healthy'}
                tooltip={{
                  description: "Message broker for reliable event distribution across microservices",
                  metadata: [
                    { label: "Type", value: "Message Queue" },
                    { label: "Pattern", value: "Pub/Sub" },
                    { label: "Status", value: state.kafkaStatus === 'up' ? 'Online' : 'Offline' }
                  ]
                }}
              />
              <ServiceBox
                position={POSITIONS.inventory}
                type="service"
                name="Inventory"
                icon="📦"
                serviceId="inventory"
                tooltip={{
                  description: "Service that consumes order events and updates inventory",
                  metadata: [
                    { label: "Type", value: "Event Consumer" },
                    { label: "Event Source", value: "Kafka" },
                    { label: "Pattern", value: "Event-Driven" }
                  ]
                }}
              />

              {/* Message flows */}
              {state.messages.map((msg) => (
                <MessageFlow key={msg.id} message={msg} />
              ))}
            </div>

            {/* Info tabs */}
            <InfoTabs
              logs={state.logs}
              outboxEntries={state.outboxEntries}
              onClear={handleClearAll}
            />
          </div>
        </div>
      </div>
    </ArchitectureProvider>
  )
}
