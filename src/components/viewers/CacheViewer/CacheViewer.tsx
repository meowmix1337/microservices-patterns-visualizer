import { memo } from 'react'
import { Card } from '../../ui'
import './CacheViewer.css'

export type CacheValue = string[] | string | number | boolean | object

export interface CacheData {
  [key: string]: CacheValue
}

export interface CacheViewerProps {
  data: CacheData
}

function CacheViewer({ data }: CacheViewerProps) {
  return (
    <Card variant="glass" padding="medium" className="cache-viewer">
      <h3>⚡ Redis Cache</h3>
      <div className="cache-content">
        {Object.keys(data).length === 0 ? (
          <div className="empty-state">Cache is empty</div>
        ) : (
          <>
            {Object.entries(data).map(([key, value]) => (
              <div
                key={key}
                className="cache-item"
              >
                <div className="cache-key">tags:{key}</div>
                <div className="cache-value">
                  {Array.isArray(value) ? (
                    value.map((tag, i) => (
                      <span key={i} className="tag-badge">{tag}</span>
                    ))
                  ) : (
                    JSON.stringify(value)
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </Card>
  )
}

export default memo(CacheViewer)
