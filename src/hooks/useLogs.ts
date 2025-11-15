import { useState, useCallback } from 'react'

export type LogType = 'info' | 'success' | 'error' | 'warning' | 'request'

export interface LogEntry {
  id: number
  timestamp: string
  message: string
  type: LogType
}

export interface UseLogsReturn {
  logs: LogEntry[]
  addLog: (message: string, type?: LogType) => void
  clearLogs: () => void
}

/**
 * Custom hook for managing application logs
 * Maintains a rolling window of the last 10 log entries
 */
export const useLogs = (): UseLogsReturn => {
  const [logs, setLogs] = useState<LogEntry[]>([])

  const addLog = useCallback((message: string, type: LogType = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, { id: Date.now(), timestamp, message, type }].slice(-10))
  }, [])

  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

  return { logs, addLog, clearLogs }
}
