import type { Step } from '../../../hooks/useStepByStep.d'
import type { UseAsyncMicroservicesStateReturn } from '../useAsyncMicroservicesState'
import { POSITIONS } from '../../../constants/colors'
import type { MessageFlowData } from '../../../components/pattern/MessageFlow'

export function createCacheMissScenario(
  state: UseAsyncMicroservicesStateReturn,
  speedDelay: (ms: number) => Promise<void>
): Step[] {
  return [
    {
      explanation: "Client sends GET request to Notes Service for note data",
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
      explanation: "Notes Service checks Redis cache first (cache-aside pattern)",
      duration: 2000,
      action: async () => {
        state.addLog('Checking Redis cache...', 'info')
        const cacheCheckMsg: MessageFlowData = {
          id: Date.now(),
          from: 'notes-service',
          to: 'redis',
          type: 'cache',
          label: 'GET tags:note:456',
          path: [POSITIONS.notesService, POSITIONS.redis]
        }
        state.setMessages(prev => [...prev, cacheCheckMsg])
        await speedDelay(500)
      }
    },
    {
      explanation: "Cache MISS! Data not in Redis. Must fetch from Tags Service synchronously, adding latency",
      duration: 2000,
      action: async () => {
        state.addLog('❌ Cache MISS! Need to fetch from Tags service', 'warning')
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
      explanation: "Notes Service makes synchronous HTTP call to Tags Service (blocks until response)",
      duration: 2000,
      action: async () => {
        state.addLog('Calling Tags service (SYNC)...', 'info')
        const syncCallMsg: MessageFlowData = {
          id: Date.now(),
          from: 'notes-service',
          to: 'tags-service',
          type: 'http',
          label: 'GET /tags?noteId=456',
          path: [POSITIONS.notesService, POSITIONS.tagsService]
        }
        state.setMessages(prev => [...prev, syncCallMsg])
        await speedDelay(800)
      }
    },
    {
      explanation: "Tags Service responds with tag data (~25ms). Now Notes Service can continue",
      duration: 2000,
      action: async () => {
        state.addLog('Tags service responded (25ms)', 'info')
        const syncResponseMsg: MessageFlowData = {
          id: Date.now(),
          from: 'tags-service',
          to: 'notes-service',
          type: 'http',
          label: '["important", "review"]',
          path: [POSITIONS.tagsService, POSITIONS.notesService],
          success: true
        }
        state.setMessages(prev => [...prev, syncResponseMsg])
        await speedDelay(500)
      }
    },
    {
      explanation: "Notes Service updates Redis cache (cache-aside write) so future requests will be faster",
      duration: 2000,
      action: async () => {
        state.addLog('Updating Redis cache...', 'info')
        const updateCacheMsg: MessageFlowData = {
          id: Date.now(),
          from: 'notes-service',
          to: 'redis',
          type: 'cache',
          label: 'SET tags:note:456',
          path: [POSITIONS.notesService, POSITIONS.redis]
        }
        state.setMessages(prev => [...prev, updateCacheMsg])
        state.setCacheData(prev => ({ ...prev, 'note:456': ['important', 'review'] }))
        await speedDelay(500)
      }
    },
    {
      explanation: "Final response sent to client. Total latency: 150ms (much slower than cache hit's 1.2ms!)",
      duration: 2000,
      action: async () => {
        state.addLog('Response sent (Latency: 150ms)', 'success')
        const responseMsg: MessageFlowData = {
          id: Date.now(),
          from: 'notes-service',
          to: 'client',
          type: 'http',
          label: '200 OK',
          path: [POSITIONS.notesService, POSITIONS.client],
          success: true
        }
        state.setMessages(prev => [...prev, responseMsg])
        await speedDelay(1000)
      }
    },
    {
      explanation: "Cache Miss complete! Notice how cache-aside pattern trades first request latency for subsequent speed",
      duration: 2000,
      action: async () => {
        await speedDelay(500)
        state.setMessages([])
      }
    }
  ]
}
