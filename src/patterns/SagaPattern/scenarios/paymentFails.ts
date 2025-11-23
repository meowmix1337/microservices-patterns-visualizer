import type { Step } from '../../../hooks/useStepByStep.d'
import type { UseSagaPatternStateReturn } from '../useSagaPatternState'
import type { Position } from '../../../constants/colors'
import type { MessageFlowData } from '../../../components/pattern/MessageFlow'

export function createPaymentFailsScenario(
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
      explanation: "Payment Service fails! Insufficient funds detected",
      duration: 2000,
      action: async () => {
        state.setPaymentServiceStatus('processing')
        state.addLog('Payment Service: Processing payment...', 'info')
        await speedDelay(300)

        state.setPaymentServiceStatus('error')
        state.addLog('❌ Payment Service: Payment failed - Insufficient funds', 'error')
        state.addTransactionLog({
          step: 2,
          action: 'Payment Failed (Insufficient funds)',
          status: 'error'
        })

        const msg: MessageFlowData = {
          id: Date.now() + 1,
          from: 'payment-service',
          to: 'orchestrator',
          type: 'http',
          label: '402 Payment Required',
          path: [POSITIONS.paymentService, POSITIONS.orchestrator],
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
          failedService: 'Payment Service'
        }))
        state.setOrchestratorStatus('error')
        state.addLog('⏪ Saga Orchestrator: Payment failed! Starting compensation...', 'warning')
        await speedDelay(500)
      }
    },
    {
      explanation: "Compensating Transaction 1: Cancel the order that was created",
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
      explanation: "Order Service executes compensating action - cancels the order",
      duration: 2000,
      action: async () => {
        state.setOrderServiceStatus('processing')
        state.addLog('Order Service: Cancelling order ORD-12345...', 'warning')
        await speedDelay(300)

        state.setOrderServiceStatus('idle')
        state.addLog('⏪ Order Service: Order cancelled (compensated)', 'warning')
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
        state.setPaymentServiceStatus('idle')
        state.addLog('❌ Saga Orchestrator: Transaction rolled back', 'error')
        state.addLog('━━━ Scenario Complete ━━━', 'info')
        await speedDelay(1000)
        state.setMessages([])
      }
    }
  ]
}
