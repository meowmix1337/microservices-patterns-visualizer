import { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './QueueViewer.css'

function QueueViewer({ messages }) {
  return (
    <div className="queue-viewer panel">
      <h3>📨 Kafka Queue</h3>
      <div className="queue-content">
        {messages.length === 0 ? (
          <div className="empty-state">No pending messages</div>
        ) : (
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                className="queue-item"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 100 }}
                layout
              >
                <div className="queue-header">
                  <span className="event-type">{msg.event}</span>
                  <span className="event-time">{msg.timestamp}</span>
                </div>
                <div className="queue-details">
                  <div className="queue-detail-item">
                    <span className="detail-label">Note:</span>
                    <span className="detail-value">{msg.noteId}</span>
                  </div>
                  <div className="queue-detail-item">
                    <span className="detail-label">Tag:</span>
                    <span className="detail-value tag-badge">{msg.tag}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

export default memo(QueueViewer)
