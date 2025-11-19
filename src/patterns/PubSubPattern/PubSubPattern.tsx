import { AnimatePresence } from 'framer-motion'
import ServiceBox from '../../components/pattern/ServiceBox'
import MessageFlow from '../../components/pattern/MessageFlow'
import { StepByStepControls } from '../../components/pattern'
import { TopicViewer, InfoTabs } from '../../components/viewers'
import Button from '../../components/ui/Button'
import { useStepByStep } from '../../hooks/useStepByStep'
import { createSpeedDelay } from '../../utils/scenarioHelpers'
import { type Position, gridToPosition } from '../../constants/colors'
import { usePubSubPatternState } from './usePubSubPatternState'
import { PUBSUB_DEPENDENCIES } from './dependencies'
import { ArchitectureProvider, buildDependencyMap } from '../../contexts/ArchitectureContext'
import {
  createHappyPathScenario,
  createTopicFilteringScenario,
  createSubscriberDownScenario
} from './scenarios'

export interface PubSubPatternProps {
  animationSpeed: number
}

// Position mapping for PubSub pattern using grid system
const POSITIONS: Record<string, Position> = {
  orderService: gridToPosition(2, 1),      // Top left publisher
  inventoryService: gridToPosition(9, 1),  // Top right publisher
  broker: gridToPosition(5, 3),            // Center - message broker
  emailService: gridToPosition(1, 5),      // Bottom left subscriber
  analyticsService: gridToPosition(5, 5),  // Bottom center subscriber
  notificationService: gridToPosition(9, 5) // Bottom right subscriber
}

