import { useState, useCallback } from 'react'

/**
 * Custom hook for managing application logs
 * Maintains a rolling window of the last 10 log entries
 */
export const useLogs = () => {
  const [logs, setLogs] = useState([])

  const addLog = useCallback((message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, { id: Date.now(), timestamp, message, type }].slice(-10))
  }, [])

  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

  return { logs, addLog, clearLogs }
}
