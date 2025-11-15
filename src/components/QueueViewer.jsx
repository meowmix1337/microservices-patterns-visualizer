import { memo } from 'react'
import './QueueViewer.css'

function QueueViewer({ messages }) {
  return (
    <div className="queue-viewer panel">
      <h3>📨 Kafka Queue</h3>
      <div className="queue-content">
        {messages.length === 0 ? (
          <div className="empty-state">No pending messages</div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="queue-item"
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
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

export default memo(QueueViewer)
