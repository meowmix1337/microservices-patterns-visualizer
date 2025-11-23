import { useState, useCallback } from 'react'
import { type Message } from '../../utils/scenarioHelpers'
import { type LogEntry } from '../../hooks/useLogs'

export type RetryStatus = 'IDLE' | 'ATTEMPTING' | 'WAITING' | 'SUCCESS' | 'FAILED'

export interface RetryState {
  status: RetryStatus
  attemptCount: number
  maxRetries: number
  messages: Message[]
  logs: LogEntry[]
  runCounter: number
  
  setStatus: (status: RetryStatus) => void
  incrementAttempt: () => void
  setAttemptCount: (count: number) => void
  resetState: () => void
  setMessages: (messages: Message[]) => void
  addLog: (message: string, type?: LogEntry['type']) => void
  clearLogs: () => void
  setRunCounter: (count: number) => void
}

export const useRetryState = (): RetryState => {
  const [status, setStatus] = useState<RetryStatus>('IDLE')
  const [attemptCount, setAttemptCount] = useState(0)
  const [messages, setMessages] = useState<Message[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [runCounter, setRunCounter] = useState(0)

  const maxRetries = 3

  const incrementAttempt = useCallback(() => {
    setAttemptCount(prev => prev + 1)
  }, [])

  const setAttemptCountValue = useCallback((count: number) => {
    setAttemptCount(count)
  }, [])

  const resetState = useCallback(() => {
    setStatus('IDLE')
    setAttemptCount(0)
    setMessages([])
  }, [])

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

  return {
    status,
    attemptCount,
    maxRetries,
    messages,
    logs,
    runCounter,
    setStatus,
    incrementAttempt,
    setAttemptCount: setAttemptCountValue,
    resetState,
    setMessages,
    addLog,
    clearLogs,
    setRunCounter
  }
}
