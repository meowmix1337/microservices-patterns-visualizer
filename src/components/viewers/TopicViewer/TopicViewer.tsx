import { memo } from 'react'
import './TopicViewer.css'

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

export interface TopicViewerProps {
  topics: Record<string, Topic>
  recentMessages?: TopicMessage[]
}

function TopicViewer({ topics, recentMessages = [] }: TopicViewerProps) {
  const topicList = Object.values(topics)

  return (
    <div className="topic-viewer">
      <div className="topic-viewer-header">
        <h3>📋 Topics & Subscriptions</h3>
      </div>

      <div className="topic-viewer-content">
        {topicList.length === 0 ? (
          <div className="topic-viewer-empty">No topics configured</div>
        ) : (
          <div className="topics-list">
            {topicList.map((topic) => (
              <div key={topic.name} className="topic-card">
                <div className="topic-header">
                  <span className="topic-name">📬 {topic.name}</span>
                  <span className="topic-message-count">
                    {topic.messageCount} {topic.messageCount === 1 ? 'message' : 'messages'}
                  </span>
                </div>
                <div className="topic-subscribers">
                  <div className="topic-subscribers-label">Subscribers ({topic.subscribers.length}):</div>
                  <div className="topic-subscribers-list">
                    {topic.subscribers.map((subscriber) => (
                      <span key={subscriber} className="subscriber-badge">
                        {subscriber}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {recentMessages.length > 0 && (
          <div className="recent-messages">
            <h4>Recent Messages</h4>
            <div className="messages-list">
              {recentMessages.slice(-5).reverse().map((message) => (
                <div key={message.id} className="message-item">
                  <div className="message-topic-badge">{message.topic}</div>
                  <div className="message-content">{message.content}</div>
                  <div className="message-publisher">by {message.publishedBy}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(TopicViewer)
