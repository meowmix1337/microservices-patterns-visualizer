import type { Step } from '../../../hooks/useStepByStep.d'
import type { UseAsyncMicroservicesStateReturn } from '../useAsyncMicroservicesState'
import type { Position } from '../../../constants/colors'
import type { MessageFlowData } from '../../../components/pattern/MessageFlow'
import type { QueueMessage } from '../../../components/viewers/QueueViewer'

export function createAsyncUpdateScenario(
  state: UseAsyncMicroservicesStateReturn,
  speedDelay: (ms: number) => Promise<void>,
  positions: Record<string, Position>
): Step[] {
  const POSITIONS = positions
  // Store the newQueueMsg in a closure so we can reference it across steps
  let newQueueMsg: QueueMessage | null = null

  return [
    {
      explanation: "Client sends POST request to create a new tag in Tags Service",
      duration: 2000,
      action: async () => {
        state.addLog('Tag created in Tags service', 'request')
        const tagCreateMsg: MessageFlowData = {
          id: Date.now(),
          from: 'client',
          to: 'tags-service',
          type: 'http',
          label: 'POST /tags',
          path: [POSITIONS.client, POSITIONS.tagsService]
        }
        state.setMessages([tagCreateMsg])
        await speedDelay(500)
      }
    },
    {
      explanation: "Tags Service writes the tag to its database, then publishes TAG_CREATED event to Kafka (fire-and-forget)",
      duration: 2500,
      action: async () => {
        state.addLog('Writing tag to database...', 'info')
        await speedDelay(300)

        state.addLog('Publishing event to Kafka (ASYNC)...', 'info')
        const kafkaPublishMsg: MessageFlowData = {
          id: Date.now(),
          from: 'tags-service',
          to: 'kafka',
          type: 'event',
          label: 'TAG_CREATED event',
          path: [POSITIONS.tagsService, POSITIONS.kafka]
        }
        state.setMessages(prev => [...prev, kafkaPublishMsg])

        // Create queue message
        newQueueMsg = {
          id: Date.now(),
          event: 'TAG_CREATED',
          noteId: 'note:789',
          tag: 'new-tag',
          timestamp: new Date().toLocaleTimeString()
        }
        state.setQueueMessages(prev => [...prev, newQueueMsg!])
        await speedDelay(500)
      }
    },
    {
      explanation: "Tags Service responds immediately to client without waiting for event processing - ultra-low latency!",
      duration: 2000,
      action: async () => {
        state.addLog('✅ Response sent immediately (no waiting!)', 'success')
        const responseMsg: MessageFlowData = {
          id: Date.now(),
          from: 'tags-service',
          to: 'client',
          type: 'http',
          label: '201 Created',
          path: [POSITIONS.tagsService, POSITIONS.client],
          success: true
        }
        state.setMessages(prev => [...prev, responseMsg])
        await speedDelay(500)
      }
    },
    {
      explanation: `Kafka consumer lag simulation (${state.kafkaLag}s) - this represents real-world async processing delay`,
      duration: state.kafkaLag * 1000 + 1000,
      action: async () => {
        state.addLog(`Waiting for Notes Service to consume event (lag: ${state.kafkaLag}s)...`, 'info')
        await speedDelay(state.kafkaLag * 1000)
      }
    },
    {
      explanation: "Notes Service consumes TAG_CREATED event from Kafka and processes it asynchronously",
      duration: 2000,
      action: async () => {
        state.addLog(`Notes service consuming event (lag: ${state.kafkaLag}s)...`, 'info')
        const kafkaConsumeMsg: MessageFlowData = {
          id: Date.now(),
          from: 'kafka',
          to: 'notes-service',
          type: 'event',
          label: 'TAG_CREATED event',
          path: [POSITIONS.kafka, POSITIONS.notesService]
        }
        state.setMessages(prev => [...prev, kafkaConsumeMsg])

        // Remove from queue
        if (newQueueMsg) {
          state.setQueueMessages(prev => prev.filter(m => m.id !== newQueueMsg!.id))
        }
        await speedDelay(500)
      }
    },
    {
      explanation: "Notes Service updates Redis cache from the consumed event to keep data synchronized across services",
      duration: 2000,
      action: async () => {
        // Check if Redis is down
        if (state.redisStatus === 'down') {
          state.addLog('⚠️ Redis is DOWN! Cannot update cache from event', 'warning')
          await speedDelay(500)
          return
        }

        state.addLog('Updating Redis cache from event...', 'info')
        const updateCacheMsg: MessageFlowData = {
          id: Date.now(),
          from: 'notes-service',
          to: 'redis',
          type: 'cache',
          label: 'UPDATE tags:note:789',
          path: [POSITIONS.notesService, POSITIONS.redis]
        }
        state.setMessages(prev => [...prev, updateCacheMsg])

        state.setCacheData(prev => ({
          ...prev,
          'note:789': [...(Array.isArray(prev['note:789']) ? prev['note:789'] as string[] : []), 'new-tag']
        }))
        await speedDelay(500)
      }
    },
    {
      explanation: "Event-driven update complete! Notice how client got instant response while cache sync happened asynchronously",
      duration: 2000,
      action: async () => {
        if (state.redisStatus !== 'down') {
          state.addLog('✅ Cache synchronized!', 'success')
        }
        await speedDelay(500)
        state.setMessages([])
      }
    }
  ]
}
