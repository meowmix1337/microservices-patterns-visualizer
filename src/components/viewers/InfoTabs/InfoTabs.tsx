import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button, Card } from '../../ui'
import CacheViewer, { type CacheData } from '../CacheViewer'
import QueueViewer, { type QueueMessage } from '../QueueViewer'
import Logs from '../Logs'
import type { LogEntry } from '../../../hooks/useLogs'
import './InfoTabs.css'

export type TabType = 'logs' | 'cache' | 'queue'

export interface InfoTabsProps {
  cacheData: CacheData
  queueMessages: QueueMessage[]
  logs: LogEntry[]
  onClear?: () => void
}

export default function InfoTabs({ cacheData, queueMessages, logs, onClear }: InfoTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('logs')
  const [isMinimized, setIsMinimized] = useState<boolean>(false)
  const [isVisible, setIsVisible] = useState<boolean>(false)

  // Toggle button when panel is hidden
  if (!isVisible) {
    return (
      <Button
        variant="secondary"
        size="medium"
        onClick={() => setIsVisible(true)}
        iconLeft="📊"
        className="activity-monitor-toggle"
        style={{
          position: 'fixed',
          bottom: 20,
          left: 20,
          zIndex: 1000,
        }}
        title="Open Activity Monitor"
      >
        Activity Monitor
      </Button>
    )
  }

  return (
    <motion.div
      className="info-tabs-floating"
      drag
      dragMomentum={false}
      dragElastic={0.1}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        position: 'fixed',
        bottom: 20,
        left: 20,
        zIndex: 1000,
        width: isMinimized ? '240px' : '320px',
        cursor: 'move'
      }}
    >
      <Card variant="glass" padding="none" className="info-tabs-card">
        <div className="floating-header">
          <div className="drag-handle">
            <span className="drag-icon">⋮⋮</span>
            <span className="floating-title">Activity Monitor</span>
          </div>
          <div className="header-actions">
            {onClear && (
              <Button
                variant="ghost"
                size="small"
                onClick={onClear}
                title="Clear all data"
                iconLeft="🗑️"
                className="action-btn clear-btn"
              />
            )}
            <Button
              variant="ghost"
              size="small"
              onClick={() => setIsMinimized(!isMinimized)}
              title={isMinimized ? 'Maximize' : 'Minimize'}
              iconLeft={isMinimized ? '□' : '−'}
              className="action-btn minimize-btn"
            />
            <Button
              variant="ghost"
              size="small"
              onClick={() => setIsVisible(false)}
              title="Close Activity Monitor"
              iconLeft="✕"
              className="action-btn close-btn"
            />
          </div>
        </div>

        {!isMinimized && (
          <>
            <div className="tabs-header">
              <Button
                variant={activeTab === 'logs' ? 'primary' : 'ghost'}
                size="small"
                onClick={() => setActiveTab('logs')}
                iconLeft="📋"
                className="tab-btn"
              >
                Logs
              </Button>
              <Button
                variant={activeTab === 'cache' ? 'primary' : 'ghost'}
                size="small"
                onClick={() => setActiveTab('cache')}
                iconLeft="⚡"
                className="tab-btn"
              >
                Cache
              </Button>
              <Button
                variant={activeTab === 'queue' ? 'primary' : 'ghost'}
                size="small"
                onClick={() => setActiveTab('queue')}
                iconLeft="📨"
                className="tab-btn"
              >
                Queue
              </Button>
            </div>

            <div className="tab-content">
              {activeTab === 'logs' && <Logs logs={logs} />}
              {activeTab === 'cache' && <CacheViewer data={cacheData} />}
              {activeTab === 'queue' && <QueueViewer messages={queueMessages} />}
            </div>
          </>
        )}
      </Card>
    </motion.div>
  )
}
