import type { Step } from '../../../hooks/useStepByStep.d'
import type { UseRequestResponseStateReturn } from '../useRequestResponseState'
import type { MessageFlowData } from '../../../components/pattern/MessageFlow'

export function createTimeoutScenario(
  state: UseRequestResponseStateReturn,
  speedDelay: (ms: number) => Promise<void>
): Step[] {
  return [
    {
      explanation: "Tags Service becomes slow/unresponsive - simulating a real-world service degradation",
      duration: 2000,
      action: async () => {
        state.setTagsServiceStatus('down')
        state.addLog('⚠️ Tags service is slow/unresponsive', 'warning')
        await speedDelay(500)
      }
    },
    {
      explanation: "Client sends request for notes with tags, unaware of the downstream service issue",
      duration: 2000,
      action: async () => {
        state.addLog('Client sends request', 'request')
        const clientToNotes: MessageFlowData = {
          id: Date.now(),
          from: 'client',
          to: 'notes-service',
          type: 'http',
          label: 'GET /notes/789?includeTags=true',
          path: [{ x: 20, y: 30 }, { x: 50, y: 30 }]
        }
        state.setMessages([clientToNotes])
        await speedDelay(500)
      }
    },
    {
      explanation: "Notes Service attempts to call the unresponsive Tags Service - waiting for response...",
      duration: 2000,
      action: async () => {
        state.addLog('Notes service calls Tags service...', 'info')
        const notesToTags: MessageFlowData = {
          id: Date.now() + 1,
          from: 'notes-service',
          to: 'tags-service',
          type: 'http',
          label: 'GET /tags?noteId=789',
          path: [{ x: 50, y: 30 }, { x: 80, y: 30 }]
        }
        state.setMessages(prev => [...prev, notesToTags])
        await speedDelay(500)
      }
    },
    {
      explanation: "Timeout exceeded! Request to Tags Service failed. Resilience pattern activates fallback strategy",
      duration: 2500,
      action: async () => {
        state.addLog('❌ Tags service timeout (5000ms exceeded)', 'error')
        state.addLog('Notes service applies fallback strategy', 'warning')
        await speedDelay(500)
      }
    },
    {
      explanation: "Notes Service returns partial data (notes without tags) rather than failing completely - graceful degradation!",
      duration: 2000,
      action: async () => {
        state.addLog('Returning note without tags', 'warning')
        const notesToClient: MessageFlowData = {
          id: Date.now() + 2,
          from: 'notes-service',
          to: 'client',
          type: 'http',
          label: '200 OK (partial data)',
          path: [{ x: 50, y: 30 }, { x: 20, y: 30 }],
          success: true
        }
        state.setMessages(prev => [...prev, notesToClient])
        await speedDelay(500)
      }
    },
    {
      explanation: "Timeout scenario complete! Tags Service recovers. Fallback strategy prevented total failure and maintained availability",
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
