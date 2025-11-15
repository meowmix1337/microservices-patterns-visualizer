import { memo } from 'react'
import './Logs.css'

function Logs({ logs }) {
  const getIcon = (type) => {
    switch (type) {
      case 'request': return '📥'
      case 'success': return '✅'
      case 'error': return '❌'
      case 'warning': return '⚠️'
      default: return '📝'
    }
  }

  return (
    <div className="logs panel">
      <h3>📋 Event Log</h3>
      <div className="logs-content">
        {logs.length === 0 ? (
          <div className="empty-state">No events yet</div>
        ) : (
          <>
            {logs.map((log) => (
              <div
                key={log.id}
                className={`log-item log-${log.type}`}
              >
                <span className="log-icon">{getIcon(log.type)}</span>
                <span className="log-time">{log.timestamp}</span>
                <span className="log-message">{log.message}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

export default memo(Logs)
