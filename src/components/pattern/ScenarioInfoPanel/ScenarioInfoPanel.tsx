import { motion, AnimatePresence } from 'framer-motion'
import './ScenarioInfoPanel.css'

export interface ScenarioInfo {
  icon?: string
  title: string
  description: string
  keyPoints?: string[]
}

export interface ScenarioInfoPanelProps {
  scenario: ScenarioInfo | null
  isVisible?: boolean
}

export default function ScenarioInfoPanel({ scenario, isVisible = true }: ScenarioInfoPanelProps) {
  if (!isVisible || !scenario) return null

  return (
    <AnimatePresence>
      <motion.div
        className="scenario-info-panel panel"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        <div className="scenario-header">
          <span className="scenario-icon">{scenario.icon || '📋'}</span>
          <h3 className="scenario-title">{scenario.title}</h3>
        </div>
        <p className="scenario-description">{scenario.description}</p>

        {scenario.keyPoints && scenario.keyPoints.length > 0 && (
          <div className="scenario-key-points">
            <h4 className="key-points-title">Key Points:</h4>
            <ul className="key-points-list">
              {scenario.keyPoints.map((point, idx) => (
                <li key={idx}>{point}</li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
