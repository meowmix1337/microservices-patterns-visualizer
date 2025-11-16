import { memo } from 'react'
import { motion } from 'framer-motion'
import Badge from '../../ui/Badge'
import './PatternSelector.css'
import { patterns, PATTERN_CATEGORIES, type PatternCategory, type Pattern, type PatternDifficulty } from '../../../patterns/patternRegistry'

export interface PatternSelectorProps {
  selectedPattern: string
  onSelectPattern: (patternId: string) => void
}

interface DifficultyConfig {
  variant: 'success' | 'warning' | 'error'
  label: string
}

function PatternSelector({ selectedPattern, onSelectPattern }: PatternSelectorProps) {
  const categoryNames: Record<PatternCategory, string> = {
    [PATTERN_CATEGORIES.ASYNC]: 'Asynchronous',
    [PATTERN_CATEGORIES.SYNC]: 'Synchronous',
    [PATTERN_CATEGORIES.HYBRID]: 'Hybrid',
    [PATTERN_CATEGORIES.RESILIENCE]: 'Resilience',
  }

  const difficultyBadge = (difficulty: PatternDifficulty) => {
    const config: Record<PatternDifficulty, DifficultyConfig> = {
      beginner: { variant: 'success', label: 'Beginner' },
      intermediate: { variant: 'warning', label: 'Intermediate' },
      advanced: { variant: 'error', label: 'Advanced' },
    }
    const { variant, label } = config[difficulty]
    return (
      <Badge variant={variant} size="small">
        {label}
      </Badge>
    )
  }

  const groupedPatterns = patterns.reduce<Record<PatternCategory, Pattern[]>>((acc, pattern) => {
    if (!acc[pattern.category]) {
      acc[pattern.category] = []
    }
    acc[pattern.category].push(pattern)
    return acc
  }, {} as Record<PatternCategory, Pattern[]>)

  return (
    <div className="pattern-selector">
      <div className="pattern-selector-header">
        <h2>Communication Patterns</h2>
        <p>Explore different architectural patterns for distributed systems</p>
      </div>

      <div className="pattern-groups">
        {Object.entries(groupedPatterns).map(([category, categoryPatterns]) => (
          <div key={category} className="pattern-group">
            <h3 className="pattern-group-title">{categoryNames[category as PatternCategory]}</h3>
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
                        <Badge key={tag} variant="neutral" size="small">
                          {tag}
                        </Badge>
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