export default function PubSubPattern({ animationSpeed }: PubSubPatternProps) {
  const state = usePubSubPatternState()

  // Build dependency map for hover highlights
  const dependencyMap = buildDependencyMap(PUBSUB_DEPENDENCIES)

  // Use the step-by-step hook
  const stepControl = useStepByStep({
    animationSpeed,
    onScenarioStart: (name: string) => {
      const newRunNumber = state.runCounter + 1
      state.setRunCounter(newRunNumber)
      state.clearLogs()
      state.clearTopicMessages()
      state.setMessages([])

      // Reset topic message counts
      state.setTopics(prev => {
        const updated = { ...prev }
        Object.keys(updated).forEach(key => {
          updated[key] = { ...updated[key], messageCount: 0 }
        })
        return updated
      })

      // Reset service statuses
      state.setEmailServiceStatus('healthy')
      state.setAnalyticsServiceStatus('healthy')
      state.setNotificationServiceStatus('healthy')

      state.addLog(`━━━ Run #${newRunNumber}: ${name} ━━━`, 'info')
    }
  })

  const speedDelay = createSpeedDelay(animationSpeed)

  // Scenario functions
  const simulateHappyPath = (): void => {
    const steps = createHappyPathScenario(state, speedDelay, POSITIONS)
    stepControl.loadScenario('Happy Path: Fan-out Messaging', steps)
  }

  const simulateTopicFiltering = (): void => {
    const steps = createTopicFilteringScenario(state, speedDelay, POSITIONS)
    stepControl.loadScenario('Topic Filtering: Selective Delivery', steps)
  }

  const simulateSubscriberDown = (): void => {
    const steps = createSubscriberDownScenario(state, speedDelay, POSITIONS)
    stepControl.loadScenario('Resilience: Subscriber Down', steps)
  }

  return (
    <ArchitectureProvider dependencyMap={dependencyMap}>
      <div className="container">
        <div className="pattern-layout">
          <div className="pattern-sidebar">
            {/* Scenario Controls */}
            <div className="control-panel panel">
              <h3>🎮 Control Panel</h3>

              <div className="scenarios">
                <h4>Scenarios</h4>
                <div className="button-grid">
                  <div className="scenario-btn-wrapper">
                    <Button
                      onClick={simulateHappyPath}
                      variant="success"
                      className="scenario-btn"
                      aria-label="Simulate happy path with fan-out messaging"
                    >
                      <span className="scenario-btn-content">
                        <span className="scenario-btn-label">📬 Happy Path</span>
                        <span className="scenario-desc">Fan-out to 3 subscribers</span>
                      </span>
                    </Button>
                  </div>

                  <div className="scenario-btn-wrapper">
                    <Button
                      onClick={simulateTopicFiltering}
                      variant="info"
                      className="scenario-btn"
                      aria-label="Simulate topic filtering with selective delivery"
                    >
                      <span className="scenario-btn-content">
                        <span className="scenario-btn-label">🎯 Topic Filtering</span>
                        <span className="scenario-desc">Selective delivery</span>
                      </span>
                    </Button>
                  </div>

                  <div className="scenario-btn-wrapper">
                    <Button
                      onClick={simulateSubscriberDown}
                      variant="error"
                      className="scenario-btn"
                      aria-label="Simulate subscriber down with graceful degradation"
                    >
                      <span className="scenario-btn-content">
                        <span className="scenario-btn-label">⚠️ Subscriber Down</span>
                        <span className="scenario-desc">Resilience testing</span>
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Topic Viewer */}
            <TopicViewer
              topics={state.topics}
              recentMessages={state.topicMessages}
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
              {/* Publishers */}
              <ServiceBox
                name="Order Service"
                type="service"
                position={POSITIONS.orderService}
                icon="📦"
                serviceId="orderService"
                tooltip={{
                  description: "Publishes order events to the 'orders' topic when orders are created or updated"
                }}
              />

              <ServiceBox
                name="Inventory Service"
                type="service"
                position={POSITIONS.inventoryService}
                icon="📊"
                serviceId="inventoryService"
                tooltip={{
                  description: "Publishes inventory events to the 'inventory' topic when stock levels change"
                }}
              />

              {/* Message Broker */}
              <ServiceBox
                name="Message Broker"
                type="queue"
                position={POSITIONS.broker}
                icon="🔀"
                serviceId="broker"
                tooltip={{
                  description: "Manages topics and routes messages to all subscribers of each topic",
                  metadata: [
                    { label: "Type", value: "Pub/Sub Broker" },
                    { label: "Topics", value: "orders, inventory" },
                    { label: "Pattern", value: "Fan-out" }
                  ]
                }}
              />

              {/* Subscribers */}
              <ServiceBox
                name="Email Service"
                type="service"
                position={POSITIONS.emailService}
                icon="📧"
                status={state.emailServiceStatus}
                serviceId="emailService"
                tooltip={{
                  description: "Subscribes to 'orders' topic to send confirmation emails when orders are created",
                  metadata: [
                    { label: "Subscribed to", value: "orders" },
                    { label: "Status", value: state.emailServiceStatus === 'healthy' ? 'Healthy' : 'Down' }
                  ]
                }}
              />

              <ServiceBox
                name="Analytics Service"
                type="service"
                position={POSITIONS.analyticsService}
                icon="📈"
                status={state.analyticsServiceStatus}
                serviceId="analyticsService"
                tooltip={{
                  description: "Subscribes to all topics to collect metrics and analyze business data",
                  metadata: [
                    { label: "Subscribed to", value: "orders, inventory" },
                    { label: "Status", value: state.analyticsServiceStatus === 'healthy' ? 'Healthy' : 'Down' }
                  ]
                }}
              />

              <ServiceBox
                name="Notification Service"
                type="service"
                position={POSITIONS.notificationService}
                icon="🔔"
                status={state.notificationServiceStatus}
                serviceId="notificationService"
                tooltip={{
                  description: "Subscribes to 'orders' topic to send push notifications about order updates",
                  metadata: [
                    { label: "Subscribed to", value: "orders" },
                    { label: "Status", value: state.notificationServiceStatus === 'healthy' ? 'Healthy' : 'Down' }
                  ]
                }}
              />

              {/* Message Flows */}
              <AnimatePresence>
                {state.messages.map((message) => (
                  <MessageFlow key={message.id} message={message} />
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <InfoTabs
        logs={state.logs}
        onClear={() => {
          state.clearLogs()
          state.clearTopicMessages()
          state.setMessages([])
        }}
      />
    </ArchitectureProvider>
  )
}
