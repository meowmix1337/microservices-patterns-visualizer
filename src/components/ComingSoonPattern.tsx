import { memo } from 'react'
import { motion } from 'framer-motion'
import './ComingSoonPattern.css'

export interface ComingSoonPatternProps {
  patternName: string
  patternIcon: string
  patternDescription: string
}

function ComingSoonPattern({ patternName, patternIcon, patternDescription }: ComingSoonPatternProps) {
  return (
    <div className="coming-soon-container">
      <motion.div
        className="coming-soon-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="coming-soon-icon">{patternIcon}</div>
        <h2 className="coming-soon-title">{patternName}</h2>
        <p className="coming-soon-description">{patternDescription}</p>
        <div className="coming-soon-badge">
          <span>🚧 Coming Soon</span>
        </div>
        <div className="coming-soon-features">
          <h4>This pattern will demonstrate:</h4>
          <ul>
            <li>Real-world implementation scenarios</li>
            <li>Interactive visualizations</li>
            <li>Best practices and anti-patterns</li>
            <li>Performance considerations</li>
          </ul>
        </div>
      </motion.div>
    </div>
  )
}

export default memo(ComingSoonPattern)
