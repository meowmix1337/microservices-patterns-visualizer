import type { Step } from '../../../hooks/useStepByStep.d'
import type { UseOutboxPatternStateReturn } from '../useOutboxPatternState'
import type { Position } from '../../../constants/colors'
import type { MessageFlowData } from '../../../components/pattern/MessageFlow'

export function createKafkaDownScenario(
  state: UseOutboxPatternStateReturn,
  speedDelay: (ms: number) => Promise<void>,
  positions: Record<string, Position>
): Step[] {
  const POSITIONS = positions

  return [
    {
      explanation: "Client sends a request to create a new order",
      duration: 2000,
      action: async () => {
        state.addLog('Client: Create order request', 'request')
        const msg: MessageFlowData = {
          id: Date.now(),
          from: 'client',
          to: 'order-service',
          type: 'http',
          label: 'POST /orders',
          path: [POSITIONS.client, POSITIONS.orderService]
        }
        state.setMessages([msg])
        await speedDelay(500)
      }
    },
    {
      explanation: "Order Service starts transaction and saves order to database",
      duration: 2000,
      action: async () => {
        state.addLog('Order Service: Starting transaction...', 'info')
        await speedDelay(200)
        state.addLog('Database: INSERT INTO orders', 'info')
        state.incrementOrderCount()
        const msg: MessageFlowData = {
          id: Date.now(),
          from: 'order-service',
          to: 'database',
          type: 'db',
          label: 'INSERT order',
          path: [POSITIONS.orderService, POSITIONS.database]
        }
        state.setMessages(prev => [...prev, msg])
        await speedDelay(500)
      }
    },
    {
      explanation: "Order Service saves event to outbox table in the same transaction",
      duration: 2000,
      action: async () => {
        state.addLog('Database: INSERT INTO outbox', 'info')

        state.addOutboxEntry({
          eventType: 'OrderCreated',
          payload: '{"orderId": "ORD-002", "items": 5}',
          status: 'pending'
        })

        const msg: MessageFlowData = {
          id: Date.now(),
          from: 'order-service',
          to: 'database',
          type: 'db',
          label: 'INSERT outbox',
          path: [POSITIONS.orderService, POSITIONS.database]
        }
        state.setMessages(prev => [...prev, msg])
        await speedDelay(500)
      }
    },
    {
      explanation: "Transaction commits successfully - order saved despite Kafka being down!",
      duration: 2000,
      action: async () => {
        state.addLog('✅ Transaction COMMITTED - Order saved!', 'success')
        await speedDelay(500)
      }
    },
    {
      explanation: "Order Service returns success to client - user experience is not affected by Kafka downtime",
      duration: 2000,
      action: async () => {
        state.addLog('Order Service: 201 Created', 'success')
        const msg: MessageFlowData = {
          id: Date.now(),
          from: 'order-service',
          to: 'client',
          type: 'http',
          label: '201 Created',
          path: [POSITIONS.orderService, POSITIONS.client],
          success: true
        }
        state.setMessages(prev => [...prev, msg])
        await speedDelay(800)
      }
    },
    {
      explanation: "Outbox Publisher polls database and finds pending event",
      duration: 2000,
      action: async () => {
        state.setMessages([])
        state.addLog('Outbox Publisher: Found pending event', 'info')
        const msg: MessageFlowData = {
          id: Date.now(),
          from: 'outbox-publisher',
          to: 'database',
          type: 'db',
          label: 'SELECT * FROM outbox WHERE status=pending',
          path: [POSITIONS.outboxPublisher, POSITIONS.database]
        }
        state.setMessages([msg])
        await speedDelay(500)
      }
    },
    {
      explanation: "Publisher attempts to publish to Kafka, but Kafka is DOWN!",
      duration: 2500,
      action: async () => {
        // Set Kafka to down status
        state.setKafkaStatus('down')

        state.addLog('Outbox Publisher: Attempting to publish...', 'info')

        const msg: MessageFlowData = {
          id: Date.now(),
          from: 'outbox-publisher',
          to: 'kafka',
          type: 'event',
          label: 'OrderCreated',
          path: [POSITIONS.outboxPublisher, POSITIONS.kafka],
          success: false
        }
        state.setMessages(prev => [...prev, msg])
        await speedDelay(500)
      }
    },
    {
      explanation: "Connection to Kafka failed! But that's OK - the event stays pending in the outbox",
      duration: 2500,
      action: async () => {
        state.addLog('❌ Kafka unavailable - connection refused', 'error')
        state.addLog('Outbox Publisher: Event remains pending, will retry...', 'warning')
        await speedDelay(1000)
      }
    },
    {
      explanation: "Publisher continues polling - the event is still in the outbox waiting to be delivered",
      duration: 2000,
      action: async () => {
        state.addLog('Outbox Publisher: Retrying in 5 seconds...', 'info')
        await speedDelay(1000)
      }
    },
    {
      explanation: "After some time, Kafka comes back online!",
      duration: 2000,
      action: async () => {
        state.setMessages([])
        // Set Kafka back to up status
        state.setKafkaStatus('up')
        state.addLog('✅ Kafka service restored!', 'success')
        await speedDelay(800)
      }
    },
    {
      explanation: "Publisher polls again and finds the same pending event",
      duration: 2000,
      action: async () => {
        state.addLog('Outbox Publisher: Polling again...', 'info')
        const msg: MessageFlowData = {
          id: Date.now(),
          from: 'outbox-publisher',
          to: 'database',
          type: 'db',
          label: 'SELECT pending',
          path: [POSITIONS.outboxPublisher, POSITIONS.database]
        }
        state.setMessages([msg])
        await speedDelay(500)
      }
    },
    {
      explanation: "This time, the publish succeeds! The event is delivered to Kafka",
      duration: 2000,
      action: async () => {
        // Update first outbox entry to publishing
        if (state.outboxEntries.length > 0) {
          const firstEntry = state.outboxEntries[0]
          state.updateOutboxStatus(firstEntry.id, 'publishing')
        }

        state.addLog('Outbox Publisher: Publishing to Kafka...', 'info')
        const msg: MessageFlowData = {
          id: Date.now(),
          from: 'outbox-publisher',
          to: 'kafka',
          type: 'event',
          label: 'OrderCreated',
          path: [POSITIONS.outboxPublisher, POSITIONS.kafka],
          success: true
        }
        state.setMessages(prev => [...prev, msg])
        await speedDelay(500)
      }
    },
    {
      explanation: "Kafka acknowledges the event and the outbox entry is marked as published",
      duration: 2000,
      action: async () => {
        state.addLog('✅ Kafka: Event received', 'success')

        // Update first outbox entry to published
        if (state.outboxEntries.length > 0) {
          const firstEntry = state.outboxEntries[0]
          state.updateOutboxStatus(firstEntry.id, 'published', new Date().toLocaleTimeString())
        }

        state.addLog('Outbox Publisher: Event marked as published', 'success')
        await speedDelay(500)
      }
    },
    {
      explanation: "Inventory Service consumes the event and processes the order",
      duration: 2000,
      action: async () => {
        state.addLog('Inventory: Consuming OrderCreated event', 'info')
        const msg: MessageFlowData = {
          id: Date.now(),
          from: 'kafka',
          to: 'inventory',
          type: 'event',
          label: 'OrderCreated',
          path: [POSITIONS.kafka, POSITIONS.inventory]
        }
        state.setMessages(prev => [...prev, msg])
        await speedDelay(500)
      }
    },
    {
      explanation: "Success! Despite Kafka being down, the event was eventually delivered reliably",
      duration: 2000,
      action: async () => {
        state.addLog('✅ Inventory: Items reserved for order ORD-002', 'success')
        await speedDelay(300)
        state.addLog('━━━ Resilience Demonstrated! ━━━', 'success')
        await speedDelay(1000)
        state.setMessages([])
      }
    }
  ]
}
