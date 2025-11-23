import { useState } from 'react'
import { useLogs } from '../../hooks/useLogs'
import type { LogEntry } from '../../hooks/useLogs'
import type { MessageFlowData } from '../../components/pattern/MessageFlow'

export type SagaState = 'idle' | 'in-progress' | 'completed' | 'compensating' | 'failed'
export type ServiceStatus = 'idle' | 'processing' | 'success' | 'error'

export interface TransactionLogEntry {
  id: string
  step: number
  action: string
  status: 'success' | 'error' | 'compensating'
  timestamp: string
  isCompensation?: boolean
}

export interface SagaStatus {
  currentStep: number
  totalSteps: number
  state: SagaState
  failedService?: string
}

export interface UseSagaPatternStateReturn {
  // Saga orchestration
  sagaStatus: SagaStatus
  setSagaStatus: (status: SagaStatus | ((prev: SagaStatus) => SagaStatus)) => void

  // Service statuses
  orderServiceStatus: ServiceStatus
  setOrderServiceStatus: (status: ServiceStatus) => void

  paymentServiceStatus: ServiceStatus
  setPaymentServiceStatus: (status: ServiceStatus) => void

  inventoryServiceStatus: ServiceStatus
  setInventoryServiceStatus: (status: ServiceStatus) => void

  shippingServiceStatus: ServiceStatus
  setShippingServiceStatus: (status: ServiceStatus) => void

  orchestratorStatus: ServiceStatus
  setOrchestratorStatus: (status: ServiceStatus) => void

  // Transaction log
  transactionLog: TransactionLogEntry[]
  addTransactionLog: (entry: Omit<TransactionLogEntry, 'id' | 'timestamp'>) => void
  clearTransactionLog: () => void

  // Messages & logs
  messages: MessageFlowData[]
  addMessage: (message: MessageFlowData) => void
  setMessages: (messages: MessageFlowData[] | ((prev: MessageFlowData[]) => MessageFlowData[])) => void

  logs: LogEntry[]
  addLog: (message: string, type?: 'info' | 'success' | 'error' | 'warning' | 'request') => void
  clearLogs: () => void

  runCounter: number
  setRunCounter: (count: number) => void

  // Reset all service statuses
  resetServiceStatuses: () => void
}

export function useSagaPatternState(): UseSagaPatternStateReturn {
  const [sagaStatus, setSagaStatus] = useState<SagaStatus>({
    currentStep: 0,
    totalSteps: 0,
    state: 'idle'
  })

  const [orderServiceStatus, setOrderServiceStatus] = useState<ServiceStatus>('idle')
  const [paymentServiceStatus, setPaymentServiceStatus] = useState<ServiceStatus>('idle')
  const [inventoryServiceStatus, setInventoryServiceStatus] = useState<ServiceStatus>('idle')
  const [shippingServiceStatus, setShippingServiceStatus] = useState<ServiceStatus>('idle')
  const [orchestratorStatus, setOrchestratorStatus] = useState<ServiceStatus>('idle')

  const [transactionLog, setTransactionLog] = useState<TransactionLogEntry[]>([])
  const [messages, setMessages] = useState<MessageFlowData[]>([])
  const { logs, addLog, clearLogs } = useLogs()
  const [runCounter, setRunCounter] = useState<number>(0)

  const addTransactionLog = (entry: Omit<TransactionLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: TransactionLogEntry = {
      ...entry,
      id: `txn-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      timestamp: new Date().toLocaleTimeString()
    }
    setTransactionLog(prev => [...prev, newEntry])
  }

  const clearTransactionLog = () => {
    setTransactionLog([])
  }

  const addMessage = (message: MessageFlowData) => {
    setMessages(prev => [...prev, message])
  }

  const resetServiceStatuses = () => {
    setOrderServiceStatus('idle')
    setPaymentServiceStatus('idle')
    setInventoryServiceStatus('idle')
    setShippingServiceStatus('idle')
    setOrchestratorStatus('idle')
  }

  return {
    // Saga orchestration
    sagaStatus,
    setSagaStatus,

    // Service statuses
    orderServiceStatus,
    setOrderServiceStatus,

    paymentServiceStatus,
    setPaymentServiceStatus,

    inventoryServiceStatus,
    setInventoryServiceStatus,

    shippingServiceStatus,
    setShippingServiceStatus,

    orchestratorStatus,
    setOrchestratorStatus,

    // Transaction log
    transactionLog,
    addTransactionLog,
    clearTransactionLog,

    // Messages & logs
    messages,
    addMessage,
    setMessages,

    logs,
    addLog,
    clearLogs,

    runCounter,
    setRunCounter,

    // Reset
    resetServiceStatuses
  }
}
