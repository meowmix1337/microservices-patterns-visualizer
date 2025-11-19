import { useState } from 'react'
import type { ServiceStatus } from '../../components/pattern/ServiceBox'
import type { MessageFlowData } from '../../components/pattern/MessageFlow'

export interface Topic {
  name: string
  subscribers: string[]
  messageCount: number
}

export interface TopicMessage {
  id: string
  topic: string
  content: string
  timestamp: string
  publishedBy: string
}

export interface UsePubSubPatternState {
  // Service statuses
  emailServiceStatus: ServiceStatus
  setEmailServiceStatus: (status: ServiceStatus) => void
  analyticsServiceStatus: ServiceStatus
  setAnalyticsServiceStatus: (status: ServiceStatus) => void
  notificationServiceStatus: ServiceStatus
  setNotificationServiceStatus: (status: ServiceStatus) => void

  // Topics and subscriptions
  topics: Record<string, Topic>
  setTopics: (topics: Record<string, Topic>) => void

  // Recent messages on topics
  topicMessages: TopicMessage[]
  setTopicMessages: (messages: TopicMessage[]) => void
  addTopicMessage: (message: TopicMessage) => void
  clearTopicMessages: () => void

  // Message flows for visualization
  messages: MessageFlowData[]
  setMessages: (messages: MessageFlowData[]) => void
  addMessage: (message: MessageFlowData) => void

  // Logs
  logs: Array<{ message: string; type: 'info' | 'success' | 'error' | 'warning' }>
  addLog: (message: string, type?: 'info' | 'success' | 'error' | 'warning') => void
  clearLogs: () => void

  // Scenario tracking
  runCounter: number
  setRunCounter: (count: number) => void
}

export function usePubSubPatternState(): UsePubSubPatternState {
  const [emailServiceStatus, setEmailServiceStatus] = useState<ServiceStatus>('healthy')
  const [analyticsServiceStatus, setAnalyticsServiceStatus] = useState<ServiceStatus>('healthy')
  const [notificationServiceStatus, setNotificationServiceStatus] = useState<ServiceStatus>('healthy')

  const [topics, setTopics] = useState<Record<string, Topic>>({
    'orders': { name: 'orders', subscribers: ['emailService', 'analyticsService', 'notificationService'], messageCount: 0 },
    'inventory': { name: 'inventory', subscribers: ['analyticsService'], messageCount: 0 }
  })

  const [topicMessages, setTopicMessages] = useState<TopicMessage[]>([])
  const [messages, setMessages] = useState<MessageFlowData[]>([])
  const [logs, setLogs] = useState<Array<{ message: string; type: 'info' | 'success' | 'error' | 'warning' }>>([])
  const [runCounter, setRunCounter] = useState(0)

  const addTopicMessage = (message: TopicMessage) => {
    setTopicMessages(prev => [...prev, message])
  }

  const clearTopicMessages = () => {
    setTopicMessages([])
  }

  const addMessage = (message: MessageFlowData) => {
    setMessages(prev => [...prev, message])
  }

  const addLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    setLogs(prev => [...prev, { message, type }])
  }

  const clearLogs = () => {
    setLogs([])
  }

  return {
    emailServiceStatus,
    setEmailServiceStatus,
    analyticsServiceStatus,
    setAnalyticsServiceStatus,
    notificationServiceStatus,
    setNotificationServiceStatus,
    topics,
    setTopics,
    topicMessages,
    setTopicMessages,
    addTopicMessage,
    clearTopicMessages,
    messages,
    setMessages,
    addMessage,
    logs,
    addLog,
    clearLogs,
    runCounter,
    setRunCounter
  }
}
