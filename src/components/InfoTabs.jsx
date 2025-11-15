import { useState } from 'react'
import CacheViewer from './CacheViewer'
import QueueViewer from './QueueViewer'
import Logs from './Logs'
import './InfoTabs.css'

export default function InfoTabs({ cacheData, queueMessages, logs }) {
  const [activeTab, setActiveTab] = useState('logs')

  return (
    <div className="info-tabs panel">
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
    </div>
  )
}
