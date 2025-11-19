import type { Step } from '../../../hooks/useStepByStep'
import type { UsePubSubPatternState } from '../usePubSubPatternState'
import type { Position } from '../../../constants/colors'

export function createHappyPathScenario(
  state: UsePubSubPatternState,
  speedDelay: (ms: number) => Promise<void>,
  POSITIONS: Record<string, Position>
): Step[] {
  return [
    {
      explanation: 'Order Service processes a new customer order',
      duration: 1500,
      action: async () => {
        state.addLog('📝 Order Service: Creating new order #1234', 'info')
      }
    },
    {
      explanation: 'Order Service publishes event to the "orders" topic in the message broker',
      duration: 2000,
      action: async () => {
        state.addLog('📤 Order Service: Publishing order.created event to "orders" topic', 'info')

        // Add topic message
        state.addTopicMessage({
          id: 'msg-1',
          topic: 'orders',
          content: 'order.created: #1234',
          timestamp: new Date().toISOString(),
          publishedBy: 'orderService'
        })

        // Show message flow from publisher to broker
        const msg = {
          id: Date.now(),
          from: 'orderService',
          to: 'broker',
          type: 'event' as const,
          label: 'order.created',
          path: [POSITIONS.orderService, POSITIONS.broker]
        }
        state.setMessages(prev => [...prev, msg])
        await speedDelay(500)
      }
    },
    {
      explanation: 'Message broker receives the event and identifies all subscribers to the "orders" topic',
      duration: 2000,
      action: async () => {
        state.addLog('📨 Broker: Received message on "orders" topic', 'info')
        state.addLog('🔍 Broker: Finding subscribers for "orders" topic...', 'info')

        // Update topic message count
        state.setTopics(prev => ({
          ...prev,
          orders: { ...prev.orders, messageCount: prev.orders.messageCount + 1 }
        }))
      }
    },
    {
      explanation: 'Broker fans out the message to Email Service (first subscriber)',
      duration: 2000,
      action: async () => {
        state.addLog('📬 Broker: Routing to 3 subscribers (Email, Analytics, Notification)', 'success')

        // Show fan-out to email service
        const msg = {
          id: Date.now(),
          from: 'broker',
          to: 'emailService',
          type: 'event' as const,
          label: 'order.created',
          path: [POSITIONS.broker, POSITIONS.emailService]
        }
        state.setMessages(prev => [...prev, msg])
        await speedDelay(400)
      }
    },
    {
      explanation: 'Broker delivers to Analytics Service (second subscriber)',
      duration: 1500,
      action: async () => {
        const msg = {
          id: Date.now() + 1,
          from: 'broker',
          to: 'analyticsService',
          type: 'event' as const,
          label: 'order.created',
          path: [POSITIONS.broker, POSITIONS.analyticsService]
        }
        state.setMessages(prev => [...prev, msg])
        await speedDelay(400)
      }
    },
    {
      explanation: 'Broker delivers to Notification Service (third subscriber)',
      duration: 1500,
      action: async () => {
        const msg = {
          id: Date.now() + 2,
          from: 'broker',
          to: 'notificationService',
          type: 'event' as const,
          label: 'order.created',
          path: [POSITIONS.broker, POSITIONS.notificationService]
        }
        state.setMessages(prev => [...prev, msg])
        await speedDelay(400)
      }
    },
    {
      explanation: 'All three subscribers process the same event independently and simultaneously',
      duration: 2500,
      action: async () => {
        state.addLog('✅ Email Service: Processing order.created - Sending confirmation email', 'success')
        state.addLog('✅ Analytics Service: Processing order.created - Recording metrics', 'success')
        state.addLog('✅ Notification Service: Processing order.created - Sending push notification', 'success')
      }
    },
    {
      explanation: 'Pub/Sub pattern successfully delivered one message to multiple subscribers with complete decoupling',
      duration: 2500,
      action: async () => {
        state.addLog('🎉 Fan-out complete: 1 message → 3 subscribers', 'success')
        state.addLog('💡 Key benefit: Publisher doesn\'t know about subscribers', 'info')
      }
    }
  ]
}
