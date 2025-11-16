import type { Step } from '../../../hooks/useStepByStep.d'
import type { UseAsyncMicroservicesStateReturn } from '../useAsyncMicroservicesState'
import { POSITIONS } from '../../../constants/colors'
import type { MessageFlowData } from '../../../components/pattern/MessageFlow'

export function createServiceFailureScenario(
  state: UseAsyncMicroservicesStateReturn,
  speedDelay: (ms: number) => Promise<void>
): Step[] {
  return [
    {
      explanation: "Tags Service goes DOWN! This simulates a real service outage scenario",
      duration: 2000,
      action: async () => {
        state.setTagsServiceStatus('down')
        state.addLog('⚠️ Tags service is DOWN!', 'error')
        await speedDelay(500)
      }
    },
    {
      explanation: "Client sends GET request for notes despite the Tags Service being down",
      duration: 2000,
      action: async () => {
        state.addLog('GET /notes request received', 'request')
        const msg: MessageFlowData = {
          id: Date.now(),
          from: 'client',
          to: 'notes-service',
          type: 'http',
          label: 'GET /notes',
          path: [POSITIONS.client, POSITIONS.notesService]
        }
        state.setMessages([msg])
        await speedDelay(500)
      }
    },
    {
      explanation: "Notes Service tries Redis cache first (cache-aside pattern) - this provides resilience!",
      duration: 2000,
      action: async () => {
        state.addLog('Checking Redis cache...', 'info')
        const cacheCheckMsg: MessageFlowData = {
          id: Date.now(),
          from: 'notes-service',
          to: 'redis',
          type: 'cache',
          label: 'GET tags:note:999',
          path: [POSITIONS.notesService, POSITIONS.redis]
        }
        state.setMessages(prev => [...prev, cacheCheckMsg])
        await speedDelay(500)
      }
    },
    {
      explanation: "Cache MISS! The requested data isn't cached, so we must call the downstream service",
      duration: 2000,
      action: async () => {
        state.addLog('Cache MISS - attempting Tags service...', 'warning')
        const cacheMissMsg: MessageFlowData = {
          id: Date.now(),
          from: 'redis',
          to: 'notes-service',
          type: 'cache',
          label: 'null',
          path: [POSITIONS.redis, POSITIONS.notesService],
          success: false
        }
        state.setMessages(prev => [...prev, cacheMissMsg])
        await speedDelay(500)
      }
    },
    {
      explanation: "Notes Service attempts to call Tags Service (which is down) - this will timeout",
      duration: 2000,
      action: async () => {
        state.addLog('Calling Tags service...', 'info')
        const syncCallMsg: MessageFlowData = {
          id: Date.now(),
          from: 'notes-service',
          to: 'tags-service',
          type: 'http',
          label: 'GET /tags?noteId=999',
          path: [POSITIONS.notesService, POSITIONS.tagsService]
        }
        state.setMessages(prev => [...prev, syncCallMsg])
        await speedDelay(500)
      }
    },
    {
      explanation: "Request timeout! Circuit breaker pattern kicks in to prevent cascading failures",
      duration: 2500,
      action: async () => {
        state.addLog('❌ Tags service timeout! Circuit breaker OPEN', 'error')
        await speedDelay(500)
      }
    },
    {
      explanation: "Graceful degradation: Notes Service returns partial data without tags rather than failing completely",
      duration: 2000,
      action: async () => {
        state.addLog('Graceful degradation: returning notes without tags', 'warning')
        const responseMsg: MessageFlowData = {
          id: Date.now(),
          from: 'notes-service',
          to: 'client',
          type: 'http',
          label: '200 OK (partial)',
          path: [POSITIONS.notesService, POSITIONS.client],
          success: true
        }
        state.setMessages(prev => [...prev, responseMsg])
        await speedDelay(500)
      }
    },
    {
      explanation: "Scenario complete! Tags Service recovers. Notice how the system degraded gracefully instead of failing entirely",
      duration: 2000,
      action: async () => {
        await speedDelay(500)
        state.setMessages([])
        state.setTagsServiceStatus('healthy')
        state.addLog('Tags service recovered', 'success')
        await speedDelay(500)
      }
    }
  ]
}
