import type { Step } from '../../../hooks/useStepByStep'
import type { UsePubSubPatternState } from '../usePubSubPatternState'
import type { Position } from '../../../constants/colors'

export function createSubscriberDownScenario(
  state: UsePubSubPatternState,
  speedDelay: (ms: number) => Promise<void>,
  POSITIONS: Record<string, Position>
): Step[] {
  return [
    {
      explanation: 'Email Service experiences an outage and is unavailable',
      duration: 1500,
      action: async () => {
        state.addLog('⚠️ Email Service is currently DOWN', 'error')
        state.setEmailServiceStatus('down')
      }
    },
    {
      explanation: 'Despite Email Service being down, Order Service continues normal operations',
      duration: 1500,
      action: async () => {
        state.addLog('📝 Order Service: New order #5678 created', 'info')
      }
    },
    {
      explanation: 'Order Service publishes normally - it doesn\'t know about Email Service status',
      duration: 2000,
      action: async () => {
        state.addLog('📤 Order Service: Publishing order.created to "orders" topic', 'info')

        // Add topic message
        state.addTopicMessage({
          id: 'msg-3',
          topic: 'orders',
          content: 'order.created: #5678',
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
      explanation: 'Broker attempts to deliver to all subscribers, regardless of their status',
      duration: 2000,
      action: async () => {
        state.addLog('📨 Broker: Received message on "orders" topic', 'info')
        state.addLog('🔍 Broker: Routing to available subscribers...', 'info')

        // Update topic message count
        state.setTopics(prev => ({
          ...prev,
          orders: { ...prev.orders, messageCount: prev.orders.messageCount + 1 }
        }))
      }
    },
    {
      explanation: 'Analytics Service receives the message successfully',
      duration: 1500,
      action: async () => {
        state.addLog('📬 Broker: Delivering to Analytics Service', 'success')
        const msg = {
          id: Date.now(),
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
      explanation: 'Notification Service receives the message successfully',
      duration: 1500,
      action: async () => {
        state.addLog('📬 Broker: Delivering to Notification Service', 'success')
        const msg = {
          id: Date.now() + 1,
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
      explanation: 'Email Service delivery fails, but message can be retried or stored in dead-letter queue',
      duration: 1500,
      action: async () => {
        state.addLog('❌ Broker: Failed to deliver to Email Service (service down)', 'error')
        const msg = {
          id: Date.now() + 2,
          from: 'broker',
          to: 'emailService',
          type: 'event' as const,
          label: 'FAILED',
          path: [POSITIONS.broker, POSITIONS.emailService],
          success: false
        }
        state.setMessages(prev => [...prev, msg])
        await speedDelay(400)
      }
    },
    {
      explanation: 'Healthy subscribers continue working - one failure doesn\'t affect others',
      duration: 2500,
      action: async () => {
        state.addLog('✅ Analytics Service: Processed successfully', 'success')
        state.addLog('✅ Notification Service: Processed successfully', 'success')
        state.addLog('💾 Broker: Message for Email Service queued for retry', 'warning')
      }
    },
    {
      explanation: 'Email Service comes back online',
      duration: 2000,
      action: async () => {
        state.addLog('🔄 Email Service: Recovering...', 'info')
        state.setEmailServiceStatus('healthy')
      }
    },
    {
      explanation: 'When service recovers, it can process missed messages. Each subscriber operates independently.',
      duration: 2500,
      action: async () => {
        state.addLog('✅ Email Service: Processing queued messages', 'success')
        state.addLog('🎉 System resilience: Failures isolated to individual subscribers', 'success')
        state.addLog('💡 Key benefit: Services are loosely coupled and fail independently', 'info')
      }
    }
  ]
}
