import type { TransactionLogEntry, SagaStatus } from '../../../patterns/SagaPattern/useSagaPatternState'
import './SagaViewer.css'

export interface SagaViewerProps {
  sagaStatus: SagaStatus
  transactionLog: TransactionLogEntry[]
}

export default function SagaViewer({ sagaStatus, transactionLog }: SagaViewerProps) {
  const getStatusIcon = (state: SagaStatus['state']) => {
    switch (state) {
      case 'idle':
        return '⏸️'
      case 'in-progress':
        return '▶️'
      case 'completed':
        return '✅'
      case 'compensating':
        return '⏪'
      case 'failed':
        return '❌'
      default:
        return '○'
    }
  }

  const getStatusLabel = (state: SagaStatus['state']) => {
    switch (state) {
      case 'idle':
        return 'Idle'
      case 'in-progress':
        return 'In Progress'
      case 'completed':
        return 'Completed'
      case 'compensating':
        return 'Compensating'
      case 'failed':
        return 'Failed'
      default:
        return 'Unknown'
    }
  }

  const getStatusClass = (state: SagaStatus['state']) => {
    switch (state) {
      case 'idle':
        return 'saga-status-idle'
      case 'in-progress':
        return 'saga-status-progress'
      case 'completed':
        return 'saga-status-completed'
      case 'compensating':
        return 'saga-status-compensating'
      case 'failed':
        return 'saga-status-failed'
      default:
        return ''
    }
  }

  const getEntryIcon = (entry: TransactionLogEntry) => {
    if (entry.isCompensation) {
      return '⏪'
    }
    return entry.status === 'success' ? '✅' : entry.status === 'error' ? '❌' : '⏪'
  }

  const getEntryClass = (entry: TransactionLogEntry) => {
    if (entry.isCompensation) {
      return 'txn-compensation'
    }
    return entry.status === 'success' ? 'txn-success' : entry.status === 'error' ? 'txn-error' : 'txn-compensating'
  }

  return (
    <div className="saga-viewer">
      <div className="saga-status-section">
        <h4>Saga Status</h4>
        <div className={`saga-status-card ${getStatusClass(sagaStatus.state)}`}>
          <div className="saga-status-header">
            <span className="saga-status-icon">{getStatusIcon(sagaStatus.state)}</span>
            <span className="saga-status-label">{getStatusLabel(sagaStatus.state)}</span>
          </div>
          {sagaStatus.totalSteps > 0 && (
            <div className="saga-progress">
              <div className="saga-progress-text">
                Step {sagaStatus.currentStep} / {sagaStatus.totalSteps}
              </div>
              <div className="saga-progress-bar">
                <div
                  className="saga-progress-fill"
                  style={{ width: `${(sagaStatus.currentStep / sagaStatus.totalSteps) * 100}%` }}
                />
              </div>
            </div>
          )}
          {sagaStatus.failedService && (
            <div className="saga-failed-service">
              Failed at: {sagaStatus.failedService}
            </div>
          )}
        </div>
      </div>

      <div className="transaction-log-section">
        <h4>Transaction Log</h4>
        <div className="transaction-log">
          {transactionLog.length === 0 ? (
            <div className="empty-state">No transactions yet</div>
          ) : (
            transactionLog.map((entry) => (
              <div key={entry.id} className={`txn-entry ${getEntryClass(entry)}`}>
                <div className="txn-entry-header">
                  <span className="txn-entry-icon">{getEntryIcon(entry)}</span>
                  <span className="txn-entry-step">Step {entry.step}</span>
                  <span className="txn-entry-time">{entry.timestamp}</span>
                </div>
                <div className="txn-entry-action">{entry.action}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
