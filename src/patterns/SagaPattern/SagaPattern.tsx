import ServiceBox from '../../components/pattern/ServiceBox'
import MessageFlow from '../../components/pattern/MessageFlow'
import { InfoTabs } from '../../components/viewers'
import { StepByStepControls } from '../../components/pattern'
import { Button } from '../../components/ui'
import { useStepByStep } from '../../hooks/useStepByStep'
import { createSpeedDelay } from '../../utils/scenarioHelpers'
import { type Position, gridToPosition } from '../../constants/colors'
import { useSagaPatternState } from './useSagaPatternState'
import { SAGA_DEPENDENCIES } from './dependencies'
import { ArchitectureProvider, buildDependencyMap } from '../../contexts/ArchitectureContext'
import {
  createHappyPathScenario,
  createPaymentFailsScenario,
  createInventoryFailsScenario,
  createShippingFailsScenario
} from './scenarios'
import { AnimatePresence } from 'framer-motion'

export interface SagaPatternProps {
  animationSpeed: number
}

// Position mapping for Saga pattern using grid system (12 cols × 8 rows)
const POSITIONS: Record<string, Position> = {
  orderService: gridToPosition(2, 1),
  paymentService: gridToPosition(2, 4),
  inventoryService: gridToPosition(10, 4),
  shippingService: gridToPosition(10, 1),
  orchestrator: gridToPosition(6, 2.5)
}

export default function SagaPattern({ animationSpeed }: SagaPatternProps) {
  const state = useSagaPatternState()

  // Build dependency map for hover highlights
  const dependencyMap = buildDependencyMap(SAGA_DEPENDENCIES)

  // Use the step-by-step hook
  const stepControl = useStepByStep({
    animationSpeed,
    onScenarioStart: (name: string) => {
      const newRunNumber = state.runCounter + 1
      state.setRunCounter(newRunNumber)
      state.clearLogs()
      state.clearTransactionLog()
      state.setMessages([])
      state.resetServiceStatuses()
      state.setSagaStatus({
        currentStep: 0,
        totalSteps: 0,
        state: 'idle'
      })
      state.addLog(`━━━ Run #${newRunNumber}: ${name} ━━━`, 'info')
    }
  })

  const speedDelay = createSpeedDelay(animationSpeed)

  const simulateHappyPath = (): void => {
    const happyPathSteps = createHappyPathScenario(state, speedDelay, POSITIONS)
    stepControl.loadScenario('Happy Path - All Steps Succeed', happyPathSteps)
  }

  const simulatePaymentFails = (): void => {
    const paymentFailsSteps = createPaymentFailsScenario(state, speedDelay, POSITIONS)
    stepControl.loadScenario('Payment Fails - Compensate Order', paymentFailsSteps)
  }

  const simulateInventoryFails = (): void => {
    const inventoryFailsSteps = createInventoryFailsScenario(state, speedDelay, POSITIONS)
    stepControl.loadScenario('Inventory Fails - Compensate Payment & Order', inventoryFailsSteps)
  }

  const simulateShippingFails = (): void => {
    const shippingFailsSteps = createShippingFailsScenario(state, speedDelay, POSITIONS)
    stepControl.loadScenario('Shipping Fails - Full Rollback', shippingFailsSteps)
  }

  const handleClearAll = () => {
    state.clearLogs()
    state.clearTransactionLog()
    state.setMessages([])
  }

  return (
    <ArchitectureProvider dependencyMap={dependencyMap}>
      <div className="container">
        <div className="pattern-layout">
          <div className="pattern-sidebar">
            <div className="control-panel panel">
              <h3>🔀 Saga Pattern</h3>

              <div className="scenarios">
                <h4>Scenarios</h4>
                <div className="button-grid">
                  <Button onClick={simulateHappyPath} variant="success" size="medium">
                    ✅ Happy Path
                  </Button>
                  <Button onClick={simulatePaymentFails} variant="error" size="medium">
                    💳 Payment Fails
                  </Button>
                  <Button onClick={simulateInventoryFails} variant="error" size="medium">
                    📦 Inventory Fails
                  </Button>
                  <Button onClick={simulateShippingFails} variant="error" size="medium">
                    🚚 Shipping Fails
                  </Button>
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
                position={POSITIONS.orderService}
                type="service"
                name="Order Service"
                icon="📝"
                serviceId="orderService"
                status={state.orderServiceStatus === 'error' ? 'error' : state.orderServiceStatus === 'processing' ? 'processing' : 'healthy'}
                tooltip={{
                  description: "Creates and manages order lifecycle",
                  metadata: [
                    { label: "Type", value: "REST API" },
                    { label: "Responsibility", value: "Order Management" },
                    { label: "Compensation", value: "Cancel Order" }
                  ]
                }}
              />
              <ServiceBox
                position={POSITIONS.paymentService}
                type="service"
                name="Payment Service"
                icon="💳"
                serviceId="paymentService"
                status={state.paymentServiceStatus === 'error' ? 'down' : 'healthy'}
                tooltip={{
                  description: "Processes payments and handles refunds",
                  metadata: [
                    { label: "Type", value: "Payment Gateway" },
                    { label: "Responsibility", value: "Payment Processing" },
                    { label: "Compensation", value: "Refund Payment" }
                  ]
                }}
              />
              <ServiceBox
                position={POSITIONS.inventoryService}
                type="service"
                name="Inventory Service"
                icon="📦"
                serviceId="inventoryService"
                status={state.inventoryServiceStatus === 'error' ? 'down' : 'healthy'}
                tooltip={{
                  description: "Reserves and releases inventory",
                  metadata: [
                    { label: "Type", value: "REST API" },
                    { label: "Responsibility", value: "Inventory Management" },
                    { label: "Compensation", value: "Release Items" }
                  ]
                }}
              />
              <ServiceBox
                position={POSITIONS.shippingService}
                type="service"
                name="Shipping Service"
                icon="🚚"
                serviceId="shippingService"
                status={state.shippingServiceStatus === 'error' ? 'down' : 'healthy'}
                tooltip={{
                  description: "Arranges shipping and handles cancellations",
                  metadata: [
                    { label: "Type", value: "Shipping Provider" },
                    { label: "Responsibility", value: "Delivery Scheduling" },
                    { label: "Compensation", value: "Cancel Shipment" }
                  ]
                }}
              />
              <ServiceBox
                position={POSITIONS.orchestrator}
                type="service"
                name="Saga Orchestrator"
                icon="🔀"
                serviceId="orchestrator"
                status={state.orchestratorStatus === 'error' ? 'down' : 'healthy'}
                tooltip={{
                  description: "Coordinates the saga workflow and manages compensating transactions",
                  metadata: [
                    { label: "Type", value: "Orchestration Service" },
                    { label: "Pattern", value: "Saga Orchestrator" },
                    { label: "Responsibility", value: "Transaction Coordination" }
                  ]
                }}
              />

              {/* Message flows */}
              {state.messages.map((msg) => (
                <MessageFlow key={msg.id} message={msg} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <InfoTabs
        logs={state.logs}
        onClear={handleClearAll}
      />
    </ArchitectureProvider>
  )
}
