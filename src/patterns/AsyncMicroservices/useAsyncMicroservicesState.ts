import { useState } from 'react'
import { useLogs } from '../../hooks/useLogs'
import type { MessageFlowData } from '../../components/pattern/MessageFlow'
import type { ServiceStatus } from '../../components/pattern/ServiceBox'
import type { RedisStatus } from '../../components/pattern/ControlPanel'
import type { CacheData } from '../../components/viewers/CacheViewer'
import type { QueueMessage } from '../../components/viewers/QueueViewer'

export interface UseAsyncMicroservicesStateReturn {
  // State
  messages: MessageFlowData[]
  cacheData: CacheData
  queueMessages: QueueMessage[]
  logs: Array<{ message: string; type: string; timestamp: string }>
  kafkaLag: number
  redisStatus: RedisStatus
  tagsServiceStatus: ServiceStatus
  runCounter: number

  // Setters
  setMessages: React.Dispatch<React.SetStateAction<MessageFlowData[]>>
  setCacheData: React.Dispatch<React.SetStateAction<CacheData>>
  setQueueMessages: React.Dispatch<React.SetStateAction<QueueMessage[]>>
  setKafkaLag: React.Dispatch<React.SetStateAction<number>>
  setRedisStatus: React.Dispatch<React.SetStateAction<RedisStatus>>
  setTagsServiceStatus: React.Dispatch<React.SetStateAction<ServiceStatus>>
  setRunCounter: React.Dispatch<React.SetStateAction<number>>

  // Log methods
  addLog: (message: string, type: string) => void
  clearLogs: () => void
}

export function useAsyncMicroservicesState(): UseAsyncMicroservicesStateReturn {
  const [messages, setMessages] = useState<MessageFlowData[]>([])
  const [cacheData, setCacheData] = useState<CacheData>({})
  const [queueMessages, setQueueMessages] = useState<QueueMessage[]>([])
  const { logs, addLog, clearLogs } = useLogs()
  const [kafkaLag, setKafkaLag] = useState<number>(0)
  const [redisStatus, setRedisStatus] = useState<RedisStatus>('healthy')
  const [tagsServiceStatus, setTagsServiceStatus] = useState<ServiceStatus>('healthy')
  const [runCounter, setRunCounter] = useState<number>(0)

  return {
    // State
    messages,
    cacheData,
    queueMessages,
    logs,
    kafkaLag,
    redisStatus,
    tagsServiceStatus,
    runCounter,

    // Setters
    setMessages,
    setCacheData,
    setQueueMessages,
    setKafkaLag,
    setRedisStatus,
    setTagsServiceStatus,
    setRunCounter,

    // Log methods
    addLog,
    clearLogs
  }
}
