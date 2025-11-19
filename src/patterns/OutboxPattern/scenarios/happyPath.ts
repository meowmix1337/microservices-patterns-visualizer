import type { Step } from '../../../hooks/useStepByStep.d'
import type { UseOutboxPatternStateReturn } from '../useOutboxPatternState'
import type { Position } from '../../../constants/colors'
import type { MessageFlowData } from '../../../components/pattern/MessageFlow'

export function createHappyPathScenario(
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
      explanation: "Order Service receives the request and begins a database transaction",
      duration: 2000,
      action: async () => {
        state.addLog('Order Service: Starting transaction...', 'info')
        await speedDelay(300)
      }
    },
    {
      explanation: "Step 1: Save the order to the orders table within the transaction",
      duration: 2000,
      action: async () => {
        state.addLog('Database: INSERT INTO orders (order_id, customer, items)', 'info')
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
      explanation: "Step 2: Save the event to the outbox table in the same transaction",
      duration: 2500,
      action: async () => {
        state.addLog('Database: INSERT INTO outbox (event_type, payload)', 'info')

        // Add entry to outbox with pending status
        state.addOutboxEntry({
          eventType: 'OrderCreated',
          payload: '{"orderId": "ORD-001", "items": 3}',
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
      explanation: "Transaction commits successfully - both order and outbox event are saved atomically",
      duration: 2000,
      action: async () => {
        state.addLog('✅ Transaction COMMITTED - Order and event saved!', 'success')
        await speedDelay(500)
      }
    },
    {
      explanation: "Order Service returns success response to the client immediately",
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
      explanation: "Meanwhile, the Outbox Publisher process polls the database for pending events",
      duration: 2000,
      action: async () => {
        state.setMessages([])
        state.addLog('Outbox Publisher: Polling for pending events...', 'info')
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
      explanation: "Publisher finds the pending OrderCreated event in the outbox table",
      duration: 2000,
      action: async () => {
        state.addLog('Outbox Publisher: Found 1 pending event', 'info')
        await speedDelay(500)
      }
    },
    {
      explanation: "Publisher updates the event status to 'publishing' and begins sending to Kafka",
      duration: 2000,
      action: async () => {
        // Update first outbox entry to publishing status
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
          path: [POSITIONS.outboxPublisher, POSITIONS.kafka]
        }
        state.setMessages(prev => [...prev, msg])
        await speedDelay(500)
      }
    },
    {
      explanation: "Kafka acknowledges receipt of the event",
      duration: 2000,
      action: async () => {
        state.addLog('✅ Kafka: Event received and persisted', 'success')
        await speedDelay(300)
      }
    },
    {
      explanation: "Publisher marks the event as 'published' in the outbox table",
      duration: 2000,
      action: async () => {
        // Update first outbox entry to published status
        if (state.outboxEntries.length > 0) {
          const firstEntry = state.outboxEntries[0]
          state.updateOutboxStatus(firstEntry.id, 'published', new Date().toLocaleTimeString())
        }

        state.addLog('Outbox Publisher: Event marked as published', 'success')
        await speedDelay(500)
      }
    },
    {
      explanation: "Inventory Service consumes the OrderCreated event from Kafka",
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
      explanation: "Inventory Service processes the event and reserves the items",
      duration: 2000,
      action: async () => {
        state.addLog('✅ Inventory: Items reserved for order ORD-001', 'success')
        await speedDelay(500)
      }
    },
    {
      explanation: "Complete! The Outbox Pattern guaranteed reliable message delivery despite separate systems",
      duration: 2000,
      action: async () => {
        state.addLog('━━━ Scenario Complete ━━━', 'info')
        await speedDelay(1000)
        state.setMessages([])
      }
    }
  ]
}
