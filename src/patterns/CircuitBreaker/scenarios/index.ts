import { type Step } from '../../../hooks/useStepByStep.d'
import { type CircuitBreakerState } from '../useCircuitBreakerState'
import { createStep, type Message } from '../../../utils/scenarioHelpers'
import { gridToPosition } from '../../../constants/colors'

const POSITIONS = {
  client: gridToPosition(1, 2),
  apiGateway: gridToPosition(4, 2),
  service: gridToPosition(7, 2)
}

const createMessage = (
  from: keyof typeof POSITIONS,
  to: keyof typeof POSITIONS,
  label: string,
  type: Message['type'] = 'http'
): Message => ({
  id: Date.now(),
  from,
  to,
  type,
  label,
  path: [POSITIONS[from], POSITIONS[to]]
})

export const createNormalRequestScenario = (
  state: CircuitBreakerState
): Step[] => {
  return [
    createStep({
      explanation: 'Client initiates request',
      duration: 1500,
      action: async () => {
        state.addLog('Client sending request to API Gateway', 'info')
        state.setMessages([
          createMessage('client', 'apiGateway', 'Request', 'http')
        ])
      }
    }),
    createStep({
      explanation: 'API Gateway checks Circuit Breaker status',
      duration: 1500,
      action: async () => {
        if (state.status === 'OPEN') {
          state.addLog('Circuit is OPEN. Request blocked.', 'error')
        } else {
          state.addLog(`Circuit is ${state.status}. Forwarding to Service.`, 'info')
          state.setMessages([
            createMessage('apiGateway', 'service', 'Forward', 'http')
          ])
        }
      }
    }),
    createStep({
      explanation: 'Service processes request',
      duration: 1500,
      action: async () => {
        state.addLog('Service processing request...', 'info')
      }
    }),
    createStep({
      explanation: 'Service sends response',
      duration: 1500,
      action: async () => {
        state.addLog('Service responding successfully', 'success')
        state.setMessages([
          createMessage('service', 'apiGateway', '200 OK', 'http')
        ])
        state.incrementSuccess()
        if (state.status === 'HALF_OPEN') {
            state.setStatus('CLOSED')
            state.resetCounts()
            state.addLog('Circuit Breaker state changed to CLOSED', 'success')
        }
      }
    }),
    createStep({
      explanation: 'API Gateway responds to Client',
      duration: 1500,
      action: async () => {
        state.setMessages([
          createMessage('apiGateway', 'client', '200 OK', 'http')
        ])
      }
    }),
    createStep({
      explanation: 'Request completed',
      duration: 1000,
      action: async () => {
        state.setMessages([])
        state.addLog('Request completed successfully', 'success')
      }
    })
  ]
}

export const createFailureScenario = (
  state: CircuitBreakerState
): Step[] => {
  return [
    createStep({
      explanation: 'Client initiates request',
      duration: 1500,
      action: async () => {
        state.addLog('Client sending request to API Gateway', 'info')
        state.setMessages([
          createMessage('client', 'apiGateway', 'Request', 'http')
        ])
      }
    }),
    createStep({
      explanation: 'API Gateway checks Circuit Breaker status',
      duration: 1500,
      action: async () => {
        state.addLog(`Circuit is ${state.status}. Forwarding to Service.`, 'info')
        state.setMessages([
          createMessage('apiGateway', 'service', 'Forward', 'http')
        ])
      }
    }),
    createStep({
      explanation: 'Service fails to process',
      duration: 1500,
      action: async () => {
        state.addLog('Service encountered an error!', 'error')
        state.setMessages([
          createMessage('service', 'apiGateway', '500 Error', 'http') // Changed type to http as 'error' is not a valid Message type
        ])
      }
    }),
    createStep({
      explanation: 'API Gateway handles failure',
      duration: 1500,
      action: async () => {
        state.incrementFailure()
        state.addLog(`Failure count: ${state.failureCount + 1}/${state.failureThreshold}`, 'warning')
        
        if (state.failureCount + 1 >= state.failureThreshold) {
            state.setStatus('OPEN')
            state.addLog('Failure threshold reached! Circuit Breaker state changed to OPEN', 'error')
        } else if (state.status === 'HALF_OPEN') {
            state.setStatus('OPEN')
            state.addLog('Probe failed! Circuit Breaker state changed to OPEN', 'error')
        }

        state.setMessages([
          createMessage('apiGateway', 'client', '500 Error', 'http')
        ])
      }
    }),
    createStep({
      explanation: 'Request failed',
      duration: 1000,
      action: async () => {
        state.setMessages([])
        state.addLog('Request failed', 'error')
      }
    })
  ]
}

export const createOpenCircuitScenario = (
  state: CircuitBreakerState
): Step[] => {
  return [
    createStep({
      explanation: 'Client initiates request',
      duration: 1500,
      action: async () => {
        state.addLog('Client sending request to API Gateway', 'info')
        state.setMessages([
          createMessage('client', 'apiGateway', 'Request', 'http')
        ])
      }
    }),
    createStep({
      explanation: 'API Gateway blocks request',
      duration: 1500,
      action: async () => {
        state.addLog('Circuit is OPEN. Request blocked immediately.', 'error')
        state.setMessages([
            createMessage('apiGateway', 'client', '503 Service Unavailable', 'http')
        ])
      }
    }),
    createStep({
      explanation: 'Request blocked',
      duration: 1000,
      action: async () => {
        state.setMessages([])
        state.addLog('Request blocked by Circuit Breaker', 'warning')
      }
    })
  ]
}

export const createRecoveryScenario = (
    state: CircuitBreakerState
  ): Step[] => {
    return [
      createStep({
        explanation: 'Waiting for reset timeout...',
        duration: state.resetTimeout,
        action: async () => {
          state.addLog(`Waiting ${state.resetTimeout}ms for circuit to cool down...`, 'info')
        }
      }),
      createStep({
        explanation: 'Timeout reached',
        duration: 1500,
        action: async () => {
            state.setStatus('HALF_OPEN')
            state.addLog('Reset timeout reached. Circuit Breaker state changed to HALF_OPEN', 'warning')
            state.addLog('Next request will be a probe request.', 'info')
        }
      })
    ]
  }
