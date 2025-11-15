import { memo } from 'react'
import { motion } from 'framer-motion'
import './PatternSelector.css'
import { patterns, PATTERN_CATEGORIES } from '../patterns/patternRegistry'

function PatternSelector({ selectedPattern, onSelectPattern }) {
  const categoryNames = {
    [PATTERN_CATEGORIES.ASYNC]: 'Asynchronous',
    [PATTERN_CATEGORIES.SYNC]: 'Synchronous',
    [PATTERN_CATEGORIES.HYBRID]: 'Hybrid',
    [PATTERN_CATEGORIES.RESILIENCE]: 'Resilience',
  }

  const difficultyBadge = (difficulty) => {
    const styles = {
      beginner: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', label: 'Beginner' },
      intermediate: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', label: 'Intermediate' },
      advanced: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', label: 'Advanced' },
    }
    const style = styles[difficulty]
    return (
      <span
        className="difficulty-badge"
        style={{ background: style.bg, color: style.color }}
      >
        {style.label}
      </span>
    )
  }

  const groupedPatterns = patterns.reduce((acc, pattern) => {
    if (!acc[pattern.category]) {
      acc[pattern.category] = []
    }
    acc[pattern.category].push(pattern)
    return acc
  }, {})

  return (
    <div className="pattern-selector">
      <div className="pattern-selector-header">
        <h2>Communication Patterns</h2>
        <p>Explore different architectural patterns for distributed systems</p>
      </div>

      <div className="pattern-groups">
        {Object.entries(groupedPatterns).map(([category, categoryPatterns]) => (
          <div key={category} className="pattern-group">
            <h3 className="pattern-group-title">{categoryNames[category]}</h3>
            <div className="pattern-cards">
              {categoryPatterns.map((pattern) => (
                <motion.button
                  key={pattern.id}
                  className={`pattern-card ${selectedPattern === pattern.id ? 'selected' : ''}`}
                  onClick={() => onSelectPattern(pattern.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    borderColor: selectedPattern === pattern.id ? pattern.color : 'rgba(148, 163, 184, 0.2)',
                  }}
                  aria-label={`Select ${pattern.name} pattern`}
                >
                  <div className="pattern-card-header">
                    <span className="pattern-icon" style={{ color: pattern.color }}>
                      {pattern.icon}
                    </span>
                    <h4>{pattern.name}</h4>
                  </div>
                  <p className="pattern-description">{pattern.description}</p>
                  <div className="pattern-meta">
                    {difficultyBadge(pattern.difficulty)}
                    <div className="pattern-tags">
                      {pattern.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="pattern-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  {selectedPattern === pattern.id && (
                    <motion.div
                      className="selected-indicator"
                      layoutId="selected-pattern"
                      style={{ background: pattern.color }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default memo(PatternSelector)
