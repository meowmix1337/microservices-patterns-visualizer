import type { Step } from '../../../hooks/useStepByStep.d'
import type { UseRequestResponseStateReturn } from '../useRequestResponseState'
import type { MessageFlowData } from '../../../components/pattern/MessageFlow'

export function createParallelRequestsScenario(
  state: UseRequestResponseStateReturn,
  speedDelay: (ms: number) => Promise<void>
): Step[] {
  return [
    {
      explanation: "Client requests note with full metadata (tags + author info)",
      duration: 2000,
      action: async () => {
        state.addLog('Client requests note with metadata', 'request')
        const clientToNotes: MessageFlowData = {
          id: Date.now(),
          from: 'client',
          to: 'notes-service',
          type: 'http',
          label: 'GET /notes/456/full',
          path: [{ x: 20, y: 30 }, { x: 50, y: 30 }]
        }
        state.setMessages([clientToNotes])
        await speedDelay(500)
      }
    },
    {
      explanation: "Notes Service makes PARALLEL calls to both Tags and User services simultaneously - this is key!",
      duration: 2500,
      action: async () => {
        state.addLog('Notes service makes parallel calls', 'info')
        const notesToTags: MessageFlowData = {
          id: Date.now() + 1,
          from: 'notes-service',
          to: 'tags-service',
          type: 'http',
          label: 'GET /tags?noteId=456',
          path: [{ x: 50, y: 30 }, { x: 80, y: 50 }]
        }
        const notesToUser: MessageFlowData = {
          id: Date.now() + 2,
          from: 'notes-service',
          to: 'user-service',
          type: 'http',
          label: 'GET /users/author',
          path: [{ x: 50, y: 30 }, { x: 80, y: 10 }]
        }
        state.setMessages(prev => [...prev, notesToTags, notesToUser])
        await speedDelay(500)
      }
    },
    {
      explanation: "Both services respond - total wait time is max(tags, user), NOT the sum. Much faster than sequential!",
      duration: 2000,
      action: async () => {
        state.addLog('Both services respond (waiting for slowest)', 'info')
        const tagsToNotes: MessageFlowData = {
          id: Date.now() + 3,
          from: 'tags-service',
          to: 'notes-service',
          type: 'http',
          label: '200 OK',
          path: [{ x: 80, y: 50 }, { x: 50, y: 30 }],
          success: true
        }
        const userToNotes: MessageFlowData = {
          id: Date.now() + 4,
          from: 'user-service',
          to: 'notes-service',
          type: 'http',
          label: '200 OK',
          path: [{ x: 80, y: 10 }, { x: 50, y: 30 }],
          success: true
        }
        state.setMessages(prev => [...prev, tagsToNotes, userToNotes])
        await speedDelay(500)
      }
    },
    {
      explanation: "Notes Service aggregates all data (note + tags + author) and sends complete response",
      duration: 2000,
      action: async () => {
        state.addLog('Notes service aggregates and responds', 'success')
        const notesToClient: MessageFlowData = {
          id: Date.now() + 5,
          from: 'notes-service',
          to: 'client',
          type: 'http',
          label: '200 OK {note + tags + author}',
          path: [{ x: 50, y: 30 }, { x: 20, y: 30 }],
          success: true
        }
        state.setMessages(prev => [...prev, notesToClient])
        await speedDelay(500)
      }
    },
    {
      explanation: "Parallel requests complete! Total latency: ~120ms. Faster than 150ms sequential because calls ran concurrently",
      duration: 2000,
      action: async () => {
        state.addLog('Total latency: 120ms (parallel is faster!)', 'success')
        await speedDelay(500)
        state.setMessages([])
      }
    }
  ]
}
