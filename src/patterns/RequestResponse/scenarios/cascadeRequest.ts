import type { Step } from '../../../hooks/useStepByStep.d'
import type { UseRequestResponseStateReturn } from '../useRequestResponseState'
import type { MessageFlowData } from '../../../components/pattern/MessageFlow'

export function createCascadeRequestScenario(
  state: UseRequestResponseStateReturn,
  speedDelay: (ms: number) => Promise<void>
): Step[] {
  return [
    {
      explanation: "Client requests note with tags - this triggers a cascade of sequential service calls",
      duration: 2000,
      action: async () => {
        state.addLog('Client requests note with tags', 'request')
        const clientToNotes: MessageFlowData = {
          id: Date.now(),
          from: 'client',
          to: 'notes-service',
          type: 'http',
          label: 'GET /notes/123?includeTags=true',
          path: [{ x: 20, y: 30 }, { x: 50, y: 30 }]
        }
        state.setMessages([clientToNotes])
        await speedDelay(500)
      }
    },
    {
      explanation: "Notes Service must call Tags Service synchronously to get tag data - this adds latency!",
      duration: 2000,
      action: async () => {
        state.addLog('Notes service calls Tags service (SYNC)', 'info')
        const notesToTags: MessageFlowData = {
          id: Date.now() + 1,
          from: 'notes-service',
          to: 'tags-service',
          type: 'http',
          label: 'GET /tags?noteId=123',
          path: [{ x: 50, y: 30 }, { x: 80, y: 30 }]
        }
        state.setMessages(prev => [...prev, notesToTags])
        await speedDelay(500)
      }
    },
    {
      explanation: "Tags Service responds with tag data (~15ms) - Notes Service is blocked waiting for this",
      duration: 2000,
      action: async () => {
        state.addLog('Tags service responds (15ms)', 'info')
        const tagsToNotes: MessageFlowData = {
          id: Date.now() + 2,
          from: 'tags-service',
          to: 'notes-service',
          type: 'http',
          label: '200 OK ["work", "urgent"]',
          path: [{ x: 80, y: 30 }, { x: 50, y: 30 }],
          success: true
        }
        state.setMessages(prev => [...prev, tagsToNotes])
        await speedDelay(500)
      }
    },
    {
      explanation: "Notes Service merges note + tag data and sends final response to client",
      duration: 2000,
      action: async () => {
        state.addLog('Notes service merges data and responds', 'success')
        const notesToClient: MessageFlowData = {
          id: Date.now() + 3,
          from: 'notes-service',
          to: 'client',
          type: 'http',
          label: '200 OK {note + tags}',
          path: [{ x: 50, y: 30 }, { x: 20, y: 30 }],
          success: true
        }
        state.setMessages(prev => [...prev, notesToClient])
        await speedDelay(500)
      }
    },
    {
      explanation: "Cascade complete! Total latency: ~150ms. Sequential calls sum up - each service waits for the next",
      duration: 2000,
      action: async () => {
        state.addLog('Total latency: 150ms (sequential)', 'info')
        await speedDelay(500)
        state.setMessages([])
      }
    }
  ]
}
