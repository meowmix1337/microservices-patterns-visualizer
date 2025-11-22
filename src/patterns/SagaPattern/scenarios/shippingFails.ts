import type { Step } from '../../../hooks/useStepByStep.d'
import type { UseSagaPatternStateReturn } from '../useSagaPatternState'
import type { Position } from '../../../constants/colors'
import type { MessageFlowData } from '../../../components/pattern/MessageFlow'

export function createShippingFailsScenario(
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
      explanation: "Step 1/4: Order Service creates the order successfully",
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
        await speedDelay(300)

        state.setOrderServiceStatus('processing')
        await speedDelay(200)
        state.setOrderServiceStatus('success')
        state.addLog('✅ Order Service: Order created (ORD-12345)', 'success')
        state.addTransactionLog({
          step: 1,
          action: 'Order Created (ORD-12345)',
          status: 'success'
        })

        const msgResp: MessageFlowData = {
          id: Date.now() + 1,
          from: 'order-service',
          to: 'orchestrator',
          type: 'http',
          label: '201 Created',
          path: [POSITIONS.orderService, POSITIONS.orchestrator],
          success: true
        }
        state.setMessages(prev => [...prev, msgResp])
        await speedDelay(500)
      }
    },
    {
      explanation: "Step 2/4: Payment Service processes payment successfully",
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
        await speedDelay(300)

        state.setPaymentServiceStatus('processing')
        await speedDelay(200)
        state.setPaymentServiceStatus('success')
        state.addLog('✅ Payment Service: Payment successful ($150.00)', 'success')
        state.addTransactionLog({
          step: 2,
          action: 'Payment Processed ($150.00)',
          status: 'success'
        })

        const msgResp: MessageFlowData = {
          id: Date.now() + 1,
          from: 'payment-service',
          to: 'orchestrator',
          type: 'http',
          label: '200 OK',
          path: [POSITIONS.paymentService, POSITIONS.orchestrator],
          success: true
        }
        state.setMessages(prev => [...prev, msgResp])
        await speedDelay(500)
      }
    },
    {
      explanation: "Step 3/4: Inventory Service reserves items successfully",
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
        await speedDelay(300)

        state.setInventoryServiceStatus('processing')
        await speedDelay(200)
        state.setInventoryServiceStatus('success')
        state.addLog('✅ Inventory Service: Items reserved (3 items)', 'success')
        state.addTransactionLog({
          step: 3,
          action: 'Inventory Reserved (3 items)',
          status: 'success'
        })

        const msgResp: MessageFlowData = {
          id: Date.now() + 1,
          from: 'inventory-service',
          to: 'orchestrator',
          type: 'http',
          label: '200 OK',
          path: [POSITIONS.inventoryService, POSITIONS.orchestrator],
          success: true
        }
        state.setMessages(prev => [...prev, msgResp])
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
      explanation: "Shipping Service fails! No delivery slots available",
      duration: 2000,
      action: async () => {
        state.setShippingServiceStatus('processing')
        state.addLog('Shipping Service: Checking delivery slots...', 'info')
        await speedDelay(300)

        state.setShippingServiceStatus('error')
        state.addLog('❌ Shipping Service: No delivery slots available', 'error')
        state.addTransactionLog({
          step: 4,
          action: 'Shipping Failed (No slots available)',
          status: 'error'
        })

        const msg: MessageFlowData = {
          id: Date.now() + 1,
          from: 'shipping-service',
          to: 'orchestrator',
          type: 'http',
          label: '503 Unavailable',
          path: [POSITIONS.shippingService, POSITIONS.orchestrator],
          success: false
        }
        state.setMessages(prev => [...prev, msg])
        await speedDelay(500)
      }
    },
    {
      explanation: "Orchestrator detects failure and initiates compensating transactions",
      duration: 2000,
      action: async () => {
        state.setSagaStatus(prev => ({
          ...prev,
          state: 'compensating',
          failedService: 'Shipping Service'
        }))
        state.setOrchestratorStatus('error')
        state.addLog('⏪ Saga Orchestrator: Shipping failed! Starting compensation...', 'warning')
        await speedDelay(500)
      }
    },
    {
      explanation: "Compensating Transaction 1: Release reserved inventory",
      duration: 2000,
      action: async () => {
        state.addLog('Orchestrator → Inventory Service: Release inventory (compensate)', 'warning')

        const msg: MessageFlowData = {
          id: Date.now(),
          from: 'orchestrator',
          to: 'inventory-service',
          type: 'http',
          label: 'Release Inventory',
          path: [POSITIONS.orchestrator, POSITIONS.inventoryService]
        }
        state.setMessages(prev => [...prev, msg])
        await speedDelay(500)
      }
    },
    {
      explanation: "Inventory Service releases the reserved items",
      duration: 2000,
      action: async () => {
        state.setInventoryServiceStatus('processing')
        state.addLog('Inventory Service: Releasing items...', 'warning')
        await speedDelay(300)

        state.setInventoryServiceStatus('idle')
        state.addLog('⏪ Inventory Service: Items released (Compensating)', 'warning')
        state.addTransactionLog({
          step: 3,
          action: 'Inventory Released (Compensating)',
          status: 'compensating',
          isCompensation: true
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
      explanation: "Compensating Transaction 2: Refund the payment",
      duration: 2000,
      action: async () => {
        state.addLog('Orchestrator → Payment Service: Refund payment (compensate)', 'warning')

        const msg: MessageFlowData = {
          id: Date.now(),
          from: 'orchestrator',
          to: 'payment-service',
          type: 'http',
          label: 'Refund Payment',
          path: [POSITIONS.orchestrator, POSITIONS.paymentService]
        }
        state.setMessages(prev => [...prev, msg])
        await speedDelay(500)
      }
    },
    {
      explanation: "Payment Service executes refund",
      duration: 2000,
      action: async () => {
        state.setPaymentServiceStatus('processing')
        state.addLog('Payment Service: Processing refund...', 'warning')
        await speedDelay(300)

        state.setPaymentServiceStatus('idle')
        state.addLog('⏪ Payment Service: Payment refunded ($150.00)', 'warning')
        state.addTransactionLog({
          step: 2,
          action: 'Payment Refunded (Compensating)',
          status: 'compensating',
          isCompensation: true
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
      explanation: "Compensating Transaction 3: Cancel the order",
      duration: 2000,
      action: async () => {
        state.addLog('Orchestrator → Order Service: Cancel order (compensate)', 'warning')

        const msg: MessageFlowData = {
          id: Date.now(),
          from: 'orchestrator',
          to: 'order-service',
          type: 'http',
          label: 'Cancel Order',
          path: [POSITIONS.orchestrator, POSITIONS.orderService]
        }
        state.setMessages(prev => [...prev, msg])
        await speedDelay(500)
      }
    },
    {
      explanation: "Order Service executes order cancellation",
      duration: 2000,
      action: async () => {
        state.setOrderServiceStatus('processing')
        state.addLog('Order Service: Cancelling order...', 'warning')
        await speedDelay(300)

        state.setOrderServiceStatus('idle')
        state.addLog('⏪ Order Service: Order cancelled (Compensating)', 'warning')
        state.addTransactionLog({
          step: 1,
          action: 'Order Cancelled (Compensating)',
          status: 'compensating',
          isCompensation: true
        })

        const msg: MessageFlowData = {
          id: Date.now() + 1,
          from: 'order-service',
          to: 'orchestrator',
          type: 'http',
          label: '200 OK',
          path: [POSITIONS.orderService, POSITIONS.orchestrator],
          success: true
        }
        state.setMessages(prev => [...prev, msg])
        await speedDelay(500)
      }
    },
    {
      explanation: "Saga failed and rolled back. All compensating transactions completed",
      duration: 2000,
      action: async () => {
        state.setSagaStatus(prev => ({ ...prev, state: 'failed' }))
        state.setOrchestratorStatus('error')
        state.setShippingServiceStatus('idle')
        state.addLog('❌ Saga Orchestrator: Transaction rolled back', 'error')
        state.addLog('━━━ Scenario Complete ━━━', 'info')
        await speedDelay(1000)
        state.setMessages([])
      }
    }
  ]
}
