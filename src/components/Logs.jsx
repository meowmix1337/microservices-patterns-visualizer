import { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
          <AnimatePresence>
            {logs.map((log) => (
              <motion.div
                key={log.id}
                className={`log-item log-${log.type}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                layout
              >
                <span className="log-icon">{getIcon(log.type)}</span>
                <span className="log-time">{log.timestamp}</span>
                <span className="log-message">{log.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

export default memo(Logs)
