import type { Step } from '../../../hooks/useStepByStep.d'
import type { UseAsyncMicroservicesStateReturn } from '../useAsyncMicroservicesState'
import type { Position } from '../../../constants/colors'
import type { MessageFlowData } from '../../../components/pattern/MessageFlow'

export function createCacheHitScenario(
  state: UseAsyncMicroservicesStateReturn,
  speedDelay: (ms: number) => Promise<void>,
  positions: Record<string, Position>
): Step[] {
  const POSITIONS = positions
  return [
    {
      explanation: "Client initiates a GET request to fetch notes from the Notes Service",
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
      explanation: "Notes Service checks Redis cache first (cache-aside pattern) - this is much faster than calling another service",
      duration: 2000,
      action: async () => {
        state.addLog('Checking Redis cache...', 'info')
        const cacheCheckMsg: MessageFlowData = {
          id: Date.now(),
          from: 'notes-service',
          to: 'redis',
          type: 'cache',
          label: 'GET tags:note:123',
          path: [POSITIONS.notesService, POSITIONS.redis]
        }
        state.setMessages(prev => [...prev, cacheCheckMsg])
        await speedDelay(500)
      }
    },
    {
      explanation: "Cache HIT! Redis returns the cached tags instantly (~1ms). No need to call Tags Service, saving ~150ms",
      duration: 2000,
      action: async () => {
        state.addLog('✅ Cache HIT! Retrieved tags from Redis', 'success')
        const cacheHitMsg: MessageFlowData = {
          id: Date.now(),
          from: 'redis',
          to: 'notes-service',
          type: 'cache',
          label: '["work", "urgent"]',
          path: [POSITIONS.redis, POSITIONS.notesService],
          success: true
        }
        state.setMessages(prev => [...prev, cacheHitMsg])
        await speedDelay(500)
      }
    },
    {
      explanation: "Notes Service sends the complete response back to client with ultra-low latency (total: ~1.2ms)",
      duration: 2000,
      action: async () => {
        state.addLog('Response sent (Latency: 1.2ms)', 'success')
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
      explanation: "Scenario complete! The cache-aside pattern reduced latency from 150ms to 1.2ms - a 125x improvement",
      duration: 2000,
      action: async () => {
        await speedDelay(500)
        state.setMessages([])
      }
    }
  ]
}
