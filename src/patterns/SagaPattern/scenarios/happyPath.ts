import type { Step } from '../../../hooks/useStepByStep.d'
import type { UseSagaPatternStateReturn } from '../useSagaPatternState'
import type { Position } from '../../../constants/colors'
import type { MessageFlowData } from '../../../components/pattern/MessageFlow'

export function createHappyPathScenario(
  state: UseSagaPatternStateReturn,
  speedDelay: (ms: number) => Promise<void>,
  positions: Record<string, Position>
): Step[] {
  const POSITIONS = positions

  return [
    {
      explanation: "Saga Orchestrator initiates the order saga workflow",
      duration: 2000,
      action: async () => {
        state.setSagaStatus({
          currentStep: 0,
          totalSteps: 4,
          state: 'in-progress'
        })
        state.setOrchestratorStatus('processing')
        state.addLog('🔀 Saga Orchestrator: Starting order saga...', 'info')
        await speedDelay(500)
      }
    },
    {
      explanation: "Step 1/4: Orchestrator requests Order Service to create the order",
      duration: 2000,
      action: async () => {
        state.setSagaStatus(prev => ({ ...prev, currentStep: 1 }))
        state.addLog('Orchestrator → Order Service: Create order', 'request')

        const msg: MessageFlowData = {
          id: Date.now(),
          from: 'orchestrator',
          to: 'order-service',
          type: 'http',
          label: 'Create Order',
          path: [POSITIONS.orchestrator, POSITIONS.orderService]
        }
        state.setMessages([msg])
        await speedDelay(500)
      }
    },
    {
      explanation: "Order Service creates the order successfully",
      duration: 2000,
      action: async () => {
        state.setOrderServiceStatus('processing')
        state.addLog('Order Service: Creating order ORD-12345...', 'info')
        await speedDelay(300)

        state.setOrderServiceStatus('success')
        state.addLog('✅ Order Service: Order created successfully', 'success')
        state.addTransactionLog({
          step: 1,
          action: 'Order Created (ORD-12345)',
          status: 'success'
        })

        const msg: MessageFlowData = {
          id: Date.now() + 1,
          from: 'order-service',
          to: 'orchestrator',
          type: 'http',
          label: '201 Created',
          path: [POSITIONS.orderService, POSITIONS.orchestrator],
          success: true
        }
        state.setMessages(prev => [...prev, msg])
        await speedDelay(500)
      }
    },
    {
      explanation: "Step 2/4: Orchestrator requests Payment Service to process payment",
      duration: 2000,
      action: async () => {
        state.setSagaStatus(prev => ({ ...prev, currentStep: 2 }))
        state.addLog('Orchestrator → Payment Service: Process payment', 'request')

        const msg: MessageFlowData = {
          id: Date.now(),
          from: 'orchestrator',
          to: 'payment-service',
          type: 'http',
          label: 'Process Payment',
          path: [POSITIONS.orchestrator, POSITIONS.paymentService]
        }
        state.setMessages(prev => [...prev, msg])
        await speedDelay(500)
      }
    },
    {
      explanation: "Payment Service processes the payment successfully",
      duration: 2000,
      action: async () => {
        state.setPaymentServiceStatus('processing')
        state.addLog('Payment Service: Processing payment $150.00...', 'info')
        await speedDelay(300)

        state.setPaymentServiceStatus('success')
        state.addLog('✅ Payment Service: Payment successful (TXN-98765)', 'success')
        state.addTransactionLog({
          step: 2,
          action: 'Payment Processed ($150.00)',
          status: 'success'
        })

        const msg: MessageFlowData = {
          id: Date.now() + 1,
          from: 'payment-service',
          to: 'orchestrator',
          type: 'http',
          label: '200 OK',
          path: [POSITIONS.paymentService, POSITIONS.orchestrator],
          success: true
        }
        state.setMessages(prev => [...prev, msg])
        await speedDelay(500)
      }
    },
    {
      explanation: "Step 3/4: Orchestrator requests Inventory Service to reserve items",
      duration: 2000,
      action: async () => {
        state.setSagaStatus(prev => ({ ...prev, currentStep: 3 }))
        state.addLog('Orchestrator → Inventory Service: Reserve inventory', 'request')

        const msg: MessageFlowData = {
          id: Date.now(),
          from: 'orchestrator',
          to: 'inventory-service',
          type: 'http',
          label: 'Reserve Inventory',
          path: [POSITIONS.orchestrator, POSITIONS.inventoryService]
        }
        state.setMessages(prev => [...prev, msg])
        await speedDelay(500)
      }
    },
    {
      explanation: "Inventory Service reserves the items successfully",
      duration: 2000,
      action: async () => {
        state.setInventoryServiceStatus('processing')
        state.addLog('Inventory Service: Reserving 3 items...', 'info')
        await speedDelay(300)

        state.setInventoryServiceStatus('success')
        state.addLog('✅ Inventory Service: Items reserved', 'success')
        state.addTransactionLog({
          step: 3,
          action: 'Inventory Reserved (3 items)',
          status: 'success'
        })

        const msg: MessageFlowData = {
          id: Date.now() + 1,
          from: 'inventory-service',
          to: 'orchestrator',
          type: 'http',
          label: '200 OK',
          path: [POSITIONS.inventoryService, POSITIONS.orchestrator],
          success: true
        }
        state.setMessages(prev => [...prev, msg])
        await speedDelay(500)
      }
    },
    {
      explanation: "Step 4/4: Orchestrator requests Shipping Service to arrange delivery",
      duration: 2000,
      action: async () => {
        state.setSagaStatus(prev => ({ ...prev, currentStep: 4 }))
        state.addLog('Orchestrator → Shipping Service: Arrange delivery', 'request')

        const msg: MessageFlowData = {
          id: Date.now(),
          from: 'orchestrator',
          to: 'shipping-service',
          type: 'http',
          label: 'Arrange Shipping',
          path: [POSITIONS.orchestrator, POSITIONS.shippingService]
        }
        state.setMessages(prev => [...prev, msg])
        await speedDelay(500)
      }
    },
    {
      explanation: "Shipping Service arranges delivery successfully",
      duration: 2000,
      action: async () => {
        state.setShippingServiceStatus('processing')
        state.addLog('Shipping Service: Scheduling delivery...', 'info')
        await speedDelay(300)

        state.setShippingServiceStatus('success')
        state.addLog('✅ Shipping Service: Delivery scheduled', 'success')
        state.addTransactionLog({
          step: 4,
          action: 'Shipping Arranged (Delivery: 2 days)',
          status: 'success'
        })

        const msg: MessageFlowData = {
          id: Date.now() + 1,
          from: 'shipping-service',
          to: 'orchestrator',
          type: 'http',
          label: '200 OK',
          path: [POSITIONS.shippingService, POSITIONS.orchestrator],
          success: true
        }
        state.setMessages(prev => [...prev, msg])
        await speedDelay(500)
      }
    },
    {
      explanation: "Saga completed successfully! All steps executed without errors",
      duration: 2000,
      action: async () => {
        state.setSagaStatus(prev => ({ ...prev, state: 'completed' }))
        state.setOrchestratorStatus('success')
        state.addLog('✅ Saga Orchestrator: Transaction committed successfully!', 'success')
        state.addLog('━━━ Scenario Complete ━━━', 'info')
        await speedDelay(1000)
        state.setMessages([])
      }
    }
  ]
}
