import { useState } from 'react'
import { useLogs } from '../../hooks/useLogs'
import type { MessageFlowData } from '../../components/pattern/MessageFlow'
import type { ServiceStatus } from '../../components/pattern/ServiceBox'

export interface UseRequestResponseStateReturn {
  // State
  messages: MessageFlowData[]
  logs: Array<{ message: string; type: string; timestamp: string }>
  runCounter: number
  tagsServiceStatus: ServiceStatus

  // Setters
  setMessages: React.Dispatch<React.SetStateAction<MessageFlowData[]>>
  setRunCounter: React.Dispatch<React.SetStateAction<number>>
  setTagsServiceStatus: React.Dispatch<React.SetStateAction<ServiceStatus>>

  // Log methods
  addLog: (message: string, type: string) => void
  clearLogs: () => void
}

export function useRequestResponseState(): UseRequestResponseStateReturn {
  const [messages, setMessages] = useState<MessageFlowData[]>([])
  const { logs, addLog, clearLogs } = useLogs()
  const [runCounter, setRunCounter] = useState<number>(0)
  const [tagsServiceStatus, setTagsServiceStatus] = useState<ServiceStatus>('healthy')

  return {
    // State
    messages,
    logs,
    runCounter,
    tagsServiceStatus,

    // Setters
    setMessages,
    setRunCounter,
    setTagsServiceStatus,

    // Log methods
    addLog,
    clearLogs
  }
}
