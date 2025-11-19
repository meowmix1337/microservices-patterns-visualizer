import { useState } from 'react'
import { useLogs } from '../../hooks/useLogs'
import type { LogEntry } from '../../hooks/useLogs'
import type { MessageFlowData } from '../../components/pattern/MessageFlow'

export interface OutboxEntry {
  id: string
  eventType: string
  payload: string
  status: 'pending' | 'publishing' | 'published'
  createdAt: string
  publishedAt?: string
}

export type KafkaStatus = 'up' | 'down'

export interface UseOutboxPatternStateReturn {
  // Outbox table
  outboxEntries: OutboxEntry[]
  addOutboxEntry: (entry: Omit<OutboxEntry, 'id' | 'createdAt'>) => void
  updateOutboxStatus: (id: string, status: OutboxEntry['status'], publishedAt?: string) => void
  clearOutboxEntries: () => void

  // Service status
  kafkaStatus: KafkaStatus
  setKafkaStatus: (status: KafkaStatus) => void

  // Database state
  orderCount: number
  incrementOrderCount: () => void

  // Messages & logs
  messages: MessageFlowData[]
  addMessage: (message: MessageFlowData) => void
  setMessages: (messages: MessageFlowData[] | ((prev: MessageFlowData[]) => MessageFlowData[])) => void

  logs: LogEntry[]
  addLog: (message: string, type?: 'info' | 'success' | 'error' | 'warning' | 'request') => void
  clearLogs: () => void

  runCounter: number
  setRunCounter: (count: number) => void
}

export function useOutboxPatternState(): UseOutboxPatternStateReturn {
  const [outboxEntries, setOutboxEntries] = useState<OutboxEntry[]>([])
  const [kafkaStatus, setKafkaStatus] = useState<KafkaStatus>('up')
  const [orderCount, setOrderCount] = useState<number>(0)
  const [messages, setMessages] = useState<MessageFlowData[]>([])
  const { logs, addLog, clearLogs } = useLogs()
  const [runCounter, setRunCounter] = useState<number>(0)

  const addOutboxEntry = (entry: Omit<OutboxEntry, 'id' | 'createdAt'>) => {
    const newEntry: OutboxEntry = {
      ...entry,
      id: `outbox-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      createdAt: new Date().toLocaleTimeString()
    }
    setOutboxEntries(prev => [...prev, newEntry])
  }

  const updateOutboxStatus = (id: string, status: OutboxEntry['status'], publishedAt?: string) => {
    setOutboxEntries(prev =>
      prev.map(entry =>
        entry.id === id
          ? { ...entry, status, ...(publishedAt && { publishedAt }) }
          : entry
      )
    )
  }

  const clearOutboxEntries = () => {
    setOutboxEntries([])
  }

  const incrementOrderCount = () => {
    setOrderCount(prev => prev + 1)
  }

  const addMessage = (message: MessageFlowData) => {
    setMessages(prev => [...prev, message])
  }

  return {
    // Outbox table
    outboxEntries,
    addOutboxEntry,
    updateOutboxStatus,
    clearOutboxEntries,

    // Service status
    kafkaStatus,
    setKafkaStatus,

    // Database state
    orderCount,
    incrementOrderCount,

    // Messages & logs
    messages,
    addMessage,
    setMessages,

    logs,
    addLog,
    clearLogs,

    runCounter,
    setRunCounter
  }
}
