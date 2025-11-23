import { type Step } from '../../../hooks/useStepByStep.d'
import { type RetryState } from '../useRetryState'
import { createStep, type Message } from '../../../utils/scenarioHelpers'
import { gridToPosition } from '../../../constants/colors'

const POSITIONS = {
  client: gridToPosition(2, 4),
  service: gridToPosition(10, 4)
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
  state: RetryState
): Step[] => {
  return [
    createStep({
      explanation: 'Client initiates request',
      duration: 1500,
      action: async () => {
        state.resetState()
        state.incrementAttempt()
        state.setStatus('ATTEMPTING')
        state.addLog('Client sending request (Attempt 1)', 'info')
        state.setMessages([
          createMessage('client', 'service', 'Request', 'http')
        ])
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
      explanation: 'Service responds successfully',
      duration: 1500,
      action: async () => {
        state.setStatus('SUCCESS')
        state.addLog('Request succeeded', 'success')
        state.setMessages([
          createMessage('service', 'client', '200 OK', 'http')
        ])
      }
    }),
    createStep({
      explanation: 'Request completed',
      duration: 1000,
      action: async () => {
        state.setMessages([])
        state.addLog('Operation completed successfully', 'success')
      }
    })
  ]
}

export const createTransientFailureScenario = (
  state: RetryState
): Step[] => {
  const steps: Step[] = []
  
  // Attempt 1 (Failure)
  steps.push(
    createStep({
      explanation: 'Client initiates request (Attempt 1)',
      duration: 1500,
      action: async () => {
        state.resetState()
        state.incrementAttempt()
        state.setStatus('ATTEMPTING')
        state.addLog('Client sending request (Attempt 1)', 'info')
        state.setMessages([
          createMessage('client', 'service', 'Request', 'http')
        ])
      }
    }),
    createStep({
      explanation: 'Service fails to process',
      duration: 1500,
      action: async () => {
        state.addLog('Service encountered an error (500)', 'error')
        state.setMessages([
          createMessage('service', 'client', '500 Error', 'http')
        ])
      }
    }),
    createStep({
      explanation: 'Client waits before retrying',
      duration: 2000,
      action: async () => {
        state.setStatus('WAITING')
        state.setMessages([])
        state.addLog('Transient failure detected. Waiting 2s before retry...', 'warning')
      }
    })
  )

  // Attempt 2 (Success)
  steps.push(
    createStep({
      explanation: 'Client retries request (Attempt 2)',
      duration: 1500,
      action: async () => {
        state.incrementAttempt()
        state.setStatus('ATTEMPTING')
        state.addLog('Client retrying request (Attempt 2)', 'info')
        state.setMessages([
          createMessage('client', 'service', 'Retry Request', 'http')
        ])
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
      explanation: 'Service responds successfully',
      duration: 1500,
      action: async () => {
        state.setStatus('SUCCESS')
        state.addLog('Retry succeeded!', 'success')
        state.setMessages([
          createMessage('service', 'client', '200 OK', 'http')
        ])
      }
    }),
    createStep({
      explanation: 'Request completed',
      duration: 1000,
      action: async () => {
        state.setMessages([])
        state.addLog('Operation completed successfully after retry', 'success')
      }
    })
  )

  return steps
}

export const createPersistentFailureScenario = (
  state: RetryState
): Step[] => {
  const steps: Step[] = []
  
  // Create steps for max retries
  for (let i = 1; i <= 3; i++) {
    steps.push(
      createStep({
        explanation: `Client initiates request (Attempt ${i})`,
        duration: 1500,
        action: async () => {
            if (i === 1) state.resetState()
            if (i > 1) state.incrementAttempt()
            else state.setAttemptCount(1) // Ensure it starts at 1
            
            state.setStatus('ATTEMPTING')
            state.addLog(`Client sending request (Attempt ${i})`, 'info')
            state.setMessages([
            createMessage('client', 'service', i === 1 ? 'Request' : 'Retry Request', 'http')
            ])
        }
      }),
      createStep({
        explanation: 'Service fails to process',
        duration: 1500,
        action: async () => {
            state.addLog('Service encountered an error (500)', 'error')
            state.setMessages([
            createMessage('service', 'client', '500 Error', 'http')
            ])
        }
      })
    )

    if (i < 3) {
        steps.push(
            createStep({
                explanation: 'Client waits before retrying',
                duration: 2000,
                action: async () => {
                    state.setStatus('WAITING')
                    state.setMessages([])
                    state.addLog('Failure detected. Waiting before retry...', 'warning')
                }
            })
        )
    }
  }

  // Final failure step
  steps.push(
    createStep({
      explanation: 'Max retries reached',
      duration: 1000,
      action: async () => {
        state.setStatus('FAILED')
        state.setMessages([])
        state.addLog('Max retries reached. Operation failed.', 'error')
      }
    })
  )

  return steps
}
