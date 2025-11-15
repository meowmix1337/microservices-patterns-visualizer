import { useState } from 'react'
import { motion } from 'framer-motion'
import CacheViewer from './CacheViewer'
import QueueViewer from './QueueViewer'
import Logs from './Logs'
import './InfoTabs.css'

export default function InfoTabs({ cacheData, queueMessages, logs, onClear }) {
  const [activeTab, setActiveTab] = useState('logs')
  const [isMinimized, setIsMinimized] = useState(false)

  return (
    <motion.div
      className="info-tabs-floating panel"
      drag
      dragMomentum={false}
      dragElastic={0.1}
      style={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 1000,
        width: isMinimized ? '300px' : '400px',
        cursor: 'move'
      }}
    >
      <div className="floating-header">
        <div className="drag-handle">
          <span className="drag-icon">⋮⋮</span>
          <span className="floating-title">Activity Monitor</span>
        </div>
        <div className="header-actions">
          {onClear && (
            <button
              className="clear-btn"
              onClick={onClear}
              title="Clear all data"
            >
              🗑️
            </button>
          )}
          <button
            className="minimize-btn"
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? 'Maximize' : 'Minimize'}
          >
            {isMinimized ? '□' : '−'}
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="tabs-header">
            <button
              className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
              onClick={() => setActiveTab('logs')}
            >
              📋 Logs
            </button>
            <button
              className={`tab-btn ${activeTab === 'cache' ? 'active' : ''}`}
              onClick={() => setActiveTab('cache')}
            >
              ⚡ Cache
            </button>
            <button
              className={`tab-btn ${activeTab === 'queue' ? 'active' : ''}`}
              onClick={() => setActiveTab('queue')}
            >
              📨 Queue
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'logs' && <Logs logs={logs} />}
            {activeTab === 'cache' && <CacheViewer data={cacheData} />}
            {activeTab === 'queue' && <QueueViewer messages={queueMessages} />}
          </div>
        </>
      )}
    </motion.div>
  )
}
