import { useState, useCallback } from 'react'
import { type Message } from '../../utils/scenarioHelpers'
import { type LogEntry } from '../../hooks/useLogs'

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN'

export interface CircuitBreakerState {
  // Circuit Status
  status: CircuitState
  failureCount: number
  successCount: number
  lastFailureTime: number | null
  
  // Configuration
  failureThreshold: number
  resetTimeout: number
  
  // Visualization
  messages: Message[]
  logs: LogEntry[]
  runCounter: number
  
  // Actions
  setStatus: (status: CircuitState) => void
  incrementFailure: () => void
  incrementSuccess: () => void
  resetCounts: () => void
  setMessages: (messages: Message[]) => void
  addLog: (message: string, type?: LogEntry['type']) => void
  clearLogs: () => void
  setRunCounter: (count: number) => void
}

export const useCircuitBreakerState = (): CircuitBreakerState => {
  const [status, setStatus] = useState<CircuitState>('CLOSED')
  const [failureCount, setFailureCount] = useState(0)
  const [successCount, setSuccessCount] = useState(0)
  const [lastFailureTime, setLastFailureTime] = useState<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [runCounter, setRunCounter] = useState(0)

  // Configuration constants
  const failureThreshold = 3
  const resetTimeout = 3000 // 3 seconds

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [
      ...prev,
      {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        message,
        type
      }
    ])
  }, [])

  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

  const incrementFailure = useCallback(() => {
    setFailureCount(prev => {
      const newCount = prev + 1
      setLastFailureTime(Date.now())
      return newCount
    })
  }, [])

  const incrementSuccess = useCallback(() => {
    setSuccessCount(prev => prev + 1)
  }, [])

  const resetCounts = useCallback(() => {
    setFailureCount(0)
    setSuccessCount(0)
    setLastFailureTime(null)
  }, [])

  return {
    status,
    failureCount,
    successCount,
    lastFailureTime,
    failureThreshold,
    resetTimeout,
    messages,
    logs,
    runCounter,
    setStatus,
    incrementFailure,
    incrementSuccess,
    resetCounts,
    setMessages,
    addLog,
    clearLogs,
    setRunCounter
  }
}
