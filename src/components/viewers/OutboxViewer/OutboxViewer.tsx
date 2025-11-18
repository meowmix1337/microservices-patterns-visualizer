import './OutboxViewer.css'

export interface OutboxEntry {
  id: string
  eventType: string
  payload: string
  status: 'pending' | 'publishing' | 'published'
  createdAt: string
  publishedAt?: string
}

export interface OutboxViewerProps {
  entries: OutboxEntry[]
}

export default function OutboxViewer({ entries }: OutboxViewerProps) {
  const getStatusIcon = (status: OutboxEntry['status']) => {
    switch (status) {
      case 'pending':
        return '⏳'
      case 'publishing':
        return '🔄'
      case 'published':
        return '✅'
    }
  }

  const getStatusClass = (status: OutboxEntry['status']) => {
    return `status-${status}`
  }

  return (
    <div className="outbox-viewer">
      <div className="outbox-header">
        <h3>📤 Outbox Table</h3>
        <span className="entry-count">{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</span>
      </div>
      {entries.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <p>No events in outbox</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="outbox-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Event Type</th>
                <th>Payload</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className={getStatusClass(entry.status)}>
                  <td className="cell-id" title={entry.id}>
                    {entry.id.substring(0, 12)}...
                  </td>
                  <td className="cell-event-type">{entry.eventType}</td>
                  <td className="cell-payload" title={entry.payload}>
                    {entry.payload}
                  </td>
                  <td className="cell-status">
                    <span className="status-badge">
                      {getStatusIcon(entry.status)} {entry.status}
                    </span>
                  </td>
                  <td className="cell-time">{entry.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
