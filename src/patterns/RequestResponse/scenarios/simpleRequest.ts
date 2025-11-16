import type { Step } from '../../../hooks/useStepByStep.d'
import type { UseRequestResponseStateReturn } from '../useRequestResponseState'
import type { MessageFlowData } from '../../../components/pattern/MessageFlow'

export function createSimpleRequestScenario(
  state: UseRequestResponseStateReturn,
  speedDelay: (ms: number) => Promise<void>
): Step[] {
  return [
    {
      explanation: "Client sends GET request to Notes Service - basic synchronous HTTP request",
      duration: 2000,
      action: async () => {
        state.addLog('Client sends GET request', 'request')
        const requestMsg: MessageFlowData = {
          id: Date.now(),
          from: 'client',
          to: 'notes-service',
          type: 'http',
          label: 'GET /notes',
          path: [{ x: 20, y: 30 }, { x: 50, y: 30 }]
        }
        state.setMessages([requestMsg])
        await speedDelay(500)
      }
    },
    {
      explanation: "Notes Service processes the request - single service handles everything (~25ms)",
      duration: 2000,
      action: async () => {
        state.addLog('Notes service processing...', 'info')
        await speedDelay(500)
      }
    },
    {
      explanation: "Notes Service responds immediately with data - point-to-point communication is fast!",
      duration: 2000,
      action: async () => {
        state.addLog('Response sent (25ms)', 'success')
        const responseMsg: MessageFlowData = {
          id: Date.now(),
          from: 'notes-service',
          to: 'client',
          type: 'http',
          label: '200 OK',
          path: [{ x: 50, y: 30 }, { x: 20, y: 30 }],
          success: true
        }
        state.setMessages(prev => [...prev, responseMsg])
        await speedDelay(500)
      }
    },
    {
      explanation: "Request complete! Total latency: ~25ms for simple request-response pattern",
      duration: 2000,
      action: async () => {
        await speedDelay(500)
        state.setMessages([])
      }
    }
  ]
}
