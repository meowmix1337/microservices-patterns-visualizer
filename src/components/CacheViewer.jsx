import { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './CacheViewer.css'

function CacheViewer({ data }) {
  return (
    <div className="cache-viewer panel">
      <h3>⚡ Redis Cache</h3>
      <div className="cache-content">
        {Object.keys(data).length === 0 ? (
          <div className="empty-state">Cache is empty</div>
        ) : (
          <AnimatePresence>
            {Object.entries(data).map(([key, value]) => (
              <motion.div
                key={key}
                className="cache-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                layout
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
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

export default memo(CacheViewer)
