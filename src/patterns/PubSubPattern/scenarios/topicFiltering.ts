import type { Step } from '../../../hooks/useStepByStep'
import type { UsePubSubPatternState } from '../usePubSubPatternState'
import type { Position } from '../../../constants/colors'

export function createTopicFilteringScenario(
  state: UsePubSubPatternState,
  speedDelay: (ms: number) => Promise<void>,
  POSITIONS: Record<string, Position>
): Step[] {
  return [
    {
      explanation: 'Inventory Service detects a change in stock levels',
      duration: 1500,
      action: async () => {
        state.addLog('📦 Inventory Service: Stock level changed for item SKU-789', 'info')
      }
    },
    {
      explanation: 'Inventory Service publishes event to the "inventory" topic (different from "orders")',
      duration: 2000,
      action: async () => {
        state.addLog('📤 Inventory Service: Publishing inventory.updated event to "inventory" topic', 'info')

        // Add topic message
        state.addTopicMessage({
          id: 'msg-2',
          topic: 'inventory',
          content: 'inventory.updated: SKU-789',
          timestamp: new Date().toISOString(),
          publishedBy: 'inventoryService'
        })

        // Show message flow from publisher to broker
        const msg = {
          id: Date.now(),
          from: 'inventoryService',
          to: 'broker',
          type: 'event' as const,
          label: 'inventory.updated',
          path: [POSITIONS.inventoryService, POSITIONS.broker]
        }
        state.setMessages(prev => [...prev, msg])
        await speedDelay(500)
      }
    },
    {
      explanation: 'Broker checks subscriptions - only Analytics Service subscribes to "inventory" topic',
      duration: 2000,
      action: async () => {
        state.addLog('📨 Broker: Received message on "inventory" topic', 'info')
        state.addLog('🔍 Broker: Finding subscribers for "inventory" topic...', 'info')

        // Update topic message count
        state.setTopics(prev => ({
          ...prev,
          inventory: { ...prev.inventory, messageCount: prev.inventory.messageCount + 1 }
        }))
      }
    },
    {
      explanation: 'Only Analytics Service receives the message - Email and Notification services are not subscribed to "inventory" topic',
      duration: 2000,
      action: async () => {
        state.addLog('📬 Broker: Routing to 1 subscriber (Analytics only)', 'success')

        // Show delivery to analytics only
        const msg = {
          id: Date.now(),
          from: 'broker',
          to: 'analyticsService',
          type: 'event' as const,
          label: 'inventory.updated',
          path: [POSITIONS.broker, POSITIONS.analyticsService]
        }
        state.setMessages(prev => [...prev, msg])
        await speedDelay(500)
      }
    },
    {
      explanation: 'Only the subscribed service processes the event - others are unaffected',
      duration: 2500,
      action: async () => {
        state.addLog('✅ Analytics Service: Processing inventory.updated - Recording stock metrics', 'success')
        state.addLog('⏭️ Email Service: No action (not subscribed to "inventory")', 'info')
        state.addLog('⏭️ Notification Service: No action (not subscribed to "inventory")', 'info')
      }
    },
    {
      explanation: 'Topic-based filtering ensures services only receive events they care about',
      duration: 2500,
      action: async () => {
        state.addLog('🎯 Topic filtering working: Each subscriber only gets relevant messages', 'success')
        state.addLog('💡 Key benefit: Subscribers control what events they receive', 'info')
      }
    }
  ]
}
